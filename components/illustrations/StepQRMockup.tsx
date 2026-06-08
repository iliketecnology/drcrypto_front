'use client';

/** Mockup step 2 · QR Code estilizado + countdown LIVE.
 * Countdown só começa quando o mockup entra no viewport (IntersectionObserver),
 * evitando timer rodando à toa em seções fora da tela. */

import { useEffect, useRef, useState } from 'react';
import { USDTLogo } from './BrandLogos';

const COUNTDOWN_START_SECONDS = 15 * 60;

export function StepQRMockup() {
  const [seconds, setSeconds] = useState(COUNTDOWN_START_SECONDS);
  const [running, setRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || running) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRunning(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : COUNTDOWN_START_SECONDS));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3">
      <div
        className="relative w-[110px] h-[110px] rounded-xl bg-white grid place-items-center p-3"
        style={{ boxShadow: '0 4px 16px rgba(91, 33, 182,0.1)' }}
      >
        <QRGrid />
        {/* Logo USDT central */}
        <div
          className="absolute inset-0 grid place-items-center pointer-events-none"
          aria-hidden
        >
          <div
            className="rounded-full grid place-items-center bg-white"
            style={{
              width: 26,
              height: 26,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <USDTLogo size={22} />
          </div>
        </div>
      </div>
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
        style={{
          background: 'var(--color-green-100)',
          color: 'var(--color-green-900)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'var(--color-green-700)',
            animation: 'opr-blink 1.4s infinite',
          }}
        />
        Expira em <span className="mono-num" style={{ marginLeft: 2 }}>{mm}:{ss}</span>
      </div>
      <style>{`
        @keyframes opr-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function QRGrid() {
  // 11x11 grid de quadradinhos pretos/verdes pra simular QR Code (placeholder visual)
  const cells: Array<{ x: number; y: number; on: boolean }> = [];
  const SIZE = 11;
  // Pattern semi-aleatório mas determinístico
  const seed = (x: number, y: number) =>
    Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      cells.push({ x, y, on: (seed(x, y) - Math.floor(seed(x, y))) > 0.5 });
    }
  }
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${SIZE}, 1fr)`,
        gap: '1px',
        width: '88px',
        height: '88px',
      }}
      aria-hidden
    >
      {cells.map((c, i) => (
        <span
          key={i}
          style={{
            background: c.on
              ? 'var(--color-green-900)'
              : 'transparent',
            borderRadius: '0.5px',
          }}
        />
      ))}
      {/* Cantos do QR (finder patterns) */}
      <FinderCorner x={0} y={0} />
      <FinderCorner x={SIZE - 3} y={0} />
      <FinderCorner x={0} y={SIZE - 3} />
    </div>
  );
}

function FinderCorner({ x, y }: { x: number; y: number }) {
  return (
    <span
      style={{
        gridColumn: `${x + 1} / span 3`,
        gridRow: `${y + 1} / span 3`,
        background: 'var(--color-green-900)',
        border: '1.5px solid var(--color-white)',
        boxShadow: 'inset 0 0 0 1.5px var(--color-green-900), inset 0 0 0 3px var(--color-white)',
      }}
      aria-hidden
    />
  );
}
