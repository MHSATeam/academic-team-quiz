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
  ArithmeticMean,
  GeometricMean,
  HarmonicMean,
  TrigAngles,
}
