import { ArrayElement } from "@/src/utils/array-utils";
import {
  AlphabetRound,
  Category,
  CategoryTeamGroup,
  Prisma,
  PrismaClient,
  Question,
  Round,
  ThemeRound,
} from "@prisma/client";

export type QuizSessionWithQuestions = NonNullable<
  Prisma.Result<
    PrismaClient["userQuizSession"],
    {
      include: {
        questionsTrackers: {
          orderBy: {
            id: "asc";
          };
          include: {
            question: {
              include: {
                round: {
                  include: {
                    alphabetRound: true;
                    themeRound: true;
                  };
                };
                category: true;
              };
            };
          };
        };
      };
    },
    "findFirst"
  >
>;

export type QuestionWithRoundData = NonNullable<
  ArrayElement<QuizSessionWithQuestions["questionsTrackers"]>["question"]
>;

export function addRoundData(
  question: Question,
  round?: Round & {
    themeRound?: ThemeRound | null;
    alphabetRound?: AlphabetRound | null;
    categoryTeamGroup?: CategoryTeamGroup | null;
  },
  category?: Category,
): QuestionWithRoundData {
  const emptyRound: Round & {
    themeRound: ThemeRound | null;
    alphabetRound: AlphabetRound | null;
    categoryTeamGroup: CategoryTeamGroup | null;
  } = {
    id: -1,
    name: "Undefined Round",
    difficulty: -1,
    themeRound: null,
    alphabetRound: null,
    categoryTeamGroup: null,
    createdOn: new Date(),
    modifiedOn: new Date(),
  };

  const emptyCategory: Category = {
    id: -1,
    name: "Undefined Category",
    createdOn: new Date(),
    modifiedOn: new Date(),
  };

  return {
    ...question,
    round: {
      ...emptyRound,
      ...round,
    },
    category: {
      ...emptyCategory,
      ...category,
    },
  };
}

export type CompleteSet = NonNullable<
  Prisma.Result<
    PrismaClient["set"],
    { include: typeof CompleteSetInclude },
    "findFirst"
  >
> & { questionList: QuestionWithRoundData[] };

export const CompleteSetInclude = {
  alphabetRound: {
    include: {
      round: {
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          questions: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  },
  categoryRound: {
    include: {
      teamGroups: {
        include: {
          round: {
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
              questions: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
    },
  },
  lightningRound: {
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
      questions: {
        include: {
          category: true,
        },
      },
    },
  },
  themeRound: {
    include: {
      round: {
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          questions: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  },
} as const;

export const createQuestionList = (
  completeSet: NonNullable<
    Prisma.Result<
      PrismaClient["set"],
      { include: typeof CompleteSetInclude },
      "findFirst"
    >
  >,
): QuestionWithRoundData[] => {
  const questionList: QuestionWithRoundData[] = [];
  const categoryRoundQuestionsByCategory: QuestionWithRoundData[][] = [];
  if (completeSet.categoryRound) {
    if (
      completeSet.categoryRound.teamGroups.every(
        (round) => round.round.questions.length === 10,
      )
    ) {
      const lastTeamRound =
        completeSet.categoryRound.teamGroups[
          completeSet.categoryRound.teamGroups.length - 1
        ].round;
      const numberOfTeams = completeSet.categoryRound.teamGroups.length;
      for (let i = 0; i < lastTeamRound.questions.length; i++) {
        categoryRoundQuestionsByCategory.push([]);
        for (
          let j = i % 2 === 0 ? 0 : numberOfTeams - 2;
          i % 2 === 0 ? j < numberOfTeams - 1 : j >= 0;
          j += i % 2 === 0 ? 1 : -1
        ) {
          const round = completeSet.categoryRound.teamGroups[j].round;
          const question = round.questions[i];
          categoryRoundQuestionsByCategory[i].push(
            addRoundData(question, round, question.category),
          );
        }
        categoryRoundQuestionsByCategory[i].push(
          addRoundData(
            lastTeamRound.questions[i],
            lastTeamRound,
            lastTeamRound.questions[i].category,
          ),
        );
      }
    }
  }

  if (completeSet.categoryRound) {
    if (categoryRoundQuestionsByCategory.length === 0) {
      questionList.push(
        ...completeSet.categoryRound.teamGroups.flatMap((group) =>
          group.round.questions.map((q) =>
            addRoundData(q, group.round, q.category),
          ),
        ),
      );
    } else {
      questionList.push(...categoryRoundQuestionsByCategory.flat());
    }
  }
  if (completeSet.alphabetRound) {
    const round = completeSet.alphabetRound.round;
    questionList.push(
      ...round.questions.map((q) =>
        addRoundData(q, {
          ...round,
          alphabetRound: completeSet.alphabetRound,
        }),
      ),
    );
  }
  if (completeSet.lightningRound) {
    const round = completeSet.lightningRound;
    questionList.push(
      ...round.questions.map((q) => addRoundData(q, round, q.category)),
    );
  }
  if (completeSet.themeRound) {
    const round = completeSet.themeRound.round;
    questionList.push(
      ...round.questions.map((q) =>
        addRoundData(
          q,
          { ...round, themeRound: completeSet.themeRound },
          q.category,
        ),
      ),
    );
  }
  return questionList;
};
