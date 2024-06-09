import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import GameIdDisplay from "@/components/buzzer/GameIdDisplay";
import { Dialog, DialogPanel, Flex } from "@tremor/react";
import React, { useContext } from "react";
import QRCode from "react-qr-code";

type GameIdDialog = {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function GameIdDialog(props: GameIdDialog) {
  const boxPresence = useContext(BoxPresenceContext);
  return (
    <Dialog open={props.isOpen} onClose={props.setOpen}>
      <DialogPanel>
        {boxPresence && (
          <Flex flexDirection="col" alignItems="center" className="gap-4">
            <QRCode
              size={250}
              level="M"
              className="shrink-0 rounded-md"
              value={`${location.origin}/buzzer?id=${boxPresence.gameId}`}
            />
            <GameIdDisplay showLink={true} gameId={boxPresence.gameId} />
          </Flex>
        )}
      </DialogPanel>
    </Dialog>
  );
}
