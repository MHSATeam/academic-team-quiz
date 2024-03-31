import { Editor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import {
  BoldIcon,
  ItalicIcon,
  LucideIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from "lucide-react";

export type EditorButton = {
  name: string;
  Icon: LucideIcon;
  onClick: (editor: Editor) => void;
  isDisabled?: (editor: Editor) => boolean;
  isActive?: (editor: Editor) => boolean;
};

export const DefaultEditorButtons: EditorButton[] = [
  {
    name: "bold",
    Icon: BoldIcon,
    onClick: (editor) => editor.chain().focus().toggleBold().run(),
    isDisabled: (editor) => !editor.can().chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  },
  {
    name: "underline",
    Icon: UnderlineIcon,
    onClick: (editor) => editor.chain().focus().toggleUnderline().run(),
    isDisabled: (editor) =>
      !editor.can().chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
  },
  {
    name: "italicize",
    Icon: ItalicIcon,
    onClick: (editor) => editor.chain().focus().toggleItalic().run(),
    isDisabled: (editor) => !editor.can().chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  },
  {
    name: "superscript",
    Icon: SuperscriptIcon,
    onClick: (editor) => editor.chain().focus().toggleSuperscript().run(),
    isDisabled: (editor) =>
      !editor.can().chain().focus().toggleSuperscript().run(),
    isActive: (editor) => editor.isActive("superscript"),
  },
  {
    name: "subscript",
    Icon: SubscriptIcon,
    onClick: (editor) => editor.chain().focus().toggleSubscript().run(),
    isDisabled: (editor) =>
      !editor.can().chain().focus().toggleSubscript().run(),
    isActive: (editor) => editor.isActive("subscript"),
  },
];

export function getExtensionList() {
  return [
    Document.extend({ content: "paragraph" }),
    HardBreak.extend({
      addKeyboardShortcuts() {
        return {
          Enter: () => this.editor.commands.setHardBreak(),
          "Mod-Enter": () => this.editor.commands.setHardBreak(),
          "Shift-Enter": () => this.editor.commands.setHardBreak(),
        };
      },
    }),
    StarterKit.configure({
      document: false,
      hardBreak: false,
    }),
    Superscript,
    Subscript,
    Underline,
    Typography.configure({
      superscriptTwo: false,
      superscriptThree: false,
    }),
  ];
}
