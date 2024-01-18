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

export const generatePolynomial = (degree: number) => {
  const coefficents = new Array(degree).fill(0).map(() => randomInt(-9, 9));
  if (coefficents[degree - 1] === 0) {
    coefficents[degree - 1] = 1;
  } else {
    coefficents[degree - 1] = Math.abs(coefficents[degree - 1]);
  }
  const equation = coefficents
    .map((coeff, power) => `(${coeff}*(x^${power + 1}))`)
    .join("+");
  return equation;
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

  public toString() {
    return `(${this.x}, ${this.y})`;
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

export type Card = {
  suit: Suit;
  rank: Rank;
};

export type Draw = {
  suit?: Suit;
  rank?: Rank;
  color?: Color;
  face: boolean;
};

export enum Color {
  Red,
  Black,
}

export enum Suit {
  Hearts,
  Diamonds,
  Clubs,
  Spades,
}
export enum Rank {
  King = 13,
  Queen = 12,
  Jack = 11,
  Ten = 10,
  Nine = 9,
  Eight = 8,
  Seven = 7,
  Six = 6,
  Five = 5,
  Four = 4,
  Three = 3,
  Two = 2,
  Ace = 1,
}

export class Deck {
  public static FaceRanks: Rank[] = [Rank.King, Rank.Queen, Rank.Jack];
  public static ColorSuits: Record<Color, Suit[]> = {
    [Color.Black]: [Suit.Clubs, Suit.Spades],
    [Color.Red]: [Suit.Diamonds, Suit.Hearts],
  };

  public cards: Card[] = [];

  constructor() {
    for (let suit = 0; suit < 4; suit++) {
      for (let rank = 1; rank <= 13; rank++) {
        this.cards.push({ rank, suit });
      }
    }
  }

  public getSuitCards(suit: Suit): Card[] {
    return this.cards.filter((c) => c.suit === suit);
  }

  public getRankCards(rank: Rank): Card[] {
    return this.cards.filter((c) => c.rank === rank);
  }

  public getCardsOfSubset(subset: (card: Card) => boolean) {
    return this.cards.filter(subset);
  }

  public replaceCard(card: Card) {
    this.cards.push(card);
  }

  public pullCard(suit: Suit, rank: Rank) {
    const index = this.cards.findIndex(
      (c) => c.rank === rank && c.suit === suit
    );
    if (index === -1) return false;
    this.cards.splice(index, 1);
    return true;
  }

  public pullFromDrawParams(draw: Draw) {
    return this.pullFromSubset(Deck.GetDrawSubset(draw));
  }

  public pullFromSubset(filter: (card: Card) => boolean) {
    const subset = this.cards.filter(filter);
    const card = subset[randomInt(0, subset.length)];
    const index = this.cards.findIndex(
      (c) => c.rank === card.rank && c.suit === card.suit
    );
    this.cards.splice(index, 1);
    return card;
  }

  public pullRandomSuit(suit: Suit) {
    return this.pullFromSubset((c) => c.suit === suit);
  }

  public pullRandomColor(color: Color) {
    return this.pullFromSubset((c) => Deck.ColorSuits[color].includes(c.suit));
  }

  public pullRandom(): Card {
    const index = randomInt(0, this.cards.length);
    return this.cards.splice(index, 1)[0];
  }

  public static GetDrawSubset(draw: Draw): (card: Card) => boolean {
    return (card) => {
      if (
        draw.color !== undefined &&
        !Deck.ColorSuits[draw.color].includes(card.suit)
      ) {
        return false;
      }
      if (draw.rank !== undefined && draw.rank !== card.rank) {
        return false;
      }
      if (draw.suit !== undefined && draw.suit !== card.suit) {
        return false;
      }
      if (draw.face && !Deck.FaceRanks.includes(card.rank)) {
        return false;
      }
      return true;
    };
  }

  public static RandomSuit(usedSuits: Suit[] = []): Suit {
    return randomInt(0, 4, ...usedSuits);
  }

  public static RandomColor(): Color {
    return randomInt(0, 2);
  }

  public static RandomRank(usedRanks: Rank[] = []): Rank {
    return randomInt(1, 14, ...usedRanks);
  }

  public static RandomDraw(
    usedSuits: Suit[] = [],
    usedRanks: Rank[] = [],
    includeRanks = true
  ): Draw {
    switch (randomInt(usedSuits.length === 4 ? 1 : 0, includeRanks ? 3 : 2)) {
      case 0: {
        return {
          suit: Deck.RandomSuit(usedSuits),
          face: randomBool(),
        };
      }
      case 1: {
        return {
          color: Deck.RandomColor(),
          face: randomBool(),
        };
      }
      case 2: {
        return {
          rank: Deck.RandomRank(usedRanks),
          face: false,
        };
      }
    }
    return {
      face: false,
    };
  }

  public static RandomNonOverlapDrawSet(numDraws = 2): Draw[] {
    const drawList: Draw[] = [];
    for (let i = 0; i < numDraws; i++) {
      const faceDependentDraws = drawList.filter((d) => d.face);
      const usedSuits = faceDependentDraws
        .filter((d) => d.suit !== undefined)
        .map((d) => d.suit!);
      usedSuits.push(
        ...drawList
          .filter((d) => d.color !== undefined)
          .map((d) => Deck.ColorSuits[d.color!])
          .flat()
      );
      const draw = Deck.RandomDraw(
        usedSuits,
        faceDependentDraws
          .filter((d) => d.rank !== undefined)
          .map((d) => d.rank!),
        false
      );
      drawList.push(draw);
    }
    return drawList;
  }

  public static CardToString(card: Card): string {
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);

    return `${ranks[card.rank - 1].toString().toLowerCase()} of ${suits[
      card.suit
    ]
      .toString()
      .toLowerCase()}`;
  }

  public static SuitToString(suit: Suit) {
    const suits = Object.values(Suit);
    return suits[suit].toString().toLowerCase();
  }

  public static RankToString(rank: Rank) {
    const ranks = Object.values(Rank);
    return ranks[rank - 1].toString().toLowerCase();
  }

  public static ColorToString(color: Color) {
    const colors = Object.values(Color);
    return colors[color].toString().toLowerCase();
  }

  public static DrawToString(draw: Draw) {
    const vowels = ["a", "e", "i", "o", "u"];
    let name = "";

    if (draw.color !== undefined) {
      name += Deck.ColorToString(draw.color) + " ";
    }

    if (draw.suit !== undefined) {
      name += Deck.SuitToString(draw.suit).slice(0, -1) + " ";
    }

    if (draw.rank !== undefined) {
      name += Deck.RankToString(draw.rank) + " ";
    }

    if (draw.face) {
      name += "face ";
    }

    if (draw.face || draw.color !== undefined) {
      name += "card";
    } else {
      name = name.slice(0, -1);
    }

    let prefix = vowels.includes(name[0]) ? "an " : "a ";

    return prefix + name;
  }
}
