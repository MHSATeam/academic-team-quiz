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
  min: number = 0,
  max: number = 2,
  ...exclude: number[]
) => {
  function getNumber() {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  var number = getNumber();
  var count = 0;
  while (exclude.includes(number) && count < 50) {
    number = getNumber();
    count++;
  }
  return number;
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
