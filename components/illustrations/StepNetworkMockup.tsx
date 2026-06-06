'use client';

/** Mockup step 1 · seleção de rede USDT com cursor animado em loop.
 *
 * Layout vertical:
 *   ┌──────────────────┐
 *   │  [chain] Polygon │   <-- card da rede Polygon (rede única)
 *   └──────────────────┘
 *           ↑↓
 *        🖱 cursor                  <-- posição idle (logo abaixo do card)
 *
 * Timeline (cycle ≈ 3.5s):
 *   0.0s · idle    — cursor parado abaixo do card
 *   1.8s · rising  — cursor sobe até o card
 *   2.5s · click   — micro animação (scale 0.78), card já flipa pra outra rede
 *   2.8s · falling — cursor desce pra posição idle
 *   3.5s · idle    — loop
 *
 * Trigger: IntersectionObserver com threshold 0.35 — só roda no viewport. */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChainLogo, CHAIN_COLORS } from './ChainLogo';

type Net = 'polygon';
type Phase = 'idle' | 'rising' | 'clicking' | 'falling';

const PHASE_DURATIONS: Record<Phase, number> = {
  idle: 1800,
  rising: 700,
  clicking: 300,
  falling: 700,
};

const CURSOR_Y_IDLE = 38;
const CURSOR_Y_ON_CARD = -4;

export function StepNetworkMockup() {
  const selected: Net = 'polygon';
  const [phase, setPhase] = useState<Phase>('idle');
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

  // State machine sequencial · cada phase agenda a próxima via setTimeout.
  useEffect(() => {
    if (!running) return;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    function step(current: Phase) {
      if (cancelled) return;
      setPhase(current);
      const next: Phase =
        current === 'idle'
          ? 'rising'
          : current === 'rising'
            ? 'clicking'
            : current === 'clicking'
              ? 'falling'
              : 'idle';
      timeoutId = setTimeout(() => step(next), PHASE_DURATIONS[current]);
    }

    step('idle');

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [running]);

  const cursorY = phase === 'idle' || phase === 'falling' ? 18 : -28;
  const cursorScale = phase === 'clicking' ? 0.78 : 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[200px] flex flex-col items-center"
    >
      {/* Card da rede Polygon */}
      <NetCard chain={selected} />

      {/* Cursor · posição relativa logo abaixo do card.
       * y=18 idle (abaixo do card), y=-28 rising/clicking (em cima do card). */}
      <motion.div
        aria-hidden
        className="relative pointer-events-none"
        style={{ marginTop: 6 }}
        initial={false}
        animate={{ y: cursorY, scale: cursorScale }}
        transition={{
          y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          scale: { duration: 0.18, ease: 'easeOut' },
        }}
      >
        <CursorIcon />
      </motion.div>
    </div>
  );
}

function NetCard({ chain }: { chain: Net }) {
  return (
    <motion.div
      key={chain}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-xl border-2 px-3 py-2.5 flex items-center gap-2.5 bg-white"
      style={{
        borderColor: CHAIN_COLORS[chain],
        boxShadow: `0 0 0 3px ${CHAIN_COLORS[chain]}1a`,
      }}
    >
      <ChainLogo chain={chain} size={26} />
      <div className="flex-1 min-w-0">
        <p
          className="mono-num text-[8px] font-bold tracking-wider uppercase"
          style={{ color: CHAIN_COLORS[chain] }}
        >
          USDT.POL
        </p>
        <p className="text-[12px] font-semibold text-ink-900 leading-tight">
          Polygon
        </p>
      </div>
      <span
        className="w-4 h-4 rounded-full grid place-items-center text-white text-[8px] font-bold shrink-0"
        style={{ background: CHAIN_COLORS[chain] }}
        aria-hidden
      >
        ✓
      </span>
    </motion.div>
  );
}

/** Cursor arrow estilo macOS · branco com contorno preto.
 * Ponta no canto superior esquerdo (orientação natural). */
function CursorIcon() {
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
    >
      <path
        d="M3 2 L3 18 L7.5 14.5 L10.2 20 L13 18.7 L10.3 13.5 L16 13.5 Z"
        fill="white"
        stroke="#0b0e16"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
