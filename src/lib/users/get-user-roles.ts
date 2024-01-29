import { prismaClient } from "@/src/utils/clients";

export default async function getUserRoles(userId: string) {
  return await prismaClient.userRole.findMany({
    where: {
      userId: userId,
    },
  });
}
