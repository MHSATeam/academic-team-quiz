import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import { HTMLAttributes } from "react";

type QuestionTextProps = {
  question: QuestionWithRoundData;
  showQuestion?: boolean;
  subtitleClass?: string;
} & Omit<HTMLAttributes<HTMLParagraphElement>, "children">;

export default function QuestionText({
  question,
  showQuestion = true,
  subtitleClass,
  ...textProps
}: QuestionTextProps) {
  return (
    <div className="overflow-auto">
      {showQuestion ? (
        <>
          {question.round?.alphabetRound && (
            <span className={subtitleClass}>
              Alphabet Round Letter:{" "}
              {question.round.alphabetRound.letter.toUpperCase()}
            </span>
          )}
          {question.round?.themeRound && (
            <span className={subtitleClass}>
              Part of a theme round, see question info
            </span>
          )}
          <DisplayFormattedText text={question.question} {...textProps} />
        </>
      ) : (
        <DisplayFormattedText text={question.answer} {...textProps} />
      )}
    </div>
  );
}
