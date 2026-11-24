import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createSky } from './sky.js';
import { createLights } from './lights.js';
import { applyAmbience } from './ambience.js';
import { buildTajMahal } from '../model/index.js';
import { getViewpoint } from '../viewpoints.js';

const TOUR_PERIOD = 60; // secondes pour un tour complet
const TRANSITION = 1400; // ms

// Rendu à la demande : aucune boucle permanente. On ne dessine qu'au chargement,
// quand la caméra bouge, au redimensionnement et pendant les courtes transitions.
export function createTajScene(container, { initialView = 'facade', night = false, onTourChange } = {}) {
  const width = () => container.clientWidth || window.innerWidth;
  const height = () => container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width(), height());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // la lumière ne bouge qu'au changement jour/nuit
  renderer.shadowMap.needsUpdate = true;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd6e1e9, 600, 3600);
  const camera = new THREE.PerspectiveCamera(40, width() / height(), 1, 6000);

  const sky = createSky(scene);
  const lights = createLights(scene);
  const { mats } = buildTajMahal(scene, renderer);
  const ctx = { scene, renderer, sky, lights, mats };

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.minDistance = 20;
  controls.maxDistance = 1200;
  controls.maxPolarAngle = Math.PI * 0.56;
  controls.screenSpacePanning = true;

  const render = () => renderer.render(scene, camera);
  let queued = 0;
  const requestRender = () => {
    if (!queued) {
      queued = requestAnimationFrame(() => {
        queued = 0;
        render();
      });
    }
  };

  // jamais sous le sol, cible gardée près du monument
  controls.addEventListener('change', () => {
    const t = controls.target;
    t.x = THREE.MathUtils.clamp(t.x, -700, 700);
    t.z = THREE.MathUtils.clamp(t.z, -700, 900);
    t.y = THREE.MathUtils.clamp(t.y, 0, 120);
    if (camera.position.y < 1.5) {
      camera.position.y = 1.5;
      camera.lookAt(t);
    }
    requestRender();
  });

  // ---- visite guidée (désactivée par défaut) ----
  let tour = 0;
  function stopTour() {
    if (tour) {
      cancelAnimationFrame(tour);
      tour = 0;
      onTourChange?.(false);
    }
  }
  function startTour() {
    cancelAnimationFrame(anim);
    anim = 0;
    const off = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const radius = THREE.MathUtils.clamp(off.radius, 170, 330);
    const phi = THREE.MathUtils.clamp(off.phi, Math.PI * 0.36, Math.PI * 0.48);
    const theta0 = off.theta;
    const start = performance.now();
    controls.target.set(0, 26, 0);
    const loop = (now) => {
      const th = theta0 + ((now - start) / 1000) * ((2 * Math.PI) / TOUR_PERIOD);
      camera.position.setFromSpherical(new THREE.Spherical(radius, phi, th)).add(controls.target);
      controls.update();
      tour = requestAnimationFrame(loop);
    };
    tour = requestAnimationFrame(loop);
    onTourChange?.(true);
  }

  // ---- transitions de caméra (1,4 s, s'arrêtent seules) ----
  let anim = 0;
  function setView(id, animate = true) {
    const vp = getViewpoint(id);
    const p1 = new THREE.Vector3(...vp.position);
    const t1 = new THREE.Vector3(...vp.target);
    stopTour();
    cancelAnimationFrame(anim);
    anim = 0;
    if (!animate) {
      camera.position.copy(p1);
      controls.target.copy(t1);
      controls.update();
      render();
      return;
    }
    const t0 = controls.target.clone();
    const o0 = new THREE.Spherical().setFromVector3(camera.position.clone().sub(t0));
    const o1 = new THREE.Spherical().setFromVector3(p1.clone().sub(t1));
    let dth = o1.theta - o0.theta;
    if (dth > Math.PI) dth -= 2 * Math.PI;
    if (dth < -Math.PI) dth += 2 * Math.PI;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / TRANSITION);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      controls.target.lerpVectors(t0, t1, e);
      const s = new THREE.Spherical(
        o0.radius + (o1.radius - o0.radius) * e,
        o0.phi + (o1.phi - o0.phi) * e,
        o0.theta + dth * e,
      );
      camera.position.setFromSpherical(s).add(controls.target);
      controls.update();
      anim = k < 1 ? requestAnimationFrame(step) : 0;
    };
    anim = requestAnimationFrame(step);
  }

  function setNight(v) {
    applyAmbience(ctx, !!v);
    render();
  }

  const onResize = () => {
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
    renderer.setSize(width(), height());
    render();
  };
  const onPointerDown = () => stopTour();
  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('wheel', onPointerDown, { passive: true });

  // première image complète dès le chargement
  applyAmbience(ctx, night);
  setView(initialView, false);

  return {
    setView: (id) => setView(id, true),
    setNight,
    toggleTour: () => (tour ? stopTour() : startTour()),
    dispose() {
      stopTour();
      cancelAnimationFrame(anim);
      cancelAnimationFrame(queued);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('wheel', onPointerDown);
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const list = Array.isArray(o.material) ? o.material : [o.material];
          list.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
