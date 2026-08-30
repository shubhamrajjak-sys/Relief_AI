import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

export type TwinSelection = "flood" | "convoy" | "bridge" | "shelter";

type DigitalTwinProps = {
  simulated: boolean;
  reducedMotion: boolean;
  onSelect: (selection: TwinSelection) => void;
};

const safePoints = [
  new THREE.Vector3(-7.4, 0.44, 4.8),
  new THREE.Vector3(-5.2, 0.5, 2.1),
  new THREE.Vector3(-3.2, 0.56, -0.4),
  new THREE.Vector3(-1.3, 0.62, -2.8),
  new THREE.Vector3(2.1, 0.65, -3.9),
  new THREE.Vector3(5.6, 0.7, -2.1),
  new THREE.Vector3(7.4, 0.72, -4.3),
];

const unsafePoints = [
  new THREE.Vector3(-7.4, 0.42, 4.8),
  new THREE.Vector3(-4.5, 0.46, 3.5),
  new THREE.Vector3(-1.6, 0.5, 2),
  new THREE.Vector3(1.1, 0.52, 1.1),
  new THREE.Vector3(4.3, 0.54, 0.5),
];

function useNormalizedModel(source: THREE.Object3D, height: number) {
  return useMemo(() => {
    const model = SkeletonUtils.clone(source);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(height / Math.max(size.y, 0.01));
    const scaled = new THREE.Box3().setFromObject(model);
    const center = scaled.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -scaled.min.y, -center.z);
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return model;
  }, [source, height]);
}

function Vehicle({
  kind,
  position,
  rotation = 0,
  scale = 1,
  onClick,
}: {
  kind: "truck" | "ambulance";
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  onClick?: () => void;
}) {
  const truck = useGLTF(kind === "truck" ? "/models/relief-truck.glb" : "/models/ambulance.glb");
  const model = useNormalizedModel(truck.scene, 0.9 * scale);
  return (
    <group position={position} rotation-y={rotation} onClick={(event) => { event.stopPropagation(); onClick?.(); }}>
      <primitive object={model} />
    </group>
  );
}

function RouteTube({ points, tone, opacity = 1 }: { points: THREE.Vector3[]; tone: "safe" | "danger"; opacity?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 80, tone === "safe" ? 0.075 : 0.06, 8, false), [curve, tone]);
  const color = tone === "safe" ? "#64ff79" : "#ff4d32";
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={tone === "safe" ? 2.2 : 1.6} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

function RouteSignals({ reducedMotion, simulated }: { reducedMotion: boolean; simulated: boolean }) {
  const signals = useRef<Array<THREE.Mesh | null>>([]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(simulated ? safePoints : unsafePoints), [simulated]);
  useFrame(({ clock }, rawDelta) => {
    if (reducedMotion) return;
    const delta = Math.min(rawDelta, 0.05);
    const elapsed = clock.getElapsedTime();
    signals.current.forEach((signal, index) => {
      if (!signal) return;
      const progress = (elapsed * 0.09 + index / 7 + delta) % 1;
      signal.position.copy(curve.getPointAt(progress));
    });
  });
  return (
    <>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} ref={(node) => { signals.current[index] = node; }}>
          <sphereGeometry args={[0.105, 10, 10]} />
          <meshBasicMaterial color={simulated ? "#64ff79" : "#66e8ff"} toneMapped={false} />
          <pointLight color={simulated ? "#64ff79" : "#66e8ff"} intensity={0.3} distance={1.4} />
        </mesh>
      ))}
    </>
  );
}

