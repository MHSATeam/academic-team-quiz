import CreateQuizSession from "@/components/inputs/CreateQuizSession";
import DeleteSession from "@/components/inputs/DeleteSession";
import QuizTypes from "@/src/lib/quiz-sessions/quiz-types";
import getDefaultCategories from "@/src/lib/users/get-default-categories";
import { prismaClient } from "@/src/utils/clients";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { QuizType } from "@prisma/client";
import {
  Card,
  Flex,
  Grid,
  Metric,
  ProgressBar,
  Subtitle,
  Text,
  Title,
} from "@tremor/react";
import { FileText, Layers, Pencil } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await getSession();
  let user: UserProfile;
  if (!session) {
    user = {
      name: "Test User",
      sub: "google-oauth2|113895089668351284797",
      email: "test@example.com",
      email_verified: true,
      nickname: "Test",
    };
  } else {
    user = session.user;
  }

  if (!user.sub || !user.name) {
    throw new Error("Missing user data!");
  }

  const quizSessions = await prismaClient.userQuizSession.findMany({
    where: {
      userId: user.sub,
    },
    orderBy: {
      createdOn: "desc",
    },
    include: {
      categories: true,
      questionsTrackers: true,
      _count: {
        select: {
          questionsTrackers: {
            where: {
              NOT: {
                result: "Incomplete",
              },
            },
          },
        },
      },
    },
  });

  const defaultCategories = await getDefaultCategories(user.sub);

  const categories = await prismaClient.category.findMany();

  return (
    <main className="flex flex-col gap-4 px-6 py-12">
      <Metric>In Progress Sessions</Metric>
      <Grid
        numItems={1}
        numItemsMd={3}
        className="items-stretch justify-normal gap-4"
      >
        <CreateQuizSession
          defaultOpen={quizSessions.every(
            (quizSession) => quizSession.completedOn !== null,
          )}
          defaultQuizType={
            QuizTypes.includes(searchParams.type as QuizType)
              ? (searchParams.type as QuizType)
              : undefined
          }
          defaultCategories={defaultCategories.map(({ id }) => id)}
          categories={categories}
        />
        {quizSessions.map((quizSession) => {
          const Icon = {
            Flashcards: Layers,
            Writing: Pencil,
            Test: FileText,
          }[quizSession.quizType];
          const cardBody = (
            <Flex className="h-full" flexDirection="col" alignItems="start">
              <Flex justifyContent="start" className="gap-2">
                <Icon className="dark:text-white" />
                <Title>{quizSession.quizType}</Title>
              </Flex>
              <Subtitle className="mb-auto">
                {quizSession.categories
                  .map((category) => category.name)
                  .join(", ")}
              </Subtitle>
              <Flex className="gap-2">
                <Flex flexDirection="col" alignItems="start">
                  <Flex justifyContent="end">
                    <Text>
                      {quizSession._count.questionsTrackers} /{" "}
                      {quizSession.questionsTrackers.length}
                    </Text>
                  </Flex>
                  <ProgressBar
                    value={
                      (quizSession._count.questionsTrackers * 100) /
                      quizSession.questionsTrackers.length
                    }
                  />
                  <Text className="mt-2">
                    Started: {quizSession.createdOn.toLocaleDateString()}
                  </Text>
                </Flex>
                {quizSession.completedOn === null && (
                  <DeleteSession sessionId={quizSession.id} />
                )}
              </Flex>
            </Flex>
          );
          return (
            <Card className="overflow-hidden" key={quizSession.id}>
              {quizSession.completedOn !== null && (
                <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-gray-500 bg-opacity-50">
                  <Title>Completed</Title>
                  <Subtitle color="blue">
                    On {quizSession.completedOn.toLocaleDateString()}
                  </Subtitle>
                </div>
              )}
              {quizSession.completedOn === null ? (
                <Link
                  href={`/study/${quizSession.quizType.toLowerCase()}?id=${
                    quizSession.id
                  }`}
                >
                  {cardBody}
                </Link>
              ) : (
                cardBody
              )}
            </Card>
          );
        })}
      </Grid>
    </main>
  );
}
