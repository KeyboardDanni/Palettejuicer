import "reflect-metadata";

import fs from "fs";
import { expect, test } from "vitest";

import { Exporter } from "../storage/exporters/Exporter";
import { JascPalExporter } from "../storage/exporters/JascPalExporter";
import { GnuPaletteExporter } from "../storage/exporters/GnuPaletteExporter";
import { DEFAULT_PALETTE_HEIGHT, DEFAULT_PALETTE_WIDTH, Palette } from "../model/Palette";
import { castDraft, produce } from "immer";
import { Color } from "../model/color/Color";
import { ColorspaceRgb } from "../model/color/ColorspaceRgb";

const exporters: (typeof Exporter)[] = [JascPalExporter, GnuPaletteExporter];
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

test.each(exporters)("only saves the export range (%s)", async (exporter) => {
  let palette = new Palette(DEFAULT_PALETTE_WIDTH, DEFAULT_PALETTE_HEIGHT);

  palette = produce(palette, (draft) => {
    let index = 0;

    for (let y = 0; y < DEFAULT_PALETTE_HEIGHT; y++) {
      for (let x = 0; x < DEFAULT_PALETTE_WIDTH; x++) {
        draft.baseColors[index] = castDraft(new Color(ColorspaceRgb.fromTransformed([x * 8, y * 8, 255])));
        index++;
      }
    }
  });

  let resized = palette.resize(DEFAULT_PALETTE_WIDTH + 10, DEFAULT_PALETTE_HEIGHT + 8, 5, 4);
  resized = produce(resized, (draft) => {
    draft.exportStart = { x: 5, y: 4 };
    draft.exportEnd = { x: DEFAULT_PALETTE_WIDTH + 4, y: DEFAULT_PALETTE_HEIGHT + 3 };
  });

  const exported = await exporter.export(resized);
  const paletteReimport = await exporter.import(exported);

  expect(paletteReimport.width).toBe(palette.width);
  expect(paletteReimport.height).toBe(palette.height);

  for (const [i, color] of palette.baseColors.entries()) {
    expect(paletteReimport.baseColors[i].hex, `Palette color ${i}`).toBe(color.hex);
  }
});
