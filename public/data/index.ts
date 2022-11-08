import { readdir, readFile } from "fs/promises";
import * as path from "path";
import { sets } from "./sets";
const questions: { [key in Set]: QuizletTerm[] } = {};

export type Set = typeof sets[number];
export type Question = {
  id: number;
  definition: string;
};
export type Answer = {
  term: string;
};
export type QuizletTerm = Question & Answer;

async function loadSets() {
  if (Object.keys(questions).length !== sets.length) {
    for (const set of sets) {
      const file = path.join(process.cwd(), "public", "data", `${set}.json`);
      const data = await readFile(file, "utf8");
      questions[set] = JSON.parse(data);
    }
  }
}
export async function getQuestion(sets: Set[]): Promise<Question> {
  const set = sets[Math.floor(Math.random() * sets.length)];
  await loadSets();
  const question =
    questions[set][Math.floor(Math.random() * questions[set]!.length)];
  return {
    id: question.id,
    definition: question.definition,
  };
}
export async function getAnswer(id: number): Promise<string> {
  await loadSets();
  for (const set in questions) {
    const question = questions[set].find((q) => q.id === id);
    if (question) {
      return question.term;
    }
  }
  throw new Error("Question not found");
}
