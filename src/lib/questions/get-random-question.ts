import { prismaClient } from "@/src/utils/clients";
import "server-only";

export async function getRandomQuestion(categories?: number[]) {
  const where = categories
    ? {
        where: {
          OR: categories.map((id) => ({
            categoryId: id,
          })),
        },
      }
    : null;
  const questionCount = await prismaClient.question.count({
    ...where,
  });
  const skip = Math.floor(Math.random() * questionCount);
  return await prismaClient.question.findFirst({
    ...where,
    skip,
  });
}
