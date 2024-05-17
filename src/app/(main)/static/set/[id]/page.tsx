import QuestionList from "@/components/display/QuestionList";
import FlashcardList from "@/components/utils/FlashcardList";
import { prismaClient } from "@/src/utils/clients";
import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import { Category, Question, Round } from "@prisma/client";
import { Flex, Subtitle, Title } from "@tremor/react";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return redirect("/404");
  }

  const set = await prismaClient.set.findFirst({
    include: {
      alphabetRound: {
        include: {
          round: {
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
              questions: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
      categoryRound: {
        include: {
          teamGroups: {
            include: {
              round: {
                include: {
                  _count: {
                    select: {
                      questions: true,
                    },
                  },
                  questions: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      lightningRound: {
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          questions: {
            include: {
              category: true,
            },
          },
        },
      },
      themeRound: {
        include: {
          round: {
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
              questions: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      id: numberId,
    },
  });

  if (set === null) {
    return redirect("/404");
  }

  const emptyRound = {
    themeRound: null,
    alphabetRound: null,
    categoryTeamGroup: null,
  };

  const createFlashcardQuestion = (
    question: Question & { category: Category },
    round: Round,
  ): QuestionWithRoundData => {
    return {
      ...question,
      round: {
        ...emptyRound,
        ...round,
      },
    };
  };

  const flashcardQuestions: QuestionWithRoundData[] = [];
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
          categoryRoundQuestionsByCategory[i].push(
            createFlashcardQuestion(round.questions[i], round),
          );
        }
        categoryRoundQuestionsByCategory[i].push(
          createFlashcardQuestion(lastTeamRound.questions[i], lastTeamRound),
        );
      }
    }
  }

  if (set.categoryRound) {
    if (categoryRoundQuestionsByCategory.length === 0) {
      flashcardQuestions.push(
        ...set.categoryRound.teamGroups.flatMap((group) =>
          group.round.questions.map((q) =>
            createFlashcardQuestion(q, group.round),
          ),
        ),
      );
    } else {
      flashcardQuestions.push(...categoryRoundQuestionsByCategory.flat());
    }
  }
  if (set.alphabetRound) {
    const round = set.alphabetRound.round;
    flashcardQuestions.push(
      ...round.questions.map((q) => createFlashcardQuestion(q, round)),
    );
  }
  if (set.lightningRound) {
    const round = set.lightningRound;
    flashcardQuestions.push(
      ...round.questions.map((q) => createFlashcardQuestion(q, round)),
    );
  }
  if (set.themeRound) {
    const round = set.themeRound.round;
    flashcardQuestions.push(
      ...round.questions.map((q) => createFlashcardQuestion(q, round)),
    );
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
        <FlashcardList questions={flashcardQuestions} />
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
