import EditorButtons from "@/components/upload/EditorButtons";
import { DefaultEditorButtons } from "@/src/utils/tiptap-utils";
import { Editor, EditorContent } from "@tiptap/react";
import { Button, Flex, Title } from "@tremor/react";
import { Images } from "lucide-react";

type WYSIWYGEditorProps = {
  editor: Editor;
  isQuestion: boolean;
  onOpenImages: () => void;
};

export default function WYSIWYGEditor(props: WYSIWYGEditorProps) {
  return (
    <Flex flexDirection="col" alignItems="start" className="h-full grow">
      <EditorContent editor={props.editor} className="mt-auto w-full" />
      <Flex justifyContent="start" className="gap-2">
        <EditorButtons editor={props.editor} buttons={DefaultEditorButtons} />
        <Title className="ml-auto">
          {props.isQuestion ? "Question" : "Answer"}
        </Title>
        <Button
          color="gray"
          className="aspect-square p-2"
          title="View selection images"
          onClick={props.onOpenImages}
        >
          <Images />
        </Button>
      </Flex>
    </Flex>
  );
}
