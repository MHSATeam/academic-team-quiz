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

  if (!user.sub) {
    return NextResponse.json("User profile was malformed", { status: 500 });
  }

  const body = await req.json();

  if (!("quizSessionId" in body && typeof body.quizSessionId === "number")) {
    return NextResponse.json("Missing tracking data", { status: 400 });
  }

  const { quizSessionId }: { quizSessionId: number } = body;

  try {
    const updateResponse = await prismaClient.userQuizSession.update({
      where: {
        id: quizSessionId,
        userId: user.sub,
      },
      data: {
        completedOn: new Date(),
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
