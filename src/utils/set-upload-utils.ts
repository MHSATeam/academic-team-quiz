import { Category } from "@prisma/client";
import { nanoid } from "nanoid";

export type PDFFile = string | File | Blob | null;

export type CategoryRound = {
  type: "category";
  categories: CategoryRoundQuestions[];
};

export type CategoryRoundQuestions = {
  category: Category;
  questions: EditorQuestion[];
};

export type AlphabetRound = {
  type: "alphabet";
  letter: string;
  questions: EditorQuestion[];
};

export type LightningRound = {
  type: "lightning";
  questions: EditorQuestion[];
};

export type ThemeRound = {
  type: "theme";
  theme: string;
  questions: EditorQuestion[];
};

export type Round = CategoryRound | AlphabetRound | LightningRound | ThemeRound;

export type EditorQuestion = {
  id: string;
  category: Category;
  question: string;
  questionImages: ImageData[];
  answer: string;
  answerImages: ImageData[];
};

export function createQuestion(): EditorQuestion {
  return {
    id: nanoid(),
    category: {
      id: -1,
      name: "Undefined Category",
      modifiedOn: new Date(),
      createdOn: new Date(),
    },
    question: "",
    questionImages: [],
    answer: "",
    answerImages: [],
  };
}

export function createQuestionArray(numQuestions: number): EditorQuestion[] {
  return Array.from(new Array(numQuestions), () => createQuestion());
}

export function createCategoryRound(categories: Category[]): CategoryRound {
  return {
    type: "category",
    categories: categories.map((category) => ({
      category,
      questions: createQuestionArray(2),
    })),
  };
}

export function createAlphabetRound(letter?: string): AlphabetRound {
  if (letter === undefined) {
    letter = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  }

  return {
    type: "alphabet",
    letter,
    questions: createQuestionArray(20),
  };
}

export function createLightningRound(): LightningRound {
  return {
    type: "lightning",
    questions: createQuestionArray(20),
  };
}

export function createThemeRound(theme: string): ThemeRound {
  return {
    type: "theme",
    theme,
    questions: createQuestionArray(10),
  };
}
