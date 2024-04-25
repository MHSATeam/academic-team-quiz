import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import { EditorQuestion } from "@/src/utils/set-upload-utils";
import { Subtitle } from "@tremor/react";
import classNames from "classnames";
import { Menu } from "lucide-react";
import { HTMLAttributes, Ref, forwardRef } from "react";

type QuestionDisplayProps = HTMLAttributes<HTMLDivElement> & {
  questionData: EditorQuestion;
  handleRef?: Ref<HTMLDivElement>;
  handleProps?: HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  dragOverlay?: boolean;
};

export default forwardRef<HTMLDivElement, QuestionDisplayProps>(
  function QuestionDisplay(props, ref) {
    const {
      questionData,
      handleRef,
      handleProps,
      isDragging,
      dragOverlay,
      ...divProps
    } = props;
    return (
      <div
        ref={ref}
        {...divProps}
        className={classNames(
          "flex",
          "items-center",
          "overflow-hidden",
          "relative",
          "gap-4",
          "rounded-md",
          "border",
          "p-2",
          "bg-tremor-background-muted",
          "dark:bg-dark-tremor-background-muted",
          "border-tremor-border",
          "dark:border-dark-tremor-border",
          {
            "drop-shadow-lg": dragOverlay,
            "opacity-50": isDragging,
          },
        )}
      >
        <div
          ref={handleRef}
          {...handleProps}
          className="p-2 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
        >
          <Menu />
        </div>
        <div className="flex grow basis-1/2 flex-col gap-1">
          <Subtitle>Question:</Subtitle>
          <DisplayFormattedText
            text={questionData.question}
            className="line-clamp-2 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
          />
        </div>
        <div className="flex grow basis-1/3 flex-col gap-1">
          <Subtitle>Answer:</Subtitle>
          <DisplayFormattedText
            text={questionData.answer}
            className="line-clamp-2 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
          />
        </div>
      </div>
    );
  },
);
