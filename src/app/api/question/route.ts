import { NextResponse } from "next/server";
import { getRandomQuestion } from "@/src/lib/questions/get-random-question";

export async function POST() {
  const question = await getRandomQuestion();
  return NextResponse.json(question);
}
