import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { D } from './dimensions.js';
import { archOutline, archPanel, extrudeFace, splitExtrude, box, cyl, onion, addChhatri, addFinial } from './builder.js';

// Mosquée (ouest) et jawab (est) : jumeaux de grès rouge face au mausolée, trois coupoles de marbre blanc.
export function buildSideBuildings(B) {
  const y0 = D.terrace.h + 1.0;
  const { x: cxB, length: L, depth: Dp, height: H } = D.mosque;
  const hw = L / 2;
  const pTop = 24.5;
  const pw = 10.5;
  const T = 2.5;
  const outer = [[-hw, 0], [hw, 0], [hw, H], [pw, H], [pw, pTop], [-pw, pTop], [-pw, H], [-hw, H]];
  const holes = [archOutline(0, 0.4, 10.8, 8.2)];
  for (const sx of [-1, 1]) {
    holes.push(archOutline(sx * 18, 0.4, 5.5, 4.5));
    holes.push(archOutline(sx * 18, 10.6, 3.6, 2.8));
  }
  const face = splitExtrude(extrudeFace(outer, holes, T), -hw, 0, L, pTop);
  const wins = mergeGeometries([
    archPanel(0, 0.5, 4.2, 4.0),
    archPanel(0, 8.0, 4.6, 2.8),
    archPanel(-18, 0.5, 3.0, 3.4),
    archPanel(18, 0.5, 3.0, 3.4),
    archPanel(-18, 10.7, 2.2, 2.2),
    archPanel(18, 10.7, 2.2, 2.2),
  ]);
  const domeC = new THREE.LatheGeometry(onion(6.6, 8.2, 28), 40);
  const domeS = new THREE.LatheGeometry(onion(4.7, 6.2, 24), 32);
  const capP = new THREE.LatheGeometry(onion(0.65, 1.1, 10), 8);

  for (const s of [-1, 1]) {
    const R = new THREE.Matrix4().makeRotationY((-s * Math.PI) / 2); // la façade regarde le mausolée
    const fx = s * (cxB - Dp / 2);
    const T0 = new THREE.Matrix4().makeTranslation(fx, 0, 0);
    const at = (lx, ly, lz) => new THREE.Matrix4().makeTranslation(lx, ly, lz).premultiply(R).premultiply(T0);
    const wp = (lx, lz) => new THREE.Vector3(lx, 0, lz).applyMatrix4(R).add(new THREE.Vector3(fx, 0, 0));

    B.add('redPlain', box(L + 8, 1.0, Dp + 8), at(0, y0 - 1.0, -Dp / 2));
    B.add('mosqueFacade', face.caps, at(0, y0, 0));
    B.add('redPlain', face.sides, at(0, y0, 0));
    B.add('window', wins, at(0, y0, -T + 0.05));
    B.add('redWall', box(L - 1, H - 0.3, Dp - T), at(0, y0, -T - (Dp - T) / 2));
    B.add('redPlain', box(L, 0.35, Dp), at(0, y0 + H - 0.4, -Dp / 2));

    for (const tx of [-hw, hw]) {
      for (const tz of [-0.6, -Dp + 0.6]) {
        B.add('redWall', cyl(3.3, 3.5, H + 1.6, 8), at(tx, y0, tz));
        const p = wp(tx, tz);
        addChhatri(B, p.x, y0 + H + 1.6, p.z, 2.2, { base: 'redPlain', col: 'redPlain' });
      }
    }
    for (const tx of [-pw, pw]) {
      B.add('redPlain', cyl(0.42, 0.48, pTop + 1.5, 8), at(tx, y0, 0));
      B.add('marble', capP, at(tx, y0 + pTop + 1.5, 0));
    }
    for (const [tx, big] of [[0, true], [-13.3, false], [13.3, false]]) {
      const p = wp(tx, -Dp / 2);
      const dr = big ? 5.4 : 3.9;
      const dh = big ? 2.6 : 2.0;
      B.add('marble', cyl(dr, dr, dh, 32), at(tx, y0 + H - 0.1, -Dp / 2));
      B.add('marble', big ? domeC : domeS, at(tx, y0 + H + dh - 0.15, -Dp / 2));
      addFinial(B, p.x, y0 + H + dh - 0.3 + (big ? 8.2 : 6.2), p.z, big ? 0.3 : 0.22);
    }
  }
}
