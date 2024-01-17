"use client";
import { type Set, sets } from "@/api-lib/set-list";
import Select from "react-select";

const displayNames: { [key: string]: string } = {
  "american-government-and-economics": "American Government and Economics",
  "american-history": "American History",
  "american-literature": "American Literature",
  "fine-arts": "Fine Arts",
  geography: "Geography",
  "life-science": "Life Science",
  math: "Math",
  "physical-science": "Physical Science",
  "world-history": "World History",
  "world-literature": "World Literature",
};

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

export function convertSetLabelsToSetArray(setList: SetLabel[]) {
  var finalSetList: Set[] = [];
  for (const set of setList) {
    if (set.value === "american-history") {
      finalSetList.push((set.value + "-(old)") as Set);
    } else {
      finalSetList.push((set.value + "-(all)") as Set);
    }
  }
  return finalSetList;
}

export default function SetPicker(props: SetPickerProps) {
  return (
    <Select
      className="m-2 dark:text-black"
      isMulti
      isClearable={false}
      blurInputOnSelect={false}
      closeMenuOnSelect={false}
      options={DefaultSetLabels}
      value={props.setList}
      onChange={(setList) => {
        props.onChange(setList);
      }}
      menuPortalTarget={document.body}
    />
  );
}
