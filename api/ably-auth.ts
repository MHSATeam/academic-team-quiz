import type { VercelRequest, VercelResponse } from "@vercel/node";
import Ably from "ably";
import { nanoid } from "nanoid";

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
    },
    clientId: nanoid(),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json("Method not allowed! Send a GET request instead");
  }
  if (ablyRest === null) {
    console.warn(
      "You have not setup an api key for ably realtime, so features related to it will be disabled."
    );
    return res.status(501).json("Error requesting token: Missing ably key");
  }

  try {
    const token = await getAblyToken();
    res.status(200).json(token);
  } catch (e) {
    console.error(e);
    res.status(500).json(`Error requesting token: ${JSON.stringify(e)}`);
  }
}