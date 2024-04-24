import { ArrayElement } from "@/src/utils/array-utils";
import { Prisma, PrismaClient } from "@prisma/client";

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
