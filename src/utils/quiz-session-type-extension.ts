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
