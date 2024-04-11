import QuestionDisplay from "@/components/upload/uploading/QuestionDisplay";
import { EditorQuestion } from "@/src/utils/set-upload-utils";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Flex, Title } from "@tremor/react";
import classNames from "classnames";

type QuestionContainerProps = {
  questionData: EditorQuestion[];
  id: string;
  questions: string[];
};

export default function QuestionContainer(props: QuestionContainerProps) {
  const { over, setNodeRef } = useDroppable({ id: props.id });
  const isOverContainer = over && props.questions.includes(over.id as string);
  return (
    <Flex
      ref={setNodeRef}
      flexDirection="col"
      alignItems="stretch"
      className={classNames(
        "min-h-16 shrink-0 gap-2 rounded-md border-2 border-tremor-border p-1 dark:border-dark-tremor-border",
        {
          "bg-tremor-background-muted dark:bg-dark-tremor-background-muted":
            isOverContainer,
        },
      )}
    >
      <SortableContext
        id={props.id}
        items={props.questions}
        strategy={verticalListSortingStrategy}
      >
        {props.questions.map((questionId) => {
          const question = props.questionData.find((q) => q.id === questionId);
          if (!question) {
            return null;
          }
          return (
            <DraggableQuestion
              key={questionId}
              questionId={questionId}
              questionData={question}
            />
          );
        })}
      </SortableContext>
      {props.questions.length === 0 && (
        <Title className="my-auto text-center">Drop Questions Here</Title>
      )}
    </Flex>
  );
}

type DraggableQuestionProps = {
  questionId: string;
  questionData: EditorQuestion;
};

function DraggableQuestion(props: DraggableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.questionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <QuestionDisplay
      questionData={props.questionData}
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      handleRef={setActivatorNodeRef}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
    />
  );
}
