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

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const TesseractScheduler = Tesseract.createScheduler();
if (typeof window !== "undefined") {
  const WorkerCount = window.navigator.hardwareConcurrency ?? 4;
  const genWorker = async () => {
    const worker = await Tesseract.createWorker("eng");
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UploadSet(props: UploadSetProps) {
  const [state, send] = useMachine(uploadSetMachine);

  const meta = state.getMeta()[
    state.machine.id + "." + state.value
  ] as StepMetaData;

  const StateComponent = meta.component;

  return (
    <main className="p-4 flex flex-col items-center gap-4 h-full overflow-hidden">
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
