import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { ResectionPlane } from '../ResectionPlane';

function makeBounds(minZ: number, maxZ: number): THREE.Box3 {
  return new THREE.Box3(
    new THREE.Vector3(-50, -50, minZ),
    new THREE.Vector3(50, 50, maxZ),
  );
}

describe('ResectionPlane', () => {
  it('starts at center Z', () => {
    const plane = new ResectionPlane(makeBounds(-200, 200));
    expect(plane.getZ()).toBe(0);
  });

  it('moves up (positive Z)', () => {
    const plane = new ResectionPlane(makeBounds(-200, 200));
    plane.moveUp();
    expect(plane.getZ()).toBeGreaterThan(0);
  });

  it('moves down (negative Z)', () => {
    const plane = new ResectionPlane(makeBounds(-200, 200));
    plane.moveDown();
    expect(plane.getZ()).toBeLessThan(0);
  });

  it('clamps at upper bound', () => {
    const plane = new ResectionPlane(makeBounds(-200, 200));
    for (let i = 0; i < 100; i++) plane.moveUp();
    expect(plane.getZ()).toBeLessThanOrEqual(200);
  });

  it('clamps at lower bound', () => {
    const plane = new ResectionPlane(makeBounds(-200, 200));
    for (let i = 0; i < 100; i++) plane.moveDown();
    expect(plane.getZ()).toBeGreaterThanOrEqual(-200);
  });

  it('step is 5% of bone height', () => {
    const plane = new ResectionPlane(makeBounds(-100, 100));
    plane.moveUp();
    expect(plane.getZ()).toBeCloseTo(10, 1);
  });
});
