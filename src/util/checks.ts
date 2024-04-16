export function throwOnNullIndex(index: number | null) {
  if (index === null) {
    throw new Error("Bad index");
  }

  return index;
}
