import * as THREE from 'three';
import { D } from './dimensions.js';
import { cyl, addChhatri, M } from './builder.js';

// Quatre minarets de 40 m aux angles du socle : trois fûts presque égaux, trois balcons, un chhatri au sommet.
export function buildMinarets(B) {
  const P = D.plinth.top;
  const o = D.minaret.offset;
  const bs = D.minaret.balconies;
  const radii = [[2.8, 2.65], [2.6, 2.45], [2.42, 2.3]];
  const segs = [[1.0, bs[0]], [bs[0], bs[1]], [bs[1], bs[2]]];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = sx * o;
      const z = sz * o;
      B.add('marble', cyl(4.3, 4.6, 1.0, 8), M(x, P, z, Math.PI / 8));
      segs.forEach(([a, b], i) => {
        const g = new THREE.CylinderGeometry(radii[i][1], radii[i][0], b - a, 24, 1, true).translate(0, (b - a) / 2, 0);
        B.add('minaret', g, M(x, P + a, z));
      });
      for (const b of bs) {
        B.add('marble', cyl(3.55, 2.5, 1.1, 24), M(x, P + b - 1.1, z));
        B.add('marble', cyl(3.65, 3.65, 0.35, 24), M(x, P + b, z));
        B.add('marble', cyl(3.55, 3.55, 0.9, 24, true), M(x, P + b + 0.35, z));
      }
      addChhatri(B, x, P + bs[2] + 0.35, z, 2.45);
    }
  }
}
