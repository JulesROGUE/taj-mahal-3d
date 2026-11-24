import { Buckets } from './builder.js';
import { createMaterials } from './materials.js';
import { buildPlinth } from './plinth.js';
import { buildMausoleum } from './mausoleum.js';
import { buildDome } from './dome.js';
import { buildMinarets } from './minarets.js';
import { buildSideBuildings } from './sideBuildings.js';
import { buildGate } from './gate.js';
import { buildGarden } from './garden.js';
import { createGround } from '../scene/ground.js';

const NO_SHADOW = ['ground', 'gardenGround', 'river', 'sand', 'water', 'jet', 'paving', 'redPaving', 'bank', 'window', 'lamp'];

export function buildTajMahal(scene, renderer) {
  const mats = createMaterials(renderer);
  // UV « monde » (tuiles en mètres) pour les matériaux répétés
  const B = new Buckets({ redWall: 6, redPlain: 3, redPaving: 9, paving: 3.2 });
  createGround(B);
  buildPlinth(B);
  buildMausoleum(B);
  buildDome(B);
  buildMinarets(B);
  buildSideBuildings(B);
  buildGate(B);
  const pool = buildGarden(B);
  const group = B.build(mats.list, NO_SHADOW);
  scene.add(group, pool);
  return { mats, group, pool };
}
