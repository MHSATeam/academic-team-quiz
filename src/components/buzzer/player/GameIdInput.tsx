import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { Button, Card, Flex, NumberInput, Title } from "@tremor/react";
import { useState } from "react";

type GameIdInputProps = {
  onSuccessfulJoin: () => void;
};

export default function GameIdInput(props: GameIdInputProps) {
  const [gameId, setGameId] = useState<number | "">("");

  return (
    <Card className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 md:w-96">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (gameId === "") {
            return;
          }
          if (await RealtimeClient.connectToGame(gameId)) {
            props.onSuccessfulJoin();
          } else {
            alert("A game with that pin doesn't exist!");
          }
        }}
      >
        <Flex
          flexDirection="col"
          className="gap-2 text-center"
          alignItems="stretch"
        >
          <Title>Buzzer Login</Title>
          <NumberInput
            className="[&>input]:text-center [&>input]:placeholder:text-center"
            enableStepper={false}
            value={gameId}
            onValueChange={setGameId}
            placeholder="Game ID"
            style={{
              fontSize: "1.125rem",
            }}
          />
          <Button disabled={gameId === undefined}>Join</Button>
        </Flex>
      </form>
    </Card>
  );
}
