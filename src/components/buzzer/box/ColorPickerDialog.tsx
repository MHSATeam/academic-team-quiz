import chroma from "chroma-js";
import { Button, Dialog, DialogPanel, Title } from "@tremor/react";
import { Dispatch, SetStateAction, useState } from "react";
import { ColorPicker, type HSVA } from "@/components/utils/ColorPicker";

type ColorPickerDialogProps = {
  isOpen: boolean;
  currentColor: string;
  team: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setTeamColor: (newColor: string) => void;
};

export default function ColorPickerDialog(props: ColorPickerDialogProps) {
  // return null;
  const [color, setColor] = useState<HSVA>([...chroma(props.currentColor).hsv(), 0]);

  const confirmColor = () => {
    props.setTeamColor(chroma.hsv(...color).hex("rgb"));
    props.setIsOpen(false);
  };

  return (
    <Dialog open={props.isOpen} onClose={confirmColor}>
      <DialogPanel className="flex flex-col gap-2 w-fit">
        <Title>Set Team {props.team.toUpperCase()}&apos;s color</Title>
        <ColorPicker className="w-48" color={color} onColorChange={setColor}>
          <ColorPicker.Area /> 
          <ColorPicker.Hue className="mt-2" />
        </ColorPicker>
        <Button onClick={confirmColor}>Confirm</Button>
      </DialogPanel>
    </Dialog>
  );
}
