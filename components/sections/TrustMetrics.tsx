'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { CountUp } from '@/components/ui/CountUp';
import { LiveTimeMetric } from '@/components/ui/LiveTimeMetric';
import { WorldMap } from '@/components/illustrations/WorldMap';

const easeOut = [0.16, 1, 0.3, 1] as const;
const METRIC_KEYS = ['speed', 'max', 'unlimited', 'min'] as const;

export function TrustMetrics() {
  const t = useTranslations('trust');

  return (
    <section
      className="relative py-16 md:py-24 lg:py-28 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, #2a0548 0%, #150226 70%, #0a0114 100%)',
      }}
    >
      {/* Mapa-múndi line-art · atmosfera de fundo (variante dark pra emergir
       * do violeta escuro). BR centralizado, fluxos globais entrando no hub.
       * Esmaecido pra não competir com as métricas em primeiro plano. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.45]"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '1900px', height: '950px' }}
        >
          <WorldMap variant="dark" />
        </div>
      </div>

      {/* Halo verde radial sutil no centro */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, var(--color-green-500) 0%, transparent 60%)',
        }}
      />

      {/* Grain mais forte em fundo escuro */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23a)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="container-app relative">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="max-w-[60ch] mb-12 lg:mb-16"
        >
          <span
            className="eyebrow block"
            style={{ color: 'var(--color-green-300)' }}
          >
            {t('eyebrow')}
          </span>
          <h2
            className="display-lg mt-4 max-w-[18ch]"
            style={{ color: 'white' }}
          >
            {t('title')}
          </h2>
        </motion.header>

        {/* Toolbar de status acima da grid · texto longo só em ≥sm. */}
        <div
          className="flex items-center justify-between gap-4 pb-5 mb-8 lg:mb-10 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <span
            className="hidden sm:inline text-[11px] font-semibold tracking-wider uppercase"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Métricas operacionais
          </span>
          <div className="inline-flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--color-green-300)',
                boxShadow: '0 0 10px var(--color-green-300)',
                animation: 'usp-live-blink 1.4s infinite',
              }}
            />
            <span
              className="text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              <span className="hidden sm:inline">Live · atualizado em tempo real</span>
              <span className="sm:hidden">Live</span>
            </span>
          </div>
          <style>{`
            @keyframes usp-live-blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.35; }
            }
          `}</style>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-x-4 lg:gap-y-14">
          {METRIC_KEYS.map((key, i) => (
            <Metric
              key={key}
              metricKey={key}
              value={t(`metrics.${key}.value`)}
              label={t(`metrics.${key}.label`)}
              delay={i * 0.12}
              isLast={i === METRIC_KEYS.length - 1}
            />
          ))}
        </div>

        <p
          className="text-xs mt-12 lg:mt-16 max-w-3xl"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {t('footnote')}
        </p>
      </div>
    </section>
  );
}

function Metric({
  metricKey,
  value,
  label,
  delay,
  isLast,
}: {
  metricKey: string;
  value: string;
  label: string;
  delay: number;
  isLast: boolean;
}) {
  const numberStyle: React.CSSProperties = {
    fontSize: 'clamp(1.75rem, 2.6vw, 2.75rem)',
    color: 'white',
    fontWeight: 800,
    letterSpacing: '-0.035em',
    lineHeight: '1',
    textShadow: '0 0 24px rgba(157, 43, 237, 0.25)',
    whiteSpace: 'nowrap',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: easeOut, delay }}
      className="
        relative flex flex-col gap-2 min-w-0
        rounded-2xl border px-5 py-5
        bg-white/[0.035] border-white/10 backdrop-blur-sm
        lg:rounded-none lg:border-0 lg:bg-transparent lg:backdrop-blur-none
        lg:px-0 lg:py-0 lg:pr-6 lg:gap-3
      "
    >
      {!isLast && (
        <span
          aria-hidden
          className="hidden lg:block absolute right-0 top-2 bottom-2 w-px"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        />
      )}

      {metricKey === 'speed' ? (
        <LiveTimeMetric className="mono-num block" style={numberStyle} />
      ) : (
        <CountUp value={value} className="mono-num block" style={numberStyle} />
      )}

      <p
        className="text-[12.5px] leading-snug mt-1 lg:mt-2"
        style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}
      >
        {label}
      </p>
    </motion.div>
  );
}
