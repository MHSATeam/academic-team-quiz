import QuizTypes from "@/src/lib/quiz-sessions/QuizTypes";
import { prismaClient } from "@/src/utils/clients";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Prisma, Question, QuizType } from "@prisma/client";
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
  const { categories } = body;
  if (
    !categories ||
    !Array.isArray(categories) ||
    !((categories: any[]): categories is number[] =>
      categories.every((value) => typeof value === "number"))(categories)
  ) {
    return NextResponse.json("Categories input was malformed", { status: 400 });
  }

  try {
    return NextResponse.json(
      JSON.stringify(
        await prismaClient.userDefaultCategories.upsert({
          create: {
            userId: user.sub,
            categories: {
              connect: categories.map((id) => ({ id })),
            },
          },
          where: {
            userId: user.sub,
          },
          update: {
            categories: {
              set: categories.map((id) => ({ id })),
            },
          },
        })
      )
    );
  } catch (e) {
    return NextResponse.json("Failed to update user categories!", {
      status: 500,
    });
  }
}
