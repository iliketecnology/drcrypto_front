'use client';

import { useMemo } from 'react';
import { feature } from 'topojson-client';
import { geoEquirectangular, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import worldData from 'world-atlas/countries-110m.json';

/** Outline line-art world map · paths reais via topojson + d3-geo.
 *
 * Projeção: Natural Earth (Robinson-like) · mais bonita visualmente que
 * Mercator (poupa Antártica/Groenlândia exageradas). ViewBox dimensionado
 * pra mostrar o globo todo. BR destacado em verde escuro. Capitais
 * financeiras como pontos pulsantes. Flow lines curvas saindo delas
 * entrando em Brasília. */

const VIEWBOX_W = 1600;
const VIEWBOX_H = 800;

// ISO 3166-1 numeric codes
const BRAZIL_ID = '076';

type CountryProps = { name?: string };

const CAPITALS = [
  { name: 'NYC', lat: 40.7, lng: -74, primary: true },
  { name: 'Londres', lat: 51.5, lng: -0.1, primary: true },
  { name: 'Berlim', lat: 52.5, lng: 13.4 },
  { name: 'Dubai', lat: 25.2, lng: 55.3 },
  { name: 'Mumbai', lat: 19.1, lng: 72.9 },
  { name: 'Cingapura', lat: 1.4, lng: 103.8 },
  { name: 'Hong Kong', lat: 22.3, lng: 114.2 },
  { name: 'Tóquio', lat: 35.7, lng: 139.7, primary: true },
  { name: 'México DF', lat: 19.4, lng: -99.1 },
  { name: 'Buenos Aires', lat: -34.6, lng: -58.4 },
];

const BR_CITIES = [
  { name: 'São Paulo', lat: -23.5, lng: -46.6, primary: true },
  { name: 'Rio de Janeiro', lat: -22.9, lng: -43.2 },
  { name: 'Brasília', lat: -15.8, lng: -47.9 },
  { name: 'Salvador', lat: -12.9, lng: -38.5 },
  { name: 'Fortaleza', lat: -3.7, lng: -38.5 },
  { name: 'Manaus', lat: -3.1, lng: -60 },
  { name: 'Porto Alegre', lat: -30, lng: -51.2 },
];

const BR_HUB = { lat: -15.8, lng: -47.9 };

function curvedPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
  liftFactor = 0.3,
): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return '';
  const nx = -dy / len;
  const ny = dx / len;
  const lift = len * liftFactor;
  const sign = ny < 0 ? 1 : -1;
  const cx = mx + nx * lift * sign;
  const cy = my + ny * lift * sign;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

/** `variant` adapta a paleta ao fundo:
 *  - 'light' (default) → fundo branco (Hero original): contornos sutis em
 *    roxo claro, núcleos de cidade escuros com anel branco.
 *  - 'dark' → fundo violeta escuro (Trust Metrics): contornos clareados e
 *    mais opacos pra emergir do escuro, núcleos claros com anel escuro. */
