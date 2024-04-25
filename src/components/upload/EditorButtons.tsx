import { EditorButton } from "@/src/utils/tiptap-utils";
import { Editor } from "@tiptap/react";

type EditorButtonsProps = {
  editor: Editor;
  buttons: EditorButton[];
};
export default function EditorButtons(props: EditorButtonsProps) {
  return (
    <div className="flex gap-1">
      {props.buttons.map((button) => {
        return (
          <EditorButton
            key={button.name}
            button={button}
            editor={props.editor}
          />
        );
      })}
    </div>
  );
}

type EditorButtonProps = {
  editor: Editor;
  button: EditorButton;
};
function EditorButton(props: EditorButtonProps) {
  const { Icon, ...button } = props.button;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        button.onClick(props.editor);
      }}
      disabled={button.isDisabled?.(props.editor) ?? false}
      className={
        "rounded-md border-2 p-1 text-sm disabled:bg-slate-300 dark:text-white" +
        (button.isActive && button.isActive(props.editor)
          ? " bg-tremor-brand dark:bg-dark-tremor-brand"
          : " bg-tremor-brand-faint dark:bg-dark-tremor-brand-faint")
      }
    >
      <Icon />
    </button>
  );
}
