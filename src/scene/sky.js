import * as THREE from 'three';

// couleur brute (déjà en sRGB) pour le shader du ciel, qui n'est pas tonemappé
export const raw = (hex) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);

export function createSky(scene) {
  const uniforms = {
    top: { value: raw(0x4a8bd6) },
    horizon: { value: raw(0xdce7ef) },
    bottom: { value: raw(0xc2bba4) },
    sunDir: { value: new THREE.Vector3(0, 1, 0) },
    sunColor: { value: raw(0xfff0d4) },
    sunSize: { value: 1 },
    glow: { value: 0.22 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 top;
      uniform vec3 horizon;
      uniform vec3 bottom;
      uniform vec3 sunDir;
      uniform vec3 sunColor;
      uniform float sunSize;
      uniform float glow;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = h > 0.0
          ? mix(horizon, top, pow(clamp(h * 1.5, 0.0, 1.0), 0.65))
          : mix(horizon, bottom, clamp(-h * 6.0, 0.0, 1.0));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        col += sunColor * (pow(s, 900.0) * sunSize * 2.0 + pow(s, 10.0) * glow);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(4500, 32, 16), material);
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  scene.add(mesh);

  // étoiles (nuit)
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = 1400;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = 2 * Math.PI * rnd();
    const y = 0.05 + 0.95 * rnd();
    const r = Math.sqrt(1 - y * y);
    pos.set([Math.cos(th) * r * 4200, y * 4200, Math.sin(th) * r * 4200], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(
    sg,
    new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false, depthWrite: false }),
  );
  stars.visible = false;
  scene.add(stars);

  // lune (nuit) : disque dessiné dans un canvas
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,251,238,1)');
  grd.addColorStop(0.27, 'rgba(255,248,232,1)');
  grd.addColorStop(0.3, 'rgba(210,222,255,0.35)');
  grd.addColorStop(1, 'rgba(150,170,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = 'rgba(205,200,186,0.55)';
  for (const [x, y, r] of [[112, 114, 9], [140, 134, 7], [124, 146, 5], [146, 110, 5]]) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, fog: false, depthWrite: false, transparent: true, toneMapped: false }));
  moon.scale.setScalar(520);
  moon.visible = false;
  scene.add(moon);

  return { mesh, uniforms, stars, moon };
}
