import { D } from './dimensions.js';
import { box, cyl, M, addChhatri } from './builder.js';

// Terrasse de grès rouge (côté rivière), socle de marbre blanc de 95,5 m et mur de quai sur la Yamuna.
export function buildPlinth(B) {
  const P = D.plinth.top;
  const th = D.terrace.h;
  const S = D.plinth.size;
  B.add('redPaving', box(D.terrace.w, th, D.terrace.d), M(0, 0, 0));
  B.add('plinthSide', box(S, P - th - 0.06, S), M(0, th, 0));
  B.add('paving', box(S, 0.08, S), M(0, P - 0.07, 0));
  B.add('marble', box(S + 0.6, 0.35, S + 0.6), M(0, th, 0));
  // mur de quai (arcs aujourd'hui murés) et tours octogonales aux angles
  B.add('redWall', box(D.terrace.w, 7.3, 2), M(0, D.river.level - 0.1, -D.terrace.d / 2 - 1));
  for (const sx of [-1, 1]) {
    B.add('redWall', cyl(5.5, 5.8, 22, 8), M(sx * 150, D.river.level - 0.1, -56.5, Math.PI / 8));
    B.add('redPlain', cyl(6.2, 6.2, 0.6, 8), M(sx * 150, 15.9, -56.5, Math.PI / 8));
    addChhatri(B, sx * 150, 16.5, -56.5, 2.6, { base: 'redPlain', col: 'redPlain' });
  }
}
