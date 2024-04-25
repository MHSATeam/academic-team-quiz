import { StepComponent } from "@/components/pages/UploadSet";
import Finalize from "@/components/upload/steps/Finalize";
import Formatting from "@/components/upload/steps/Formatting";
import SelectFile from "@/components/upload/steps/SelectFile";
import SelectText from "@/components/upload/steps/SelectText";
import Uploading from "@/components/upload/steps/Uploading";
import { UploadableSet, buildSet } from "@/src/lib/upload/build-set";
import { initFileDb } from "@/src/lib/upload/file-db";
import {
  EditorQuestion,
  OACSet,
  PDFFile,
  QuestionList,
  Set,
  createAlphabetRound,
  createCategoryRound,
  createCustomSet,
  createQuestionList,
  createSet,
  createThemeRound,
} from "@/src/utils/set-upload-utils";
import { Category, Set as PrismaSet, Round } from "@prisma/client";
import { nanoid } from "nanoid";
import { assign, fromPromise, raise, setup } from "xstate";

export type StepMetaData = {
  component: StepComponent;
};

let fileDB: IDBDatabase | undefined = undefined;

export const getFileDb = async () => {
  if (fileDB === undefined) {
    fileDB = await initFileDb();
  }
  return fileDB;
};

export const uploadSetMachine = setup({
  types: {} as {
    context: {
      stateId: string;
      pdfFile: PDFFile | undefined;
      questions: EditorQuestion[];
      questionLists: QuestionList[];
      set: Set | null;
      hasUploaded: boolean;
      uploadedObj: PrismaSet | Round | null;
      error?: unknown;
    };
    events:
      | { type: "addPdf"; params: { newFile: PDFFile } }
      | { type: "addQuestion"; params: { question: EditorQuestion } }
      | { type: "removeQuestion"; params: { questionId: string } }
      | { type: "toFormatting" }
      | { type: "toSelectText" }
      | {
          type: "updateQuestion";
          params: {
            id: string;
            question?: string;
            answer?: string;
            category?: Category;
            hideInFlashcards?: boolean;
          };
        }
      | { type: "toUpload" }
      | {
          type: "convertSetType";
          params: { toOAC: boolean; categories?: Category[] };
        }
      | { type: "updateSetName"; params: { newName: string } }
      | { type: "updateCreatedYear"; params: { year: number } }
      | { type: "updateAuthor"; params: { author: string } }
      | {
          type: "updateQuestionLists";
          params: { questionLists: QuestionList[] };
        }
      | { type: "updateAlphabetLetter"; params: { letter: string } }
      | { type: "updateTheme"; params: { theme: string } }
      | { type: "finalize" }
      | { type: "retryError" };
  },
  actors: {
    uploadSet: fromPromise<PrismaSet | Round, { set: UploadableSet }>(
      async ({ input }) => {
        const response = await fetch("/api/upload-set", {
          method: "POST",
          body: JSON.stringify({
            set: input.set,
          }),
        });
        if (response.ok) {
          return await response.json();
        } else {
          throw await response.text();
        }
      },
    ),
  },
  actions: {
    checkSetLists: assign(({ context }) => {
      const questionLists = [...context.questionLists];
      const usedQuestions: string[] = [];
      for (const questionList of questionLists) {
        questionList.questions = questionList.questions.filter(
          (q) => !usedQuestions.includes(q),
        );
        usedQuestions.push(...questionList.questions);
      }
      return {
        questionLists,
      };
    }),
    convertToSetType: assign(({ context, event }) => {
      if (event.type !== "convertSetType") {
        return {};
      }
      const isOAC = event.params.toOAC;
      let set: Set;
      let isNew = false;
      if (context.set === null) {
        set = isOAC
          ? createSet(event.params.categories, context.questions)
          : createCustomSet();
        isNew = true;
      } else {
        if (isOAC) {
          const partialSet: Partial<Set> = {};
          if (context.set.alphabetRound === null) {
            partialSet.alphabetRound = createAlphabetRound(context.questions);
          }
          if (context.set.categoryRound === null) {
            partialSet.categoryRound = createCategoryRound();
          }
          if (context.set.themeRound === null) {
            partialSet.themeRound = createThemeRound();
          }
          set = {
            ...context.set,
            ...partialSet,
          };
        } else {
          set = {
            ...context.set,
            alphabetRound: null,
            categoryRound: null,
            themeRound: null,
          };
        }
      }

      const missingQuestionListIds: { questionListId: string }[] = [];
      if (set.categoryRound) {
        missingQuestionListIds.push(...set.categoryRound.teams);
      }
      if (set.alphabetRound) {
        missingQuestionListIds.push(set.alphabetRound);
      }
      if (set.lightningRound) {
        missingQuestionListIds.push(set.lightningRound);
      }
      if (set.themeRound) {
        missingQuestionListIds.push(set.themeRound);
      }
      const questionLists = [...context.questionLists];
      const usedQuestionListIds: string[] = [];
      for (let i = missingQuestionListIds.length - 1; i >= 0; i--) {
        const missingQuestionList = missingQuestionListIds[i];
        if (
          questionLists.findIndex(
            (qList) => qList.id === missingQuestionList.questionListId,
          ) !== -1 &&
          !usedQuestionListIds.includes(missingQuestionList.questionListId)
        ) {
          usedQuestionListIds.push(missingQuestionList.questionListId);
          missingQuestionListIds.splice(i, 1);
        }
      }
      const unusedIds = questionLists
        .filter((qList) => !usedQuestionListIds.includes(qList.id))
        .map((qList) => qList.id);
      for (const missingQuestionList of missingQuestionListIds) {
        if (unusedIds.length > 0) {
          missingQuestionList.questionListId = unusedIds.splice(0, 1)[0];
        } else {
          const newList = createQuestionList();
          missingQuestionList.questionListId = newList.id;
          questionLists.push(newList);
        }
      }
      for (let i = questionLists.length - 1; i >= 0; i--) {
        const questionList = questionLists[i];
        if (unusedIds.includes(questionList.id)) {
          let nextIndex = i - 1;
          if (nextIndex < 0) {
            nextIndex = questionLists.length - 1;
            if (nextIndex === i) {
              console.warn("Cannot remove all question lists!");
              break;
            }
          }
          questionLists[nextIndex].questions.push(...questionList.questions);
          questionLists.splice(i, 1);
        }
      }
      if (isNew) {
        const questionIds = context.questions.map((q) => q.id);
        if (isOAC) {
          const oacSet = set as OACSet;
          oacSet.categoryRound.teams.forEach((team, index) => {
            const questions = questionIds
              .slice(0, 30)
              .filter((_, qIndex) =>
                index === 2
                  ? qIndex % 3 === 2
                  : Math.floor(qIndex / 3) % 2 === 0
                    ? qIndex % 3 === index
                    : qIndex % 3 === (index + 1) % 2,
              );
            questionLists
              .find((qList) => qList.id === team.questionListId)!
              .questions.push(...questions);
          });
          questionIds.splice(0, 30);
          questionLists
            .find((qList) => qList.id === oacSet.alphabetRound.questionListId)!
            .questions.push(...questionIds.splice(0, 20));
          questionLists
            .find((qList) => qList.id === oacSet.lightningRound.questionListId)!
            .questions.push(...questionIds.splice(0, 20));
          questionLists
            .find((qList) => qList.id === oacSet.themeRound.questionListId)!
            .questions.push(...questionIds.splice(0, 10));
          if (questionIds.length > 0) {
            questionLists
              .find(
                (qList) => qList.id === oacSet.lightningRound.questionListId,
              )!
              .questions.push(...questionIds);
          }
        } else {
          questionLists[0].questions.push(...questionIds);
        }
      }
      return {
        set,
        questionLists,
      };
    }),
  },
}).createMachine({
  context: {
    stateId: nanoid(),
    pdfFile: undefined,
    questions: [],
    questionLists: [],
    set: null,
    hasUploaded: false,
    uploadedObj: null,
    error: undefined,
  },
  id: "upload-set",
  initial: "selectFile",
  on: {
    convertSetType: {
      actions: {
        type: "convertToSetType",
        params: ({
          event: {
            params: { toOAC },
          },
        }) => {
          return { toOAC };
        },
      },
    },
  },
  states: {
    selectFile: {
      on: {
        addPdf: {
          actions: [
            assign({
              pdfFile: ({ event }) => event.params.newFile,
            }),
            raise({ type: "toSelectText" }),
          ],
        },
        toSelectText: {
          guard: ({ context }) => {
            return context.pdfFile !== undefined;
          },
          target: "selectText",
        },
      },
      meta: {
        component: SelectFile,
      } as StepMetaData,
    },
    selectText: {
      on: {
        addQuestion: {
          actions: assign({
            questions: ({ context, event }) => [
              ...context.questions,
              event.params.question,
            ],
          }),
        },
        removeQuestion: {
          actions: assign({
            questions: ({ context, event }) =>
              context.questions.filter(
                (question) => question.id !== event.params.questionId,
              ),
          }),
        },
        toFormatting: {
          guard: ({ context }) => {
            return context.questions.length > 0;
          },
          target: "formatting",
        },
      },
      meta: {
        component: SelectText,
      } as StepMetaData,
    },
    formatting: {
      on: {
        toSelectText: {
          target: "selectText",
        },
        updateQuestion: {
          actions: assign({
            questions: ({ context, event }) => {
              const { id, question, answer, category, hideInFlashcards } =
                event.params;
              return context.questions.map((oldQuestion) => {
                if (oldQuestion.id !== id) {
                  return oldQuestion;
                }
                let newQuestionText = oldQuestion.question;
                let newAnswer = oldQuestion.answer;
                let newCategory = oldQuestion.category;
                let newHideInFlashcards = oldQuestion.hideInFlashcards;

                if (question !== undefined) {
                  newQuestionText = question;
                }

                if (answer !== undefined) {
                  newAnswer = answer;
                }

                if (category !== undefined) {
                  newCategory = category;
                }

                if (hideInFlashcards !== undefined) {
                  newHideInFlashcards = hideInFlashcards;
                }

                return {
                  ...oldQuestion,
                  question: newQuestionText,
                  answer: newAnswer,
                  category: newCategory,
                  hideInFlashcards: newHideInFlashcards,
                };
              });
            },
          }),
        },
        toUpload: {
          target: "uploading",
        },
      },
      meta: {
        component: Formatting,
      } as StepMetaData,
    },
    uploading: {
      on: {
        updateSetName: {
          actions: assign({
            set: ({ context, event }) => {
              if (context.set === null) {
                return null;
              }
              return {
                ...context.set,
                name: event.params.newName,
              };
            },
          }),
        },
        updateAuthor: {
          actions: assign({
            set: ({ context, event }) => {
              if (context.set === null) {
                return null;
              }
              return {
                ...context.set,
                author: event.params.author,
              };
            },
          }),
        },
        updateCreatedYear: {
          actions: assign({
            set: ({ context, event }) => {
              if (context.set === null) {
                return null;
              }
              return {
                ...context.set,
                createdYear: event.params.year,
              };
            },
          }),
        },
        updateQuestionLists: {
          actions: [
            assign({
              questionLists: ({ context, event }) => [
                ...context.questionLists.map((qList) => {
                  const newList = event.params.questionLists.find(
                    (newList) => newList.id === qList.id,
                  );
                  if (!newList) {
                    return qList;
                  }
                  return newList;
                }),
              ],
            }),
            "checkSetLists",
          ],
        },
        updateAlphabetLetter: {
          actions: assign({
            set: ({ context, event }) => {
              if (!context.set || !context.set.alphabetRound) {
                return context.set;
              }

              return {
                ...context.set,
                alphabetRound: {
                  ...context.set.alphabetRound,
                  letter: event.params.letter,
                },
              };
            },
          }),
        },
        updateTheme: {
          actions: assign({
            set: ({ context, event }) => {
              if (!context.set || !context.set.themeRound) {
                return context.set;
              }

              return {
                ...context.set,
                themeRound: {
                  ...context.set.themeRound,
                  theme: event.params.theme,
                },
              };
            },
          }),
        },
        toFormatting: {
          target: "formatting",
        },
        finalize: {
          target: "finalize",
        },
      },
      meta: {
        component: Uploading,
      } as StepMetaData,
    },
    finalize: {
      states: {
        uploading: {
          invoke: {
            src: "uploadSet",
            input: ({ context }) => {
              if (context.set === null) {
                throw new Error("Missing set!");
              }

              return {
                set: buildSet(
                  context.questions,
                  context.set,
                  context.questionLists,
                ),
              };
            },
            onDone: {
              actions: assign({
                hasUploaded: true,
                uploadedObj: ({ event }) => event.output,
              }),
              target: "done",
            },
            onError: {
              actions: assign({
                hasUploaded: true,
                error: ({ event }) => event.error,
              }),
              target: "error",
            },
          },
        },
        error: {
          on: {
            retryError: {
              target: "uploading",
              actions: assign({
                hasUploaded: false,
                error: undefined,
                uploadedObj: undefined,
              }),
            },
          },
        },
        done: {},
      },
      initial: "uploading",
      meta: {
        component: Finalize,
      } as StepMetaData,
    },
  },
});
