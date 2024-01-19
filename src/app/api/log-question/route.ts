import { prismaClient } from "@/src/utils/clients";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session || typeof session.user.sub !== "string") {
    return NextResponse.json("Missing user session", { ...res, status: 401 });
  }
  const { user }: { user: UserProfile } = session;

  const body = await req.json();

  if (
    !("result" in body && typeof body.result === "string") ||
    !("questionId" in body && typeof body.questionId === "number")
  ) {
    return NextResponse.json("Missing tracking data", { status: 400 });
  }

  const { result, questionId }: { result: string; questionId: number } = body;
  if (!["Incorrect", "Correct"].includes(result)) {
    return NextResponse.json("Incorrect result enum", { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.userQuestionTrack.create({
      data: {
        result: result as "Incorrect" | "Correct",
        questionId: questionId,
        userId: user.sub!,
      },
    })
  );
}
