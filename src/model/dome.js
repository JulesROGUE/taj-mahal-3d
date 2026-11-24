import * as THREE from 'three';
import { D } from './dimensions.js';
import { cyl, onion, addChhatri, addFinial, M } from './builder.js';

// Tambour (12 m), coupole en bulbe (23 m, LatheGeometry), épi doré (9,6 m) et quatre chhatris en diagonale.
export function buildDome(B) {
  const P = D.plinth.top;
  const yR = P + D.body.height; // toit-terrasse
  const { r, h } = D.drum;
  B.add('marble', cyl(r + 1.0, r + 1.2, 1.4, 48), M(0, yR - 0.05, 0));
  B.add('drum', cyl(r, r, h, 64, true), M(0, yR, 0));
  B.add('marble', cyl(r + 0.4, r + 0.4, 0.6, 64), M(0, yR + 1.35, 0));
  B.add('marble', new THREE.TorusGeometry(r + 0.15, 0.45, 6, 64).rotateX(Math.PI / 2), M(0, yR + h - 0.3, 0));
  const yD = yR + h;
  B.add('dome', new THREE.LatheGeometry(onion(D.dome.rMax, D.dome.h, 44), 72), M(0, yD - 0.1, 0));
  addFinial(B, 0, yD + D.dome.h - 0.35, 0, 1);
  const o = D.chhatri.offset;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addChhatri(B, sx * o, yR, sz * o, 4.4);
}
