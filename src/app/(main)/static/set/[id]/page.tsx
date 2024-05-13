import FlashcardList from "@/components/utils/FlashcardList";
import { prismaClient } from "@/src/utils/clients";
import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import { Category, Question, Round } from "@prisma/client";
import { Flex, Subtitle } from "@tremor/react";
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
  if (set.categoryRound) {
    flashcardQuestions.push(
      ...set.categoryRound.teamGroups.flatMap((group) =>
        group.round.questions.map((q) =>
          createFlashcardQuestion(q, group.round),
        ),
      ),
    );
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
      <div className="grow overflow-auto">
        <FlashcardList questions={flashcardQuestions} />
      </div>
    </Flex>
  );
}
