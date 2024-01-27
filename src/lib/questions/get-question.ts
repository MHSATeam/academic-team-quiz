import { prismaClient } from "@/src/utils/clients";
import "server-only";

export async function getQuestion(id?: number) {
  return await prismaClient.question.findFirst({
    where: {
      id,
    },
  });
}
