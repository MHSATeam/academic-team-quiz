import { NextRequest, NextResponse } from "next/server";
import { Set, sets } from "@/api-lib/set-list";
import { getQuestion, getAnswer } from "@/api-lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body || !body.sets) {
    return NextResponse.json("Missing sets", { status: 400 });
  }

  const { sets: requestedSets }: { sets: string[] } = body;
  const filteredSets: Set[] = requestedSets.filter(function isSet(
    set: string
  ): set is Set {
    return sets.includes(set as Set);
  });

  if (filteredSets.length === 0) {
    return NextResponse.json("No valid sets provided", { status: 400 });
  }

  const question = await getQuestion(filteredSets);
  const answer = await getAnswer(question.id);
  return NextResponse.json({ term: answer, ...question });
}
