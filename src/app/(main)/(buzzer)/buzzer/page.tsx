import PlayerPage from "@/components/pages/buzzer/Player";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";

export default async function Page() {
  const session = await getSession();
  const user: UserProfile | undefined = session?.user;
  return <PlayerPage name={user?.name ?? undefined} />;
}
