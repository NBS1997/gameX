import {
  CELL_SIZE,
  DAMPING_RATE,
  GRID_H,
  GRID_W,
  HEIGHT_PUMP,
  HOLD_FORCE_BASE,
  REST_HEIGHT,
  REST_RATE,
  SPRING,
} from '../config.ts';

export class FluidGrid {
  readonly width = GRID_W;
  readonly height = GRID_H;
  h: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  private hScratch: Float32Array;

  constructor() {
    const cells = GRID_W * GRID_H;
    this.h = new Float32Array(cells);
    this.vx = new Float32Array(cells);
    this.vy = new Float32Array(cells);
    this.hScratch = new Float32Array(cells);
    this.h.fill(REST_HEIGHT);
  }

  applyPull(
    cursorX: number,
    cursorY: number,
    pullRadius: number,
    pullStrength: number,
    dt: number,
  ): void {
    const gx = cursorX / CELL_SIZE;
    const gy = cursorY / CELL_SIZE;
    const gridR = pullRadius / CELL_SIZE;

    const minX = Math.max(0, Math.floor(gx - gridR));
    const maxX = Math.min(GRID_W - 1, Math.ceil(gx + gridR));
    const minY = Math.max(0, Math.floor(gy - gridR));
    const maxY = Math.min(GRID_H - 1, Math.ceil(gy + gridR));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = gx - x;
        const dy = gy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > gridR) continue;
        const falloff = 1 - dist / gridR;
        const dirX = dist > 0.001 ? dx / dist : 0;
        const dirY = dist > 0.001 ? dy / dist : 0;
        const force = pullStrength * HOLD_FORCE_BASE * falloff * dt;
        const i = y * GRID_W + x;
        this.vx[i] += dirX * force;
        this.vy[i] += dirY * force;
        this.h[i] += falloff * pullStrength * HEIGHT_PUMP * dt;
      }
    }
  }

  step(dt: number): void {
    const W = GRID_W;
    const cells = GRID_W * GRID_H;

    // Pressure: height gradient pushes velocity (high water flows toward low water)
    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const gradX = (this.h[i + 1] - this.h[i - 1]) * 0.5;
        const gradY = (this.h[i + W] - this.h[i - W]) * 0.5;
        this.vx[i] -= gradX * SPRING * dt;
        this.vy[i] -= gradY * SPRING * dt;
      }
    }

    // Velocity damping (frame-rate independent)
    const dampingFactor = Math.exp(-DAMPING_RATE * dt);
    for (let i = 0; i < cells; i++) {
      this.vx[i] *= dampingFactor;
      this.vy[i] *= dampingFactor;
    }

    // Height advection + rest restoration (semi-Lagrangian-ish via gradient)
    for (let i = 0; i < cells; i++) this.hScratch[i] = this.h[i];

    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const gradX = (this.h[i + 1] - this.h[i - 1]) * 0.5;
        const gradY = (this.h[i + W] - this.h[i - W]) * 0.5;
        let h = this.h[i] - (this.vx[i] * gradX + this.vy[i] * gradY) * dt;
        h += (REST_HEIGHT - h) * REST_RATE * dt;
        this.hScratch[i] = h;
      }
    }

    // Swap buffers (zero-allocation)
    const tmp = this.h;
    this.h = this.hScratch;
    this.hScratch = tmp;
  }

  sampleHeight(logicalX: number, logicalY: number): number {
    const gx = Math.max(
      0,
      Math.min(GRID_W - 1, Math.floor(logicalX / CELL_SIZE)),
    );
    const gy = Math.max(
      0,
      Math.min(GRID_H - 1, Math.floor(logicalY / CELL_SIZE)),
    );
    return this.h[gy * GRID_W + gx];
  }

  sampleFlow(logicalX: number, logicalY: number): { vx: number; vy: number } {
    const gx = Math.max(
      0,
      Math.min(GRID_W - 1, Math.floor(logicalX / CELL_SIZE)),
    );
    const gy = Math.max(
      0,
      Math.min(GRID_H - 1, Math.floor(logicalY / CELL_SIZE)),
    );
    const i = gy * GRID_W + gx;
    return { vx: this.vx[i], vy: this.vy[i] };
  }
}
