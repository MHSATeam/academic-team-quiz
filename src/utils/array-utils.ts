export function filterNotEmpty<Value>(value: Value | null): value is Value {
  return value !== null;
}
