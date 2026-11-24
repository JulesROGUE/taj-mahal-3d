import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Outils de construction : arcs brisés, façades extrudées, onion domes, chhatris,
// et regroupement des géométries par matériau (mergeGeometries) pour rester sous ~40 draw calls.

const KEEP = ['position', 'normal', 'uv'];
export const v2 = ([x, y]) => new THREE.Vector2(x, y);

export function M(x = 0, y = 0, z = 0, ry = 0, s = 1) {
  const m = new THREE.Matrix4().makeRotationY(ry);
  if (s !== 1) m.multiply(new THREE.Matrix4().makeScale(s, s, s));
  return m.setPosition(x, y, z);
}
export function MS(x, y, z, sx, sy, sz, ry = 0) {
  return new THREE.Matrix4().makeRotationY(ry).multiply(new THREE.Matrix4().makeScale(sx, sy, sz)).setPosition(x, y, z);
}
export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
export const cyl = (rt, rb, h, seg = 16, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open).translate(0, h / 2, 0);
export const sphere = (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);

// Arc brisé moghol : deux arcs de cercle de rayon k·w qui se rejoignent au sommet.
export function archTop(w, spring, k = 0.62) {
  const R = k * w;
  const off = R - w / 2;
  return spring + Math.sqrt(R * R - off * off);
}
export function archOutline(cx, y0, w, spring, k = 0.62, seg = 10) {
  const R = k * w;
  const hw = w / 2;
  const off = R - hw;
  const ys = y0 + spring;
  const ta = Math.atan2(Math.sqrt(R * R - off * off), -off);
  const pts = [[cx - hw, y0]];
  for (let i = 0; i <= seg; i++) {
    const t = Math.PI + ((ta - Math.PI) * i) / seg;
    pts.push([cx + off + R * Math.cos(t), ys + R * Math.sin(t)]);
  }
  for (let i = 1; i <= seg; i++) {
    const t = (Math.PI - ta) * (1 - i / seg);
    pts.push([cx - off + R * Math.cos(t), ys + R * Math.sin(t)]);
  }
  pts.push([cx + hw, y0]);
  return pts;
}

export function octagon(S, c) {
  const a = S - c;
  return [[a, S], [S, a], [S, -a], [a, -S], [-a, -S], [-S, -a], [-S, a], [-a, S]];
}

// Mur plein percé d'arcs : face avant en z = 0, épaisseur vers -z (les côtés des trous forment les voussures).
export function extrudeFace(outer, holes, depth) {
  const shape = new THREE.Shape(outer.map(v2));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(v2)));
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 6 });
  g.translate(0, 0, -depth);
  return g;
}
export function extrudeUp(points, h) {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(points.map(v2)), { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return g;
}
export function archPanel(cx, y0, w, spring) {
  return new THREE.ShapeGeometry(new THREE.Shape(archOutline(cx, y0, w, spring).map(v2)));
}

function slice(geo, start, count) {
  const out = new THREE.BufferGeometry();
  for (const name of KEEP) {
    const a = geo.getAttribute(name);
    if (a) out.setAttribute(name, new THREE.BufferAttribute(a.array.slice(start * a.itemSize, (start + count) * a.itemSize), a.itemSize));
  }
  return out;
}
// Sépare la face texturée (caps) des côtés (voussures) et cale les UV de la face sur la texture de façade.
export function splitExtrude(geo, x0, y0, w, h) {
  const caps = [];
  const sides = [];
  for (const gr of geo.groups) (gr.materialIndex === 0 ? caps : sides).push(slice(geo, gr.start, gr.count));
  const join = (arr) => (arr.length === 1 ? arr[0] : mergeGeometries(arr));
  const c = join(caps);
  const s = join(sides);
  const p = c.getAttribute('position');
  const uv = c.getAttribute('uv');
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x0) / w, (p.getY(i) - y0) / h);
  return { caps: c, sides: s };
}

// Profil de bulbe (onion dome) normalisé, calé sur la façade sud : rayon max vers 28 % de la hauteur,
// épaules pleines, pointe effilée sous le lotus.
const ONION = [[0.88, 0], [0.95, 0.07], [0.995, 0.17], [1, 0.28], [0.975, 0.4], [0.9, 0.53], [0.76, 0.66], [0.55, 0.78], [0.32, 0.88], [0.14, 0.955], [0, 1]];
export function onion(rMax, h, n = 32) {
  const curve = new THREE.SplineCurve(ONION.map(([a, b]) => new THREE.Vector2(a * rMax, b * h)));
  const pts = curve.getPoints(n);
  for (const p of pts) p.x = Math.max(0, p.x);
  pts[pts.length - 1].set(0, h);
  return pts;
}

