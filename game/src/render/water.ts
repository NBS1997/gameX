import { Sprite, Texture } from 'pixi.js';
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  WATER_PALETTES,
  WATER_STOPS,
} from '../config.ts';
import type { LunarPhase } from '../level/types.ts';
import { FluidGrid } from '../sim/fluid.ts';

interface RGB {
  r: number;
  g: number;
  b: number;
}

const PALETTE_LERP_RATE = 1.5;

export interface WaterRenderer {
  sprite: Sprite;
  update(dt: number): void;
  setPhase(phase: LunarPhase): void;
}

export function createWaterRenderer(grid: FluidGrid): WaterRenderer {
  const canvas = document.createElement('canvas');
  canvas.width = grid.width;
  canvas.height = grid.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  const imageData = ctx.createImageData(grid.width, grid.height);
  const data = imageData.data;

  const texture = Texture.from(canvas);
  texture.source.scaleMode = 'nearest';

  const sprite = new Sprite(texture);
  sprite.width = LOGICAL_WIDTH;
  sprite.height = LOGICAL_HEIGHT;

  // Active palette is interpolated toward the target on phase change.
  const active: RGB[] = WATER_PALETTES['waxing-crescent'].map((c) => ({ ...c }));
  let target: readonly RGB[] = WATER_PALETTES['waxing-crescent'];

  const setPhase = (phase: LunarPhase): void => {
    target = WATER_PALETTES[phase];
  };

  const update = (dt: number): void => {
    const blend = Math.min(1, PALETTE_LERP_RATE * dt);
    for (let i = 0; i < active.length; i++) {
      active[i].r += (target[i].r - active[i].r) * blend;
      active[i].g += (target[i].g - active[i].g) * blend;
      active[i].b += (target[i].b - active[i].b) * blend;
    }

    const heights = grid.heights;
    const cells = grid.width * grid.height;
    for (let i = 0; i < cells; i++) {
      const h = heights[i];
      const colour = sampleColour(h, active);
      const off = i * 4;
      data[off] = colour.r;
      data[off + 1] = colour.g;
      data[off + 2] = colour.b;
      data[off + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    texture.source.update();
  };

  return { sprite, update, setPhase };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function sampleColour(h: number, palette: RGB[]): RGB {
  const stops = WATER_STOPS;
  if (h <= stops[0]) return palette[0];
  if (h >= stops[stops.length - 1]) return palette[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (h >= stops[i] && h <= stops[i + 1]) {
      const t = (h - stops[i]) / (stops[i + 1] - stops[i]);
      return {
        r: lerp(palette[i].r, palette[i + 1].r, t) | 0,
        g: lerp(palette[i].g, palette[i + 1].g, t) | 0,
        b: lerp(palette[i].b, palette[i + 1].b, t) | 0,
      };
    }
  }
  return palette[0];
}
