import { Button, Card, Flex, Grid, Title } from "@tremor/react";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import QuestionList from "@/components/display/QuestionList";

type SetPickerProps = {
  sets: CompleteSet[];
  selectSet: (set: CompleteSet) => void;
};

export default function SetPicker(props: SetPickerProps) {
  return (
    <div className="absolute left-1/2 top-1/2 flex h-full w-fit -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden p-4">
      <Card className="flex max-h-full flex-col gap-2 overflow-hidden">
        <Title>Choose a set</Title>
        <Grid numItems={2} className="grow gap-2 overflow-auto p-1">
          {props.sets.map((set, i) => {
            return (
              <Card key={i}>
                <Flex
                  className="gap-2"
                  flexDirection="col"
                  alignItems="stretch"
                >
                  <Title>{set.name}</Title>
                  <hr />
                  <QuestionList questions={set.questionList.slice(0, 5)} />
                  <hr />
                  <Button onClick={() => props.selectSet(set)}>Play Set</Button>
                </Flex>
              </Card>
            );
          })}
        </Grid>
      </Card>
    </div>
  );
}
