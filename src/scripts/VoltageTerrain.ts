import * as THREE from 'three';

export type VoltageTerrainHandle = {
  setScroll: (progress: number) => void;
  setContrasted: (on: boolean) => void;
  pulse: () => void;
  destroy: () => void;
};

type TerrainOpts = {
  canvas: HTMLCanvasElement;
  reducedMotion?: boolean;
};

/**
 * Real topography: displaced mesh with lit ridges + contour wireframe.
 * Mouse pulls a local peak; scroll rolls the landscape.
 */
const vert = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uPulse;
uniform vec2 uMouse;
varying vec3 vNormal;
varying float vH;
varying vec3 vWorld;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float heightAt(vec2 xz) {
  float roll = uScroll * 5.5;
  vec2 np = xz * 0.32 + vec2(roll * 0.18, uTime * 0.04);
  float h = fbm(np);

  // Ridges — classic topo look
  float ridge = 1.0 - abs(fbm(np * 1.4 + 3.1) * 2.0 - 1.0);
  h = mix(h, ridge, 0.45);

  // Mouse peak
  vec2 m = uMouse * vec2(8.5, 5.5);
  float dist = length(xz - m);
  float bulge = exp(-dist * dist * 0.07) * (1.8 + uPulse * 1.2);

  float amp = 1.35 + uScroll * 1.4 + uPulse * 0.5;
  h = h * amp + bulge;
  h += sin(uTime * 0.4 + xz.x * 0.35) * 0.04;
  return h;
}

