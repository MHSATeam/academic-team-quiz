"use client";

import { Category } from "@prisma/client";
import { FunctionComponent } from "react";
import { pdfjs } from "react-pdf";
import Tesseract from "tesseract.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useMachine } from "@xstate/react";
import {
  StepMetaData,
  uploadSetMachine,
} from "@/src/lib/upload/upload-state-machine";
import { Actor, StateFrom } from "xstate";
import { OCRBlacklistedCharacters } from "@/src/lib/upload/filter-ocr-results";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const TesseractScheduler = Tesseract.createScheduler();
if (typeof window !== "undefined") {
  const WorkerCount = Math.max(
    1,
    window.navigator.hardwareConcurrency ?? 4 - 1,
  );
  const genWorker = async () => {
    const worker = await Tesseract.createWorker("eng");
    await worker.setParameters({
      tessedit_char_blacklist: OCRBlacklistedCharacters,
    });
    TesseractScheduler.addWorker(worker);
  };
  for (let i = 0; i < WorkerCount; i++) {
    genWorker();
  }
}

type UploadSetProps = {
  categories: Category[];
};

export type StepComponentProps = {
  state: StateFrom<typeof uploadSetMachine>;
  categories: Category[];
  send: Actor<typeof uploadSetMachine>["send"];
};

export type StepComponent = FunctionComponent<StepComponentProps>;

export default function UploadSet(props: UploadSetProps) {
  const [state, send] = useMachine(uploadSetMachine);
  let stateValue: string;
  if (typeof state.value === "object") {
    stateValue = "finalize";
  } else {
    stateValue = state.value;
  }
  const meta = state.getMeta()[
    state.machine.id + "." + stateValue
  ] as StepMetaData;

  const StateComponent = meta.component;

  return (
    <main className="flex h-full flex-col items-center gap-4 overflow-hidden p-4">
      {StateComponent && (
        <StateComponent
          state={state}
          categories={props.categories}
          send={send}
        />
      )}
    </main>
  );
}
