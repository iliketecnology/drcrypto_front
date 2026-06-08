/** Mapa do Brasil estilizado para o Hero OprPay.
 *
 * Composição:
 * - Outline simplificado do Brasil em path SVG (reconhecível, não preciso)
 * - Grid de dots dentro do território (via pattern + clipPath)
 * - 10 cidades em coordenadas relativas, com pulse halo verde
 * - Linhas de fluxo animadas conectando capitais (gradient stroke + dash animation)
 *
 * ViewBox 1000×1000. Não é projeção cartográfica precisa — é representação
 * geográfica suficiente pra leitura "este é o Brasil" e foco em conexões. */

const CITIES = [
  { name: 'São Paulo', x: 555, y: 720, size: 7, primary: true },
  { name: 'Rio de Janeiro', x: 615, y: 695, size: 6, primary: true },
  { name: 'Brasília', x: 530, y: 590, size: 6, primary: true },
  { name: 'Belo Horizonte', x: 585, y: 650, size: 5 },
  { name: 'Salvador', x: 685, y: 510, size: 6 },
  { name: 'Recife', x: 745, y: 430, size: 5 },
  { name: 'Fortaleza', x: 690, y: 365, size: 5 },
  { name: 'Manaus', x: 350, y: 340, size: 5 },
  { name: 'Porto Alegre', x: 475, y: 830, size: 5 },
  { name: 'Curitiba', x: 515, y: 760, size: 4 },
];

const FLOW_LINKS: Array<[number, number]> = [
  [0, 1], // SP - RJ
  [0, 2], // SP - BSB
  [0, 3], // SP - BH
  [2, 7], // BSB - Manaus
  [2, 4], // BSB - Salvador
  [4, 5], // Salvador - Recife
  [5, 6], // Recife - Fortaleza
  [0, 9], // SP - Curitiba
  [9, 8], // Curitiba - POA
  [1, 3], // RJ - BH
];

// Outline simplificado · curvas suaves cobrem Amapá no NE, corcova do Nordeste,
// barriga Sudeste e ponta do RS no Sul. Não pretende precisão cartográfica.
const BR_OUTLINE =
  'M 268 248 ' +
  'Q 310 215 360 210 ' +
  'Q 400 195 445 205 ' +
  'Q 490 200 535 220 ' +
  'Q 575 225 610 245 ' +
  'Q 625 270 615 305 ' +
  'Q 645 315 680 340 ' +
  'Q 720 365 745 405 ' +
  'Q 775 445 785 495 ' +
  'Q 790 540 760 580 ' +
  'Q 735 615 710 645 ' +
  'Q 690 680 670 715 ' +
  'Q 650 745 625 770 ' +
  'Q 590 790 560 800 ' +
  'Q 530 815 505 825 ' +
  'Q 480 855 455 870 ' +
  'Q 425 880 405 855 ' +
  'Q 380 820 365 780 ' +
  'Q 350 740 335 695 ' +
  'Q 325 650 320 605 ' +
  'Q 305 560 290 515 ' +
  'Q 275 470 270 420 ' +
  'Q 260 370 255 320 ' +
  'Q 252 280 268 248 Z';

export function BrazilMap() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mapa do Brasil com cidades conectadas"
      className="w-full h-full"
    >
      <defs>
        {/* Pattern de dots que preenche o território */}
        <pattern
          id="opr-territory-dots"
          x="0"
          y="0"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="7" cy="7" r="1.1" fill="var(--color-green-300)" opacity="0.55" />
        </pattern>

        {/* ClipPath = forma do BR; dots só aparecem dentro */}
        <clipPath id="opr-br-clip">
          <path d={BR_OUTLINE} />
        </clipPath>

        {/* Radial pra halo das cidades */}
        <radialGradient id="opr-pulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-green-500)" stopOpacity="0.85" />
          <stop offset="55%" stopColor="var(--color-green-500)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-green-500)" stopOpacity="0" />
        </radialGradient>

        {/* Gradient pra linhas de fluxo (efeito caminhando) */}
        <linearGradient id="opr-flow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-green-500)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--color-green-700)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--color-green-500)" stopOpacity="0" />
        </linearGradient>

        <filter id="opr-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Dots dentro do território */}
      <rect
        x="0"
        y="0"
        width="1000"
        height="1000"
        fill="url(#opr-territory-dots)"
        clipPath="url(#opr-br-clip)"
      />

      {/* Outline do BR */}
      <path
        d={BR_OUTLINE}
        fill="none"
        stroke="var(--color-green-700)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <path
        d={BR_OUTLINE}
        fill="none"
        stroke="var(--color-green-500)"
        strokeWidth="0.6"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* Linhas de fluxo conectando capitais */}
      <g>
        {FLOW_LINKS.map(([fromIdx, toIdx], i) => {
          const a = CITIES[fromIdx];
          const b = CITIES[toIdx];
          // Curva sutil
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 - 12;
          return (
            <g key={`flow-${i}`}>
              <path
                d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                fill="none"
                stroke="var(--color-green-300)"
                strokeWidth="0.7"
                strokeDasharray="3 6"
                opacity="0.5"
              />
              <path
                d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                fill="none"
                stroke="url(#opr-flow)"
                strokeWidth="1.6"
                strokeDasharray="40 200"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="240;0"
                  dur={`${4 + (i % 3)}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </path>
            </g>
          );
        })}
      </g>

      {/* Cidades */}
      {CITIES.map((city) => (
        <g key={city.name}>
          <circle
            cx={city.x}
            cy={city.y}
            r={city.size * 3}
            fill="url(#opr-pulse)"
            filter="url(#opr-glow)"
          >
            <animate
              attributeName="r"
              values={`${city.size * 2.2};${city.size * 4.5};${city.size * 2.2}`}
              dur={city.primary ? '3.2s' : '4.5s'}
              repeatCount="indefinite"
              begin={`${(city.x + city.y) % 5}s`}
            />
            <animate
              attributeName="opacity"
              values="0.95;0.25;0.95"
              dur={city.primary ? '3.2s' : '4.5s'}
              repeatCount="indefinite"
              begin={`${(city.x + city.y) % 5}s`}
            />
          </circle>

          <circle
            cx={city.x}
            cy={city.y}
            r={city.size * 0.7}
            fill="var(--color-green-700)"
            stroke="var(--color-white)"
            strokeWidth="0.5"
          />
        </g>
      ))}
    </svg>
  );
}
