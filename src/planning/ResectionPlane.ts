import type { Box3 } from 'three';
import { Vector3 } from 'three';

const MARGIN_RATIO = 0.05;

export class ResectionPlane {
  private z = 0;
  private minZ = 0;
  private maxZ = 0;
  private step = 0;

  constructor(bounds: Box3) {
    this.recalculate(bounds);
  }

  moveUp(): void {
    this.z = Math.min(this.z + this.step, this.maxZ);
  }

  moveDown(): void {
    this.z = Math.max(this.z - this.step, this.minZ);
  }

  getZ(): number { return this.z; }
  isAtMax(): boolean { return this.z >= this.maxZ; }
  isAtMin(): boolean { return this.z <= this.minZ; }
  setToMin(): void { this.z = this.minZ; }
  setToMax(): void { this.z = this.maxZ; }

  recalculate(bounds: Box3): void {
    const size = new Vector3();
    bounds.getSize(size);
    this.step = size.z * MARGIN_RATIO;
    this.minZ = bounds.min.z + this.step;
    this.maxZ = bounds.max.z - this.step;
    this.z = (bounds.min.z + bounds.max.z) / 2;
  }
}
