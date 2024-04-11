import QuestionContainer from "@/components/upload/uploading/QuestionContainer";
import {
  EditorQuestion,
  LightningRound as LightningData,
  QuestionList,
} from "@/src/utils/set-upload-utils";
import { Card, Title } from "@tremor/react";

type LightningRoundProps = {
  round: LightningData;
  questionLists: QuestionList[];
  questions: EditorQuestion[];
};

export default function LightningRound(props: LightningRoundProps) {
  return (
    <Card>
      <Title className="mb-4">Lightning Round</Title>
      <QuestionContainer
        id={props.round.questionListId}
        questionData={props.questions}
        questions={
          props.questionLists.find(
            (qList) => qList.id === props.round.questionListId,
          )!.questions
        }
      />
    </Card>
  );
}