export function WorldMap({
  variant = 'light',
}: {
  variant?: 'light' | 'dark';
} = {}) {
  const isDark = variant === 'dark';

  // Paleta dependente do fundo. Os gradientes de pulse (defs) continuam em
  // roxo de marca e funcionam nos dois fundos; só os contornos e núcleos
  // sólidos precisam inverter contraste.
  const countryFill = isDark ? 'var(--color-green-300)' : 'var(--color-green-100)';
  const countryFillOpacity = isDark ? 0.07 : 0.28;
  const countryStrokeOpacity = isDark ? 0.55 : 0.5;
  const brFillOpacity = isDark ? 0.22 : 0.32;
  const capCore = isDark ? 'var(--color-green-100)' : 'var(--color-green-700)';
  const brCore = isDark ? 'var(--color-green-300)' : 'var(--color-green-900)';
  const coreStroke = isDark ? 'var(--color-green-900)' : 'var(--color-white)';

  const { countryPaths, project } = useMemo(() => {
    const topology = worldData as unknown as Topology;
    const collection = feature(
      topology,
      topology.objects.countries,
    ) as unknown as FeatureCollection<
      GeoJSON.Geometry,
      CountryProps & { id?: string }
    >;

    // Projeção equirectangular rotacionada -50° pra colocar o Brasil
    // (~-50°W) no CENTRO horizontal do viewBox. Quando o container do
    // hero cortar nas laterais, o foco permanece no Brasil.
    const projection = geoEquirectangular()
      .rotate([50, 0, 0])
      .fitWidth(VIEWBOX_W - 20, { type: 'Sphere' } as never);
    const [tx] = projection.translate();
    projection.translate([tx, VIEWBOX_H / 2]);
    const pathGen = geoPath(projection);

    const paths = collection.features
      .map((f, idx) => {
        const rawId = String(
          (f as Feature & { id?: string | number }).id ?? '',
        ).padStart(3, '0');
        const id = `${rawId}-${idx}`;
        const d = pathGen(f) ?? '';
        return { id, rawId, d };
      })
      .filter((p) => p.d.length > 0);

    const project = (lng: number, lat: number) => {
      const [x, y] = projection([lng, lat]) ?? [0, 0];
      return { x, y };
    };

    return { countryPaths: paths, project };
  }, []);

  const capitalsXY = useMemo(
    () => CAPITALS.map((c) => ({ ...c, ...project(c.lng, c.lat) })),
    [project],
  );
  const brCitiesXY = useMemo(
    () => BR_CITIES.map((c) => ({ ...c, ...project(c.lng, c.lat) })),
    [project],
  );
  const brHubXY = useMemo(() => project(BR_HUB.lng, BR_HUB.lat), [project]);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mapa mundial · fluxos USDT entrando no Brasil"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="opr-cap-pulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-green-500)" stopOpacity="0.85" />
          <stop offset="55%" stopColor="var(--color-green-500)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-green-500)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="opr-br-pulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-green-700)" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--color-green-700)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-green-700)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="opr-inflow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-green-500)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--color-green-700)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-green-900)" stopOpacity="0" />
        </linearGradient>
        <filter id="opr-map-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Países · outline line-art muito sutil pra não brigar com o texto */}
      <g>
        {countryPaths.map((c) =>
          c.rawId === BRAZIL_ID ? null : (
            <path
              key={c.id}
              d={c.d}
              fill={countryFill}
              fillOpacity={countryFillOpacity}
              stroke="var(--color-green-300)"
              strokeWidth="0.5"
              strokeOpacity={countryStrokeOpacity}
              strokeLinejoin="round"
            />
          ),
        )}
      </g>

      {/* Brasil · destacado sutil */}
      <g>
        {countryPaths
          .filter((c) => c.rawId === BRAZIL_ID)
          .map((c) => (
            <path
              key={c.id}
              d={c.d}
              fill="var(--color-green-500)"
              fillOpacity={brFillOpacity}
              stroke="var(--color-green-700)"
              strokeWidth="0.7"
              strokeOpacity="0.7"
              strokeLinejoin="round"
            />
          ))}
      </g>

      {/* Linhas de fluxo · capitais globais → hub BR */}
      <g>
        {capitalsXY.map((cap, i) => {
          const d = curvedPath(cap, brHubXY, 0.32);
          if (!d) return null;
          const delay = i * 0.55;
          return (
            <g key={`flow-${cap.name}`}>
              <path
                d={d}
                fill="none"
                stroke="var(--color-green-300)"
                strokeWidth="0.7"
                strokeDasharray="2 6"
                opacity="0.4"
              />
              <path
                d={d}
                fill="none"
                stroke="url(#opr-inflow)"
                strokeWidth="1.5"
                strokeDasharray="50 220"
                strokeLinecap="round"
                opacity="0"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="360;0"
                  dur="6s"
                  repeatCount="indefinite"
                  begin={`${delay}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.15;0.82;1"
                  dur="6s"
                  repeatCount="indefinite"
                  begin={`${delay}s`}
                />
              </path>
            </g>
          );
        })}
      </g>

      {/* Linhas internas BR */}
      <g>
        {[
          [brCitiesXY[0], brCitiesXY[1]],
          [brCitiesXY[0], brCitiesXY[2]],
          [brCitiesXY[2], brCitiesXY[3]],
          [brCitiesXY[0], brCitiesXY[6]],
        ].map(([a, b], i) => {
          if (!a || !b) return null;
          const d = curvedPath(a, b, 0.18);
          if (!d) return null;
          return (
            <g key={`brflow-${i}`}>
              <path
                d={d}
                fill="none"
                stroke="var(--color-green-500)"
                strokeWidth="0.9"
                strokeDasharray="28 140"
                strokeLinecap="round"
                opacity="0"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="192;0"
                  dur="4s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.75;0.75;0"
                  keyTimes="0;0.18;0.8;1"
                  dur="4s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </path>
            </g>
          );
        })}
      </g>

      {/* Cidades globais · origens dos fluxos · pulses menores */}
      {capitalsXY.map((cap) => (
        <g key={`cap-${cap.name}`} opacity="0.75">
          <circle
            cx={cap.x}
            cy={cap.y}
            r={cap.primary ? 11 : 8}
            fill="url(#opr-cap-pulse)"
            filter="url(#opr-map-glow)"
          >
            <animate
              attributeName="r"
              values={cap.primary ? '7;15;7' : '5;11;5'}
              dur={cap.primary ? '3.2s' : '4.5s'}
              repeatCount="indefinite"
              begin={`${Math.abs((cap.x + cap.y) % 4)}s`}
            />
            <animate
              attributeName="opacity"
              values="0.85;0.2;0.85"
              dur={cap.primary ? '3.2s' : '4.5s'}
              repeatCount="indefinite"
              begin={`${Math.abs((cap.x + cap.y) % 4)}s`}
            />
          </circle>
          <circle
            cx={cap.x}
            cy={cap.y}
            r={cap.primary ? 2.8 : 2.2}
            fill={capCore}
            stroke={coreStroke}
            strokeWidth="1"
          />
        </g>
      ))}

      {/* Cidades BR · destinos · pulses menores */}
      {brCitiesXY.map((c) => (
        <g key={`br-${c.name}`} opacity="0.8">
          <circle
            cx={c.x}
            cy={c.y}
            r={c.primary ? 8 : 6}
            fill="url(#opr-br-pulse)"
            filter="url(#opr-map-glow)"
          >
            <animate
              attributeName="r"
              values={c.primary ? '5;10;5' : '3.5;7.5;3.5'}
              dur={c.primary ? '2.8s' : '3.8s'}
              repeatCount="indefinite"
              begin={`${Math.abs((c.x + c.y) % 3)}s`}
            />
            <animate
              attributeName="opacity"
              values="0.85;0.25;0.85"
              dur={c.primary ? '2.8s' : '3.8s'}
              repeatCount="indefinite"
              begin={`${Math.abs((c.x + c.y) % 3)}s`}
            />
          </circle>
          <circle
            cx={c.x}
            cy={c.y}
            r={c.primary ? 2.4 : 1.9}
            fill={brCore}
            stroke={coreStroke}
            strokeWidth="0.8"
          />
        </g>
      ))}
    </svg>
  );
}
