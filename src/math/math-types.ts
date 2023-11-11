export type Problem = {
  type: ProblemType;
  question: string;
  answers: string[];
  answerType: AnswerType;
};
export enum AnswerType {
  Any,
  AllOrdered,
  AnyOrder,
}

export enum ProblemType {
  QuadRoots = "Quadratic Roots",
  CubicRoots = "Cube Roots",
  VectorDistance = "Distance Between",
  SlopeTwoPoint = "Slope from Points",
  Area = "2D Area",
  Volume = "Volume",
  SurfaceArea = "Surface Area",
  Perimeter = "Perimeter",
  DotProduct = "Dot Product",
  CompleteTheSequence = "Complete the Sequence",
  ParabolaVertices = "Parabola Vertices",
  BinaryConversion = "Binary <-> Decimal",
  HexConversion = "Hexadecimal <-> Decimal",
  TrigAngles = "Radians <-> Degrees",
  Systems = "Systems of Equations",
  TwoDigitMultiplication = "2 Digit Multiplication",
  MeanValues = "Means of a Set",
  Derivatives = "Derivatives",
  DefiniteIntegrals = "Definite Integrals",
  TrigFunctionValues = "Common Trig Functions",
  SimplifyTrigFunctions = "Simplifiy Trig Functions",
  PlayingCardProbability = "Playing Card Probability",
  Combinations = "Combinations",
  Permutations = "Permutations",
}

export const ALLOWED_PROBLEM_TYPES: ProblemType[] = [
  ProblemType.Area,
  ProblemType.BinaryConversion,
  ProblemType.CubicRoots,
  ProblemType.DotProduct,
  ProblemType.HexConversion,
  ProblemType.ParabolaVertices,
  ProblemType.QuadRoots,
  ProblemType.SlopeTwoPoint,
  ProblemType.VectorDistance,
  ProblemType.TwoDigitMultiplication,
  ProblemType.Derivatives,
  ProblemType.DefiniteIntegrals,
  ProblemType.TrigAngles,
  ProblemType.TrigFunctionValues,
  ProblemType.SimplifyTrigFunctions,
  ProblemType.SurfaceArea,
  ProblemType.Volume,
  // ProblemType.PlayingCardProbability,
];
