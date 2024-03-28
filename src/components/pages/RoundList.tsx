"use client";

import QuestionList from "@/components/display/QuestionList";
import getRoundName from "@/src/lib/round/getRoundName";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  Button,
  Card,
  Flex,
  Grid,
  Subtitle,
  TextInput,
  Title,
} from "@tremor/react";
import { Search } from "lucide-react";
import MiniSearch from "minisearch";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type RoundListProps = {
  rounds: Prisma.Result<
    PrismaClient["round"],
    {
      include: {
        questions: {
          take: 5;
        };
        alphabetRound: true;
        categoryTeamGroup: {
          include: {
            category: true;
          };
        };
        themeRound: true;
        sets: true;
        _count: {
          select: {
            questions: true;
          };
        };
      };
    },
    "findMany"
  >;
};

export default function RoundList(props: RoundListProps) {
  const minisearch = useRef<MiniSearch>();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    minisearch.current = new MiniSearch({
      fields: ["name"],
      storeFields: ["id", "name"],
    });
    minisearch.current.addAll(props.rounds);
  }, [props.rounds]);

  const filteredRounds = useMemo(() => {
    if (!minisearch.current || search.trim().length === 0) return props.rounds;
    const searchResults = minisearch.current.search(search);
    return props.rounds.filter(
      (round) => searchResults.findIndex((r) => r.id === round.id) !== -1
    );
  }, [props.rounds, search]);

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
        }}
      >
        <Flex className="gap-2 items-stretch">
          <TextInput
            placeholder="Search"
            icon={Search}
            value={searchInput}
            onValueChange={setSearchInput}
            className="grow"
            style={{
              fontSize: "1.125rem",
            }}
          />
          <Button icon={Search} />
        </Flex>
      </form>
      <Grid
        numItems={1}
        numItemsMd={3}
        className="gap-4 justify-normal items-stretch"
      >
        {filteredRounds.map((round) => {
          const { fullName, roundType, name } = getRoundName(round);

          return (
            <Card key={round.id}>
              <Link href={`/static/round/${round.id}`}>
                <Title>{name ?? fullName}</Title>
                <Subtitle>{roundType}</Subtitle>
                <Subtitle>{round._count.questions} Questions</Subtitle>
              </Link>
              <hr className="my-2" />
              <Title>Sample Questions</Title>
              <QuestionList questions={round.questions} />
            </Card>
          );
        })}
      </Grid>
    </div>
  );
}
