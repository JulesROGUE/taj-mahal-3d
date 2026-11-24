import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { D } from './dimensions.js';
import { archOutline, archPanel, extrudeFace, splitExtrude, box, cyl, M, addChhatri } from './builder.js';

// Grande porte (darwaza) au sud du jardin, murs d'enceinte de grès rouge et pavillons.
export function buildGate(B) {
  const zc = D.garden.z0 + D.garden.size; // 355,5
  const { w: W, d: Dp, h: H } = D.gate;
  const hw = W / 2;
  const T = 2.5;
  const outer = [[-hw, 0], [hw, 0], [hw, H], [-hw, H]];
  const holes = [archOutline(0, 0.4, 10, 9)];
  for (const sx of [-1, 1]) {
    holes.push(archOutline(sx * 14.3, 0.4, 5, 4.2));
    holes.push(archOutline(sx * 14.3, 10.2, 5, 4.0));
  }
  const face = splitExtrude(extrudeFace(outer, holes, T), -hw, 0, W, H);
  const wins = mergeGeometries([
    archPanel(0, 0.5, 4.6, 5.5),
    archPanel(0, 11, 4.2, 2.4),
    archPanel(-14.3, 0.6, 2.6, 3.0),
    archPanel(14.3, 0.6, 2.6, 3.0),
    archPanel(-14.3, 10.4, 2.6, 2.8),
    archPanel(14.3, 10.4, 2.6, 2.8),
  ]);

  B.add('redWall', box(W - 1, H - 0.3, Dp - 2 * T), M(0, 0, zc));
  B.add('redPlain', box(W, 0.4, Dp), M(0, H - 0.45, zc));
  for (const dir of [-1, 1]) {
    const a = dir < 0 ? Math.PI : 0;
    const zf = zc + (dir * Dp) / 2;
    B.add('gateFacade', face.caps, new THREE.Matrix4().makeRotationY(a).setPosition(0, 0, zf));
    B.add('redPlain', face.sides, new THREE.Matrix4().makeRotationY(a).setPosition(0, 0, zf));
    B.add('window', wins, new THREE.Matrix4().makeRotationY(a).setPosition(0, 0, zf - dir * (T - 0.05)));
    for (let i = 0; i < 11; i++) addChhatri(B, -12 + i * 2.4, H, zf - dir * 1.4, 1.05, { base: 'redPlain', col: 'redPlain' });
  }
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = sx * hw;
      const z = zc + (sz * Dp) / 2;
      B.add('redWall', cyl(3.3, 3.6, H + 3.5, 8), M(x, 0, z, Math.PI / 8));
      addChhatri(B, x, H + 3.5, z, 2.1, { base: 'redPlain', col: 'redPlain' });
    }
  }

  // enceinte du jardin et de la terrasse
  const wallH = 7.5;
  const t = 1.6;
  const zN = -D.terrace.d / 2;
  for (const sx of [-1, 1]) {
    B.add('redWall', box(t, wallH, zc - zN), M(sx * 150, 0, (zc + zN) / 2));
    B.add('redPlain', box(t + 0.8, 0.5, zc - zN), M(sx * 150, wallH, (zc + zN) / 2));
    B.add('redWall', box(150 - hw, wallH, t), M((sx * (hw + 150)) / 2, 0, zc));
    B.add('redPlain', box(150 - hw, 0.5, t + 0.8), M((sx * (hw + 150)) / 2, wallH, zc));
    B.add('redWall', cyl(6, 6.4, 13, 8), M(sx * 150, 0, zc, Math.PI / 8));
    addChhatri(B, sx * 150, 13, zc, 2.8, { base: 'redPlain', col: 'redPlain' });
    // pavillons (naubat khana) au bout de l'axe est-ouest
    B.add('redWall', box(10, 11, 22), M(sx * 145, 0, 205.5));
    B.add('redPlain', box(10.8, 0.5, 22.8), M(sx * 145, 11, 205.5));
    addChhatri(B, sx * 145, 11.5, 205.5, 2.2, { base: 'redPlain', col: 'redPlain' });
  }
}
