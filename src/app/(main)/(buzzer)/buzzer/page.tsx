import PlayerPage from "@/components/pages/buzzer/Player";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";

export default async function Page({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const session = await getSession();
  const user: UserProfile | undefined = session?.user;
  let gameId = undefined;
  if (searchParams && searchParams.id) {
    gameId = parseInt(searchParams.id);
  }
  return <PlayerPage name={user?.name ?? undefined} gameId={gameId} />;
}
