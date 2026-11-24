import * as THREE from 'three';
import { archOutline, archTop } from './builder.js';

// Toutes les textures sont dessinées en code (CanvasTexture) : aucune image téléchargée.
let seed = 20260611;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.round(w);
  c.height = Math.round(h);
  return { c, g: c.getContext('2d') };
}

function grain(g, w, h, n, a = 0.1, dark = '110,90,70') {
  for (let i = 0; i < n; i++) {
    g.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${(a * rnd()).toFixed(3)})` : `rgba(${dark},${(a * rnd()).toFixed(3)})`;
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
  }
}

function veins(g, w, h, n, color) {
  g.strokeStyle = color;
  g.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    let x = rnd() * w;
    let y = rnd() * h;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += (rnd() - 0.5) * 70;
      y += (rnd() - 0.3) * 40;
      g.lineTo(x, y);
    }
    g.stroke();
  }
}

function trace(g, pts, X, Y) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
}

function flower(g, x, y, r, petal, heart) {
  g.fillStyle = petal;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    g.beginPath();
    g.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.42, r * 0.2, a, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = heart;
  g.beginPath();
  g.arc(x, y, r * 0.22, 0, Math.PI * 2);
  g.fill();
}

// Bande calligraphique : marbre noir incrusté, tracés clairs stylisés (pas de vrai texte).
function calligraphy(g, x, y, w, h, light = 'rgba(240,232,218,0.9)', dark = '#2b2521') {
  g.fillStyle = dark;
  g.fillRect(x, y, w, h);
  const vertical = h > w;
  const th = vertical ? w : h;
  const len = vertical ? h : w;
  const n = Math.floor(len / (th * 0.5));
  g.strokeStyle = light;
  g.fillStyle = light;
  g.lineWidth = Math.max(1, th * 0.08);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const s = th * 0.3;
    const cx = vertical ? x + w / 2 : x + t * w;
    const cy = vertical ? y + t * h : y + h / 2;
    g.beginPath();
    if (vertical) {
      g.moveTo(cx - s, cy - s * 0.4);
      g.quadraticCurveTo(cx + s * (rnd() - 0.2), cy + s * 0.7, cx + s, cy - s * 0.1);
    } else {
      g.moveTo(cx - s * 0.4, cy - s);
      g.quadraticCurveTo(cx + s * 0.7, cy + s * (rnd() - 0.2), cx - s * 0.1, cy + s);
    }
    g.stroke();
    if (rnd() > 0.5) {
      g.beginPath();
      g.arc(cx + (rnd() - 0.5) * s, cy + (rnd() - 0.5) * s, Math.max(1, s * 0.14), 0, Math.PI * 2);
      g.fill();
    }
  }
}

function insideArch(cx, y0, w, spring, pad = 0.3) {
  const R = 0.62 * w;
  const off = R - w / 2;
  const ys = y0 + spring;
  return (x, y) => {
    if (Math.abs(x - cx) > w / 2 + pad || y < y0) return false;
    if (y < ys) return true;
    return Math.hypot(Math.abs(x - cx) + off, y - ys) < R + pad;
  };
}

// pietra dura : petites fleurs de pierres de couleur incrustées dans les écoinçons (teintes sourdes)
const PIETRA = ['#b46a5c', '#7d9163', '#c2a160', '#8a7393', '#6d8c96'];
function pietraDura(g, X, Y, s, x1, y1, x2, y2, n, skip) {
  g.lineWidth = Math.max(1, s * 0.04);
  for (let i = 0; i < n; i++) {
    const x = x1 + rnd() * (x2 - x1);
    const y = y1 + rnd() * (y2 - y1);
    if (skip && skip(x, y)) continue;
    g.strokeStyle = 'rgba(110,135,85,0.55)';
    g.beginPath();
    g.moveTo(X(x), Y(y));
    g.quadraticCurveTo(X(x + 0.3), Y(y - 0.2), X(x + 0.15), Y(y - 0.5));
    g.stroke();
    flower(g, X(x), Y(y), s * (0.12 + rnd() * 0.1), PIETRA[i % PIETRA.length], '#d6bb7a');
  }
}

function marbleBase(w, h) {
  const { c, g } = mk(w, h);
  g.fillStyle = '#f5f1e9';
  g.fillRect(0, 0, c.width, c.height);
  veins(g, c.width, c.height, Math.round((c.width * c.height) / 16000), 'rgba(150,140,125,0.10)');
  grain(g, c.width, c.height, Math.round((c.width * c.height) / 70), 0.07);
  return { c, g };
}

function dado(g, X, Y, s, x1, x2) {
  g.fillStyle = '#e6decf';
  g.fillRect(X(x1), Y(1.7), (x2 - x1) * s, 1.7 * s);
  for (let x = x1 + 0.15; x < x2 - 1.3; x += 1.45) {
    g.strokeStyle = '#b5a995';
    g.lineWidth = 1.4;
    g.strokeRect(X(x), Y(1.55), 1.25 * s, 1.3 * s);
    flower(g, X(x + 0.62), Y(0.9), 0.4 * s, '#cfc4b0', '#b4a792');
  }
}

function bayFrame(g, X, Y, s, cx, y0, w, spring, flowers) {
  const top = y0 + archTop(w, spring);
  const hw = w / 2 + 1.0;
  g.fillStyle = '#eee8dd';
  g.fillRect(X(cx - hw), Y(top + 0.9), 2 * hw * s, (top + 0.9 - y0) * s);
  pietraDura(g, X, Y, s, cx - hw + 0.3, y0 + spring - 0.5, cx + hw - 0.3, top + 0.6, flowers, insideArch(cx, y0, w, spring));
  g.strokeStyle = '#a3967f';
  g.lineWidth = 2;
  g.strokeRect(X(cx - hw), Y(top + 0.9), 2 * hw * s, (top + 0.9 - y0) * s);
  g.lineWidth = 0.24 * s;
  g.strokeStyle = '#3b332d';
  trace(g, archOutline(cx, y0, w + 0.5, spring), X, Y);
  g.stroke();
}

function cornice(g, X, Y, s, x1, x2, yt) {
  g.fillStyle = '#ddd3c2';
  g.fillRect(X(x1), Y(yt), (x2 - x1) * s, 0.8 * s);
  g.fillStyle = '#c4b7a2';
  for (let x = x1 + 0.35; x < x2 - 0.3; x += 0.75) {
    g.beginPath();
    g.arc(X(x), Y(yt - 0.45), 0.17 * s, 0, Math.PI * 2);
    g.fill();
  }
}

// Façade principale (43,3 x 26 m) : pishtaq encadré d'une bande calligraphique, pietra dura, travées à deux niveaux.
function facadeMainCanvas() {
  const W = 43.3;
  const H = 26;
  const s = 24;
  const x0 = -W / 2;
  const { c, g } = marbleBase(W * s, H * s);
  const X = (x) => (x - x0) * s;
  const Y = (y) => (H - y) * s;
  const pw = 11.3;
  const bx = 16.475;
  g.fillStyle = '#eee8dd';
  g.fillRect(X(-pw), 0, 2 * pw * s, c.height);
  dado(g, X, Y, s, x0, -x0);
  g.fillStyle = '#f1ebe1';
  g.fillRect(X(-8.9), Y(23.5), 17.8 * s, 12 * s);
  pietraDura(g, X, Y, s, -8.6, 12, 8.6, 23.2, 120, insideArch(0, 0.5, 14, 11.5, 0.6));
  g.lineWidth = 0.45 * s;
  g.strokeStyle = '#3a322c';
  trace(g, archOutline(0, 0.5, 14.9, 11.5), X, Y);
  g.stroke();
  g.lineWidth = 0.2 * s;
  g.strokeStyle = '#c3b6a2';
  trace(g, archOutline(0, 0.5, 16.0, 11.5), X, Y);
  g.stroke();
  calligraphy(g, X(-10.1), Y(24.9), 0.9 * s, 23 * s);
  calligraphy(g, X(9.2), Y(24.9), 0.9 * s, 23 * s);
  calligraphy(g, X(-10.1), Y(24.9), 20.2 * s, 0.9 * s);
  g.strokeStyle = '#9c8f7c';
  g.lineWidth = 2;
  g.strokeRect(X(-10.7), Y(25.5), 21.4 * s, 23.7 * s);
  for (const sx of [-1, 1]) {
    bayFrame(g, X, Y, s, sx * bx, 0.5, 6.2, 5.0, 24);
    bayFrame(g, X, Y, s, sx * bx, 10.6, 6.2, 4.6, 24);
    g.fillStyle = '#ddd3c2';
    g.fillRect(X(sx * bx - 5.1), Y(10.45), 10.2 * s, 0.4 * s);
  }
  cornice(g, X, Y, s, x0, -pw, 21.5);
  cornice(g, X, Y, s, pw, -x0, 21.5);
  cornice(g, X, Y, s, -pw, pw, 26);
  for (const x of [-pw, pw, x0 + 0.25, -x0 - 0.25]) {
    g.fillStyle = '#dcd2c2';
    g.fillRect(X(x) - 0.5 * s, 0, 1.0 * s, c.height);
  }
  return c;
}

// Pan coupé (9,9 x 21,5 m) : deux arcs superposés.
function facadeChamferCanvas() {
  const W = 9.9;
  const H = 21.5;
  const s = 24;
  const x0 = -W / 2;
  const { c, g } = marbleBase(W * s, H * s);
  const X = (x) => (x - x0) * s;
  const Y = (y) => (H - y) * s;
  dado(g, X, Y, s, x0, -x0);
  bayFrame(g, X, Y, s, 0, 0.5, 6.2, 5.0, 20);
  bayFrame(g, X, Y, s, 0, 10.6, 6.2, 4.6, 20);
  g.fillStyle = '#ddd3c2';
  g.fillRect(0, Y(10.45), c.width, 0.4 * s);
  cornice(g, X, Y, s, x0, -x0, 21.5);
  for (const x of [x0 + 0.25, -x0 - 0.25]) {
    g.fillStyle = '#dcd2c2';
    g.fillRect(X(x) - 0.5 * s, 0, 1.0 * s, c.height);
  }
  return c;
}

// Tambour : 16 niches aveugles, bande calligraphique en haut.
function drumCanvas() {
  const w = 2048;
  const h = 336;
  const s = 28;
  const { c, g } = marbleBase(w, h);
  const n = 16;
  const pw = w / n;
  for (let i = 0; i < n; i++) {
    const cx = (i + 0.5) * pw;
    const X = (u) => cx + u * s;
    const Y = (v) => h - 44 - v * s;
    g.strokeStyle = '#a99c87';
    g.lineWidth = 2;
    g.strokeRect(cx - pw / 2 + 8, 46, pw - 16, h - 96);
    g.fillStyle = '#e3dbcd';
    trace(g, archOutline(0, 0.2, 2.7, 4.9), X, Y);
    g.closePath();
    g.fill();
    g.strokeStyle = '#4e443b';
    g.lineWidth = 3;
    g.stroke();
  }
  calligraphy(g, 0, 8, w, 28);
  g.fillStyle = '#d9cfbe';
  g.fillRect(0, h - 38, w, 38);
  g.fillStyle = '#b9ac97';
  for (let x = 6; x < w; x += 18) {
    g.beginPath();
    g.arc(x, h - 19, 5, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

// Coupole : pétales de lotus au sommet, moulure en torsade à la base.
function domeCanvas() {
  const w = 1024;
  const h = 1024;
  const { c, g } = mk(w, h);
  g.fillStyle = '#f7f3ec';
  g.fillRect(0, 0, w, h);
  veins(g, w, h, 30, 'rgba(150,140,125,0.07)');
  grain(g, w, h, 12000, 0.05);
  const yTop = (1 - 0.955) * h;
  const yBot = (1 - 0.77) * h;
  const n = 16;
  const pw = w / n;
  for (const [y1, half, shift] of [[yBot, 0.5, 0.5], [yBot - (yBot - yTop) * 0.4, 0.32, 0]]) {
    for (let i = 0; i <= n; i++) {
      const cx = (i + shift) * pw;
      const hw = pw * half;
      const hgt = y1 - yTop;
      g.strokeStyle = '#a3967f';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cx - hw, y1);
      g.quadraticCurveTo(cx - hw * 1.05, y1 - hgt * 0.75, cx, y1 - hgt);
      g.quadraticCurveTo(cx + hw * 1.05, y1 - hgt * 0.75, cx + hw, y1);
      g.stroke();
    }
  }
  g.fillStyle = '#d3c8b6';
  g.fillRect(0, yBot, w, 7);
  const ry = (1 - 0.025) * h;
  g.fillStyle = '#e0d7c8';
  g.fillRect(0, ry, w, h - ry);
  g.strokeStyle = '#9c8f7b';
  g.lineWidth = 3;
  for (let x = -40; x < w + 40; x += 14) {
    g.beginPath();
    g.moveTo(x, h);
    g.lineTo(x + 20, ry);
    g.stroke();
  }
  return c;
}

// Minarets : blocs de marbre soulignés de joints noirs.
function minaretCanvas() {
  const { c, g } = marbleBase(256, 256);
  g.fillStyle = '#4a423b';
  g.fillRect(0, 0, 256, 3);
  g.fillRect(0, 128, 256, 3);
  g.fillRect(0, 0, 3, 128);
  g.fillRect(128, 0, 3, 128);
  g.fillRect(64, 128, 3, 128);
  g.fillRect(192, 128, 3, 128);
  return c;
}

// Socle : arcature aveugle (une travée = 1/16 du côté).
function plinthCanvas() {
  const w = 512;
  const h = 256;
  const { c, g } = marbleBase(w, h);
  const sx = w / 5.97;
  const sy = h / 5.74;
  const X = (u) => w / 2 + u * sx;
  const Y = (v) => h - v * sy;
  g.fillStyle = '#e6ddcf';
  g.fillRect(0, 0, w, 0.45 * sy);
  g.strokeStyle = '#ab9f8b';
  g.lineWidth = 2;
  g.strokeRect(X(-2.6), Y(5.4), 5.2 * sx, 4.8 * sy);
  g.fillStyle = '#e4dccd';
  trace(g, archOutline(0, 0.6, 3.6, 2.4), X, Y);
  g.closePath();
  g.fill();
  g.strokeStyle = '#3e362f';
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = '#ddd4c5';
  g.fillRect(0, Y(0.4), w, 0.4 * sy);
  return c;
}

function pavingCanvas() {
  const { c, g } = marbleBase(256, 256);
  g.strokeStyle = '#c9bfae';
  g.lineWidth = 2;
  for (const p of [1, 128]) {
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, 256);
    g.moveTo(0, p);
    g.lineTo(256, p);
    g.stroke();
  }
  g.strokeStyle = 'rgba(60,50,45,0.45)';
  g.beginPath();
  g.moveTo(128, 100);
  g.lineTo(156, 128);
  g.lineTo(128, 156);
  g.lineTo(100, 128);
  g.closePath();
  g.stroke();
  return c;
}

function redBase(w, h, base = '#a24e39') {
  const { c, g } = mk(w, h);
  g.fillStyle = base;
  g.fillRect(0, 0, c.width, c.height);
  grain(g, c.width, c.height, Math.round((c.width * c.height) / 60), 0.12, '70,25,15');
  return { c, g };
}

// Grès rouge : arcature aveugle cernée de marbre blanc (murs, terrasse) — tuile de 6 m.
function redWallCanvas() {
  const w = 512;
  const s = w / 6;
  const { c, g } = redBase(w, w);
  const X = (u) => u * s;
  const Y = (v) => w - v * s;
  g.strokeStyle = '#c4866a';
  g.lineWidth = 3;
  g.strokeRect(X(0.35), Y(5.6), 5.3 * s, 5.0 * s);
  g.fillStyle = '#8b3e2c';
  trace(g, archOutline(3, 0.6, 3.4, 2.5), X, Y);
  g.closePath();
  g.fill();
  g.strokeStyle = '#efe5d6';
  g.lineWidth = 4;
  g.stroke();
  g.fillStyle = '#b8694f';
  g.fillRect(0, Y(6), w, 0.3 * s);
  g.fillRect(0, Y(0.3), w, 0.3 * s);
  return c;
}

function redPlainCanvas() {
  const { c, g } = redBase(256, 256, '#a65340');
  g.strokeStyle = 'rgba(110,45,30,0.6)';
  g.lineWidth = 2;
  for (let r = 0; r < 4; r++) {
    const y = r * 64;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
    for (let x = (r % 2) * 64; x < 256; x += 128) {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x, y + 64);
      g.stroke();
    }
  }
  return c;
}

function redPavingCanvas() {
  const { c, g } = redBase(512, 512, '#a95a44');
  const q = 512 / 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = i * q;
      const y = j * q;
      g.fillStyle = (i + j) % 2 ? '#9c4c38' : '#b0614a';
      g.beginPath();
      g.moveTo(x + q / 2, y + 12);
      g.lineTo(x + q - 12, y + q / 2);
      g.lineTo(x + q / 2, y + q - 12);
      g.lineTo(x + 12, y + q / 2);
      g.closePath();
      g.fill();
    }
  }
  g.strokeStyle = '#efe6d8';
  g.lineWidth = 6;
  for (let i = 0; i <= 3; i++) {
    g.beginPath();
    g.moveTo(i * q, 0);
    g.lineTo(i * q, 512);
    g.moveTo(0, i * q);
    g.lineTo(512, i * q);
    g.stroke();
  }
  return c;
}

export const MOSQUE_FACADE = {
  W: 56, H: 24.5, s: 18, pw: 10.5, pTop: 24.5, bodyTop: 19.6, calli: false,
  main: [0, 0.4, 10.8, 8.2],
  bays: [[-18, 0.4, 5.5, 4.5], [18, 0.4, 5.5, 4.5], [-18, 10.6, 3.6, 2.8], [18, 10.6, 3.6, 2.8]],
};
export const GATE_FACADE = {
  W: 41, H: 23, s: 24, pw: 9.2, pTop: 23, bodyTop: 23, calli: true,
  main: [0, 0.4, 10, 9],
  bays: [[-14.3, 0.4, 5, 4.2], [14.3, 0.4, 5, 4.2], [-14.3, 10.2, 5, 4], [14.3, 10.2, 5, 4]],
};

// Façades de grès rouge (mosquée, jawab, grande porte) : panneaux et cadres de marbre blanc.
function redFacadeCanvas(o) {
  const { W, H, s, pw, pTop, bodyTop } = o;
  const x0 = -W / 2;
  const { c, g } = redBase(W * s, H * s);
  const X = (x) => (x - x0) * s;
  const Y = (y) => (H - y) * s;
  const white = '#efe6d7';
  g.strokeStyle = 'rgba(239,230,215,0.55)';
  g.lineWidth = 2;
  for (let x = x0 + 0.6; x < -x0 - 1.5; x += 2.3) {
    for (let y = 1.2; y < bodyTop - 2.8; y += 3.1) g.strokeRect(X(x), Y(y + 2.5), 1.7 * s, 2.5 * s);
  }
  for (const [cx, y0, w, sp] of o.bays) {
    const top = y0 + archTop(w, sp);
    const hw = w / 2 + 0.9;
    g.fillStyle = '#a24e39';
    g.fillRect(X(cx - hw), Y(top + 0.8), 2 * hw * s, (top + 0.8 - y0) * s);
    g.strokeStyle = white;
    g.lineWidth = 3;
    g.strokeRect(X(cx - hw), Y(top + 0.8), 2 * hw * s, (top + 0.8 - y0) * s);
    g.lineWidth = 0.22 * s;
    trace(g, archOutline(cx, y0, w + 0.45, sp), X, Y);
    g.stroke();
    flower(g, X(cx - w / 2 - 0.1), Y(top + 0.1), 0.35 * s, white, '#c98a6e');
    flower(g, X(cx + w / 2 + 0.1), Y(top + 0.1), 0.35 * s, white, '#c98a6e');
  }
  g.fillStyle = '#a24e39';
  g.fillRect(X(-pw), Y(pTop), 2 * pw * s, pTop * s);
  g.fillStyle = white;
  g.fillRect(X(-pw + 0.3), Y(pTop - 0.3), (2 * pw - 0.6) * s, (pTop - 0.6) * s);
  g.fillStyle = '#a95640';
  g.fillRect(X(-pw + 1.2), Y(pTop - 1.2), (2 * pw - 2.4) * s, (pTop - 1.8) * s);
  if (o.calli) {
    calligraphy(g, X(-pw + 0.45), Y(pTop - 0.45), (2 * pw - 0.9) * s, 0.6 * s);
    calligraphy(g, X(-pw + 0.45), Y(pTop - 0.45), 0.6 * s, (pTop - 1.2) * s);
    calligraphy(g, X(pw - 1.05), Y(pTop - 0.45), 0.6 * s, (pTop - 1.2) * s);
  }
  const [cx, y0, w, sp] = o.main;
  const top = y0 + archTop(w, sp);
  g.fillStyle = '#b8684f';
  g.fillRect(X(cx - w / 2 - 1.2), Y(top + 1.4), (w + 2.4) * s, (top + 1.4 - y0 - sp) * s);
  for (let i = 0; i < 18; i++) {
    const fx = cx + (rnd() - 0.5) * (w + 2);
    const fy = y0 + sp + rnd() * (top + 1.2 - y0 - sp);
    if (insideArch(cx, y0, w, sp, 0.5)(fx, fy)) continue;
    flower(g, X(fx), Y(fy), 0.3 * s, white, '#d9a35c');
  }
  g.strokeStyle = white;
  g.lineWidth = 0.4 * s;
  trace(g, archOutline(cx, y0, w + 0.7, sp), X, Y);
  g.stroke();
  g.fillStyle = white;
  g.fillRect(0, Y(bodyTop), c.width, 0.35 * s);
  g.fillRect(X(-pw), Y(pTop), 2 * pw * s, 0.35 * s);
  g.fillStyle = 'rgba(239,230,215,0.8)';
  for (let x = x0 + 0.4; x < -x0; x += 0.9) {
    g.beginPath();
    g.arc(X(x), Y(bodyTop - 0.7), 0.16 * s, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

// Plan du jardin moghol (charbagh 300 x 300 m) : quatre quarts, 16 parterres en creux par quart,
// grands axes avec canal, allées de grès et plates-bandes de cyprès.
function gardenCanvas() {
  const N = 2048;
  const s = N / 300;
  const z0 = 55.5;
  const zc = 205.5;
  const { c, g } = mk(N, N);
  const X = (x) => (x + 150) * s;
  const Z = (z) => (z - z0) * s;
  const rect = (x1, z1, x2, z2, col) => {
    g.fillStyle = col;
    g.fillRect(X(x1), Z(z1), (x2 - x1) * s, (z2 - z1) * s);
  };
  const LAWN = '#6c8c3a';
  const PATH = '#c39179';
  const PATH2 = '#b98670';
  const BED = '#56692f';
  const COPE = '#ebe5da';
  rect(-150, z0, 150, z0 + 300, LAWN);
  grain(g, N, N, 60000, 0.12, '30,50,10');
  const quads = [[-142, z0 + 8, -19, zc - 19], [19, z0 + 8, 142, zc - 19], [-142, zc + 19, -19, z0 + 292], [19, zc + 19, 142, z0 + 292]];
  for (const [x1, z1, x2, z2] of quads) {
    const mx = (x1 + x2) / 2;
    const mz = (z1 + z2) / 2;
    for (const [a, b] of [[x1, mx], [mx, x2]]) {
      for (const [p, q] of [[z1, mz], [mz, z2]]) {
        const ma = (a + b) / 2;
        const mb = (p + q) / 2;
        for (const [u1, u2] of [[a, ma], [ma, b]]) {
          for (const [v1, v2] of [[p, mb], [mb, q]]) {
            g.strokeStyle = 'rgba(40,60,20,0.35)';
            g.lineWidth = 3;
            g.strokeRect(X(u1) + 5, Z(v1) + 5, (u2 - u1) * s - 10, (v2 - v1) * s - 10);
          }
        }
        rect(ma - 0.8, p, ma + 0.8, q, PATH2);
        rect(a, mb - 0.8, b, mb + 0.8, PATH2);
      }
    }
    rect(mx - 2.5, z1, mx + 2.5, z2, PATH);
    rect(x1, mz - 2.5, x2, mz + 2.5, PATH);
  }
  rect(-150, z0, 150, z0 + 8, PATH);
  rect(-150, z0 + 292, 150, z0 + 300, PATH);
  rect(-150, z0, -142, z0 + 300, PATH);
  rect(142, z0, 150, z0 + 300, PATH);
  const axis = (a, b, col) => {
    rect(a, z0, b, z0 + 300, col);
    rect(-150, zc + a, 150, zc + b, col);
  };
  for (const sx of [-1, 1]) {
    const band = (a, b, col) => axis(Math.min(sx * a, sx * b), Math.max(sx * a, sx * b), col);
    band(14, 19, PATH);
    band(10, 14, BED);
    band(4, 10, PATH);
    band(3, 4, COPE);
  }
  axis(-3, 3, '#3e6470');
  // motifs étoilés de grès en bordure des plates-bandes
  g.fillStyle = PATH;
  for (let t = 0; t < 300; t += 3) {
    for (const sx of [-1, 1]) {
      for (const [edge, tip] of [[10, 11.3], [14, 12.7]]) {
        g.beginPath();
        g.moveTo(X(sx * edge), Z(z0 + t));
        g.lineTo(X(sx * tip), Z(z0 + t + 1.5));
        g.lineTo(X(sx * edge), Z(z0 + t + 3));
        g.fill();
        g.beginPath();
        g.moveTo(X(-150 + t), Z(zc + sx * edge));
        g.lineTo(X(-150 + t + 1.5), Z(zc + sx * tip));
        g.lineTo(X(-150 + t + 3), Z(zc + sx * edge));
        g.fill();
      }
    }
  }
  rect(-14, zc - 14, 14, zc + 14, COPE);
  return c;
}

export function createMaterials(renderer) {
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const T = (canvas, rx = 1, ry = 1) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = aniso;
    return t;
  };
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...o });
  const list = {
    marble: std({ color: 0xf5f1ea, roughness: 0.45 }),
    marbleShade: std({ color: 0xd9d0c1, roughness: 0.6 }),
    facadeMain: std({ map: T(facadeMainCanvas()), roughness: 0.45 }),
    facadeChamfer: std({ map: T(facadeChamferCanvas()), roughness: 0.45 }),
    drum: std({ map: T(drumCanvas()), roughness: 0.45 }),
    dome: std({ map: T(domeCanvas()), roughness: 0.4 }),
    minaret: std({ map: T(minaretCanvas(), 8, 3.5), roughness: 0.45 }),
    plinthSide: std({ map: T(plinthCanvas(), 16, 1), roughness: 0.5 }),
    paving: std({ map: T(pavingCanvas()), roughness: 0.55 }),
    gold: std({ color: 0xc9a24a, roughness: 0.35, metalness: 0.55 }),
    window: std({ color: 0x4d4238, roughness: 0.9, emissive: 0xffa24a, emissiveIntensity: 0 }),
    redWall: std({ map: T(redWallCanvas()) }),
    redPlain: std({ map: T(redPlainCanvas()) }),
    redPaving: std({ map: T(redPavingCanvas()), roughness: 0.9 }),
    mosqueFacade: std({ map: T(redFacadeCanvas(MOSQUE_FACADE)) }),
    gateFacade: std({ map: T(redFacadeCanvas(GATE_FACADE)) }),
    gardenGround: std({ map: T(gardenCanvas()), roughness: 0.95 }),
    water: std({ color: 0x5b7b84, roughness: 0.08, metalness: 0.1 }),
    river: std({ color: 0x88a4a4, roughness: 0.3, metalness: 0.05 }),
    ground: std({ color: 0x8e8c5c, roughness: 1 }),
    sand: std({ color: 0xb8a581, roughness: 1 }),
    bank: std({ color: 0x8b7a5c, roughness: 1 }),
    cypress: std({ color: 0x2e4a25, roughness: 0.95 }),
    foliage: std({ color: 0x4f6e2e, roughness: 0.95, flatShading: true }),
    foliage2: std({ color: 0x627a36, roughness: 0.95, flatShading: true }),
    trunk: std({ color: 0x5a4632, roughness: 1 }),
    iron: std({ color: 0x2f2b28, roughness: 0.6, metalness: 0.4 }),
    lamp: std({ color: 0xf6ecd4, roughness: 0.5, emissive: 0xffcf85, emissiveIntensity: 0 }),
    jet: new THREE.MeshStandardMaterial({ color: 0xeaf4f8, roughness: 0.2, transparent: true, opacity: 0.5, depthWrite: false }),
  };
  function setNight(night) {
    list.window.emissiveIntensity = night ? 1.6 : 0;
    list.lamp.emissiveIntensity = night ? 3 : 0;
  }
  return { list, setNight };
}
