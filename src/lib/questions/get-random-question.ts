import { prismaClient } from "@/src/utils/clients";
import { QuestionWithRoundData } from "@/src/utils/prisma-extensions";
import "server-only";

export async function getRandomQuestion(
  categories?: number[],
  showFlashcardHidden = false,
): Promise<QuestionWithRoundData | null> {
  const categoriesClause =
    categories && categories.length > 0
      ? {
          OR: categories.map((id) => ({
            categoryId: id,
          })),
        }
      : null;
  const flashcardsClause = !showFlashcardHidden
    ? {
        hideInFlashcards: false,
      }
    : null;
  const where =
    categoriesClause !== null || flashcardsClause !== null
      ? {
          where: {
            ...categoriesClause,
            ...flashcardsClause,
          },
        }
      : null;
  const questionCount = await prismaClient.question.count({
    ...where,
  });
  const skip = Math.floor(Math.random() * questionCount);
  return await prismaClient.question.findFirst({
    ...where,
    include: {
      round: {
        include: {
          alphabetRound: true,
          themeRound: true,
        },
      },
      category: true,
    },
    skip,
  });
}
