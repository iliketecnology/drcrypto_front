/** Logos das chains USDT — interpretações fiéis das marcas oficiais,
 * desenhadas inline pra evitar problemas de copyright/licença. */

export type ChainKey = 'tron' | 'ethereum' | 'polygon' | 'solana';

export const CHAIN_COLORS: Record<ChainKey, string> = {
  tron: '#FF060A',
  ethereum: '#627EEA',
  polygon: '#6C00F6',
  solana: '#14F195',
};

export function ChainLogo({
  chain,
  size = 48,
  className,
  white = false,
}: {
  chain: ChainKey;
  size?: number;
  className?: string;
  /** Variante branca (usar em fundos coloridos da própria chain) */
  white?: boolean;
}) {
  switch (chain) {
    case 'tron':
      return <TronLogo size={size} className={className} />;
    case 'ethereum':
      return <EthereumLogo size={size} className={className} />;
    case 'polygon':
      return <PolygonLogo size={size} className={className} white={white} />;
    case 'solana':
      return <SolanaLogo size={size} className={className} />;
  }
}

function TronLogo({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tron TRC20"
      className={className}
    >
      <circle cx="32" cy="32" r="32" fill="#FF060A" />
      {/* Triângulo Tron · 3 vértices + linhas internas conectando */}
      <g
        fill="white"
        stroke="white"
        strokeWidth="0.8"
        strokeLinejoin="round"
      >
        <path d="M 13 19 L 52 23 L 35 50 Z" fill="white" opacity="0.95" />
        {/* Linhas internas marcadas (sombras pra dar profundidade) */}
        <path
          d="M 13 19 L 35 50"
          stroke="#FF060A"
          strokeWidth="1.2"
          opacity="0.55"
          fill="none"
        />
        <path
          d="M 52 23 L 35 50"
          stroke="#FF060A"
          strokeWidth="1"
          opacity="0.35"
          fill="none"
        />
        <path
          d="M 32 32 L 13 19"
          stroke="#FF060A"
          strokeWidth="0.7"
          opacity="0.3"
          fill="none"
        />
        <path
          d="M 32 32 L 52 23"
          stroke="#FF060A"
          strokeWidth="0.7"
          opacity="0.3"
          fill="none"
        />
        <path
          d="M 32 32 L 35 50"
          stroke="#FF060A"
          strokeWidth="0.7"
          opacity="0.3"
          fill="none"
        />
      </g>
    </svg>
  );
}

function EthereumLogo({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ethereum ERC20"
      className={className}
    >
      <circle cx="32" cy="32" r="32" fill="#627EEA" />
      {/* Diamante Ethereum · 6 faces (clássico) */}
      <g fill="white" fillRule="evenodd">
        {/* Metade superior */}
        <path d="M 32 10 L 32 26.5 L 46 33 Z" opacity="0.6" />
        <path d="M 32 10 L 32 26.5 L 18 33 Z" opacity="1" />
        {/* Centro horizontal */}
        <path d="M 18 33 L 32 41 L 46 33 L 32 26.5 Z" opacity="0.8" />
        {/* Metade inferior */}
        <path d="M 32 44 L 32 54 L 46 35.5 Z" opacity="0.45" />
        <path d="M 32 44 L 32 54 L 18 35.5 Z" opacity="0.8" />
      </g>
    </svg>
  );
}

function PolygonLogo({
  size,
  className,
  white,
}: {
  size: number;
  className?: string;
  white?: boolean;
}) {
  return (
    <img
      src={white ? '/brand/polygon-white.png' : '/brand/polygon.png'}
      alt="Polygon"
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}

function SolanaLogo({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Solana"
      className={className}
    >
      <defs>
        <linearGradient id="usp-sol-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#usp-sol-bg)" />
      {/* 3 barras paralelas em diagonal · símbolo Solana 100% branco */}
      <g fill="white">
        <path d="M 19 24 L 41 24 L 45.5 19 L 23.5 19 Z" />
        <path d="M 23.5 35 L 45.5 35 L 41 30 L 19 30 Z" />
        <path d="M 19 46 L 41 46 L 45.5 41 L 23.5 41 Z" />
      </g>
    </svg>
  );
}
