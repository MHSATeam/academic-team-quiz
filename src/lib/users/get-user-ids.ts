import { Auth0BaseUrl } from "@/src/lib/auth0/constants";
import getManagementToken from "@/src/lib/auth0/get-management-token";
import { User } from "@/src/lib/users/types";
import "server-only";

export default async function getUserList(): Promise<User[]> {
  const userListEndpoint = new URL("/api/v2/users", Auth0BaseUrl);

  const bearerToken = await getManagementToken();
  const res = await fetch(userListEndpoint, {
    headers: new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${bearerToken}`,
    }),
    method: "GET",
    redirect: "follow",
  });

  if (!res.ok) {
    console.log(res);
    throw new Error("User list request failed!");
  }

  const userList:
    | {
        start: number;
        limit: number;
        length: number;
        total: number;
        users: User[];
      }
    | User[] = await res.json();
  if (Array.isArray(userList)) {
    return userList;
  } else {
    return userList.users;
  }
}