let CH = null;
function chhatriParts() {
  if (CH) return CH;
  const cols = [];
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4;
    cols.push(cyl(0.065, 0.065, 0.95, 6).translate(Math.cos(a) * 0.8, 0.35, Math.sin(a) * 0.8));
  }
  CH = {
    base: [cyl(1.0, 1.0, 0.35, 8), cyl(1.1, 0.86, 0.12, 8).translate(0, 1.3, 0), cyl(0.88, 0.88, 0.24, 8).translate(0, 1.42, 0)],
    col: [mergeGeometries(cols)],
    dome: [new THREE.LatheGeometry(onion(0.82, 1.05, 16), 16).translate(0, 1.64, 0)],
    fin: [cyl(0.025, 0.05, 0.5, 5).translate(0, 2.66, 0), sphere(0.07, 6, 4).translate(0, 2.9, 0)],
  };
  return CH;
}
// Chhatri : kiosque octogonal à 8 colonnes, auvent (chhajja) et petit bulbe. Hauteur = 3,2 × s.
export function addChhatri(B, x, y, z, s, keys = {}) {
  const k = { base: 'marble', col: 'marble', dome: 'marble', fin: 'gold', ...keys };
  const parts = chhatriParts();
  const m = new THREE.Matrix4().makeScale(s, s, s).setPosition(x, y, z);
  for (const part of ['base', 'col', 'dome', 'fin']) for (const g of parts[part]) B.add(k[part], g, m);
}

// Épi (finial) : sphères empilées et croissant. Hauteur ≈ 9,6 × s.
export function addFinial(B, x, y, z, s = 1, key = 'gold') {
  const m = new THREE.Matrix4().makeScale(s, s, s).setPosition(x, y, z);
  const parts = [
    cyl(0.7, 0.95, 0.8, 12),
    sphere(1.1).translate(0, 1.8, 0),
    cyl(0.35, 0.35, 0.7, 8).translate(0, 2.8, 0),
    sphere(0.85).translate(0, 4.1, 0),
    sphere(0.6).translate(0, 5.3, 0),
    cyl(0.12, 0.12, 2.6, 6).translate(0, 5.8, 0),
    new THREE.TorusGeometry(0.9, 0.14, 6, 18, Math.PI * 1.4).rotateZ(Math.PI * 0.8).translate(0, 8.75, 0),
  ];
  for (const g of parts) B.add(key, g, m);
}

function worldUV(g, s) {
  const p = g.getAttribute('position');
  const n = g.getAttribute('normal');
  const uv = g.getAttribute('uv');
  for (let i = 0; i < p.count; i++) {
    const nx = Math.abs(n.getX(i));
    const ny = Math.abs(n.getY(i));
    const nz = Math.abs(n.getZ(i));
    if (ny >= nx && ny >= nz) uv.setXY(i, p.getX(i) / s, p.getZ(i) / s);
    else if (nx >= nz) uv.setXY(i, p.getZ(i) / s, p.getY(i) / s);
    else uv.setXY(i, p.getX(i) / s, p.getY(i) / s);
  }
}

// Regroupe toutes les pièces par matériau : un seul mesh (donc un seul draw call) par matériau.
export class Buckets {
  constructor(worldScale = {}) {
    this.lists = new Map();
    this.worldScale = worldScale;
  }
  add(key, geometry, matrix) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    for (const name of Object.keys(g.attributes)) if (!KEEP.includes(name)) g.deleteAttribute(name);
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').count * 2), 2));
    if (matrix) g.applyMatrix4(matrix);
    if (this.worldScale[key]) worldUV(g, this.worldScale[key]);
    g.clearGroups();
    if (!this.lists.has(key)) this.lists.set(key, []);
    this.lists.get(key).push(g);
  }
  build(materials, noShadow = []) {
    const group = new THREE.Group();
    for (const [key, list] of this.lists) {
      const mat = materials[key];
      if (!mat) throw new Error('Matériau manquant : ' + key);
      const geo = mergeGeometries(list, false);
      if (!geo) throw new Error('Fusion impossible : ' + key);
      list.forEach((g) => g.dispose());
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = key;
      mesh.castShadow = !noShadow.includes(key);
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}
