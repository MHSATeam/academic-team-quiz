import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import type { BuzzerClickMessage } from "@/src/buzzers/ably-realtime";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
const private_key = process.env.PRIVATE_KEY?.split(String.raw`\n`).join("\n");

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: private_key,
    projectId: "academic-team-buzzers",
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});
const spreadsheetId = "1GVp5t7rZzk64-YMGURvfq_oVjNa_BudmTHWz7j_geZ8";

export const POST = withApiAuthRequired(async function POST(req: NextRequest) {
  const { buzzList, sessionId } = (await req.json()) as {
    buzzList: BuzzerClickMessage[];
    sessionId: string;
  };
  const firstBuzzTime = buzzList[0].timestamp;
  try {
    const range = "Logs!A1:G1";
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        range,
        values: buzzList.map((buzz, index) => [
          sessionId,
          buzz.user.label,
          index === 0 ? "first" : "successive",
          (buzz.timestamp - firstBuzzTime) / 1000,
          new Date(buzz.timestamp).toLocaleTimeString("en-US"),
          new Date().toLocaleDateString("en-US", {
            dateStyle: "short",
            timeStyle: undefined,
          }),
        ]),
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json({ success: false });
});
