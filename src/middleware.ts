import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";
import { NextMiddleware } from "next/server";

export const config = {
  matcher:
    "/((?!mustangs-amazons-square-logo\\.png|buzzer|scorekeeper|api/ably-auth|api/log-buzz|beep\\.mp3).*)",
};

export default ((...args) => {
  if (process.env.VERCEL_ENV === "development") {
    return;
  }

  return withMiddlewareAuthRequired()(...args);
}) as NextMiddleware;
