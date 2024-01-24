import Flashcards from "@/components/pages/Flashcards";
import { prismaClient } from "@/src/utils/clients";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Button, Title } from "@tremor/react";
import Link from "next/link";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: {
    id?: string;
  };
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
  if (user.sub && searchParams.id && typeof searchParams.id === "string") {
    const idNum = Number(searchParams.id);
    if (!Number.isNaN(idNum)) {
      const quizSession = await prismaClient.userQuizSession.findUnique({
        where: {
          id: idNum,
          quizType: "Flashcards",
          userId: user.sub,
        },
        include: {
          questionsTrackers: {
            orderBy: {
              id: "asc",
            },
            include: {
              question: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (quizSession) {
        return <Flashcards quizSession={quizSession} />;
      }
    }
  }
  return (
    <main className="px-6 py-12">
      <Title>This flashcard set doesn't exist!</Title>
      <Button className="w-fit">
        <Link href="/">Go Home</Link>
      </Button>
    </main>
  );
}
