import { prismaClient } from "@/src/utils/clients";

export default async function getDefaultCategories(userId: string) {
  return (
    (
      await prismaClient.userDefaultCategories.findUnique({
        where: {
          userId,
        },
        include: {
          categories: true,
        },
      })
    )?.categories ?? []
  );
}
