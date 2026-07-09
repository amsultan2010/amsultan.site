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

/** Compact 2D value noise for living topography without a noise lib. */
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0);
  const b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1);
  const d = hash2(x0 + 1, y0 + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number) {
  let amp = 0.55;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    sum += smoothNoise(x * freq, y * freq) * amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum;
}

const COLORS = {
  default: {
    field: new THREE.Color('#ff4d1a'),
    peak: new THREE.Color('#fffaf5'),
    valley: new THREE.Color('#c2340f'),
    light: new THREE.Color('#fff5eb'),
  },
  contrasted: {
    field: new THREE.Color('#fff8f1'),
    peak: new THREE.Color('#ff4d1a'),
    valley: new THREE.Color('#e8ddd0'),
    light: new THREE.Color('#ff6a3d'),
  },
};

export function createVoltageTerrain({
  canvas,
  reducedMotion = false,
}: TerrainOpts): VoltageTerrainHandle | null {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return null;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const segments = reducedMotion ? 48 : isMobile ? 64 : 96;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 4.2, 7.2);
  camera.lookAt(0, 0, 0);

  const geometry = new THREE.PlaneGeometry(18, 12, segments, Math.floor(segments * 0.65));
  geometry.rotateX(-Math.PI / 2.35);

  const basePositions = Float32Array.from(geometry.attributes.position.array as Float32Array);
  const colors = new Float32Array(basePositions.length);

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.72,
    metalness: 0.08,
    transparent: true,
    opacity: reducedMotion ? 0.35 : 0.55,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -0.6;
  scene.add(mesh);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff5eb, 1.15);
  key.position.set(3, 6, 4);
  scene.add(key);

  const fill = new THREE.PointLight(0xff6a3d, 0.65, 30);
  fill.position.set(-4, 2, 2);
  scene.add(fill);

  let palette = COLORS.default;
  let scrollProgress = 0;
  let pulse = 0;
  let running = true;
  let raf = 0;
  let time = 0;
  let frame = 0;

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const applyPalette = () => {
    key.color.copy(palette.light);
    fill.color.copy(palette.peak);
    ambient.intensity = palette === COLORS.contrasted ? 0.7 : 0.55;
    material.opacity = palette === COLORS.contrasted ? 0.4 : reducedMotion ? 0.35 : 0.55;
  };
  applyPalette();

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const displace = (t: number) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const ampBase = 0.55 + scrollProgress * 0.85 + pulse * 0.35;
    const roll = scrollProgress * 4.5;
    const mx = mouse.x * 5.5;
    const mz = mouse.y * 3.8;

    for (let i = 0; i < arr.length; i += 3) {
      const bx = basePositions[i];
      const by = basePositions[i + 1];
      const bz = basePositions[i + 2];

      const nx = bx * 0.22 + roll * 0.15;
      const nz = bz * 0.22 + t * 0.08;
      let h = fbm(nx, nz) * ampBase;

      // Mouse bulge: local topography peak
      const dx = bx - mx;
      const dz = bz - mz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const bulge = Math.exp(-(dist * dist) * 0.12) * (1.1 + pulse * 0.6);
      h += bulge;

      // Gentle breathing so it never feels frozen
      h += Math.sin(t * 0.7 + bx * 0.35 + bz * 0.2) * 0.06;

      arr[i] = bx;
      arr[i + 1] = by + h;
      arr[i + 2] = bz;

      const cIdx = i;
      const mix = THREE.MathUtils.clamp((h + 0.2) / 1.8, 0, 1);
      const col = palette.valley.clone().lerp(palette.peak, mix);
      // Tint mid heights toward field orange
      col.lerp(palette.field, 0.35 * (1 - Math.abs(mix - 0.45)));
      colors[cIdx] = col.r;
      colors[cIdx + 1] = col.g;
      colors[cIdx + 2] = col.b;
    }

    pos.needsUpdate = true;
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (colorAttr) {
      (colorAttr.array as Float32Array).set(colors);
      colorAttr.needsUpdate = true;
    } else {
      geometry.setAttribute('color', new THREE.BufferAttribute(colors.slice(), 3));
    }
    // Normals every other frame for lighting, cheaper on CPU
    if (frame % 2 === 0) geometry.computeVertexNormals();
  };

  // Static frame for reduced motion
  if (reducedMotion) {
    displace(0);
    renderer.render(scene, camera);
  }

  const tick = () => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    time += 0.016;
    frame += 1;

    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    pulse *= 0.94;

    if (!reducedMotion) {
      displace(time);
      // Light orbits with mouse
      key.position.x = 3 + mouse.x * 2.5;
      key.position.z = 4 + mouse.y * 1.5;
      fill.position.x = -4 + mouse.x * 1.2;
      fill.intensity = 0.55 + pulse * 0.8 + scrollProgress * 0.25;
      mesh.rotation.z = mouse.x * 0.04;
      mesh.position.x = mouse.x * 0.15;
    }

    renderer.render(scene, camera);
  };

  const onPointer = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  const onVisibility = () => {
    running = document.visibilityState === 'visible';
    if (running && !reducedMotion) {
      cancelAnimationFrame(raf);
      tick();
    }
  };

  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  if (!reducedMotion) tick();
  else {
    // Still listen for contrast/scroll updates on a static frame
    running = false;
  }

  return {
    setScroll(progress: number) {
      scrollProgress = THREE.MathUtils.clamp(progress, 0, 1);
      if (reducedMotion) {
        displace(0);
        renderer.render(scene, camera);
      }
    },
    setContrasted(on: boolean) {
      palette = on ? COLORS.contrasted : COLORS.default;
      applyPalette();
      if (reducedMotion) {
        displace(0);
        renderer.render(scene, camera);
      }
    },
    pulse() {
      pulse = 1;
      if (reducedMotion) {
        displace(0);
        renderer.render(scene, camera);
      }
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
