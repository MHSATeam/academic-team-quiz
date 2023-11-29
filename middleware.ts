import cookie from "cookie";
import { jwtVerify } from "jose";
import { getEnvVar } from "./api-lib/_auth";
export const config = {
  matcher: ["/api/((?!login).*)"],
};

class AuthError extends Error {}

interface UserJwtPayload {
  jti: string;
  iat: number;
}

async function verifyAuth(req: Request) {
  // Get token from cookie
  const cookies = req.headers.get("cookie");
  const parsedCookies = cookie.parse(cookies || "");
  const token = parsedCookies["user-token"];

  if (!token) throw new AuthError("Missing user token");

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getEnvVar("JWT_SECRET_KEY"))
    );
    return verified.payload as UserJwtPayload;
  } catch (err) {
    throw new AuthError("Your token has expired.");
  }
}

export default async function middleware(req: Request) {
  const isLocal = process.env.VERCEL_ENV === "development";

  if (isLocal) {
    return;
  }

  const verifiedToken = await verifyAuth(req).catch((err) => {
    console.error(err.message);
  });

  if (!verifiedToken) {
    // if this an API request, respond with JSON
    if (new URL(req.url).pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({ error: { message: "Authentication Required" } }),
        { status: 401 }
      );
    }
    // otherwise, redirect to the set token page
    else {
      return Response.redirect(new URL("/", req.url));
    }
  }
}
