import { SetType } from "@/src/lib/buzzers/message-types";
import { Button, Card, Flex } from "@tremor/react";

type SetTypePickerProps = {
  onPickSet: (setType: SetType) => void;
};

export default function SetTypePicker(props: SetTypePickerProps) {
  return (
    <div>
      <Card className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2">
        <Flex className="gap-2">
          <Button
            onClick={() => {
              props.onPickSet("online");
            }}
          >
            Online Set
          </Button>
          <Button
            onClick={() => {
              props.onPickSet("oac-paper");
            }}
          >
            OAC Set
          </Button>
          <Button
            onClick={() => {
              props.onPickSet("unknown");
            }}
          >
            Other
          </Button>
        </Flex>
      </Card>
    </div>
  );
}
