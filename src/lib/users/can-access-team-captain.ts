import { prismaClient } from "@/src/utils/clients";

export default async function canAccessTeamCaptain(userId: string) {
  return (
    await prismaClient.userRole.findMany({
      where: {
        userId,
      },
    })
  ).some(
    (userRole) =>
      userRole.role === "TeamCaptain" || userRole.role === "SiteAdmin"
  );
}
