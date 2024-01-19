import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const pathToSet = "/public/data/physical-science-(all).json";

const CategoryID = 1; // Physical Science (on local)

const RoundID = 1; // Luke Knull's Quizlets: Physical Science (on local)

const set = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), pathToSet), "utf-8")
);
const newQuestions = [];
for (const question of set) {
  try {
    newQuestions.push(
      await prisma.question.create({
        data: {
          question: question.definition,
          answer: question.term,
          createdYear: 2015,
          categoryId: CategoryID,
          roundId: RoundID,
        },
      })
    );
  } catch (e) {
    console.error(e);
    console.log(newQuestions.slice(newQuestions.length - 4));
    break;
  }
}