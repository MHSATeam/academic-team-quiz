import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import path from "path";
import { exit } from "process";

const prisma = new PrismaClient();

const pathToSet = "/public/data/world-literature-(all).json";

const CategoryID = 10; //  (on local)

const RoundID = 10; // Luke Knull's Quizlets: (on local)

const set = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), pathToSet), "utf-8")
);
if (set.length === 0) {
  console.log("No questions found; aborting...");
} else {
  try {
    const questions = await prisma.question.createMany({
      data: set.map((question) => ({
        question: question.definition,
        answer: question.term,
        createdYear: 2015,
        categoryId: CategoryID,
        roundId: RoundID,
      })),
    });
    console.log(`Successfully uploaded ${questions.count} questions`);
  } catch (e) {
    console.error(e);
  }
}
