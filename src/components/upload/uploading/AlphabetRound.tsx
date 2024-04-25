import QuestionContainer from "@/components/upload/uploading/QuestionContainer";
import {
  AlphabetRound as AlphabetData,
  EditorQuestion,
  QuestionList,
} from "@/src/utils/set-upload-utils";
import { Card, Flex, TextInput, Title } from "@tremor/react";

type AlphabetRoundProps = {
  round: AlphabetData;
  setLetter: (letter: string) => void;
  questionLists: QuestionList[];
  questions: EditorQuestion[];
};

export default function AlphabetRound(props: AlphabetRoundProps) {
  return (
    <Card>
      <Flex className="mb-4">
        <Title>Alphabet Round</Title>
        <div className="flex items-center gap-1">
          <Title>Letter:</Title>
          <TextInput
            className="w-fit"
            value={props.round.letter.toUpperCase()}
            onFocus={(event) => {
              event.target.select();
            }}
            onValueChange={(value: string) => {
              if (value.length === 1) {
                props.setLetter(value);
              } else if (value.length > 0) {
                props.setLetter(value[1]);
              }
            }}
          />
        </div>
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
