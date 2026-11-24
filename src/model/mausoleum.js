import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { D } from './dimensions.js';
import { archOutline, archPanel, extrudeFace, extrudeUp, splitExtrude, octagon, cyl, onion, M } from './builder.js';

// Mausolée : plan carré de 57,3 m aux angles chanfreinés (octogone irrégulier).
// 4 façades à pishtaq (grand arc) + 4 pans coupés, chacun percé de deux niveaux d'arcs.
export function buildMausoleum(B) {
  const P = D.plinth.top;
  const { half: S, chamfer: c, height: H, wall: T } = D.body;
  const fw = S - c; // demi-largeur d'une façade droite (21,65 m)
  const pw = D.pishtaq.width / 2; // 11,3 m
  const pH = D.pishtaq.height;
  const bx = (pw + fw) / 2; // axe des travées latérales
  const cw = (c * Math.SQRT2) / 2; // demi-largeur d'un pan coupé
  const dCh = (2 * S - c) / Math.SQRT2; // distance du centre à un pan coupé
  const lower = [0.5, 5.0];
  const upper = [10.6, 4.6];
  const aw = 6.2;

  const mainOuter = [[-fw, 0], [fw, 0], [fw, H], [pw, H], [pw, pH], [-pw, pH], [-pw, H], [-fw, H]];
  const mainHoles = [archOutline(0, 0.5, D.pishtaq.arch.w, D.pishtaq.arch.spring)];
  for (const sx of [-1, 1]) for (const [y0, sp] of [lower, upper]) mainHoles.push(archOutline(sx * bx, y0, aw, sp));
  const main = splitExtrude(extrudeFace(mainOuter, mainHoles, T), -fw, 0, 2 * fw, pH);

  const chOuter = [[-cw, 0], [cw, 0], [cw, H], [-cw, H]];
  const chHoles = [archOutline(0, lower[0], aw, lower[1]), archOutline(0, upper[0], aw, upper[1])];
  const chamfer = splitExtrude(extrudeFace(chOuter, chHoles, T), -cw, 0, 2 * cw, H);

  // fonds des arcs : porte et claustra (jali), éclairés la nuit
  const winMain = mergeGeometries([
    archPanel(0, 0.6, 4.6, 4.2),
    archPanel(0, 8.0, 6.4, 5.2),
    archPanel(-bx, 1.0, 3.4, 3.6),
    archPanel(bx, 1.0, 3.4, 3.6),
    archPanel(-bx, 11.2, 3.4, 3.2),
    archPanel(bx, 11.2, 3.4, 3.2),
  ]);
  const winCh = mergeGeometries([archPanel(0, 1.0, 3.4, 3.6), archPanel(0, 11.2, 3.4, 3.2)]);

  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const isMain = k % 2 === 0;
    const d = isMain ? S : dCh;
    const f = isMain ? main : chamfer;
    const m = new THREE.Matrix4().makeRotationY(a).setPosition(Math.sin(a) * d, P, Math.cos(a) * d);
    B.add(isMain ? 'facadeMain' : 'facadeChamfer', f.caps, m);
    B.add('marble', f.sides, m);
    const di = d - T + 0.05;
    B.add('window', isMain ? winMain : winCh, new THREE.Matrix4().makeRotationY(a).setPosition(Math.sin(a) * di, P, Math.cos(a) * di));
  }

  // noyau (fond des niches) et toit-terrasse
  const Si = S - T;
  const cI = 2 * Si - (dCh - T) * Math.SQRT2;
  B.add('marbleShade', extrudeUp(octagon(Si, cI), H - 0.3), M(0, P, 0));
  B.add('marble', extrudeUp(octagon(S - 0.2, c), 0.35), M(0, P + H - 0.4, 0));

  // pinacles (guldastas) aux angles et de part et d'autre de chaque pishtaq
  const pin = [
    ['marble', cyl(0.55, 0.62, 25, 8)],
    ['marble', cyl(0.85, 0.85, 0.3, 8).translate(0, 21.3, 0)],
    ['marble', cyl(0.82, 0.82, 1.3, 8).translate(0, 25, 0)],
    ['marble', new THREE.LatheGeometry(onion(0.95, 1.6, 12), 8).translate(0, 26.3, 0)],
    ['gold', cyl(0.06, 0.06, 0.9, 4).translate(0, 27.8, 0)],
  ];
  const spots = octagon(S, c).map(([x, z]) => [x, z]);
  const up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 4; k++) {
    for (const sx of [-1, 1]) {
      const v = new THREE.Vector3(sx * pw, 0, S).applyAxisAngle(up, (k * Math.PI) / 2);
      spots.push([v.x, v.z]);
    }
  }
  for (const [x, z] of spots) for (const [key, geo] of pin) B.add(key, geo, M(x, P, z));
}
