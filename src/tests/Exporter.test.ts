import "reflect-metadata";

import fs from "fs";
import { expect, test } from "vitest";

import { JascPalExporter } from "../storage/exporters/JascPalExporter";
import { GnuPaletteExporter } from "../storage/exporters/GnuPaletteExporter";

const jascFiles = ["SuperCrateHoard", "NonRectangular"];
const gnuFiles = ["SuperCrateHoard", "RioGrande", "NonRectangular8", "TooFewColumns", "TooManyColumns"];

function getJson(path: string) {
  const decoder = new TextDecoder();
  const buffer = fs.readFileSync(path);
  const text = decoder.decode(buffer);

  return JSON.parse(text);
}

test.each(jascFiles)("loads a Jasc palette (%s)", async (jascFile) => {
  const json = getJson(`./src/tests/data/${jascFile}.json`);
  const buffer = fs.readFileSync(`./src/tests/data/${jascFile}.pal`);

  const palette = await JascPalExporter.import(buffer);

  expect(palette.width).toBe(json.dimensions[0]);
  expect(palette.height).toBe(json.dimensions[1]);

  for (const [i, hex] of json.colors.entries()) {
    expect(palette.baseColors[i].hex, `Palette color ${i}`).toBe(hex);
  }
});

test.each(gnuFiles)("loads a GNU palette (%s)", async (gnuFile) => {
  const json = getJson(`./src/tests/data/${gnuFile}.json`);
  const buffer = fs.readFileSync(`./src/tests/data/${gnuFile}.gpl`);

  const palette = await GnuPaletteExporter.import(buffer);

  expect(palette.width).toBe(json.dimensions[0]);
  expect(palette.height).toBe(json.dimensions[1]);

  for (const [i, hex] of json.colors.entries()) {
    expect(palette.baseColors[i].hex, `Palette color ${i}`).toBe(hex);
  }
});

test.each(jascFiles)("saves a Jasc palette (%s)", async (jascFile) => {
  const buffer = fs.readFileSync(`./src/tests/data/${jascFile}.pal`);

  const palette = await JascPalExporter.import(buffer);
  const exported = await JascPalExporter.export(palette);

  const paletteReimport = await JascPalExporter.import(exported);

  expect(paletteReimport.width).toBe(palette.width);
  expect(paletteReimport.height).toBe(palette.height);

  for (const [i, color] of palette.baseColors.entries()) {
    expect(paletteReimport.baseColors[i].hex, `Palette color ${i}`).toBe(color.hex);
  }
});

test.each(gnuFiles)("saves a GNU palette (%s)", async (gnuFile) => {
  const buffer = fs.readFileSync(`./src/tests/data/${gnuFile}.gpl`);

  const palette = await GnuPaletteExporter.import(buffer);
  const exported = await GnuPaletteExporter.export(palette);

  const paletteReimport = await GnuPaletteExporter.import(exported);

  expect(paletteReimport.width).toBe(palette.width);
  expect(paletteReimport.height).toBe(palette.height);

  for (const [i, color] of palette.baseColors.entries()) {
    expect(paletteReimport.baseColors[i].hex, `Palette color ${i}`).toBe(color.hex);
  }
});
