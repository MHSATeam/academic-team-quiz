import fs from "fs/promises";
const questions: { [key in Set]: QuizletTerm[] } = {};
export const sets = [
  "american-government-and-economics-(all)",
  "american-government-and-economics-(hard)",
  "american-history-(hard)",
  "american-history-(old)",
  "american-literature-(all)",
  "american-literature-(hard)",
  "fine-arts-(all)",
  "fine-arts-(hard)",
  "geography-(all)",
  "geography-(hard)",
  "life-science-(all)",
  "life-science-(hard)",
  "math-(all)",
  "math-(hard)",
  "physical-science-(all)",
  "physical-science-(hard)",
  "world-history-(all)",
  "world-history-(hard)",
  "world-literature-(all)",
  "world-literature-(hard)",
];

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
      const data = await fs.readFile(`./data/${set}.json`, "utf-8");
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
