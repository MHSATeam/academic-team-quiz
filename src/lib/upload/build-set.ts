import {
  EditorQuestion,
  QuestionList,
  Set,
} from "@/src/utils/set-upload-utils";

export type UploadableSet = {
  name: string;
  author: string;
  categoryRound?: CategoryRound;
  lightningRound: LightningRound;
  alphabetRound?: AlphabetRound;
  themeRound?: ThemeRound;
};

type CategoryRound = {
  teams: CategoryRoundTeam[];
};

type CategoryRoundTeam = {
  team: string;
  questionList: Question[];
};

type AlphabetRound = {
  letter: string;
  questionList: Question[];
};

type LightningRound = {
  questionList: Question[];
};

type ThemeRound = {
  theme: string;
  questionList: Question[];
};

type Question = {
  question: string;
  answer: string;
  hideInFlashcards: boolean;
  categoryId: number;
  createdYear: number;
};

function removePTags(question: string) {
  return question.replace(/<\/?p>/g, "");
}

export function buildSet(
  questions: EditorQuestion[],
  set: Set,
  questionLists: QuestionList[],
): UploadableSet {
  const partialSet: UploadableSet = {
    name: set.name,
    author: set.author,
    lightningRound: { questionList: [] },
    alphabetRound: { letter: "", questionList: [] },
    themeRound: { theme: "", questionList: [] },
    categoryRound: {
      teams: [],
    },
  };

  function getQuestion(id: string): Question {
    const editorQuestion = questions.find((q) => q.id === id);
    if (!editorQuestion) {
      throw new Error("Unable to find question of id: " + id);
    }
    return {
      question: removePTags(editorQuestion.question),
      answer: removePTags(editorQuestion.answer),
      categoryId: editorQuestion.category.id,
      createdYear: set.createdYear,
      hideInFlashcards: editorQuestion.hideInFlashcards,
    };
  }

  const rounds = ["lightningRound", "alphabetRound", "themeRound"] as const;
  for (const round of rounds) {
    const preRoundObj = set[round];
    if (!preRoundObj) {
      delete partialSet[round];
      continue;
    }
    const roundList = questionLists.find(
      (qList) => qList.id === preRoundObj.questionListId,
    );
    if (!roundList) {
      throw new Error(`Missing question list for ${round}!`);
    }
    const roundObj = partialSet[round];
    if (!roundObj) {
      throw new Error("Something went terribly wrong");
    }
    roundObj.questionList = roundList.questions.map(getQuestion);
  }

  if (set.alphabetRound && partialSet.alphabetRound) {
    partialSet.alphabetRound.letter = set.alphabetRound.letter;
  }

  if (set.themeRound && partialSet.themeRound) {
    partialSet.themeRound.theme = set.themeRound.theme;
  }

  if (!set.categoryRound) {
    delete partialSet.categoryRound;
  } else if (!partialSet.categoryRound) {
    throw new Error("Something went terribly wrong");
  } else {
    for (const categoryRoundQuestions of set.categoryRound.teams) {
      const roundList = questionLists.find(
        (qList) => qList.id === categoryRoundQuestions.questionListId,
      );
      if (!roundList) {
        throw new Error(
          `Missing question list for category round team ${categoryRoundQuestions.team}!`,
        );
      }
      partialSet.categoryRound.teams.push({
        team: categoryRoundQuestions.team,
        questionList: roundList.questions.map(getQuestion),
      });
    }
  }

  return partialSet;
}
