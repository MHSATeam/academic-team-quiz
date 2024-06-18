import QuestionContainer from "@/components/upload/uploading/QuestionContainer";
import { TeamNameMapping } from "@/src/lib/round/team-mapping";
import {
  CategoryRound as CategoryData,
  EditorQuestion,
  QuestionList,
} from "@/src/utils/set-upload-utils";
import { Card, Flex, Subtitle, Title } from "@tremor/react";

type CategoryRoundProps = {
  round: CategoryData;
  questionLists: QuestionList[];
  questions: EditorQuestion[];
};

export default function CategoryRound(props: CategoryRoundProps) {
  return (
    <Card>
      <Title>Category Round</Title>
      {props.round.teams.map((team) => {
        return (
          <Flex
            key={team.team}
            flexDirection="col"
            alignItems="start"
            className="my-4 gap-2"
          >
            <Subtitle>
              {TeamNameMapping[team.team as keyof typeof TeamNameMapping]}
            </Subtitle>
            <QuestionContainer
              id={team.questionListId}
              questionData={props.questions}
              questions={
                props.questionLists.find(
                  (qList) => qList.id === team.questionListId,
                )!.questions
              }
            />
          </Flex>
        );
      })}
    </Card>
  );
}
