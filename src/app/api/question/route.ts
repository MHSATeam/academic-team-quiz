import { NextRequest, NextResponse } from "next/server";
import { getRandomQuestion } from "@/src/lib/questions/get-random-question";

export async function POST(req: NextRequest) {
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
  const question = await getRandomQuestion(categories);
  return NextResponse.json(question);
}
