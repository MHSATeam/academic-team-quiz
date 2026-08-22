import { ColorPicker, useColorState } from "react-beautiful-color";
import { Dialog, DialogPanel } from "@tremor/react";
import { Dispatch, SetStateAction } from "react";
type ColorPickerDialogProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setTeamColor: (newColor: string) => void;
};

export default function ColorPickerDialog(props: ColorPickerDialogProps) {
  const [{ colorInput, colorState }, setColor] = useColorState();

  const confirmColor = () => {
    props.setTeamColor(colorState.hex);
    props.setIsOpen(false);
  };

  return (
    <Dialog open={props.isOpen} onClose={confirmColor}>
      <DialogPanel>
        <ColorPicker color={colorInput} onChange={setColor}>
          <ColorPicker.Hue />
        </ColorPicker>
      </DialogPanel>
    </Dialog>
  );
}
