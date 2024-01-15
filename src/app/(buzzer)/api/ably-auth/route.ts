import Ably from "ably";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

class KeyMissingError extends Error {}

const ABLY_ROOT_KEY = process.env.ABLY_ROOT_KEY;

const ablyRest =
  ABLY_ROOT_KEY !== undefined
    ? new Ably.Rest.Promise({ key: ABLY_ROOT_KEY })
    : null;

async function getAblyToken(): Promise<Ably.Types.TokenRequest> {
  if (ablyRest === null) {
    throw new KeyMissingError("Ably Key is not set");
  }
  return ablyRest.auth.createTokenRequest({
    capability: {
      "buzzer-click": ["subscribe", "publish", "presence"],
      "box-updates": ["subscribe", "publish", "presence"],
    },
    clientId: nanoid(),
  });
}

export async function GET(req: Request) {
  if (ablyRest === null) {
    console.warn(
      "You have not setup an api key for ably realtime, so features related to it will be disabled."
    );
    return NextResponse.json("Error requesting token: Missing ably key", {
      status: 500,
    });
  }

  try {
    const token = await getAblyToken();
    return NextResponse.json(token);
  } catch (e) {
    console.error(e);
    return NextResponse.json(`Error requesting token: ${JSON.stringify(e)}`, {
      status: 500,
    });
  }
}
