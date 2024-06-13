import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import Ably from "ably";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

class KeyMissingError extends Error {}

const ABLY_ROOT_KEY = process.env.ABLY_ROOT_KEY;

const ablyRest =
  ABLY_ROOT_KEY !== undefined
    ? new Ably.Rest.Promise({ key: ABLY_ROOT_KEY })
    : null;

async function getAblyToken(
  clientId: string,
): Promise<Ably.Types.TokenRequest> {
  if (ablyRest === null) {
    throw new KeyMissingError("Ably Key is not set");
  }
  return ablyRest.auth.createTokenRequest({
    capability: {
      "player:*": ["subscribe", "publish", "presence"],
      "box:*": ["subscribe", "publish", "presence"],
      "timing:*": ["subscribe", "publish"],
      "images:*": ["subscribe", "publish"],
    },
    clientId: clientId,
  });
}

export const revalidate = 0;

export async function GET(req: NextRequest) {
  if (ablyRest === null) {
    console.warn(
      "You have not setup an api key for ably realtime, so features related to it will be disabled.",
    );
    return NextResponse.json("Error requesting token: Missing ably key", {
      status: 500,
    });
  }

  let clientId = nanoid();

  const res = new NextResponse();
  const session = await getSession(req, res);
  if (session && typeof session.user.sub === "string") {
    const { user }: { user: UserProfile } = session;
    if (!user.sub) {
      return NextResponse.json("User profile was malformed", { status: 500 });
    }
    clientId = user.sub;
  } else {
    clientId = req.nextUrl.searchParams.get("client-id") ?? clientId;
  }

  try {
    const token = await getAblyToken(clientId);
    return NextResponse.json(token);
  } catch (e) {
    console.error(e);
    return NextResponse.json(`Error requesting token: ${JSON.stringify(e)}`, {
      status: 500,
    });
  }
}
