import QuestionContainer from "@/components/upload/uploading/QuestionContainer";
import {
  EditorQuestion,
  QuestionList,
  ThemeRound as ThemeData,
} from "@/src/utils/set-upload-utils";
import { Card, Flex, Textarea, Title } from "@tremor/react";
type ThemeRoundProps = {
  round: ThemeData;
  setTheme: (theme: string) => void;
  questionLists: QuestionList[];
  questions: EditorQuestion[];
};

export default function ThemeRound(props: ThemeRoundProps) {
  return (
    <Card>
      <Flex flexDirection="col" className="mb-4 gap-2" alignItems="start">
        <Title>Theme Round</Title>
        <Textarea
          placeholder="Type theme..."
          className=" w-1/2 resize"
          value={props.round.theme}
          onValueChange={(value) => {
            props.setTheme(value);
          }}
        />
      </Flex>
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
