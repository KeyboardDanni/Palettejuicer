export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function handleNaN(value: number, defaultValue: number) {
  return !Number.isNaN(value) ? value : defaultValue;
}

export function fixArraySize(values: number[], length: number): number[] {
  if (values.length === length) {
    return values;
  }

  if (values.length > length) {
    return values.slice(0, length);
  }

  return values.concat(new Array(length - values.length).fill(0));
}
