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
  const { categories, type, numQuestions } = body;
  if (
    !categories ||
    !Array.isArray(categories) ||
    !((categories: any[]): categories is number[] =>
      categories.every((value) => typeof value === "number"))(categories)
  ) {
    return NextResponse.json("Categories input was malformed", { status: 400 });
  }

  if (
    !type ||
    typeof type !== "string" ||
    !((type: string): type is QuizType => QuizTypes.includes(type as QuizType))(
      type
    )
  ) {
    return NextResponse.json("Type input was malformed", { status: 400 });
  }

  if (
    !numQuestions ||
    typeof numQuestions !== "number" ||
    numQuestions < 10 ||
    numQuestions > 100
  ) {
    return NextResponse.json("Number of Questions input was malformed", {
      status: 400,
    });
  }

  // Box A all questions unanswered
  // Box B 1 day
  // Box C 3 days
  // Box D 1 week
  // Box E 2 weeks
  // Box F 1 month

  const questions: Question[] = await prismaClient.$queryRaw`
  with
  -- find which box each question is in
  question_boxes as (
    select "questionId", greatest(0,least(5, (
      COUNT(case "result" when 'Correct' then 1 else null end)
      - COUNT(case "result" when 'Incorrect' then 1 else null end)
    )))::int as box_index,
    max("modifiedOn") as last_answered
    from "UserQuestionTrack" 
    where "userId" = ${user.sub}
    and "questionId" is not null
    group by "questionId"
  ),
  -- get the list of all avalible questions
  question_set as (
    select q.*, 
    case when boxes.box_index is null 
    then 0
    else boxes.box_index end as box_index,
    boxes.last_answered
    from "Question" q 
    left join question_boxes boxes 
    on q.id = boxes."questionId"
    where
    q."categoryId" in (${Prisma.join(categories)})
    and (boxes.last_answered is null
    or boxes.last_answered <= case 
      when boxes.box_index = 1 then now() - interval '1 day' 
      when boxes.box_index = 2 then now() - interval '3 day' 
      when boxes.box_index = 3 then now() - interval '1 week' 
      when boxes.box_index = 4 then now() - interval '2 week' 
      when boxes.box_index = 5 then now() - interval '1 month' 
      else current_date end)
  )
  -- select a random set of questions weighted towards the later boxes
  select *, 
  -LOG(1-random())/(99/(2.23605)*sqrt(box_index)+1) as priority 
  from question_set
  order by priority
  limit ${numQuestions};`;

  const quizSession = await prismaClient.userQuizSession.create({
    data: {
      quizType: type,
      userId: user.sub,
      categories: {
        connect: categories.map((categoryId) => ({
          id: categoryId,
        })),
      },
    },
  });

  await prismaClient.userQuestionTrack.createMany({
    data: questions.map((question) => ({
      result: "Incomplete",
      questionId: question.id,
      userId: user.sub!,
      quizSessionId: quizSession.id,
    })),
  });

  return NextResponse.json({
    questions,
    quizSession,
  });
}
