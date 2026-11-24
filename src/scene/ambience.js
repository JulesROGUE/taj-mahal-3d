import { raw } from './sky.js';

// Jour : soleil d'après-midi venant du sud-ouest, ciel brumeux d'Agra.
// Nuit : clair de lune derrière le monument, ciel étoilé, éclairages chauds et fenêtres allumées.
const DAY = {
  top: 0x4a8bd6, horizon: 0xdce7ef, bottom: 0xc2bba4,
  sun: [-0.45, 0.62, 0.64], sunColor: 0xfff0d4, sunI: 2.8, skySun: 0xfff0d4, sunSize: 1, glow: 0.22,
  hemiSky: 0xd2e4ff, hemiGround: 0xa08d6c, hemiI: 1.15,
  fog: 0xd6e1e9, fogNear: 600, fogFar: 3600, fillI: 0, exposure: 1,
};
const NIGHT = {
  top: 0x040a1c, horizon: 0x1c2b4f, bottom: 0x0a0c13,
  sun: [0.38, 0.3, -0.87], sunColor: 0xa9bfff, sunI: 0.6, skySun: 0x8fa6e6, sunSize: 0, glow: 0.07,
  hemiSky: 0x3a5294, hemiGround: 0x1b1711, hemiI: 0.62,
  fog: 0x17223d, fogNear: 450, fogFar: 2800, fillI: 0.85, exposure: 1.05,
};

export function applyAmbience({ scene, renderer, sky, lights, mats }, night) {
  const p = night ? NIGHT : DAY;
  const u = sky.uniforms;
  u.top.value.copy(raw(p.top));
  u.horizon.value.copy(raw(p.horizon));
  u.bottom.value.copy(raw(p.bottom));
  u.sunDir.value.set(...p.sun).normalize();
  u.sunColor.value.copy(raw(p.skySun));
  u.sunSize.value = p.sunSize;
  u.glow.value = p.glow;

  lights.setSun(p.sun);
  lights.sun.color.setHex(p.sunColor);
  lights.sun.intensity = p.sunI;
  lights.hemi.color.setHex(p.hemiSky);
  lights.hemi.groundColor.setHex(p.hemiGround);
  lights.hemi.intensity = p.hemiI;
  lights.fill.color.setHex(0xffd6a6);
  lights.fill.intensity = p.fillI;

  scene.fog.color.setHex(p.fog);
  scene.fog.near = p.fogNear;
  scene.fog.far = p.fogFar;

  sky.stars.visible = night;
  sky.moon.visible = night;
  sky.moon.position.set(...p.sun).normalize().multiplyScalar(3800);

  renderer.toneMappingExposure = p.exposure;
  mats.setNight(night);
  renderer.shadowMap.needsUpdate = true;
}
