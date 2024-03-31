import { Vector } from "@/src/utils/vector";

export const getMousePos = (
  e: MouseEvent,
  canvas: HTMLCanvasElement
): Vector => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
};

export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  point1: Vector,
  point2: Vector
) => {
  ctx.beginPath();
  const width = point2.x - point1.x;
  const height = point2.y - point1.y;
  ctx.roundRect(point1.x, point1.y, width, height, 10);
  ctx.fill();
};
