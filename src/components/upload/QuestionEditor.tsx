import { Card, Flex, Title } from "@tremor/react";
import { EditorContent, useEditor } from "@tiptap/react";
import EditorButtons from "@/components/upload/EditorButtons";
import {
  DefaultEditorButtons,
  getExtensionList,
} from "@/src/utils/tiptap-utils";

export default function QuestionEditor() {
  const questionEditor = useEditor({
    editorProps: {
      attributes: {
        class: "prose my-2 p-2 rounded-md min-w-56 border-2 bg-white",
      },
    },
    extensions: getExtensionList(),
  });
  const answerEditor = useEditor({
    editorProps: {
      attributes: {
        class: "prose my-2 p-2 rounded-md min-w-56 border-2 bg-white",
      },
    },
    extensions: getExtensionList(),
  });
  return (
    <Card className="p-2">
      <Flex>
        <Flex flexDirection="col" justifyContent="start">
          <Title>Question</Title>
          {questionEditor && (
            <div className="m-2">
              <EditorContent editor={questionEditor} />
              <EditorButtons
                editor={questionEditor}
                buttons={DefaultEditorButtons}
              />
            </div>
          )}
        </Flex>
        <Flex flexDirection="col" justifyContent="start">
          <Title>Answer</Title>
          {answerEditor && (
            <div className="m-2">
              <EditorContent editor={answerEditor} />
              <EditorButtons
                editor={answerEditor}
                buttons={DefaultEditorButtons}
              />
            </div>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
