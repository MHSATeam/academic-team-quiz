import { type Set, sets } from "@/api-lib/_set-list";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import Select from "react-select";
import { displayNames } from "../setNames";

type NewSetPickerProps = {
  setList: SetLabel[];
  onChange: (setList: readonly SetLabel[]) => void;
};

export type SetLabel = { value: string; label: string };

export const DefaultSetLabels = [
  ...new Set(sets.map((set) => set.replace(/-\(.*\)/, ""))),
].map((set) => ({
  value: set,
  label: displayNames[set],
})) as SetLabel[];

export function convertSetLabelsToSetArray(
  setList: SetLabel[],
  all = true,
  hard = true
) {
  var finalSetList: Set[] = [];
  for (const set of setList) {
    if (hard) {
      finalSetList.push((set.value + "-(hard)") as Set);
    }
    if (all) {
      if (set.value === "american-history") {
        finalSetList.push((set.value + "-(old)") as Set);
      } else {
        finalSetList.push((set.value + "-(all)") as Set);
      }
    }
  }
  return finalSetList;
}

export default function NewSetPicker(props: NewSetPickerProps) {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex flex-col border-2 my-4 rounded-lg">
      <button
        className={
          "flex gap-2 p-2 text-lg font-bold" + (isOpen ? " border-b-2" : "")
        }
        onClick={() => {
          setOpen(!isOpen);
        }}
        tabIndex={-1}
      >
        <span className="my-auto">Set Picker</span>
        <ArrowRight
          className={
            "transition-transform my-auto" + (isOpen ? " rotate-90" : "")
          }
        />
      </button>
      <div className="flex">
        <div
          className={
            "overflow-hidden transition-[max-height]" +
            (isOpen ? " max-h-screen" : " max-h-0")
          }
        >
          <Select
            className="m-2"
            isMulti
            isClearable={false}
            blurInputOnSelect={false}
            options={DefaultSetLabels}
            value={props.setList}
            onChange={(setList) => {
              props.onChange(setList);
            }}
            menuPortalTarget={document.body}
          />
        </div>
      </div>
    </div>
  );
}
