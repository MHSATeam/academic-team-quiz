import { Card, Flex, Switch, Title } from "@tremor/react";
import { useEditor } from "@tiptap/react";
import { getExtensionList } from "@/src/utils/tiptap-utils";
import { EditorQuestion } from "@/src/utils/set-upload-utils";
import WYSIWYGEditor from "@/components/upload/WYSIWYGEditor";
import { Category } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/utils/PortalSelect";

type QuestionEditorProps = {
  question: EditorQuestion;
  questionIndex: number;
  categories: Category[];
  onOpenImages: (isQuestion: boolean) => void;
  onUpdateQuestion: (newQuestion: string) => void;
  onUpdateAnswer: (newAnswer: string) => void;
  onUpdateCategory: (newCategory: Category) => void;
  onUpdateComputationFlag: (newValue: boolean) => void;
};

const editorClass =
  "prose dark:prose-invert mb-2 p-2 min-w-64 max-h-40 overflow-auto mb-2 border-b-2 transition-colors focus-within:border-tremor-brand outline-none no-scrollbar";

export default function QuestionEditor(props: QuestionEditorProps) {
  const categoryId = props.question.category.id;
  const questionEditor = useEditor({
    editorProps: {
      attributes: {
        class: editorClass,
      },
    },
    onUpdate: ({ editor }) => {
      props.onUpdateQuestion(editor.getHTML());
    },
    content: props.question.question,
    extensions: getExtensionList(),
  });
  const answerEditor = useEditor({
    editorProps: {
      attributes: {
        class: editorClass,
      },
    },
    onUpdate: ({ editor }) => {
      props.onUpdateAnswer(editor.getHTML());
    },
    content: props.question.answer,
    extensions: getExtensionList(),
  });
  return (
    <Card className="p-4">
      <Flex flexDirection="col" alignItems="start" className="gap-4">
        <Flex alignItems="start" justifyContent="start" className="gap-4">
          <Title className="grow">Question #{props.questionIndex + 1}</Title>
          {props.question.category.id === /* Math Category Id */ 2 && (
            <Flex flexDirection="col" className="w-fit gap-1" alignItems="end">
              <Title className="grow">Is Computation Question?</Title>
              <Switch
                checked={props.question.hideInFlashcards}
                onChange={props.onUpdateComputationFlag}
              />
            </Flex>
          )}
          <Flex className="w-fit gap-1" alignItems="end" flexDirection="col">
            <Title>Category</Title>
            <Select
              value={categoryId.toString()}
              onValueChange={(value) => {
                const newCategory = props.categories.find(
                  (c) => c.id === parseInt(value),
                );
                if (newCategory) {
                  props.onUpdateCategory(newCategory);
                }
              }}
            >
              <SelectTrigger className="w-fit gap-2">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {props.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Flex>
        </Flex>
        <hr className="w-full border-b border-tremor-brand" />
        <Flex className="gap-4" alignItems="end">
          {questionEditor && (
            <WYSIWYGEditor
              editor={questionEditor}
              isQuestion={true}
              onOpenImages={() => props.onOpenImages(true)}
            />
          )}
          {answerEditor && (
            <WYSIWYGEditor
              editor={answerEditor}
              isQuestion={false}
              onOpenImages={() => props.onOpenImages(false)}
            />
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
