import { Button, Card, Flex, TextInput, Title } from "@tremor/react";
import { useState } from "react";

type NameInputProps = {
  onSetName: (name: string) => void;
};

export default function NameInput(props: NameInputProps) {
  const [nameInput, setNameInput] = useState("");

  return (
    <Card className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 md:w-96">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          props.onSetName(nameInput.trim());
        }}
      >
        <Flex
          flexDirection="col"
          className="gap-2 text-center"
          alignItems="stretch"
        >
          <Title>Buzzer Login</Title>
          <TextInput
            className="[&>input]:text-center [&>input]:placeholder:text-center"
            value={nameInput}
            onValueChange={setNameInput}
            placeholder="Name"
            maxLength={40}
            style={{ fontSize: "1.125rem" }}
          />
          <Button disabled={nameInput.trim().length === 0}>Next</Button>
        </Flex>
      </form>
    </Card>
  );
}
