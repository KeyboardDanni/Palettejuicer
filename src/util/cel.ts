export interface CelIndex {
  x: number;
  y: number;
}

export function celStrip(start: CelIndex, end: CelIndex) {
  let x = Math.round(start.x);
  let y = Math.round(start.y);
  const diffX = Math.round(end.x) - x;
  const diffY = Math.round(end.y) - y;
  const diff = Math.abs(diffX) + Math.abs(diffY);
  const signX = Math.sign(diffX);
  const signY = Math.sign(diffY);

  const cels: CelIndex[] = [];

  // Check for row or column
  if (diff > 0 && (diffX === 0 || diffY === 0)) {
    for (let i = 0; i <= diff; i++) {
      cels.push({ x, y });

      x += signX;
      y += signY;
    }
  }

  return cels;
}
