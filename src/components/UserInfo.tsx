import { getSession } from "@auth0/nextjs-auth0";

export default async function UserInfo() {
  const session = await getSession();
  if (!session) {
    return <div>No User!</div>;
  }

  const { user } = session;

  return (
    user && (
      <div>
        <span>Name: {user.name}</span>
      </div>
    )
  );
}
