"use client";

import { Category } from "@prisma/client";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { pdfjs } from "react-pdf";
import Tesseract from "tesseract.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useMachine } from "@xstate/react";
import {
  StepMetaData,
  uploadSetMachine,
} from "@/src/lib/upload/upload-state-machine";
import { Actor, Snapshot, StateFrom } from "xstate";
import { OCRBlacklistedCharacters } from "@/src/lib/upload/filter-ocr-results";
import { Button, Card, Flex, Subtitle, Title } from "@tremor/react";
import {
  deleteMachineSnapshot,
  getSnapshotNames,
  loadMachineSnapshot,
  saveMachineSnapshot,
} from "@/src/lib/upload/load-state";
import { Loader2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const TesseractScheduler = Tesseract.createScheduler();

const getWorkerCount = () =>
  Math.max(1, (window.navigator.hardwareConcurrency ?? 4) - 1);

const genWorker = async () => {
  if (TesseractScheduler.getNumWorkers() >= getWorkerCount()) {
    return;
  }
  const worker = await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_char_blacklist: OCRBlacklistedCharacters,
  });
  if (TesseractScheduler.getNumWorkers() < getWorkerCount()) {
    TesseractScheduler.addWorker(worker);
  } else {
    worker.terminate();
  }
};

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
  const [snapshot, setSnapshot] = useState<
    Snapshot<unknown> | undefined | null
  >(null);
  const [confirmDesktop, setConfirmDesktop] = useState(false);
  const [createNew, setCreateNew] = useState<boolean | null>(null);
  const [Modernizr, setModernizr] = useState<ModernizrStatic>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("modernizr").then((api) => setModernizr(api));
      const load = async () => {
        const snapshots = await getSnapshotNames();
        for (let i = 0; i < getWorkerCount(); i++) {
          await genWorker();
        }
        if (snapshots.length > 0) {
          try {
            setSnapshot(await loadMachineSnapshot(snapshots[0]));
            return;
          } catch (e) {
            /* empty */
          }
        }
        setSnapshot(undefined);
      };
      load();
    } else {
      setSnapshot(undefined);
    }
  }, []);

  if (
    Modernizr === undefined ||
    (Modernizr.canvas &&
      Modernizr.canvastext &&
      Modernizr.webworkers &&
      Modernizr.localstorage)
  ) {
    if (
      Modernizr === undefined ||
      Modernizr.mq("only screen and (min-width: 50em)") ||
      confirmDesktop
    ) {
      if (snapshot === null) {
        return (
          <main className="flex h-full flex-col items-center gap-4 overflow-hidden p-4">
            <Title className="flex items-center gap-2">
              Loading <Loader2 className="animate-spin" />
            </Title>
          </main>
        );
      } else {
        if (createNew !== null || snapshot === undefined) {
          return (
            <main className="flex h-full flex-col items-center gap-4 overflow-hidden p-4">
              <StateMachine
                categories={props.categories}
                snapshot={createNew ? undefined : snapshot}
              />
            </main>
          );
        } else {
          return (
            <main className="flex h-full flex-col items-center gap-4 overflow-hidden p-4">
              <Flex flexDirection="col" className="my-auto w-fit gap-4">
                <Card>
                  <Flex flexDirection="col" className="gap-2">
                    <Title>
                      You already started uploading a set. Would you like to
                      continue or restart?
                    </Title>
                    <Flex className="gap-2">
                      <Button onClick={() => setCreateNew(false)}>
                        Continue
                      </Button>
                      <Button
                        onClick={() => {
                          setCreateNew(true);
                          getSnapshotNames().then((names) => {
                            names.forEach((name) => {
                              deleteMachineSnapshot(name);
                            });
                          });
                        }}
                        color="red"
                      >
                        Start Over
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              </Flex>
            </main>
          );
        }
      }
    } else {
      return (
        <main className="flex h-full flex-col gap-4 p-4">
          <Title>Sorry! It looks like you&apos;re using a mobile device.</Title>
          <Subtitle>
            This tool is best suited for a computer and may not work well on
            your device.
          </Subtitle>
          <Button onClick={() => setConfirmDesktop(true)} color="red">
            I understand
          </Button>
        </main>
      );
    }
  } else {
    return (
      <main className="flex h-full flex-col gap-4 p-4">
        <Title>Sorry! Your device is not compatible with this tool!</Title>
      </main>
    );
  }
}

type StateMachineProps = {
  snapshot?: Snapshot<unknown>;
  categories: Category[];
};

function StateMachine(props: StateMachineProps) {
  const [state, send, actor] = useMachine(uploadSetMachine, {
    snapshot: props.snapshot,
  });
  const saveTimeout = useRef<number>();

  useEffect(() => {
    actor.subscribe((snapshot) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      if (!snapshot.context.hasUploaded || snapshot.context.error) {
        saveTimeout.current = window.setTimeout(() => {
          saveMachineSnapshot(snapshot);
        }, 10000);
      } else {
        deleteMachineSnapshot(snapshot.context.stateId);
      }
    });
  }, [actor]);

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
  if (StateComponent) {
    return (
      <StateComponent state={state} categories={props.categories} send={send} />
    );
  }
}
