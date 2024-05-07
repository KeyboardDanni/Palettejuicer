import "reflect-metadata";

import fs from "fs";
import { expect, test } from "vitest";

import { JascPalExporter } from "../storage/exporters/JascPalExporter";
import { GnuPaletteExporter } from "../storage/exporters/GnuPaletteExporter";

const jascFiles = ["SuperCrateHoard"];
const gnuFiles = ["SuperCrateHoard", "RioGrande"];

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

  for (const [i, hex] of json.entries()) {
    expect(palette.baseColors[i].hex, `Palette color ${i}`).toBe(hex);
  }
});

test.each(gnuFiles)("loads a GNU palette (%s)", async (gnuFile) => {
  const json = getJson(`./src/tests/data/${gnuFile}.json`);
  const buffer = fs.readFileSync(`./src/tests/data/${gnuFile}.gpl`);

  const palette = await GnuPaletteExporter.import(buffer);

  for (const [i, hex] of json.entries()) {
    expect(palette.baseColors[i].hex, `Palette color ${i}`).toBe(hex);
  }
});

test.each(jascFiles)("saves a Jasc palette (%s)", async (jascFile) => {
  const buffer = fs.readFileSync(`./src/tests/data/${jascFile}.pal`);

  const palette = await JascPalExporter.import(buffer);
  const exported = await JascPalExporter.export(palette);

  const paletteReimport = await JascPalExporter.import(exported);

  for (const [i, color] of palette.baseColors.entries()) {
    expect(paletteReimport.baseColors[i].hex, `Palette color ${i}`).toBe(color.hex);
  }
});

test.each(gnuFiles)("saves a GNU palette (%s)", async (gnuFile) => {
  const buffer = fs.readFileSync(`./src/tests/data/${gnuFile}.gpl`);

  const palette = await GnuPaletteExporter.import(buffer);
  const exported = await GnuPaletteExporter.export(palette);

  const paletteReimport = await GnuPaletteExporter.import(exported);

  for (const [i, color] of palette.baseColors.entries()) {
    expect(paletteReimport.baseColors[i].hex, `Palette color ${i}`).toBe(color.hex);
  }
});
