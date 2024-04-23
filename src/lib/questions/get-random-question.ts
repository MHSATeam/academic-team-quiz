import { prismaClient } from "@/src/utils/clients";
import "server-only";

export async function getRandomQuestion(
  categories?: number[],
  showFlashcardHidden = false,
) {
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
      category: true,
    },
    skip,
  });
}
