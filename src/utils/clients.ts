import {
  QuestionWithRoundData,
  addRoundData,
} from "@/src/utils/quiz-session-type-extension";
import { Prisma, PrismaClient } from "@prisma/client";
import "server-only";

const prismaClientSingleton = () => {
  const client = new PrismaClient().$extends({
    model: {
      set: {
        async findCompleteSet(
          args: Omit<
            Prisma.Args<PrismaClient["set"], "findFirst">,
            "include" | "select"
          >,
        ) {
          const include = {
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
          } as const;
          const set = await client.set.findFirst({ ...args, include: include });
          if (!set) {
            return set;
          }
          const questionList: QuestionWithRoundData[] = [];
          const categoryRoundQuestionsByCategory: QuestionWithRoundData[][] =
            [];

          if (set.categoryRound) {
            if (
              set.categoryRound.teamGroups.every(
                (round) => round.round.questions.length === 10,
              )
            ) {
              const lastTeamRound =
                set.categoryRound.teamGroups[
                  set.categoryRound.teamGroups.length - 1
                ].round;
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

          if (set.categoryRound) {
            if (categoryRoundQuestionsByCategory.length === 0) {
              questionList.push(
                ...set.categoryRound.teamGroups.flatMap((group) =>
                  group.round.questions.map((q) =>
                    addRoundData(q, group.round, q.category),
                  ),
                ),
              );
            } else {
              questionList.push(...categoryRoundQuestionsByCategory.flat());
            }
          }
          if (set.alphabetRound) {
            const round = set.alphabetRound.round;
            questionList.push(
              ...round.questions.map((q) =>
                addRoundData(q, {
                  ...round,
                  alphabetRound: set.alphabetRound,
                }),
              ),
            );
          }
          if (set.lightningRound) {
            const round = set.lightningRound;
            questionList.push(
              ...round.questions.map((q) => addRoundData(q, round, q.category)),
            );
          }
          if (set.themeRound) {
            const round = set.themeRound.round;
            questionList.push(
              ...round.questions.map((q) =>
                addRoundData(
                  q,
                  { ...round, themeRound: set.themeRound },
                  q.category,
                ),
              ),
            );
          }
          return {
            ...set,
            questionList,
          };
        },
      },
    },
  });
  return client;
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prismaClient = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prismaClient;
