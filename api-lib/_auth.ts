import { VercelResponse } from "@vercel/node";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import cookie from "cookie";

export function getEnvVar(variableName: string): string {
  const environmentVariable = process.env[variableName];
  if (environmentVariable === undefined || environmentVariable.length === 0)
    throw new Error(`The environment variable ${variableName} is not set.`);
  return environmentVariable;
}

export async function setUserCookie(res: VercelResponse) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(getEnvVar("JWT_SECRET_KEY")));

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("user-token", token, {
      secure: true,
      path: "/",
    })
  );

  return res;
}
