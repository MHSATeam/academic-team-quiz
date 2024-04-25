import {
  filterAnswerForPrefixes,
  filterQuestionForPrefixes,
} from "@/src/lib/upload/filter-ocr-results";
import { Vector } from "@/src/utils/vector";
import { Bbox } from "tesseract.js";

export type WordBox = {
  confidence: number;
  word: string;
  box: Bbox;
};

export type Selection = {
  selectionBox: Bbox;
  selectionImage: ImageData;
  page: number;
  words: WordBox[];
};

export type TextType = "question" | "answer";

export type SelectedText = {
  type: TextType;
  selections: Selection[];
};

export function getBboxFromPoints(...points: Vector[]) {
  return {
    x0: Math.min(...points.map((v) => v.x)),
    y0: Math.min(...points.map((v) => v.y)),
    x1: Math.max(...points.map((v) => v.x)),
    y1: Math.max(...points.map((v) => v.y)),
  };
}

export function getOverlappingBoxes(
  point1: Vector,
  point2: Vector,
  wordBoxes: WordBox[],
) {
  const mouseBox: Bbox = getBboxFromPoints(point1, point2);
  return wordBoxes.filter(({ box }) => {
    const overlap = calculateIntersectionStats(box, mouseBox);
    const boxArea = getBboxArea(box);
    return overlap.intersectionArea / boxArea >= 0.5;
  });
}

export function calculateIntersectionStats(box1: Bbox, box2: Bbox) {
  const intersection: Bbox = {
    x0: Math.max(box1.x0, box2.x0),
    y0: Math.max(box1.y0, box2.y0),
    x1: Math.min(box1.x1, box2.x1),
    y1: Math.min(box1.y1, box2.y1),
  };

  if (intersection.x1 < intersection.x0 || intersection.y1 < intersection.y0) {
    return { iou: 0, intersectionArea: 0 };
  }

  const box1Area = getBboxArea(box1);
  const box2Area = getBboxArea(box2);
  const intersectionArea = getBboxArea(intersection);

  return {
    iou: intersectionArea / (box1Area + box2Area - intersectionArea),
    intersectionArea,
  };
}

export function getBboxArea(box: Bbox) {
  return (box.x1 - box.x0) * (box.y1 - box.y0);
}

export function getBboxVectors(box: Bbox): [Vector, Vector] {
  return [
    { x: box.x0, y: box.y0 },
    { x: box.x1, y: box.y1 },
  ];
}

export function calculateSurroundingBox(boxes: Bbox[]): Bbox {
  if (boxes.length === 0) {
    return { x0: 0, x1: 0, y0: 0, y1: 0 };
  }
  const surrounding: Bbox = {
    x0: Infinity,
    x1: -Infinity,
    y0: Infinity,
    y1: -Infinity,
  };

  for (const box of boxes) {
    if (box.x0 < surrounding.x0) {
      surrounding.x0 = box.x0;
    }
    if (box.y0 < surrounding.y0) {
      surrounding.y0 = box.y0;
    }
    if (box.x1 > surrounding.x1) {
      surrounding.x1 = box.x1;
    }
    if (box.y1 > surrounding.y1) {
      surrounding.y1 = box.y1;
    }
  }

  return surrounding;
}

export function getTextFromSelections(
  selectedText: SelectedText,
  isQuestion: boolean,
  useBr = true,
): string {
  let fullText = "";
  for (const selection of selectedText.selections) {
    let selectionText = getTextFromSelection(selection);
    if (isQuestion) {
      selectionText = filterQuestionForPrefixes(selectionText);
    } else {
      selectionText = filterAnswerForPrefixes(selectionText);
    }
    fullText += selectionText + (useBr ? "<br/>" : "\n");
  }
  fullText = fullText.replace(new RegExp(useBr ? /<br\/>$/ : /\n$/), "");
  return fullText;
}

export function getTextFromSelection(selection: Selection): string {
  return selection.words.map((w) => w.word).join(" ");
}
