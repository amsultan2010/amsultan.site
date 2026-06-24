/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useLayoutEffect, useEffect, forwardRef } from 'react';
import { useFrame, Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const hexToNormalizedRGB = (hex: string) => {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
uniform vec2  uMouse;

float noise(vec2 texCoord) {
  return fract(sin(dot(texCoord, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  // Mouse: very wide, gentle warp across the whole screen
  vec2 mouseUV = uMouse;
  float dist = distance(vUv, mouseUV);

  // Wide soft falloff — affects most of the screen gently
  float broad = smoothstep(0.8, 0.0, dist);
  // Gentle nudge that warps the flow field toward cursor
  vec2 dir = vUv - mouseUV;
  tex += broad * 0.04 * dir;

  // Very faint, slow ripple that spreads wide
  float ripple = sin(dist * 10.0 - uTime * 2.0) * smoothstep(0.6, 0.0, dist) * 0.02;
  tex.x += ripple;
  tex.y += ripple;

  tex.x += 0.2 * sin(8.0 * tex.y - tOffset);
  tex.y += 0.06 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                  cos(3.0 * tex.x + 5.0 * tex.y) +
                                  0.02 * tOffset) +
                          sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
  uniforms: Record<string, { value: unknown }>;
}

const SilkPlane = forwardRef<THREE.Mesh, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();
  const meshRef = ref as React.RefObject<THREE.Mesh>;

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [meshRef, viewport]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

const Background = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrent = useRef({ x: 0.5, y: 0.5 });

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: 5 },
      uScale: { value: 0.8 },
      uNoiseIntensity: { value: 50 },
      uColor: { value: new THREE.Color(...hexToNormalizedRGB("#727272")) },
      uRotation: { value: Math.PI / 4 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  // Track mouse position on window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = e.clientX / window.innerWidth;
      mouseTarget.current.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth lerp the mouse uniform each frame
  useEffect(() => {
    let raf: number;
    const tick = () => {
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.03;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.03;
      uniforms.uMouse.value.set(mouseCurrent.current.x, mouseCurrent.current.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [uniforms]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <SilkPlane ref={meshRef} uniforms={uniforms} />
      </Canvas>
    </div>
  );
};

export default Background;