function PulseMarker({ position, color = "#ff4d32" }: { position: [number, number, number]; color?: string }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const wave = (clock.getElapsedTime() % 1.8) / 1.8;
    ring.current.scale.setScalar(0.6 + wave * 1.8);
    const material = ring.current.material;
    if (material instanceof THREE.MeshBasicMaterial) material.opacity = 1 - wave;
  });
  return (
    <group position={position}>
      <mesh ref={ring} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.26, 0.32, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh position-y={0.12}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Road({ position, rotation = 0, length, dangerous = false }: { position: [number, number, number]; rotation?: number; length: number; dangerous?: boolean }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh receiveShadow>
        <boxGeometry args={[1.25, 0.12, length]} />
        <meshStandardMaterial color={dangerous ? "#3a2926" : "#252c31"} roughness={0.92} />
      </mesh>
      <mesh position-y={0.07}>
        <boxGeometry args={[0.055, 0.015, length * 0.92]} />
        <meshBasicMaterial color={dangerous ? "#ff6b35" : "#8a9794"} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Building({ position, shelter = false }: { position: [number, number, number]; shelter?: boolean }) {
  return (
    <group position={position}>
      <mesh position-y={0.55} castShadow receiveShadow>
        <boxGeometry args={shelter ? [2, 1.1, 1.5] : [2.7, 1.1, 2.2]} />
        <meshStandardMaterial color={shelter ? "#dce8e4" : "#78837f"} roughness={0.75} />
      </mesh>
      <mesh position-y={1.25} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[shelter ? 1.5 : 1.9, 0.75, 4]} />
        <meshStandardMaterial color={shelter ? "#4dda73" : "#26332f"} emissive={shelter ? "#1a5d2d" : "#000000"} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.8, 0.76]}>
        <boxGeometry args={[0.25, 0.55, 0.04]} />
        <meshBasicMaterial color={shelter ? "#64ff79" : "#66e8ff"} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Bridge({ onSelect }: { onSelect: () => void }) {
  return (
    <group position={[2.45, 0.8, 0.8]} rotation-y={-0.1} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      <mesh rotation-x={-0.12} castShadow>
        <boxGeometry args={[3.1, 0.18, 0.9]} />
        <meshStandardMaterial color="#61666a" roughness={0.8} />
      </mesh>
      {[-1.15, 1.15].map((x) => <mesh key={x} position={[x, -0.55, 0]}><boxGeometry args={[0.3, 1.2, 0.72]} /><meshStandardMaterial color="#454a4d" /></mesh>)}
      <mesh position={[0.1, 0.18, 0.1]} rotation-z={0.65}>
        <boxGeometry args={[0.08, 0.3, 1]} />
        <meshBasicMaterial color="#ff4d32" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Terrain() {
  const mountains = useMemo(() => [
    [-7.2, 1.3, -3.9, 3.2, 4.5], [-4.8, 1.1, -5, 2.6, 3.8], [-1.7, 0.9, -5.2, 2.2, 3.1],
    [5.4, 1.35, 3.9, 3.5, 4.8], [7.4, 0.9, 1.8, 2.2, 3.2], [6.8, 1, -5, 2.5, 3.5],
  ] as const, []);
  return (
    <>
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[21, 15, 1, 1]} />
        <meshStandardMaterial color="#17221d" roughness={0.95} />
      </mesh>
      {mountains.map(([x, y, z, radius, height], index) => (
        <mesh key={index} position={[x, y, z]} rotation-y={index * 0.7} castShadow receiveShadow>
          <coneGeometry args={[radius, height, 7]} />
          <meshStandardMaterial color={index % 2 ? "#263a31" : "#31463b"} flatShading roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0.7, 0.2, 1.6]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.8, 15]} />
        <meshStandardMaterial color="#163c4a" emissive="#0a7895" emissiveIntensity={0.28} transparent opacity={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[-0.5, 0.45, 2.25]} rotation={[0.18, 0.3, 0.15]} castShadow>
        <dodecahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color="#6f4c34" flatShading />
      </mesh>
      <mesh position={[-1.25, 0.32, 2.8]} rotation={[0.1, -0.2, 0.4]} castShadow>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#815a3d" flatShading />
      </mesh>
    </>
  );
}

function DisasterScene({ simulated, reducedMotion, onSelect }: DigitalTwinProps) {
  const world = useRef<THREE.Group>(null);
  const convoy = useRef<THREE.Group>(null);
  const convoyCurve = useMemo(() => new THREE.CatmullRomCurve3(simulated ? safePoints : unsafePoints), [simulated]);
  const progress = useRef(0.05);

  useEffect(() => { progress.current = 0.05; }, [simulated]);
  useFrame(({ pointer }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (world.current && !reducedMotion) {
      world.current.rotation.y += (pointer.x * 0.045 - world.current.rotation.y) * (1 - Math.exp(-2.5 * delta));
      world.current.rotation.x += (-pointer.y * 0.025 - world.current.rotation.x) * (1 - Math.exp(-2.5 * delta));
    }
    if (!convoy.current || reducedMotion) return;
    progress.current = (progress.current + delta * 0.035) % 0.96;
    const point = convoyCurve.getPointAt(progress.current);
    const next = convoyCurve.getPointAt(Math.min(progress.current + 0.012, 1));
    convoy.current.position.copy(point);
    convoy.current.lookAt(next.x, point.y, next.z);
  });

  return (
    <group ref={world} rotation={[0, 0, 0]}>
      <Terrain />
      <Road position={[-4.2, 0.3, 2.8]} rotation={1.15} length={8.5} dangerous />
      <Road position={[-3.3, 0.31, -2.5]} rotation={-1.03} length={8.3} />
      <Road position={[5.1, 0.32, -3]} rotation={1.05} length={6.5} />
      <Bridge onSelect={() => onSelect("bridge")} />
      <Building position={[-7.5, 0.25, 5]} />
      <group onClick={(event) => { event.stopPropagation(); onSelect("shelter"); }}><Building position={[7.6, 0.25, -4.5]} shelter /></group>
      <group ref={convoy}><Suspense fallback={null}><Vehicle kind="truck" position={[0, 0, 0]} rotation={Math.PI} onClick={() => onSelect("convoy")} /></Suspense></group>
      <Suspense fallback={null}><Vehicle kind="ambulance" position={[-5.4, 0.47, 3.7]} rotation={-1.15} scale={0.85} /></Suspense>
      <group position={[1.15, 0.32, 1.15]} onClick={(event) => { event.stopPropagation(); onSelect("flood"); }}>
        <mesh position-y={0.13} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[1.45, 32]} />
          <meshBasicMaterial color="#28bde8" transparent opacity={0.38} depthWrite={false} />
        </mesh>
        <PulseMarker position={[0, 0.35, 0]} />
      </group>
      <PulseMarker position={[2.45, 1.28, 0.8]} />
      <PulseMarker position={[7.6, 1.9, -4.5]} color="#64ff79" />
      <RouteTube points={unsafePoints} tone="danger" opacity={simulated ? 0.45 : 0.85} />
      {simulated && <RouteTube points={safePoints} tone="safe" />}
      <RouteSignals reducedMotion={reducedMotion} simulated={simulated} />
    </group>
  );
}

export default function DisasterDigitalTwin(props: DigitalTwinProps) {
  return (
    <Canvas
      aria-label="Interactive 3D digital twin of an earthquake and flood-affected relief network"
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [13, 13, 15], fov: 38, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#07100d"]} />
      <fog attach="fog" args={["#07100d", 19, 36]} />
      <hemisphereLight args={["#9ce8db", "#07100d", 1.25]} />
      <directionalLight position={[4, 14, 7]} intensity={2.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={11} shadow-camera-bottom={-11} />
      <pointLight position={[-7, 4, 4]} color="#64ff79" intensity={8} distance={12} />
      <pointLight position={[2, 3, 1]} color="#32c5ff" intensity={5} distance={9} />
      <DisasterScene {...props} />
      <Environment resolution={64}>
        <Lightformer intensity={2.4} color="#d8fff2" position={[0, 8, 2]} scale={[12, 2, 1]} />
        <Lightformer intensity={1.2} color="#4cff7a" position={[-8, 2, -3]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload("/models/relief-truck.glb");
useGLTF.preload("/models/ambulance.glb");