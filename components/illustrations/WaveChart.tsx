'use client';

/** Gráfico de ondas decorativo · SVG path animado se desenhando.
 * Simula a "linha de tempo" do PIX caindo — sobe e estabiliza em segundos. */

import { motion } from 'motion/react';

const WAVE_PATH =
  'M 0 100 ' +
  'Q 40 90 80 80 ' +
  'T 160 50 ' +
  'Q 200 35 240 30 ' +
  'T 320 18 ' +
  'L 400 12 ' +
  'L 400 120 ' +
  'L 0 120 Z';

const LINE_PATH =
  'M 0 100 ' +
  'Q 40 90 80 80 ' +
  'T 160 50 ' +
  'Q 200 35 240 30 ' +
  'T 320 18 ' +
  'L 400 12';

export function WaveChart() {
  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="usp-wave-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-green-300)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--color-green-300)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="usp-wave-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-green-700)" />
            <stop offset="100%" stopColor="var(--color-green-500)" />
          </linearGradient>
        </defs>

        {/* Linhas de grid sutis */}
        <g stroke="var(--color-ink-200)" strokeWidth="0.5" opacity="0.5">
          <line x1="0" y1="30" x2="400" y2="30" strokeDasharray="2 4" />
          <line x1="0" y1="60" x2="400" y2="60" strokeDasharray="2 4" />
          <line x1="0" y1="90" x2="400" y2="90" strokeDasharray="2 4" />
        </g>

        {/* Preenchimento gradient da onda */}
        <motion.path
          d={WAVE_PATH}
          fill="url(#usp-wave-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.3 }}
        />

        {/* Linha principal sendo desenhada */}
        <motion.path
          d={LINE_PATH}
          fill="none"
          stroke="url(#usp-wave-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Pontos chave na linha */}
        {[
          { x: 80, y: 80 },
          { x: 240, y: 30 },
          { x: 400, y: 12 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--color-green-700)"
            stroke="var(--color-white)"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.4 }}
          />
        ))}
      </svg>

      {/* Label "PIX 11.8s" como elemento HTML absoluto · não distorce com o SVG
       * que tem preserveAspectRatio="none" (necessário pro path da onda esticar). */}
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 2 }}
        className="
          absolute top-0 right-0
          inline-flex items-center
          px-2 py-0.5 rounded-full
          text-[10px] font-bold tracking-tight
          mono-num text-white whitespace-nowrap
        "
        style={{
          background: 'var(--color-green-700)',
          boxShadow: '0 2px 8px rgba(91, 33, 182,0.25)',
        }}
      >
        PIX 11.8s
      </motion.span>
    </div>
  );
}
