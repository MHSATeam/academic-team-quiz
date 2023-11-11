import nerdamer from "nerdamer";

declare global {
  interface String {
    removeCdot(this: string): string;
  }
}

Object.defineProperty(String.prototype, "removeCdot", {
  value() {
    return this.replaceAll("\\cdot", "");
  },
  writable: true,
  configurable: true,
});

export const randomInt = (
  arg1: NumberBound | number = 0,
  max: number = 2,
  ...exclude: number[]
) => {
  let min = 0;
  if (typeof arg1 === "number") {
    min = arg1;
  } else {
    max = arg1.high;
    min = arg1.low;
  }
  function getNumber() {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  var number = getNumber();
  var count = 0;
  while (exclude.includes(number) && count < 50) {
    number = getNumber();
    count++;
  }
  if (exclude.includes(number)) {
    throw new Error("Failed to create random int within 50 attempts");
  }
  return number;
};

export const randomBool = (trueWeight = 0.5) => {
  return Math.random() <= trueWeight;
};

export const weightedRandomNumber = (numbers: number[], weights: number[]) => {
  if (numbers.length !== weights.length) {
    throw new Error("Weights and outputs did not match up!");
  }
  const sumOfWeights = weights.reduce((acc, num) => acc + num, 0);
  let random = Math.random() * sumOfWeights;
  for (let i = 0; i < numbers.length; i++) {
    if (random < weights[i]) {
      return numbers[i];
    }
    random -= weights[i];
  }
  throw new Error("No weights were matched! Something went horribly wrong!");
};

export const nthStringConvert = (d: number) => {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export class Vector {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public dot(vector: Vector) {
    return this.x * vector.x + this.y * vector.y;
  }
  public distanceString(vector: Vector) {
    return nerdamer(`sqrt((${this.x - vector.x})^2+(${this.y - vector.y})^2)`)
      .expand()
      .toTeX();
  }
  public static randomVector(min: number, max: number) {
    return new Vector(randomInt(min, max), randomInt(min, max));
  }
}

export type NumberBound = { low: number; high: number };

export type Shape3D = {
  name: string;
  surfaceAreaEquation: string;
  volumeEquation: string;

  variables: string[];
  variableNames: string[];
  variableBounds: NumberBound[] | NumberBound;
};

export const Shapes: { [key: string]: Shape3D } = {
  Sphere: {
    name: "sphere",
    surfaceAreaEquation: "4(pi)(r^2)",
    volumeEquation: "(4/3)(pi)(r^3)",
    variables: ["r"],
    variableNames: ["radius"],
    variableBounds: { low: 1, high: 15 },
  },
  Cube: {
    name: "cube",
    surfaceAreaEquation: "6(s^2)",
    volumeEquation: "s^3",
    variables: ["s"],
    variableNames: ["side length"],
    variableBounds: { low: 1, high: 25 },
  },
  RectangularPrism: {
    name: "rectangular prism",
    surfaceAreaEquation: "2h*(l+w)",
    volumeEquation: "w*l*h",
    variables: ["w", "l", "h"],
    variableNames: ["width", "length", "height"],
    variableBounds: { low: 1, high: 20 },
  },
  Cone: {
    name: "right cone",
    surfaceAreaEquation: "pi*r*(r+sqrt(r^2+h^2))",
    volumeEquation: "(h/3)*pi*(r^2)",
    variables: ["r", "h"],
    variableNames: ["radius", "height"],
    variableBounds: { low: 1, high: 15 },
  },
  Cylinder: {
    name: "right cylinder",
    surfaceAreaEquation: "(2*pi*r)(h + r)",
    volumeEquation: "(pi)(h)(r^2)",
    variables: ["r", "h"],
    variableNames: ["radius", "height"],
    variableBounds: [
      { low: 2, high: 12 },
      { low: 1, high: 10 },
    ],
  },
};
