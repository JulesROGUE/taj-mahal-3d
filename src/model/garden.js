import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { D } from './dimensions.js';
import { box, cyl, M, MS } from './builder.js';

// Jardin moghol (charbagh) : canal en croix, bassin central surélevé, cyprès, lampadaires
// et bassin réfléchissant (Reflector) dans l'axe du mausolée.
// Coupe d'un axe (photos) : canal 6 m | margelle | allée de grès 6 m | plate-bande de cyprès 4 m | allée 5 m.
export function buildGarden(B) {
  let seed = 4242;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const z0 = D.garden.z0;
  const z1 = z0 + D.garden.size;
  const zc = (z0 + z1) / 2; // 205,5
  const zG = z1 - D.gate.d / 2; // façade nord de la grande porte
  const tank = 14;

  B.add('gardenGround', new THREE.PlaneGeometry(300, 300).rotateX(-Math.PI / 2), M(0, 0.03, zc));

  const segsNS = [[z0, zc - tank], [zc + tank, zG]];
  for (const [a, b] of segsNS) for (const sx of [-1, 1]) B.add('marble', box(1, 0.5, b - a), M(sx * 3.5, 0, (a + b) / 2));
  const segsEW = [[-142, -tank], [tank, 142]];
  for (const [a, b] of segsEW) {
    for (const sz of [-1, 1]) B.add('marble', box(b - a, 0.5, 1), M((a + b) / 2, 0, zc + sz * 3.5));
    B.add('water', new THREE.PlaneGeometry(b - a, 6).rotateX(-Math.PI / 2), M((a + b) / 2, 0.3, zc));
  }

  // bassin central surélevé et ses cinq fontaines
  for (const [x, z, w, d] of [[0, -11.5, 28, 5], [0, 11.5, 28, 5], [-11.5, 0, 5, 18], [11.5, 0, 5, 18]]) {
    B.add('marble', box(w, 1.0, d), M(x, 0, zc + z));
  }
  B.add('water', new THREE.PlaneGeometry(18, 18).rotateX(-Math.PI / 2), M(0, 0.75, zc));
  for (const [x, z] of [[0, 0], [-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]]) {
    B.add('marble', cyl(0.5, 0.7, 0.5, 10), M(x, 0.7, zc + z));
    B.add('jet', cyl(0.06, 0.2, 2.2, 6), M(x, 1.2, zc + z));
  }
  for (const [a, b] of segsNS) {
    for (let z = a + 3; z < b - 1; z += 4) {
      B.add('gold', cyl(0.06, 0.06, 0.35, 5), M(0, 0.25, z));
      B.add('jet', cyl(0.035, 0.1, 1.1, 5), M(0, 0.6, z));
    }
  }

  // cyprès le long des axes, dans les plates-bandes
  const cyp = new THREE.LatheGeometry(
    [[0, 0], [0.45, 0.12], [0.78, 0.8], [0.9, 2.0], [0.82, 3.4], [0.6, 4.7], [0.32, 5.7], [0, 6.4]].map(([x, y]) => new THREE.Vector2(x, y)),
    8,
  );
  for (const [a, b] of segsNS) {
    for (const sx of [-1, 1]) {
      for (let z = a + 5; z < b - 3; z += 9) B.add('cypress', cyp, MS(sx * 12, 0, z, 1, 0.9 + rnd() * 0.2, 1));
    }
  }
  for (const [a, b] of segsEW) {
    for (const sz of [-1, 1]) {
      for (let x = a + 6; x < b - 4; x += 9) B.add('cypress', cyp, MS(x, 0, zc + sz * 12, 1, 0.9 + rnd() * 0.2, 1));
    }
  }

  // grands arbres en bordure des quarts
  const crown = new THREE.IcosahedronGeometry(1, 1);
  const trunk = cyl(0.25, 0.35, 1, 6);
  let n = 0;
  let guard = 0;
  while (n < 56 && guard++ < 5000) {
    const x = (rnd() * 2 - 1) * 136;
    const z = z0 + 12 + rnd() * 276;
    const nearSide = Math.abs(x) > 112;
    const nearEnd = (z < z0 + 24 && Math.abs(x) > 70) || z > z1 - 24;
    if (!(nearSide || nearEnd) || Math.abs(x) < 26 || Math.abs(z - zc) < 24) continue;
    const r = 4 + rnd() * 2.5;
    const h = 3 + rnd() * 1.5;
    B.add('trunk', trunk, MS(x, 0, z, 1, h + r * 0.5, 1));
    B.add(rnd() > 0.5 ? 'foliage' : 'foliage2', crown, MS(x, h + r * 0.8, z, r, r * 0.85, r));
    n++;
  }

  // lampadaires (allumés la nuit)
  for (const [a, b] of segsNS) {
    for (const sx of [-1, 1]) {
      for (let z = a + 12; z < b - 6; z += 26) {
        B.add('iron', cyl(0.07, 0.09, 3, 5), M(sx * 19.6, 0, z));
        B.add('lamp', box(0.45, 0.6, 0.45), M(sx * 19.6, 3.0, z));
      }
    }
  }

  // bassin réfléchissant : un seul Reflector de 6 m de large
  const len = zG - z0;
  const pool = new Reflector(new THREE.PlaneGeometry(6, len), {
    textureWidth: 1024,
    textureHeight: 768,
    color: 0xbac6ca,
    clipBias: 0.003,
  });
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.32, (z0 + zG) / 2);
  return pool;
}
