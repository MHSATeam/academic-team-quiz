import { Auth0BaseUrl } from "@/src/lib/auth0/constants";
import getManagementToken from "@/src/lib/auth0/get-management-token";
import { Role } from "@/src/lib/users/types";
import "server-only";

export default async function getUserRoles(userId: string) {
  const userRolesEndpoint = new URL(
    `/api/v2/users/${userId}/roles`,
    Auth0BaseUrl
  );

  const bearerToken = await getManagementToken();
  const res = await fetch(userRolesEndpoint, {
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

  const roleList:
    | { start: number; limit: number; total: number; roles: Role[] }
    | Role[] = await res.json();
  if (Array.isArray(roleList)) {
    return roleList;
  } else {
    return roleList.roles;
  }
}
