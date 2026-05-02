import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export function createScene(container: HTMLElement): { scene: THREE.Scene } {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    2000,
  );
  camera.position.set(200, 150, 400);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 200, 1200);

  scene.add(createLighting());
  scene.add(createGround());

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  startRenderLoop(renderer, scene, camera, controls);

  return { scene };
}

function createLighting(): THREE.Group {
  const group = new THREE.Group();

  const hemi = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemi.position.set(0, 100, 0);
  group.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 3);
  dir.position.set(50, 200, 100);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.radius = 4;
  dir.shadow.bias = -0.0005;
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 600;
  dir.shadow.camera.left = -250;
  dir.shadow.camera.right = 250;
  dir.shadow.camera.top = 250;
  dir.shadow.camera.bottom = -250;
  group.add(dir);

  return group;
}

function createGround(): THREE.Mesh {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -80;
  ground.receiveShadow = true;
  return ground;
}

function startRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): void {
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
}
