import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const BONE_COLOR = 0xe8d5b7;

export function loadBone(url: string): Promise<THREE.Mesh> {
  return new Promise((resolve, reject) => {
    new STLLoader().load(
      url,
      (raw) => {
        const geometry = mergeVertices(raw, 1e-4);
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();

        const center = new THREE.Vector3();
        geometry.boundingBox!.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        geometry.computeBoundingBox();

        const material = new THREE.MeshStandardMaterial({
          color: BONE_COLOR,
          roughness: 0.6,
          metalness: 0.1,
        });

        resolve(new THREE.Mesh(geometry, material));
      },
      undefined,
      reject,
    );
  });
}
