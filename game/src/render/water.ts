import { Sprite, Texture } from 'pixi.js';
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  WATER_PALETTE,
  WATER_STOPS,
} from '../config.ts';
import { FluidGrid } from '../sim/fluid.ts';

export interface WaterRenderer {
  sprite: Sprite;
  update(): void;
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

  const update = (): void => {
    const cells = grid.width * grid.height;
    for (let i = 0; i < cells; i++) {
      const h = grid.h[i];
      const colour = sampleColour(h);
      const off = i * 4;
      data[off] = colour.r;
      data[off + 1] = colour.g;
      data[off + 2] = colour.b;
      data[off + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    texture.source.update();
  };

  return { sprite, update };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function sampleColour(h: number): { r: number; g: number; b: number } {
  const stops = WATER_STOPS;
  const palette = WATER_PALETTE;
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
