export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function positiveMod(a: number, b: number) {
  return ((a % b) + b) % b;
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
