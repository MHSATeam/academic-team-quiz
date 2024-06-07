import {
  CompleteSetInclude,
  createQuestionList,
} from "@/src/utils/prisma-extensions";
import { Prisma, PrismaClient } from "@prisma/client";
import "server-only";

const prismaClientSingleton = () => {
  const client = new PrismaClient().$extends({
    model: {
      set: {
        async findManyCompleteSets(
          args?: Omit<
            Prisma.Args<PrismaClient["set"], "findMany">,
            "include" | "select"
          >,
        ) {
          const sets = await client.set.findMany({
            ...args,
            include: CompleteSetInclude,
          });
          if (sets.length === 0) {
            return sets;
          }
          return sets.map((set) => ({
            ...set,
            questionList: createQuestionList(set),
          }));
        },
        async findCompleteSet(
          args?: Omit<
            Prisma.Args<PrismaClient["set"], "findFirst">,
            "include" | "select"
          >,
        ) {
          const set = await client.set.findFirst({
            ...args,
            include: CompleteSetInclude,
          });
          if (!set) {
            return set;
          }
          return {
            ...set,
            questionList: createQuestionList(set),
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
