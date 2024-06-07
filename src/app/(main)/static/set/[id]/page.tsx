import QuestionList from "@/components/display/QuestionList";
import FlashcardList from "@/components/display/FlashcardList";
import { prismaClient } from "@/src/utils/clients";
import {
  QuestionWithRoundData,
  addRoundData,
} from "@/src/utils/prisma-extensions";
import { Flex, Subtitle, Title } from "@tremor/react";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return redirect("/404");
  }

  const set = await prismaClient.set.findCompleteSet({
    where: {
      id: numberId,
    },
  });

  if (set === null) {
    return redirect("/404");
  }

  const categoryRoundQuestionsByCategory: QuestionWithRoundData[][] = [];

  if (set.categoryRound) {
    if (
      set.categoryRound.teamGroups.every(
        (round) => round.round.questions.length === 10,
      )
    ) {
      const lastTeamRound =
        set.categoryRound.teamGroups[set.categoryRound.teamGroups.length - 1]
          .round;
      const numberOfTeams = set.categoryRound.teamGroups.length;
      for (let i = 0; i < lastTeamRound.questions.length; i++) {
        categoryRoundQuestionsByCategory.push([]);
        for (
          let j = i % 2 === 0 ? 0 : numberOfTeams - 2;
          i % 2 === 0 ? j < numberOfTeams - 1 : j >= 0;
          j += i % 2 === 0 ? 1 : -1
        ) {
          const round = set.categoryRound.teamGroups[j].round;
          const question = round.questions[i];
          categoryRoundQuestionsByCategory[i].push(
            addRoundData(question, round, question.category),
          );
        }
        categoryRoundQuestionsByCategory[i].push(
          addRoundData(
            lastTeamRound.questions[i],
            lastTeamRound,
            lastTeamRound.questions[i].category,
          ),
        );
      }
    }
  }

  return (
    <Flex
      flexDirection="col"
      className="h-full w-full gap-2"
      alignItems="stretch"
    >
      <span className="text-2xl text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
        {set.name}
      </span>
      <Subtitle>Author(s): {set.author}</Subtitle>
      <hr className="my-2 w-full" />
      <div className="h-full">
        <FlashcardList questions={set.questionList} />
      </div>
      <hr className="my-2 w-full" />
      {categoryRoundQuestionsByCategory.length > 0 && (
        <>
          <Title>Category Round</Title>
          {categoryRoundQuestionsByCategory.map((questions, index) => (
            <div key={index}>
              <Title>{questions[0].category.name}</Title>
              <QuestionList questions={questions} showAnswer />
            </div>
          ))}
        </>
      )}
      {set.alphabetRound && (
        <>
          <Title>Alphabet Round</Title>
          <QuestionList
            questions={set.alphabetRound.round.questions}
            showAnswer
          />
        </>
      )}
      {set.lightningRound && (
        <>
          <Title>Lightning Round</Title>
          <QuestionList questions={set.lightningRound.questions} showAnswer />
        </>
      )}
      {set.themeRound && (
        <>
          <Title>Theme Round</Title>
          <QuestionList questions={set.themeRound.round.questions} showAnswer />
        </>
      )}
    </Flex>
  );
}
