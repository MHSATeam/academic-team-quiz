import { stripHTML } from "@/src/utils/string-utils";
import { Category } from "@prisma/client";
import { nanoid } from "nanoid";

export type PDFFile = string | File | Blob | null;

export type CategoryRound = {
  type: "category";
  teams: CategoryRoundTeam[];
};

export type CategoryRoundTeam = {
  team: string;
  questionListId: string;
};

export type AlphabetRound = {
  type: "alphabet";
  letter: string;
  questionListId: string;
};

export type LightningRound = {
  type: "lightning";
  questionListId: string;
};

export type ThemeRound = {
  type: "theme";
  theme: string;
  questionListId: string;
};

export type QuestionList = {
  id: string;
  questions: string[];
};

export type Round = CategoryRound | AlphabetRound | LightningRound | ThemeRound;

export type Set = {
  name: string;
  author: string;
  createdYear: number;
  categoryRound: CategoryRound | null;
  lightningRound: LightningRound;
  alphabetRound: AlphabetRound | null;
  themeRound: ThemeRound | null;
};

export type OACSet = {
  [Prop in keyof Set]: NonNullable<Set[Prop]>;
};

export type EditorQuestion = {
  id: string;
  category: Category;
  hideInFlashcards: boolean;
  question: string;
  questionImages: ImageData[];
  answer: string;
  answerImages: ImageData[];
};

export function isOACSet(set: Set): set is OACSet {
  return (
    set.alphabetRound !== null &&
    set.categoryRound !== null &&
    set.lightningRound !== null &&
    set.themeRound !== null
  );
}

export function createQuestion(): EditorQuestion {
  return {
    id: nanoid(),
    category: {
      id: -1,
      name: "Undefined Category",
      modifiedOn: new Date(),
      createdOn: new Date(),
    },
    hideInFlashcards: false,
    question: "",
    questionImages: [],
    answer: "",
    answerImages: [],
  };
}

export function createQuestionList(): QuestionList {
  return {
    id: nanoid(),
    questions: [],
  };
}

export function createSet(
  categories?: Category[],
  questions: EditorQuestion[] = [],
): Set {
  return {
    name: "",
    author: "",
    createdYear: 0,
    categoryRound: createCategoryRound(),
    alphabetRound: createAlphabetRound(questions),
    lightningRound: createLightningRound(),
    themeRound: createThemeRound(),
  };
}
export function createCustomSet(): Set {
  return {
    name: "",
    author: "",
    createdYear: 0,
    categoryRound: null,
    alphabetRound: null,
    lightningRound: createLightningRound(),
    themeRound: null,
  };
}

export function createCategoryRound(): CategoryRound {
  return {
    type: "category",
    teams: [
      {
        team: "A",
        questionListId: "",
      },
      {
        team: "B",
        questionListId: "",
      },
      {
        team: "Z",
        questionListId: "",
      },
    ],
  };
}

export function createAlphabetRound(letter?: string): AlphabetRound;
export function createAlphabetRound(questions: EditorQuestion[]): AlphabetRound;

export function createAlphabetRound(
  arg?: string | EditorQuestion[],
): AlphabetRound {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  if (Array.isArray(arg)) {
    if (arg.length === 0) {
      arg = undefined;
    } else {
      const letters: Record<string, number> = {};
      const alphabetQuestions = arg.slice(
        Math.min(30, arg.length - 1),
        Math.min(50, arg.length - 1),
      );
      if (alphabetQuestions.length === 0) {
        arg = undefined;
      } else {
        for (const question of alphabetQuestions) {
          const letter = stripHTML(question.answer)[0].toLowerCase();
          if (alphabet.indexOf(letter) !== -1) {
            if (!(letter in letters)) {
              letters[letter] = 0;
            }
            letters[letter]++;
          }
        }
        let mostCommon: [string, number] | undefined = undefined;
        Object.entries(letters).forEach((entry) => {
          if (mostCommon === undefined || mostCommon[1] < entry[1]) {
            mostCommon = entry;
          }
        });
        if (mostCommon !== undefined) {
          arg = mostCommon[0];
        } else {
          arg = undefined;
        }
      }
    }
  }
  if (arg === undefined) {
    arg = alphabet[Math.floor(Math.random() * 26)];
  }

  return {
    type: "alphabet",
    letter: arg,
    questionListId: "",
  };
}

export function createLightningRound(): LightningRound {
  return {
    type: "lightning",
    questionListId: "",
  };
}

export function createThemeRound(theme: string = ""): ThemeRound {
  return {
    type: "theme",
    theme,
    questionListId: "",
  };
}
