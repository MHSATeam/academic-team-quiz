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
if (typeof window !== "undefined") {
  TempCanvas = document.createElement("canvas");
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
  const defaultCanvasData = useRef<ImageData | null>(null);

  const renderOverlay = useCallback(() => {
    if (!canvasRef.current || !defaultCanvasData.current) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.putImageData(defaultCanvasData.current, 0, 0);
    ctx.save();

    const currentMousePos = mousePos.current;
    const initialPosition = initialPositionRef.current;
    if (initialPosition) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#0f0";
      drawRoundedRect(ctx, initialPosition, currentMousePos);
    }
    ctx.restore();
    for (const selectedText of selections) {
      for (const selection of selectedText.selections) {
        if (selection.page === pageNumber) {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = selectedText.type === "question" ? "#38c" : "#ec3";
          const wordsHull = calculateSurroundingBox(
            selection.words.map((w) => w.box)
          );
          wordsHull.x0 -= 5;
          wordsHull.y0 -= 5;
          wordsHull.x1 += 5;
          wordsHull.y1 += 5;
          drawRoundedRect(ctx, ...getBboxVectors(wordsHull));
          ctx.restore();
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
          wordBoxes
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
        const ctx = TempCanvas.getContext("2d")!;
        ctx.putImageData(defaultCanvasData.current, 0, 0);
        const selectionBox = getBboxFromPoints(
          initialPositionRef.current,
          mousePos.current
        );
        const selectionImage = ctx.getImageData(
          Math.max(selectionBox.x0 - 5, 0),
          Math.max(selectionBox.y0 - 5, 0),
          Math.min(
            selectionBox.x1 - selectionBox.x0 + 10,
            TempCanvas.width - selectionBox.x0
          ),
          Math.min(
            selectionBox.y1 - selectionBox.y0 + 10,
            TempCanvas.height - selectionBox.y0
          )
        );
        onSelect(
          {
            selectionBox,
            page: pageNumber,
            words: boxes,
            selectionImage: selectionImage,
          },
          event
        );
      }
    },
    [wordBoxes, onSelect, pageNumber]
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
      [renderOverlay]
    ),
    canvasRef.current
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
      [renderOverlay]
    )
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
      [handleSelect, renderOverlay]
    )
  );

  useKeyboardEvent(
    useCallback((event) => {
      setIsPressingMeta(event.metaKey);
    }, []),
    ["keydown", "keyup"]
  );

  const onRenderSuccess = useCallback(
    async function () {
      if (!canvasRef.current) {
        return;
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        return;
      }
      const { width, height } = canvasRef.current;
      const canvasData = ctx.getImageData(0, 0, width, height);
      defaultCanvasData.current = canvasData;

      setIsProcessed(false);

      const { data } = await ocrScheduler.addJob(
        "recognize",
        canvasRef.current
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
    [ocrScheduler, renderOverlay]
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
        <div className="absolute top-0 left-0 w-full h-full bg-opacity-90 z-10 bg-white flex flex-col gap-4 items-center justify-center">
          <span className="font-medium text-tremor-metric text-tremor-content-emphasis">
            Scanning Page
          </span>
          <Scan className="animate-ping" />
        </div>
      )}
    </Page>
  );
}
