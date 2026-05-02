import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { cutMesh } from '../cutMesh';

function makeBoxBone(): THREE.Mesh {
  const geo = new THREE.BoxGeometry(20, 20, 100);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  return new THREE.Mesh(geo, mat);
}

describe('cutMesh', () => {
  it('returns proximal and distal meshes', () => {
    const result = cutMesh(makeBoxBone(), 0);
    expect(result.proximal).toBeInstanceOf(THREE.Mesh);
    expect(result.distal).toBeInstanceOf(THREE.Mesh);
  });

  it('both segments have vertices', () => {
    const result = cutMesh(makeBoxBone(), 0);
    expect(result.proximal.geometry.attributes.position.count).toBeGreaterThan(0);
    expect(result.distal.geometry.attributes.position.count).toBeGreaterThan(0);
  });

  it('segments have no position offset', () => {
    const result = cutMesh(makeBoxBone(), 0);
    expect(result.proximal.position.z).toBe(0);
    expect(result.distal.position.z).toBe(0);
  });

  it('works with off-center cut plane', () => {
    const result = cutMesh(makeBoxBone(), 20);
    expect(result.proximal.geometry.attributes.position.count).toBeGreaterThan(0);
    expect(result.distal.geometry.attributes.position.count).toBeGreaterThan(0);
  });
});
