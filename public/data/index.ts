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
export const letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
];
export type Letter = typeof letters[number];
export type QuestionSet = {
  catagories: { [key in Set]: QuizletTerm[] };
  alphabetRound: {
    letter: Letter;
    questions: QuizletTerm[];
  };
};

const connectorsAndArticles = [
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "for",
  "nor",
  "so",
  "yet",
  "as",
  "at",
  "by",
];
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

export async function getQuestionSet(sets: Set[]): Promise<QuestionSet> {
  await loadSets();
  const questionSet: QuestionSet = {
    catagories: {},
    alphabetRound: {
      letter: letters[Math.floor(Math.random() * letters.length)],
      questions: [],
    },
  };
  var randomSets = sets.sort(() => Math.random() - 0.5);
  var tagRegex = /-\(.*\)/;
  for (const set of randomSets) {
    var done = false;
    for (const completedSet in questionSet.catagories) {
      if (completedSet.replace(tagRegex, "") === set.replace(tagRegex, "")) {
        done = true;
      }
    }
    if (!done) {
      questionSet.catagories[set] = questions[set]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    }
  }
  var maxCount = 100;
  for (let i = 0; i < 20; i++) {
    if (maxCount <= 0) {
      break;
    }
    maxCount--;
    var question = questions[sets[Math.floor(Math.random() * sets.length)]]
      .sort(() => Math.random() - 0.5)
      .find((q) =>
        q.term
          .toLowerCase()
          .split(" ")
          .find((v) => !connectorsAndArticles.includes(v))
          .startsWith(questionSet.alphabetRound.letter.toLowerCase())
      );
    if (!question) {
      i--;
      continue;
    }

    if (questionSet.alphabetRound.questions.find((q) => q.id === question.id)) {
      i--;
      continue;
    }
    questionSet.alphabetRound.questions.push(question);
  }
  return questionSet;
}
