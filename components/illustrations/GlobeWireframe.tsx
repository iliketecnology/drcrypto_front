'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Globo wireframe 3D · rotação contínua lenta · pontos nas capitais
 * financeiras pulsando · linhas decorativas (latitudes/longitudes) sutis.
 *
 * `variant` controla a paleta conforme o fundo onde o globo é montado:
 *  - 'dark'  → fundo violeta escuro (Trust Metrics): linhas saturadas,
 *              núcleos brancos, esfera interna escura pra dar profundidade.
 *  - 'light' → fundo branco (Hero): contraste invertido. A esfera interna
 *              vira um glow lavanda claro (em vez de um disco escuro), os
 *              núcleos viram roxo médio e os meridianos escurecem o
 *              suficiente pra ficarem legíveis sobre o branco. */

type GlobeVariant = 'dark' | 'light';

interface GlobePalette {
  wire: string;
  wireOpacity: number;
  inner: string;
  innerOpacity: number;
  equator: string;
  equatorOpacity: number;
  meridian: string;
  meridianOpacity: number;
  dotHalo: string;
  dotHaloOpacity: number;
  dotCore: string;
}

const PALETTES: Record<GlobeVariant, GlobePalette> = {
  dark: {
    wire: '#9d2bed',
    wireOpacity: 0.22,
    inner: '#2a0548',
    innerOpacity: 0.4,
    equator: '#9d2bed',
    equatorOpacity: 0.65,
    meridian: '#cf9bf5',
    meridianOpacity: 0.32,
    dotHalo: '#f1e3fc',
    dotHaloOpacity: 0.35,
    dotCore: '#ffffff',
  },
  light: {
    // Sobre branco: roxo saturado nas linhas, glow lavanda no miolo,
    // núcleos em roxo médio (#7c2fd6) pra terem corpo sem virar mancha.
    wire: '#9d2bed',
    wireOpacity: 0.18,
    inner: '#f1e3fc',
    innerOpacity: 0.28,
    equator: '#9d2bed',
    equatorOpacity: 0.5,
    meridian: '#9d2bed',
    meridianOpacity: 0.22,
    dotHalo: '#9d2bed',
    dotHaloOpacity: 0.28,
    dotCore: '#7c2fd6',
  },
};

const CAPITALS_3D = [
  { name: 'São Paulo', lat: -23.5, lng: -46.6 },
  { name: 'NYC', lat: 40.7, lng: -74 },
  { name: 'Londres', lat: 51.5, lng: -0.1 },
  { name: 'Tóquio', lat: 35.7, lng: 139.7 },
  { name: 'Dubai', lat: 25.2, lng: 55.3 },
  { name: 'Cingapura', lat: 1.4, lng: 103.8 },
  { name: 'Berlim', lat: 52.5, lng: 13.4 },
  { name: 'Mumbai', lat: 19.1, lng: 72.9 },
  { name: 'Sydney', lat: -33.9, lng: 151.2 },
  { name: 'México DF', lat: 19.4, lng: -99.1 },
];

const RADIUS = 1.6;

function latLngToVec3(lat: number, lng: number, r: number = RADIUS): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function GlobeMesh({ palette }: { palette: GlobePalette }) {
  const groupRef = useRef<THREE.Group>(null);
  const dotsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08; // rotação lenta contínua
    }
    if (dotsRef.current) {
      // Pulse das cidades · escala oscilante
      const t = state.clock.elapsedTime;
      dotsRef.current.children.forEach((child, i) => {
        const phase = (t * 1.2 + i * 0.6) % 4;
        const pulse = 1 + 0.35 * Math.sin(phase * Math.PI * 0.5);
        child.scale.setScalar(pulse);
      });
    }
  });

  const cityPositions = useMemo(
    () =>
      CAPITALS_3D.map((c) => ({
        name: c.name,
        position: latLngToVec3(c.lat, c.lng, RADIUS * 1.01),
      })),
    [],
  );

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0.1]}>
      {/* Wireframe sphere principal */}
      <mesh>
        <sphereGeometry args={[RADIUS, 36, 24]} />
        <meshBasicMaterial
          color={palette.wire}
          wireframe
          transparent
          opacity={palette.wireOpacity}
        />
      </mesh>

      {/* Sphere interna sólida pra dar profundidade (escura no dark,
          glow lavanda no light) */}
      <mesh scale={0.98}>
        <sphereGeometry args={[RADIUS, 32, 20]} />
        <meshBasicMaterial
          color={palette.inner}
          transparent
          opacity={palette.innerOpacity}
        />
      </mesh>

      {/* Anel equador destacado */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS * 1.005, 0.005, 16, 80]} />
        <meshBasicMaterial
          color={palette.equator}
          transparent
          opacity={palette.equatorOpacity}
        />
      </mesh>

      {/* Anéis meridianos extras */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((rot, i) => (
        <mesh key={i} rotation={[0, rot, 0]}>
          <torusGeometry args={[RADIUS * 1.005, 0.003, 16, 80]} />
          <meshBasicMaterial
            color={palette.meridian}
            transparent
            opacity={palette.meridianOpacity}
          />
        </mesh>
      ))}

      {/* Pontos das cidades pulsando */}
      <group ref={dotsRef}>
        {cityPositions.map((c) => (
          <group key={c.name} position={c.position}>
            {/* Halo grande */}
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshBasicMaterial
                color={palette.dotHalo}
                transparent
                opacity={palette.dotHaloOpacity}
              />
            </mesh>
            {/* Núcleo */}
            <mesh>
              <sphereGeometry args={[0.022, 12, 12]} />
              <meshBasicMaterial color={palette.dotCore} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export function GlobeWireframe({
  variant = 'dark',
}: {
  variant?: GlobeVariant;
}) {
  const palette = PALETTES[variant];
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{
        background: 'transparent',
        /* Fade radial · centro do globo cheio, bordas esmaecem suave (atmosfera) */
        maskImage:
          'radial-gradient(circle at center, black 38%, rgba(0,0,0,0.55) 62%, transparent 95%)',
        WebkitMaskImage:
          'radial-gradient(circle at center, black 38%, rgba(0,0,0,0.55) 62%, transparent 95%)',
      }}
    >
      <ambientLight intensity={0.6} />
      <Suspense fallback={null}>
        <GlobeMesh palette={palette} />
      </Suspense>
    </Canvas>
  );
}
