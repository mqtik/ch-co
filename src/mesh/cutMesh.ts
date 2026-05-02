import * as THREE from 'three';
import { Evaluator, Brush, INTERSECTION } from 'three-bvh-csg';
export interface CutResult {
  proximal: THREE.Mesh;
  distal: THREE.Mesh;
}

const PADDING = 50;

export function cutMesh(bone: THREE.Mesh, planeZ: number): CutResult {
  bone.geometry.computeBoundingBox();
  const bounds = bone.geometry.boundingBox!;

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const boxW = size.x + PADDING;
  const boxH = size.y + PADDING;
  const boxD = size.z + PADDING;

  const evaluator = new Evaluator();
  evaluator.attributes = ['position', 'normal'];

  const boneBrush = makeBrush(bone.geometry, bone.material as THREE.Material);
  const proxBrush = makeBoxBrush(boxW, boxH, boxD, center.x, center.y, planeZ + boxD / 2);
  const distBrush = makeBoxBrush(boxW, boxH, boxD, center.x, center.y, planeZ - boxD / 2);

  const proxResult = evaluator.evaluate(boneBrush, proxBrush, INTERSECTION);
  const distResult = evaluator.evaluate(boneBrush, distBrush, INTERSECTION);

  const material = bone.material as THREE.MeshStandardMaterial;

  return {
    proximal: new THREE.Mesh(proxResult.geometry, material.clone()),
    distal: new THREE.Mesh(distResult.geometry, material.clone()),
  };
}

function makeBrush(geometry: THREE.BufferGeometry, material: THREE.Material): Brush {
  const geo = geometry.clone();
  if (geo.hasAttribute('uv')) geo.deleteAttribute('uv');
  const brush = new Brush(geo, material);
  brush.updateMatrixWorld();
  brush.prepareGeometry();
  return brush;
}

function makeBoxBrush(w: number, h: number, d: number, cx: number, cy: number, cz: number): Brush {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.deleteAttribute('uv');
  geo.translate(cx, cy, cz);
  const brush = new Brush(geo);
  brush.updateMatrixWorld();
  brush.prepareGeometry();
  return brush;
}
