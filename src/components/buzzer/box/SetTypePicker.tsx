import { SetType } from "@/src/lib/buzzers/message-types";
import { Button, Card, Flex, Metric, Title } from "@tremor/react";
import { ReactNode } from "react";

type SetTypePickerProps = {
  onPickSet: (setType: SetType) => void;
};
type ButtonData = {
  title: string;
  description: ReactNode;
  setType: SetType;
};

export default function SetTypePicker(props: SetTypePickerProps) {
  return (
    <div>
      <Card className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2">
        <Metric className="mb-4 text-center">
          Welcome to the Online Buzzer System!
        </Metric>
        <Title className="text-center">Choose a set type</Title>
        <Flex className="gap-2 overflow-hidden" alignItems="stretch">
          {(
            [
              {
                title: "Online Set",
                description: (
                  <>
                    Use questions from our online database.{" "}
                    <b>(Does not require any paper)</b>
                  </>
                ),
                setType: "online",
              },
              {
                title: "OAC Paper Set",
                description: (
                  <>
                    Designed to be used with an OAC (Ohio Academic Competition)
                    set. <b>(These are usually in the binders)</b>
                  </>
                ),
                setType: "oac-paper",
              },
              {
                title: "Other",
                description:
                  "System will behave the same way as the physical buzzers.",
                setType: "unknown",
              },
            ] as ButtonData[]
          ).map((buttonData, i) => (
            <Button
              className="shrink basis-1/3 overflow-hidden"
              onClick={() => {
                props.onPickSet(buttonData.setType);
              }}
              key={i}
            >
              <Flex flexDirection="col" className="overflow-hidden">
                <Title>{buttonData.title}</Title>
                <p className="text-wrap text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  {buttonData.description}
                </p>
              </Flex>
            </Button>
          ))}
        </Flex>
      </Card>
    </div>
  );
}
