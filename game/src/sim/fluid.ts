import {
  CELL_SIZE,
  DAMPING_RATE,
  GRID_H,
  GRID_W,
  HEIGHT_CAP,
  HEIGHT_PUMP,
  HOLD_FORCE_BASE,
  MAX_VELOCITY,
  REST_HEIGHT,
  REST_RATE,
  SPRING,
} from '../config.ts';

export class FluidGrid {
  readonly width = GRID_W;
  readonly height = GRID_H;
  private _h: Float32Array;
  private _vx: Float32Array;
  private _vy: Float32Array;
  private _hScratch: Float32Array;

  constructor() {
    const cells = GRID_W * GRID_H;
    this._h = new Float32Array(cells);
    this._vx = new Float32Array(cells);
    this._vy = new Float32Array(cells);
    this._hScratch = new Float32Array(cells);
    this._h.fill(REST_HEIGHT);
  }

  /**
   * Read-only height field. Callers must not mutate; the buffer-swap pattern
   * inside step() relies on owning this reference.
   */
  get heights(): Float32Array {
    return this._h;
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
        this._vx[i] += dirX * force;
        this._vy[i] += dirY * force;
        const room = Math.max(0, HEIGHT_CAP - this._h[i]);
        this._h[i] += falloff * pullStrength * HEIGHT_PUMP * room * dt;
      }
    }
  }

  step(dt: number): void {
    const W = GRID_W;
    const cells = GRID_W * GRID_H;

    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const gradX = (this._h[i + 1] - this._h[i - 1]) * 0.5;
        const gradY = (this._h[i + W] - this._h[i - W]) * 0.5;
        this._vx[i] -= gradX * SPRING * dt;
        this._vy[i] -= gradY * SPRING * dt;
      }
    }

    const dampingFactor = Math.exp(-DAMPING_RATE * dt);
    const maxVSq = MAX_VELOCITY * MAX_VELOCITY;
    for (let i = 0; i < cells; i++) {
      this._vx[i] *= dampingFactor;
      this._vy[i] *= dampingFactor;
      const speedSq = this._vx[i] * this._vx[i] + this._vy[i] * this._vy[i];
      if (speedSq > maxVSq) {
        const k = MAX_VELOCITY / Math.sqrt(speedSq);
        this._vx[i] *= k;
        this._vy[i] *= k;
      }
    }

    for (let i = 0; i < cells; i++) this._hScratch[i] = this._h[i];

    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const gradX = (this._h[i + 1] - this._h[i - 1]) * 0.5;
        const gradY = (this._h[i + W] - this._h[i - W]) * 0.5;
        let h = this._h[i] - (this._vx[i] * gradX + this._vy[i] * gradY) * dt;
        h += (REST_HEIGHT - h) * REST_RATE * dt;
        this._hScratch[i] = h;
      }
    }

    const tmp = this._h;
    this._h = this._hScratch;
    this._hScratch = tmp;
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
    return this._h[gy * GRID_W + gx];
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
    return { vx: this._vx[i], vy: this._vy[i] };
  }
}
