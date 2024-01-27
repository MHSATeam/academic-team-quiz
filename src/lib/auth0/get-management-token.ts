import { Auth0BaseUrl } from "@/src/lib/auth0/constants";
import { prismaClient } from "@/src/utils/clients";

export default async function getManagementToken() {
  const maxExpiryDate = new Date(Date.now() + 1000 * 60);
  const loadedManagementToken = await prismaClient.managementTokens.findFirst({
    orderBy: {
      expiresOn: "desc",
    },
    where: {
      expiresOn: {
        gt: maxExpiryDate,
      },
    },
  });

  if (loadedManagementToken) {
    return loadedManagementToken.token;
  } else {
    return await getNewManagementToken();
  }
}

async function getNewManagementToken(): Promise<string> {
  const clientId = process.env["AUTH0_CLIENT_ID"],
    clientSecret = process.env["AUTH0_CLIENT_SECRET"];
  const tokenUrl = new URL("/oauth/token", Auth0BaseUrl);
  const audience = new URL("/api/v2/", Auth0BaseUrl).toString();
  const res = await fetch(tokenUrl, {
    method: "POST",
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience,
    }),
    headers: { "Content-Type": "application/json" },
    next: {
      revalidate: 0,
    },
  });

  if (!res.ok) {
    console.log(res);
    throw new Error("Failed to create new management token!");
  }

  const { access_token, expires_in } = await res.json();

  await prismaClient.managementTokens.create({
    data: {
      token: access_token,
      expiresOn: new Date(Date.now() + expires_in * 1000),
    },
  });
  return access_token;
}