void main() {
  vec3 pos = position;
  float h = heightAt(pos.xz);
  pos.y += h;
  vH = h;

  // Analytic-ish normals via finite differences
  float e = 0.12;
  float hx = heightAt(pos.xz + vec2(e, 0.0));
  float hz = heightAt(pos.xz + vec2(0.0, e));
  vec3 t1 = normalize(vec3(e, hx - h, 0.0));
  vec3 t2 = normalize(vec3(0.0, hz - h, e));
  vNormal = normalize(cross(t2, t1));

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const frag = /* glsl */ `
uniform vec3 uPeak;
uniform vec3 uValley;
uniform vec3 uMid;
uniform vec3 uLightDir;
uniform float uOpacity;
varying vec3 vNormal;
varying float vH;
varying vec3 vWorld;

void main() {
  float t = clamp((vH + 0.2) / 2.8, 0.0, 1.0);
  vec3 albedo = mix(uValley, uMid, smoothstep(0.0, 0.55, t));
  albedo = mix(albedo, uPeak, smoothstep(0.45, 1.0, t));

  // Contour bands — elevation lines
  float bands = abs(fract(vH * 2.4) - 0.5);
  float contour = smoothstep(0.08, 0.02, bands);
  albedo = mix(albedo, uPeak, contour * 0.35);

  vec3 n = normalize(vNormal);
  vec3 l = normalize(uLightDir);
  float diff = max(dot(n, l), 0.0);
  float ambient = 0.38;
  float lit = ambient + diff * 0.85;
  // Specular kiss on ridges
  vec3 viewDir = normalize(cameraPosition - vWorld);
  vec3 halfV = normalize(l + viewDir);
  float spec = pow(max(dot(n, halfV), 0.0), 48.0) * 0.35;

  vec3 col = albedo * lit + uPeak * spec;

  // Soft edge fade into page
  float edge = smoothstep(-7.5, -5.5, abs(vWorld.x)) * smoothstep(-5.2, -3.4, abs(vWorld.z));
  float alpha = uOpacity * (1.0 - edge * 0.85);

  gl_FragColor = vec4(col, alpha);
}
`;

const wireVert = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uPulse;
uniform vec2 uMouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}
float heightAt(vec2 xz) {
  float roll = uScroll * 5.5;
  vec2 np = xz * 0.32 + vec2(roll * 0.18, uTime * 0.04);
  float h = fbm(np);
  float ridge = 1.0 - abs(fbm(np * 1.4 + 3.1) * 2.0 - 1.0);
  h = mix(h, ridge, 0.45);
  vec2 m = uMouse * vec2(8.5, 5.5);
  float dist = length(xz - m);
  float bulge = exp(-dist * dist * 0.07) * (1.8 + uPulse * 1.2);
  float amp = 1.35 + uScroll * 1.4 + uPulse * 0.5;
  return h * amp + bulge + sin(uTime * 0.4 + xz.x * 0.35) * 0.04;
}
void main() {
  vec3 pos = position;
  pos.y += heightAt(pos.xz) + 0.02;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const wireFrag = /* glsl */ `
uniform vec3 uWire;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uWire, uOpacity);
}
`;

export function createVoltageTerrain({
  canvas,
  reducedMotion = false,
}: TerrainOpts): VoltageTerrainHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const segs = isMobile ? 72 : 110;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.4 : 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
  // Look down onto the landscape — reads as topography, not a flat blob
  camera.position.set(0, 5.8, 7.8);
  camera.lookAt(0, 0.1, -0.4);

  const shared = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPulse: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  };

  const uniforms = {
    ...shared,
    uPeak: { value: new THREE.Color('#fffaf5') },
    uValley: { value: new THREE.Color('#7a1806') },
    uMid: { value: new THREE.Color('#ff4d1a') },
    uLightDir: { value: new THREE.Vector3(0.55, 1.0, 0.35).normalize() },
    uOpacity: { value: reducedMotion ? 0.55 : 0.92 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(18, 12, segs, Math.floor(segs * 0.72));
  geometry.rotateX(-Math.PI / 2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -0.8;
  scene.add(mesh);

  // Contour wireframe on coarser grid
  const wireGeo = new THREE.PlaneGeometry(18, 12, Math.floor(segs / 2.2), Math.floor(segs / 3));
  wireGeo.rotateX(-Math.PI / 2);
  const wireMat = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uWire: { value: new THREE.Color('#fffaf5') },
      uOpacity: { value: 0.22 },
    },
    vertexShader: wireVert,
    fragmentShader: wireFrag,
    transparent: true,
    depthWrite: false,
    wireframe: true,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.position.y = -0.78;
  scene.add(wire);

  let scrollProgress = 0;
  let pulse = 0;
  let running = true;
  let raf = 0;
  let time = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const applyTheme = (contrasted: boolean) => {
    if (contrasted) {
      uniforms.uPeak.value.set('#ff4d1a');
      uniforms.uValley.value.set('#d4c4b0');
      uniforms.uMid.value.set('#fff8f1');
      uniforms.uOpacity.value = 0.65;
      wireMat.uniforms.uWire.value.set('#14110f');
      wireMat.uniforms.uOpacity.value = 0.18;
    } else {
      uniforms.uPeak.value.set('#fffaf5');
      uniforms.uValley.value.set('#7a1806');
      uniforms.uMid.value.set('#ff4d1a');
      uniforms.uOpacity.value = reducedMotion ? 0.55 : 0.92;
      wireMat.uniforms.uWire.value.set('#fffaf5');
      wireMat.uniforms.uOpacity.value = 0.22;
    }
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const tick = (t = performance.now()) => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    time = t * 0.001;

    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    pulse *= 0.93;

    shared.uTime.value = reducedMotion ? 0 : time;
    shared.uScroll.value = scrollProgress;
    shared.uPulse.value = pulse;
    shared.uMouse.value.set(mouse.x, mouse.y);

    // Light follows mouse a bit
    uniforms.uLightDir.value.set(0.45 + mouse.x * 0.4, 1.0, 0.3 + mouse.y * 0.25).normalize();

    if (!reducedMotion) {
      mesh.rotation.z = mouse.x * 0.04;
      wire.rotation.z = mouse.x * 0.04;
      mesh.position.x = mouse.x * 0.25;
      wire.position.x = mouse.x * 0.25;
    }

    renderer.render(scene, camera);
  };

  const onPointer = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  const onVisibility = () => {
    const visible = document.visibilityState === 'visible';
    if (visible && !running) {
      running = true;
      tick();
    } else if (!visible) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  renderer.render(scene, camera);
  tick();

  return {
    setScroll(progress: number) {
      scrollProgress = Math.min(1, Math.max(0, progress));
    },
    setContrasted(on: boolean) {
      applyTheme(on);
    },
    pulse() {
      pulse = 1;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      geometry.dispose();
      wireGeo.dispose();
      material.dispose();
      wireMat.dispose();
      renderer.dispose();
    },
  };
}
