import { useEffect, useState } from "react";
import { type Set, sets } from "@/api-lib/_set-list";
import { displayNames } from "../setNames";

type SetPickerProps = {
  showInstruction: boolean;
  onToggle?: (value: boolean) => void;
  onUpdateSets: (enabledSets: Set[]) => void;
};

export const defaultSetList = [
  ...new Set(sets.map((set) => set.replace(/-\(.*\)/, ""))),
].map((set) => ({
  id: set,
  displayName: displayNames[set],
  selected: true,
}));

export default function SetPicker(props: SetPickerProps) {
  const [open, _setOpen] = useState(false);

  const setOpen = (value: boolean) => {
    _setOpen(value);
    props.onToggle?.(value);
  };

  const [questionGroups, setQuestionGroups] = useState({
    hard: true,
    all: true,
  });

  const [setList, setSetList] = useState(defaultSetList);

  const getSetList = (
    setList: typeof defaultSetList,
    questionGroups: { hard: boolean; all: boolean }
  ) => {
    var finalSetList: Set[] = [];
    for (const set of setList) {
      if (set.selected) {
        if (questionGroups.hard) {
          finalSetList.push((set.id + "-(hard)") as Set);
        }
        if (questionGroups.all) {
          if (set.id === "american-history") {
            finalSetList.push((set.id + "-(old)") as Set);
          } else {
            finalSetList.push((set.id + "-(all)") as Set);
          }
        }
      }
    }
    return finalSetList;
  };

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (event.target !== document.querySelector(".sidebar")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", listener);
    return () => {
      document.removeEventListener("click", listener);
    };
  }, []);

  return (
    <div
      className={"sidebar no-print" + (open ? " open" : " closed")}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      }}
      onClick={() => {
        setOpen(!open);
      }}
    >
      <span
        className={"instructions" + (!props.showInstruction ? " hide" : "")}
      >
        Filter Sets! →
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={open ? "arrow arrow-open" : "arrow arrow-closed"}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
      </svg>
      <div
        className="sidebar-sticky"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h3>Configuration</h3>
        <div className="question-group group">
          <span className="group-name">Question Types</span>
          {Object.entries(questionGroups).map(
            ([questionGroupName, enabled], index) => {
              return (
                <label
                  htmlFor={questionGroupName}
                  className="switch"
                  key={questionGroupName}
                >
                  <input
                    type="checkbox"
                    id={questionGroupName}
                    checked={enabled}
                    onChange={(e) => {
                      const newGroups = {
                        ...questionGroups,
                        [questionGroupName]: e.target.checked,
                      };
                      setQuestionGroups(newGroups);
                      props.onUpdateSets(getSetList(setList, newGroups));
                    }}
                    disabled={
                      enabled &&
                      ((questionGroups.all && !questionGroups.hard) ||
                        (!questionGroups.all && questionGroups.hard))
                    }
                    className="checkbox"
                  />
                  <span className="slider-track">
                    <span className="slider-indicator"></span>
                  </span>
                  {questionGroupName[0].toUpperCase() +
                    questionGroupName.substring(1)}
                </label>
              );
            }
          )}
        </div>
        <div className="set-list group">
          <span className="group-name">Question Sets</span>
          {Object.entries(setList).map(([setKey, set]) => {
            return (
              <label className="switch" htmlFor={set.id} key={set.id}>
                <input
                  type="checkbox"
                  id={set.id}
                  checked={set.selected}
                  onChange={(e) => {
                    const newSets = setList.map((s) => {
                      if (s.id === set.id) {
                        return {
                          ...s,
                          selected: e.target.checked,
                        };
                      } else {
                        return s;
                      }
                    });
                    setSetList(newSets);
                    props.onUpdateSets(getSetList(newSets, questionGroups));
                  }}
                  disabled={
                    set.selected &&
                    setList.reduce(
                      (count, set) => count + (set.selected ? 1 : 0),
                      0
                    ) === 1
                  }
                  className="checkbox"
                />
                <span className="slider-track">
                  <span className="slider-indicator"></span>
                </span>
                {set.displayName}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
