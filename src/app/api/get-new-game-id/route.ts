import Ably from "ably";
import { NextResponse } from "next/server";

const ABLY_ROOT_KEY = process.env.ABLY_ROOT_KEY;

const ablyRest =
  ABLY_ROOT_KEY !== undefined
    ? new Ably.Rest.Promise({ key: ABLY_ROOT_KEY })
    : null;

export const revalidate = 0;

function generateUniqueId(channelList: string[]): number {
  const ID_LENGTH = 7;
  let id = 0;
  for (let i = 0; i < ID_LENGTH; i++) {
    id += Math.ceil(Math.random() * 9) * 10 ** i;
  }
  for (const channelName of channelList) {
    if (channelName.includes(id.toString(10))) {
      return generateUniqueId(channelList);
    }
  }
  return id;
}

export async function GET() {
  if (ablyRest === null) {
    console.warn(
      "You have not setup an api key for ably realtime, so features related to it will be disabled.",
    );
    return NextResponse.json("Error requesting token: Missing ably key", {
      status: 500,
    });
  }

  const { items: channelList } = await ablyRest.request<string>(
    "get",
    "/channels",
    {
      prefix: "box",
      by: "id",
    },
  );

  return NextResponse.json(generateUniqueId(channelList));
}
