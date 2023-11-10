import { type Set, sets } from "@/api-lib/_set-list";
import Select from "react-select";
import { displayNames } from "../setNames";

type SetPickerProps = {
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

export default function SetPicker(props: SetPickerProps) {
  return (
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
  );
}
