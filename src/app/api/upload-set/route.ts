import { sanitize } from "@/src/lib/questions/dom-purify";
import { TeamNameMapping } from "@/src/lib/round/team-mapping";
import { UploadableSet } from "@/src/lib/upload/build-set";
import { prismaClient } from "@/src/utils/clients";
import { Round } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { NextRequest, NextResponse } from "next/server";
import { ArrayElement } from "@/src/utils/array-utils";

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

  if (!("set" in body && typeof body.set === "object")) {
    return NextResponse.json("Missing set data", { status: 400 });
  }

  const { set }: { set: UploadableSet } = body;

  const questionListMapper = (
    question: ArrayElement<UploadableSet["lightningRound"]["questionList"]>,
  ) => ({
    question: sanitize(question.question),
    answer: sanitize(question.answer),
    categoryId: question.categoryId,
    createdYear: question.createdYear,
    hideInFlashcards: question.hideInFlashcards,
  });

  if (set.alphabetRound && set.categoryRound && set.themeRound) {
    const requiredSet: Required<UploadableSet> = set as Required<UploadableSet>;
    const result = await prismaClient.$transaction(async (tx) => {
      const categoryRounds: Round[] = [];
      for (const team of requiredSet.categoryRound.teams) {
        categoryRounds.push(
          await tx.round.create({
            data: {
              name:
                requiredSet.name +
                " – Category Round " +
                TeamNameMapping[team.team as keyof typeof TeamNameMapping],
              questions: {
                createMany: {
                  data: team.questionList.map(questionListMapper),
                },
              },
            },
          }),
        );
      }
      const alphabetRound =
        requiredSet.alphabetRound.questionList.length > 0
          ? {
              alphabetRound: {
                create: {
                  letter: requiredSet.alphabetRound.letter,
                  round: {
                    create: {
                      name: requiredSet.name + " – Alphabet Round",
                      questions: {
                        createMany: {
                          data: requiredSet.alphabetRound.questionList.map(
                            questionListMapper,
                          ),
                        },
                      },
                    },
                  },
                },
              },
            }
          : null;
      const lightningRound =
        requiredSet.lightningRound.questionList.length > 0
          ? {
              lightningRound: {
                create: {
                  name: requiredSet.name + " – Lightning Round",
                  questions: {
                    createMany: {
                      data: requiredSet.lightningRound.questionList.map(
                        questionListMapper,
                      ),
                    },
                  },
                },
              },
            }
          : null;
      const themeRound =
        requiredSet.themeRound.questionList.length > 0
          ? {
              themeRound: {
                create: {
                  theme: requiredSet.themeRound.theme,
                  round: {
                    create: {
                      name: requiredSet.name + " – Theme Round",
                      questions: {
                        createMany: {
                          data: requiredSet.themeRound.questionList.map(
                            questionListMapper,
                          ),
                        },
                      },
                    },
                  },
                },
              },
            }
          : null;
      return tx.set.create({
        data: {
          name: requiredSet.name,
          author: requiredSet.author,
          categoryRound: {
            create: {
              teamGroups: {
                createMany: {
                  data: requiredSet.categoryRound.teams.map((team, index) => ({
                    team: team.team,
                    roundId: categoryRounds[index].id,
                  })),
                },
              },
            },
          },
          ...alphabetRound,
          ...lightningRound,
          ...themeRound,
        },
      });
    });
    return NextResponse.json(result);
  } else {
    const result = await prismaClient.round.create({
      data: {
        name: set.name,
        questions: {
          createMany: {
            data: set.lightningRound.questionList.map(questionListMapper),
          },
        },
      },
    });
    return NextResponse.json(result);
  }
}
