import { prismaClient } from "@/src/utils/clients";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Result } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session || typeof session.user.sub !== "string") {
    return NextResponse.json("Missing user session", { ...res, status: 401 });
  }
  const { user }: { user: UserProfile } = session;

  if (!user.sub) {
    return NextResponse.json("User profile was malformed", { status: 500 });
  }

  const body = await req.json();

  if (
    !("result" in body && typeof body.result === "string") ||
    !("questionTrackerId" in body && typeof body.questionTrackerId === "number")
  ) {
    return NextResponse.json("Missing tracking data", { status: 400 });
  }

  const {
    result,
    questionTrackerId,
  }: { result: string; questionTrackerId: number } = body;
  if (!["Incorrect", "Correct", "Incomplete"].includes(result)) {
    return NextResponse.json("Incorrect result enum", { status: 400 });
  }

  try {
    const updateResponse = await prismaClient.userQuestionTrack.update({
      where: {
        id: questionTrackerId,
        userId: user.sub,
        OR: [
          {
            quizSession: null,
          },
          {
            quizSession: {
              completedOn: null,
            },
          },
        ],
      },
      data: {
        result: {
          set: result as Result,
        },
      },
    });
    return NextResponse.json(updateResponse);
  } catch (e) {
    console.error(e);
    return NextResponse.json("User question track does not exist", {
      status: 400,
    });
  }
}
