import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/* ─── helpers ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Spectral class → color temperature mapping
function spectralColor(spectralClass: string): THREE.Color {
  const sc = (spectralClass || "G").charAt(0).toUpperCase();
  const map: Record<string, string> = {
    O: "#9bb0ff",
    B: "#aabfff",
    A: "#cad7ff",
    F: "#f8f7ff",
    G: "#fff4ea",
    K: "#ffd2a1",
    M: "#ffcc6f",
  };
  return new THREE.Color(map[sc] || "#fff4ea");
}

/* ─── Background stars (static points) ─── */
function BackgroundStars({ count = 6000 }: { count?: number }) {
  const points = useMemo(() => {
    const rng = seededRandom(42);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const spectralClasses = ["O", "B", "A", "F", "G", "K", "M"];
    const weights = [0.02, 0.05, 0.1, 0.15, 0.3, 0.25, 0.13];

    for (let i = 0; i < count; i++) {
      // Distribute on a sphere
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 80 + rng() * 120;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Pick spectral class by weight
      let acc = 0;
      const roll = rng();
      let sc = "G";
      for (let j = 0; j < weights.length; j++) {
        acc += weights[j];
        if (roll <= acc) { sc = spectralClasses[j]; break; }
      }
      const col = spectralColor(sc);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = 0.3 + rng() * 1.5;
    }
    return { positions, colors, sizes };
  }, [count]);

  const geomRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    if (!geomRef.current) return;
    geomRef.current.setAttribute("size", new THREE.BufferAttribute(points.sizes, 1));
  }, [points]);

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          array={points.positions}
          count={points.positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={points.colors}
          count={points.colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={1.2}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Twinkling layer ─── */
function TwinkleStars({ count = 800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const rng = seededRandom(99);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 90 + rng() * 100;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.PointsMaterial;
      mat.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 1.5) * 0.3;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={data}
          count={data.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.6}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Target star with glow ─── */
function TargetStar({
  name,
  spectralClass,
  magnitude,
}: {
  name: string;
  spectralClass: string;
  magnitude: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const color = spectralColor(spectralClass);

  // Brighter stars → bigger
  const baseSize = Math.max(0.15, 0.6 - magnitude * 0.04);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2) * 0.15;
    if (meshRef.current) meshRef.current.scale.setScalar(pulse);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * 3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(t * 1.5) * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[baseSize, 32, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[baseSize, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Light rays */}
      <pointLight color={color} intensity={2} distance={20} decay={2} />
      {/* Label */}
      <Html
        position={[0, -(baseSize + 1.2), 0]}
        center
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border"
            style={{
              borderColor: `${color.getStyle()}`,
              boxShadow: `0 0 12px 4px ${color.getStyle()}40`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span
            className="text-xs sm:text-sm font-display font-semibold whitespace-nowrap px-2.5 py-1 rounded-full"
            style={{
              color: "#fff",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              textShadow: `0 0 10px ${color.getStyle()}`,
            }}
          >
            ⭐ {name}
          </span>
        </div>
      </Html>
    </group>
  );
}

/* ─── Nebula fog ─── */
function NebulaFog() {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const rng = seededRandom(777);
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 300;
      positions[i * 3 + 1] = (rng() - 0.5) * 300;
      positions[i * 3 + 2] = (rng() - 0.5) * 300;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.003;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data} count={200} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color="#1a1a3e"
        size={8}
        sizeAttenuation
        transparent
        opacity={0.08}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Camera auto-position ─── */
function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

/* ─── Main component ─── */
interface StarCanvasProps {
  starName: string;
  spectralClass: string;
  magnitude: number;
  onReady?: () => void;
}

const StarCanvas = ({ starName, spectralClass, magnitude, onReady }: StarCanvasProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      onReady?.();
    }, 800);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <div className="absolute inset-0 w-full h-full" style={{ background: "#03030a" }}>
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        camera={{ fov: 60, near: 0.1, far: 500 }}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 1s ease-in" }}
      >
        <CameraSetup />
        <color attach="background" args={["#03030a"]} />
        <ambientLight intensity={0.05} />

        <BackgroundStars count={6000} />
        <TwinkleStars count={800} />
        <NebulaFog />
        <TargetStar
          name={starName}
          spectralClass={spectralClass}
          magnitude={magnitude}
        />

        <OrbitControls
          enablePan={false}
          enableZoom
          enableRotate
          autoRotate
          autoRotateSpeed={0.15}
          minDistance={3}
          maxDistance={50}
          zoomSpeed={0.5}
          rotateSpeed={0.4}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
};

export default StarCanvas;
