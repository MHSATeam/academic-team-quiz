export function filterNotEmpty<Value>(value: Value | null): value is Value {
  return value !== null;
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
