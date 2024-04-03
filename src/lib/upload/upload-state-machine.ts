import { StepComponent } from "@/components/pages/UploadSet";
import Formatting from "@/components/upload/steps/Formatting";
import SelectFile from "@/components/upload/steps/SelectFile";
import SelectText from "@/components/upload/steps/SelectText";
import { EditorQuestion, PDFFile } from "@/src/utils/set-upload-utils";
import { assign, setup } from "xstate";

export type StepMetaData = {
  component: StepComponent;
};

export const uploadSetMachine = setup({
  types: {} as {
    context: {
      pdfFile: PDFFile | undefined;
      questions: EditorQuestion[];
    };
    events:
      | { type: "addPdf"; params: { newFile: PDFFile } }
      | { type: "addQuestion"; params: { question: EditorQuestion } }
      | { type: "removeQuestion"; params: { questionId: string } }
      | { type: "toFormatting" }
      | { type: "returnToSelectText" };
  },
}).createMachine({
  context: {
    pdfFile: undefined,
    questions: [],
  },
  id: "upload-set",
  initial: "selectFile",
  states: {
    selectFile: {
      on: {
        addPdf: {
          actions: assign({
            pdfFile: ({ event }) => event.params.newFile,
          }),
        },
      },
      always: {
        guard: ({ context }) => {
          return context.pdfFile !== undefined;
        },
        target: "selectText",
      },
      meta: {
        component: SelectFile,
      },
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
      },
    },
    formatting: {
      on: {
        returnToSelectText: {
          target: "selectText",
        },
      },
      meta: {
        component: Formatting,
      },
    },
  },
});
