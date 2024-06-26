export type NullableNumber = number | null;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function outOfRange(value: number, min: number, max: number): number {
  if (value < min) return min - value;
  if (value > max) return value - max;

  return 0;
}

export function positiveMod(a: number, b: number) {
  return ((a % b) + b) % b;
}

export function range(min: number, max: number, stepSize: number): number[] {
  const output = [];

  for (let i = min; i < max; i += stepSize) {
    output.push(i);
  }

  return output;
}

export function steps(min: number, max: number, numSteps: number): number[] {
  if (numSteps === 0) {
    return [];
  }
  if (numSteps === 1) {
    return [(min + max) / 2];
  }

  const stepSize = (max - min) / (numSteps - 1);
  const output = [min];

  for (let i = 1; i < numSteps - 1; i++) {
    output.push(min + i * stepSize);
  }

  output.push(max);

  return output;
}

export function appendSteps(first: number[], max: number, numSteps: number): number[] {
  if (numSteps === 0 || first.length <= 0) {
    return [...first];
  }
  if (numSteps === 1) {
    return [...first, max];
  }

  const min = first[first.length - 1];

  const stepSize = (max - min) / (numSteps - 1);
  const output = [];

  for (let i = 1; i < numSteps - 1; i++) {
    output.push(min + i * stepSize);
  }

  output.push(max);

  return first.concat(output);
}

export function addOrNull(value: NullableNumber, op: NullableNumber): NullableNumber {
  if (value === null || op === null) return null;

  return value + op;
}

export function multiplyOrNull(value: NullableNumber, op: NullableNumber): NullableNumber {
  if (value === null || op === null) return null;

  return value * op;
}

export function divideOrNull(value: NullableNumber, op: NullableNumber): NullableNumber {
  if (value === null || op === null) return null;

  return value / op;
}

export function fixArraySize(values: NullableNumber[], length: number): NullableNumber[] {
  if (values.length === length) {
    return values;
  }

  if (values.length > length) {
    return values.slice(0, length);
  }

  return values.concat(new Array(length - values.length).fill(0));
}

export function pxToRem(px: string): number {
  return parseFloat(px) / parseFloat(getComputedStyle(document.documentElement).fontSize);
}
