import { drawRoundedRect, getMousePos } from "@/src/utils/canvas-utils";
import {
  SelectedText,
  Selection,
  WordBox,
  calculateSurroundingBox,
  getBboxFromPoints,
  getBboxVectors,
  getOverlappingBoxes,
} from "@/src/utils/selection-utils";
import useKeyboardEvent from "@/src/utils/use-keyboard-event";
import useMouseEvent from "@/src/utils/use-mouse-event";
import { Vector } from "@/src/utils/vector";
import { Scan } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Page } from "react-pdf";
import Tesseract from "tesseract.js";

type PDFPageProps = {
  pageNumber: number;
  ocrScheduler: Tesseract.Scheduler;
  selections: SelectedText[];
  onSelect: (selection: Selection, event: MouseEvent) => void;
};
let TempCanvas: HTMLCanvasElement;
let TempCanvasContext: CanvasRenderingContext2D;
if (typeof window !== "undefined") {
  TempCanvas = document.createElement("canvas");
  TempCanvasContext = TempCanvas.getContext("2d", {
    willReadFrequently: true,
  })!;
}

export default function PDFPage({
  pageNumber,
  ocrScheduler,
  selections,
  onSelect,
}: PDFPageProps) {
  const [isProcessed, setIsProcessed] = useState(false);
  const [wordBoxes, setWordBoxes] = useState<WordBox[]>([]);
  const [isPressingMeta, setIsPressingMeta] = useState(false);

  const initialPositionRef = useRef<Vector | null>(null);
  const mousePos = useRef<Vector>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const defaultCanvasData = useRef<ImageData | null>(null);

  const renderOverlay = useCallback(() => {
    if (!canvasRef.current || !defaultCanvasData.current) {
      return;
    }

    if (!contextRef.current) {
      const ctx = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
      if (!ctx) {
        return;
      }
      contextRef.current = ctx;
    }

    contextRef.current.putImageData(defaultCanvasData.current, 0, 0);
    contextRef.current.save();

    const currentMousePos = mousePos.current;
    const initialPosition = initialPositionRef.current;
    if (initialPosition) {
      contextRef.current.globalAlpha = 0.3;
      contextRef.current.fillStyle = "#0f0";
      drawRoundedRect(contextRef.current, initialPosition, currentMousePos);
    }
    contextRef.current.restore();
    for (const selectedText of selections) {
      for (const selection of selectedText.selections) {
        if (selection.page === pageNumber) {
          contextRef.current.save();
          contextRef.current.globalAlpha = 0.3;
          contextRef.current.fillStyle =
            selectedText.type === "question" ? "#38c" : "#ec3";
          const wordsHull = calculateSurroundingBox(
            selection.words.map((w) => w.box),
          );
          wordsHull.x0 -= 5;
          wordsHull.y0 -= 5;
          wordsHull.x1 += 5;
          wordsHull.y1 += 5;
          drawRoundedRect(contextRef.current, ...getBboxVectors(wordsHull));
          contextRef.current.restore();
        }
      }
    }
  }, [selections, pageNumber]);

  const handleSelect = useCallback(
    (event: MouseEvent) => {
      if (initialPositionRef.current) {
        const boxes = getOverlappingBoxes(
          initialPositionRef.current,
          mousePos.current,
          wordBoxes,
        );
        if (boxes.length === 0) {
          return;
        }
        if (!defaultCanvasData.current) {
          return;
        }
        if (!canvasRef.current) {
          return;
        }
        TempCanvas.width = canvasRef.current.width;
        TempCanvas.height = canvasRef.current.height;
        TempCanvasContext.putImageData(defaultCanvasData.current, 0, 0);
        const selectionBox = getBboxFromPoints(
          initialPositionRef.current,
          mousePos.current,
        );
        const wordHull = calculateSurroundingBox(boxes.map((w) => w.box));

        const selectionImage = TempCanvasContext.getImageData(
          Math.max(wordHull.x0 - 5, 0),
          Math.max(wordHull.y0 - 5, 0),
          Math.min(
            wordHull.x1 - wordHull.x0 + 10,
            TempCanvas.width - wordHull.x0,
          ),
          Math.min(
            wordHull.y1 - wordHull.y0 + 10,
            TempCanvas.height - wordHull.y0,
          ),
        );
        onSelect(
          {
            selectionBox,
            page: pageNumber,
            words: boxes,
            selectionImage: selectionImage,
          },
          event,
        );
      }
    },
    [wordBoxes, onSelect, pageNumber],
  );

  useMouseEvent(
    "mousedown",
    useCallback(
      (event) => {
        if (canvasRef.current) {
          const currentMousePos = getMousePos(event, canvasRef.current);
          initialPositionRef.current = currentMousePos;
          mousePos.current = currentMousePos;
          renderOverlay();
        } else {
          initialPositionRef.current = null;
        }
      },
      [renderOverlay],
    ),
    canvasRef.current,
  );

  useMouseEvent(
    "mousemove",
    useCallback(
      (event) => {
        if (canvasRef.current) {
          const currentMousePos = getMousePos(event, canvasRef.current);
          mousePos.current = currentMousePos;
          if (initialPositionRef.current) {
            renderOverlay();
          }
        }
      },
      [renderOverlay],
    ),
  );

  useMouseEvent(
    "mouseup",
    useCallback(
      (event) => {
        const canvas = canvasRef.current;
        if (canvas && initialPositionRef.current) {
          const mousePos = getMousePos(event, canvas);
          if (
            mousePos.x >= 0 &&
            mousePos.x < canvas.width &&
            mousePos.y >= 0 &&
            mousePos.y < canvas.height
          ) {
            handleSelect(event);
          }
        }
        initialPositionRef.current = null;
        renderOverlay();
      },
      [handleSelect, renderOverlay],
    ),
  );

  useKeyboardEvent(
    useCallback((event) => {
      setIsPressingMeta(event.metaKey);
    }, []),
    ["keydown", "keyup"],
  );

  const onRenderSuccess = useCallback(
    async function () {
      if (!canvasRef.current) {
        return;
      }

      if (!contextRef.current) {
        const ctx = canvasRef.current.getContext("2d", {
          willReadFrequently: true,
        });
        if (!ctx) {
          return;
        }
        contextRef.current = ctx;
      }

      const { width, height } = canvasRef.current;
      const canvasData = contextRef.current.getImageData(0, 0, width, height);
      defaultCanvasData.current = canvasData;

      setIsProcessed(false);

      const { data } = await ocrScheduler.addJob(
        "recognize",
        canvasRef.current,
      );

      const newWordBoxes: WordBox[] = [];

      for (const word of data.words) {
        const { bbox, text, confidence } = word;
        newWordBoxes.push({
          confidence,
          word: text,
          box: bbox,
        });
      }

      setWordBoxes(newWordBoxes);
      renderOverlay();
      setIsProcessed(true);
    },
    [ocrScheduler, renderOverlay],
  );

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  return (
    <Page
      scale={1}
      className={["mb-2", isPressingMeta ? "cursor-copy" : ""]}
      pageNumber={pageNumber}
      renderAnnotationLayer={false}
      renderTextLayer={false}
      canvasRef={canvasRef}
      onRenderSuccess={onRenderSuccess}
      loading={
        <span className="dark:text-white">Loading Page #{pageNumber}</span>
      }
    >
      {!isProcessed && (
        <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-4 bg-white bg-opacity-90">
          <span className="text-tremor-metric font-medium text-tremor-content-emphasis">
            Scanning Page
          </span>
          <Scan className="animate-ping" />
        </div>
      )}
    </Page>
  );
}
