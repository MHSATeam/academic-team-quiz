import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";

export const config = {
  matcher:
    "/((?!mustangs-amazons-square-logo.png|buzzer|scorekeeper|api/ably-auth|api/log-buzz).*)",
};

export default withMiddlewareAuthRequired();
