import * as THREE from 'three';

export interface DashControls {
  setPlaneZ(z: number): void;
  setDashVisible(visible: boolean): void;
}

let cacheKey = 0;

const VERTEX_PREAMBLE = `varying vec3 v_worldPos;\nvarying vec3 v_worldNrm;\n`;

const VERTEX_INJECTION = `#include <worldpos_vertex>
v_worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
v_worldNrm = normalize(mat3(modelMatrix) * normal);`;

const FRAGMENT_PREAMBLE = [
  'varying vec3 v_worldPos;',
  'varying vec3 v_worldNrm;',
  'uniform float u_planeZ;',
  'uniform float u_showDash;',
].join('\n') + '\n';

const FRAGMENT_INJECTION = `if (u_showDash > 0.5) {
  float inBand = 1.0 - step(1.5, abs(v_worldPos.z - u_planeZ));
  vec3 n = abs(v_worldNrm);
  float useY = step(n.y, n.x);
  float dash = mix(
    step(0.5, fract(v_worldPos.x * 0.12)),
    step(0.5, fract(v_worldPos.y * 0.12)),
    useY
  );
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.08, 0.08, 0.08), inBand * dash * 0.9);
}
#include <fog_fragment>`;

export function applyDashShader(material: THREE.MeshStandardMaterial): DashControls {
  let uniforms: { u_planeZ: { value: number }; u_showDash: { value: number } } | null = null;
  let pendingPlaneZ = 0;
  let pendingShowDash = 1;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.u_planeZ = { value: pendingPlaneZ };
    shader.uniforms.u_showDash = { value: pendingShowDash };
    uniforms = shader.uniforms as typeof uniforms;

    shader.vertexShader = VERTEX_PREAMBLE +
      shader.vertexShader.replace('#include <worldpos_vertex>', VERTEX_INJECTION);

    shader.fragmentShader = FRAGMENT_PREAMBLE +
      shader.fragmentShader.replace('#include <fog_fragment>', FRAGMENT_INJECTION);
  };

  material.customProgramCacheKey = () => `dash_${cacheKey++}`;
  material.needsUpdate = true;

  return {
    setPlaneZ(z: number) {
      pendingPlaneZ = z;
      if (uniforms) uniforms.u_planeZ.value = z;
    },
    setDashVisible(visible: boolean) {
      const v = visible ? 1.0 : 0.0;
      pendingShowDash = v;
      if (uniforms) uniforms.u_showDash.value = v;
    },
  };
}
