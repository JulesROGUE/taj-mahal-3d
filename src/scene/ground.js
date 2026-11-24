import * as THREE from 'three';
import { box, M, MS } from '../model/builder.js';
import { D } from '../model/dimensions.js';

// Sol autour du complexe, berge et rivière Yamuna au nord, arbres (vue aérienne : le Taj est entouré de verdure).
export function createGround(B) {
  let seed = 99;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const plane = (w, d) => new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2);
  const zWall = -D.terrace.d / 2 - 2; // -57.5 : pied du mur de la terrasse côté rivière
  const zRiver = -85;
  const zFar = -515;
  const yRiver = D.river.level;

  B.add('ground', plane(7000, 3500 - zWall), M(0, 0, (3500 + zWall) / 2));
  for (const sx of [-1, 1]) B.add('bank', box(3420, 6.3, 2), M(sx * (150 + 1710), yRiver - 0.2, zWall + 1));
  B.add('sand', plane(7000, zWall - zRiver), M(0, yRiver + 0.35, (zWall + zRiver) / 2));
  B.add('river', plane(7000, zRiver - zFar), M(0, yRiver, (zRiver + zFar) / 2));
  B.add('bank', box(7000, 4.7, 3), M(0, yRiver - 0.2, zFar - 1.5));
  B.add('ground', plane(7000, 3000), M(0, -1.5, zFar - 1500));

  const crown = new THREE.IcosahedronGeometry(1, 0);
  const trunk = new THREE.CylinderGeometry(0.22, 0.32, 1, 5).translate(0, 0.5, 0);
  const tree = (x, y, z, r) => {
    B.add('trunk', trunk, MS(x, y, z, r * 0.9, r * 0.9, r * 0.9));
    B.add(rnd() > 0.5 ? 'foliage' : 'foliage2', crown, MS(x, y + r * 1.25, z, r, r * 0.82, r));
  };
  let n = 0;
  while (n < 240) {
    const x = (rnd() * 2 - 1) * 950;
    const z = -50 + rnd() * 1000;
    if (Math.abs(x) < 168 && z < 378) continue; // complexe
    if (Math.abs(x) < 70 && z < 470) continue; // parvis de la grande porte
    tree(x, 0, z, 5 + rnd() * 4);
    n++;
  }
  for (let i = 0; i < 150; i++) tree((rnd() * 2 - 1) * 1200, -1.5, zFar - 30 - rnd() * 600, 5 + rnd() * 4);
}
