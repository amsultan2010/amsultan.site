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

const vert = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uPulse;
uniform vec2 uMouse;
varying float vH;
varying vec2 vUv;

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
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

void main() {
  vUv = uv;
  vec3 pos = position;

  float roll = uScroll * 3.5;
  vec2 np = pos.xz * 0.28 + vec2(roll * 0.2, uTime * 0.06);
  float h = fbm(np);

  // Mouse bulge in plane space
  vec2 m = uMouse * vec2(7.5, 4.5);
  float dist = length(pos.xz - m);
  float bulge = exp(-dist * dist * 0.09) * (1.35 + uPulse * 0.9);

  float amp = 0.85 + uScroll * 1.1 + uPulse * 0.4;
  h = h * amp + bulge;
  h += sin(uTime * 0.55 + pos.x * 0.4 + pos.z * 0.25) * 0.05;

  pos.y += h;
  vH = h;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const frag = /* glsl */ `
uniform vec3 uPeak;
uniform vec3 uValley;
uniform vec3 uField;
uniform float uOpacity;
varying float vH;
varying vec2 vUv;

void main() {
  float t = clamp((vH + 0.15) / 2.2, 0.0, 1.0);
  vec3 col = mix(uValley, uPeak, t);
  col = mix(col, uField, 0.28 * (1.0 - abs(t - 0.5) * 2.0));

  // Soft vignette so edges fade into the page field
  float vig = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x)
            * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.55, vUv.y);

  gl_FragColor = vec4(col, uOpacity * (0.55 + 0.45 * vig));
}
`;

export function createVoltageTerrain({
  canvas,
  reducedMotion = false,
}: TerrainOpts): VoltageTerrainHandle | null {
  // Do NOT call canvas.getContext before Three — it steals the context.
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
  const segments = isMobile ? 80 : 120;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 3.6, 6.4);
  camera.lookAt(0, 0.2, 0);

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPulse: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPeak: { value: new THREE.Color('#fffaf5') },
    uValley: { value: new THREE.Color('#9a2208') },
    uField: { value: new THREE.Color('#ff4d1a') },
    uOpacity: { value: reducedMotion ? 0.45 : 0.9 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
  });

  const geometry = new THREE.PlaneGeometry(16, 11, segments, Math.floor(segments * 0.7));
  geometry.rotateX(-Math.PI / 2.2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -0.35;
  scene.add(mesh);

  let scrollProgress = 0;
  let pulse = 0;
  let running = true;
  let raf = 0;
  let time = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const applyTheme = (contrasted: boolean) => {
    if (contrasted) {
      uniforms.uPeak.value.set('#ff4d1a');
      uniforms.uValley.value.set('#e8ddd0');
      uniforms.uField.value.set('#fff8f1');
      uniforms.uOpacity.value = 0.55;
    } else {
      uniforms.uPeak.value.set('#fffaf5');
      uniforms.uValley.value.set('#9a2208');
      uniforms.uField.value.set('#ff4d1a');
      uniforms.uOpacity.value = reducedMotion ? 0.45 : 0.9;
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

  const tick = () => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    time += 0.016;

    mouse.x += (mouse.tx - mouse.x) * 0.07;
    mouse.y += (mouse.ty - mouse.y) * 0.07;
    pulse *= 0.92;

    uniforms.uTime.value = reducedMotion ? 0 : time;
    uniforms.uScroll.value = scrollProgress;
    uniforms.uPulse.value = pulse;
    uniforms.uMouse.value.set(mouse.x, mouse.y);

    if (!reducedMotion) {
      mesh.rotation.z = mouse.x * 0.05;
      mesh.position.x = mouse.x * 0.2;
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

  // Seed one frame so something is visible immediately
  uniforms.uTime.value = 0;
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
      material.dispose();
      renderer.dispose();
    },
  };
}
