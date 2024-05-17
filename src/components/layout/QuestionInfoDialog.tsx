import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import {
  Button,
  Dialog,
  DialogPanel,
  Flex,
  Subtitle,
  Title,
} from "@tremor/react";
import Link from "next/link";

type QuestionInfoDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<boolean>;
  question?: QuestionWithRoundData;
};

export default function QuestionInfoDialog(props: QuestionInfoDialogProps) {
  return (
    <Dialog
      onClick={(e) => {
        e.preventDefault();
      }}
      onClose={() => {
        props.setOpen(false);
      }}
      open={props.open}
      className="z-50"
    >
      <DialogPanel>
        {props.question && (
          <Flex flexDirection="col" className="items-start gap-2">
            {props.question.round && (
              <Link
                className="text-blue-500"
                href={`/static/round/${props.question.round.id}`}
              >
                From: {props.question.round.name}
              </Link>
            )}
            {props.question.round?.alphabetRound && (
              <Title>
                Alphabet Round Letter:{" "}
                {props.question.round.alphabetRound.letter.toUpperCase()}
              </Title>
            )}
            {props.question.round?.themeRound && (
              <Title>Theme: {props.question.round.themeRound.theme}</Title>
            )}
            <Subtitle>Category: {props.question.category.name}</Subtitle>
            <Subtitle>Created in: {props.question.createdYear}</Subtitle>
            <Button
              onClick={() => {
                props.setOpen(false);
              }}
            >
              Close
            </Button>
          </Flex>
        )}
      </DialogPanel>
    </Dialog>
  );
}
