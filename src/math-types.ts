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
  QuadRoots,
  CubicRoots,
  Simplify,
  VectorDistance,
  SlopeTwoPoint,
  Area,
  Volume,
  SurfaceArea,
  Perimeter,
  DotProduct,
  CompleteTheSequence,
  ParabolaVertices,
  BinaryConversion,
  HexConversion,
  Systems,
  TwoDigitMultiplication,
  ArithmeticMean,
  GeometricMean,
  HarmonicMean,
  TrigAngles,
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
];
