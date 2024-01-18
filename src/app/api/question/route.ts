import { NextRequest, NextResponse } from "next/server";
import { getRandomQuestion } from "@/src/lib/questions/get-random-question";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body || !body.sets) {
    return NextResponse.json("Missing sets", { status: 400 });
  }

  const question = await getRandomQuestion();
  return NextResponse.json(question);
}
