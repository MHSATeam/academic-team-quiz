import QuestionDisplay from "@/components/display/QuestionDisplay";
import { getMissedQuestions } from "@/src/lib/questions/get-missed-questions";
import { prismaClient } from "@/src/utils/clients";
import { preProcessFullTextSearch } from "@/src/utils/string-utils";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Question } from "@prisma/client";
import {
  Button,
  Card,
  Flex,
  Grid,
  Metric,
  Subtitle,
  TextInput,
  Title,
} from "@tremor/react";
import { Search } from "lucide-react";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: { search?: string };
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

  const hasSearch =
    searchParams.search !== undefined && searchParams.search.trim() !== "";

  let questions: Question[];

  if (hasSearch) {
    const processedSearch = preProcessFullTextSearch(searchParams.search);
    questions = await prismaClient.question.findMany({
      where: {
        OR: [
          {
            question: {
              search: processedSearch,
            },
          },
          {
            answer: {
              search: processedSearch,
            },
          },
        ],
      },
      orderBy: {
        _relevance: {
          fields: ["answer", "question"],
          search: processedSearch,
          sort: "desc",
        },
      },
      take: 24,
    });
  } else {
    questions = await getMissedQuestions(user.sub, 24);
  }

  const categories = await prismaClient.category.findMany();

  return (
    <Flex
      flexDirection="col"
      className="gap-4"
      alignItems="start"
      justifyContent="start"
    >
      <Metric>Question Search</Metric>
      <form method="GET" action="/static/question" className="w-full">
        <Flex alignItems="stretch">
          <TextInput
            id="search"
            name="search"
            placeholder="Search"
            defaultValue={searchParams.search}
            className="rounded-r-none border-r-0"
            autoComplete="off"
            style={{
              fontSize: "1.125rem",
            }}
          />
          <Button type="submit" className="rounded-l-none border-l-0">
            <Search />
          </Button>
        </Flex>
      </form>
      {!hasSearch && <Title>Most missed Questions</Title>}
      {!hasSearch && questions.length === 0 && (
        <Title>You haven't missed any questions!</Title>
      )}
      <Grid numItems={1} numItemsLg={3} numItemsMd={2} className="gap-4">
        {questions.map((question) => {
          return (
            <Card key={question.id}>
              <Title>
                <Link
                  href={`/static/question/${question.id}`}
                  className="text-blue-500"
                >
                  Question #{question.id}
                </Link>
              </Title>
              <Subtitle>
                <Link
                  href={`/static/category/${question.categoryId}`}
                  className="text-blue-500"
                >
                  {categories.find((c) => c.id === question.categoryId)?.name}
                </Link>
              </Subtitle>
              <QuestionDisplay question={question} />
            </Card>
          );
        })}
      </Grid>
    </Flex>
  );
}
