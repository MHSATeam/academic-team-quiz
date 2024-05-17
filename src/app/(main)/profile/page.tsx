import DefaultCategoriesSelector from "@/components/inputs/DefaultCategoriesSelector";
import canAccessTeamCaptain from "@/src/lib/users/can-access-team-captain";
import getDefaultCategories from "@/src/lib/users/get-default-categories";
import { prismaClient } from "@/src/utils/clients";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Button, Divider, Metric } from "@tremor/react";
import Link from "next/link";

export const revalidate = 0;

export default async function Page() {
  const session = await getSession();
  let user: UserProfile;
  if (!session) {
    user = {
      name: "Test User",
      sub: "google-oauth2|448529395684503072105",
      email: "test@example.com",
      email_verified: true,
      nickname: "Test",
    };
  } else {
    user = session.user;
  }
  if (!user.sub || !user.name) {
    throw new Error("Missing user data!");
  }

  const isTeamCaptain = await canAccessTeamCaptain(user.sub);

  const categories = await prismaClient.category.findMany();

  const userCategories = await getDefaultCategories(user.sub);

  return (
    <main className="flex flex-col gap-4 px-6 py-12 lg:max-w-3xl">
      <Metric>Your Profile</Metric>
      <DefaultCategoriesSelector
        categories={categories}
        currentlySelected={userCategories.map(({ id }) => id)}
      />
      <Link className="flex w-full flex-col" href={"/api/auth/logout"}>
        <Button variant="secondary">Logout</Button>
      </Link>
      {isTeamCaptain && (
        <>
          <Divider>Team Captain Resources</Divider>
          <Link className="flex w-full flex-col" href={"/management/"}>
            <Button variant="secondary">Management Console</Button>
          </Link>
        </>
      )}
    </main>
  );
}
