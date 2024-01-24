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
