import * as THREE from 'three';

// Soleil (ombres, shadow map 2048), ciel/sol (HemisphereLight) et un éclairage d'appoint chaud pour la nuit.
export function createLights(scene) {
  const target = new THREE.Object3D();
  target.position.set(0, 0, 150);
  scene.add(target);

  const sun = new THREE.DirectionalLight(0xfff0d4, 2.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -235;
  sc.right = 235;
  sc.top = 235;
  sc.bottom = -235;
  sc.near = 50;
  sc.far = 1400;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.05;
  sun.target = target;
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0xd2e4ff, 0xa08d6c, 1.15);
  scene.add(hemi);

  const fill = new THREE.DirectionalLight(0xffc68a, 0);
  fill.position.set(60, 300, 950);
  fill.target = target;
  scene.add(fill);

  function setSun(dir) {
    const d = new THREE.Vector3(...dir).normalize();
    sun.position.copy(target.position).addScaledVector(d, 700);
    sun.updateMatrixWorld();
  }

  return { sun, hemi, fill, target, setSun };
}
