'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { WaveChart } from '@/components/illustrations/WaveChart';
import { PIXLogo } from '@/components/illustrations/BrandLogos';
import { ChainLogo, type ChainKey } from '@/components/illustrations/ChainLogo';
import { CTAButton } from '@/components/wizard/CTAButton';
import { useLiveAverageTime } from '@/lib/liveAverageTime';

const easeOut = [0.16, 1, 0.3, 1] as const;
// rede única suportada · Polygon
type _ChainKeyUnused = ChainKey;

export function Differentials() {
  const t = useTranslations('differentials');
  const liveSeconds = useLiveAverageTime();

  return (
    <section
      id="differentials"
      className="relative py-16 md:py-24 lg:py-28 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, var(--color-white) 0%, var(--color-off-white) 100%)',
      }}
    >
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, var(--color-green-100) 0%, transparent 60%)',
        }}
      />

      <div className="container-app relative">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="max-w-3xl mx-auto text-center mb-12 lg:mb-16"
        >
          <span className="eyebrow">06 VANTAGENS</span>
          <h2 className="display-lg mt-4">{t('title')}</h2>
          <p className="body-lg mt-6">{t('sub')}</p>
        </motion.header>

        <div className="grid grid-cols-12 gap-4 auto-rows-[180px]">
          {/* Card flagship · PIX em segundos */}
          <FloatingCard
            className="col-span-12 md:col-span-7 row-span-2"
            delay={0}
          >
            <div className="relative h-full p-7 flex flex-col">
              <span className="mono-num text-[11px] tracking-wider text-green-700 font-bold uppercase">
                01 · FLAGSHIP
              </span>
              <h3
                className="mt-3"
                style={{
                  fontSize: 'clamp(2.25rem, 3.4vw, 3rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.02,
                  color: 'var(--color-ink-900)',
                }}
              >
                {t('cards.instant.title')}
              </h3>
              <p
                className="mt-3 max-w-[42ch]"
                style={{ fontSize: '15px', lineHeight: 1.55, color: 'var(--color-ink-700)' }}
              >
                {t('cards.instant.body')}
              </p>

              <div className="flex-1 relative mt-3 -mx-2 min-h-0">
                <WaveChart />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="mono-num inline-flex items-baseline"
                      style={{
                        fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
                        color: 'var(--color-green-700)',
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={liveSeconds}
                          initial={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          style={{ display: 'inline-block' }}
                        >
                          {liveSeconds}
                        </motion.span>
                      </AnimatePresence>
                      <span>s</span>
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-ink-500)' }}>
                      médio
                    </span>
                  </div>
                  <span aria-hidden className="text-ink-300">·</span>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="mono-num"
                      style={{
                        fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
                        color: 'var(--color-green-700)',
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      30s
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-ink-500)' }}>
                      máx
                    </span>
                  </div>
                </div>
                <CTAButton variant="ghost" size="sm">
                  Testar
                </CTAButton>
              </div>
            </div>
          </FloatingCard>

          {/* Card 100% PIX Bacen */}
          <FloatingCard
            className="col-span-12 md:col-span-5 row-span-1"
            delay={0.1}
          >
            <div className="relative h-full p-6 flex items-center gap-4">
              <div
                className="shrink-0 w-16 h-16 rounded-2xl grid place-items-center"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-green-700), var(--color-green-900))',
                  boxShadow: '0 6px 18px rgba(91, 33, 182, 0.18)',
                }}
              >
                <PIXLogo size={42} />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  style={{
                    fontSize: 'clamp(1.75rem, 2.4vw, 2.125rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.02,
                    color: 'var(--color-ink-900)',
                  }}
                >
                  {t('cards.secure.title')}
                </h3>
                <p
                  className="mt-2"
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: 'var(--color-ink-700)',
                  }}
                >
                  {t('cards.secure.body')}
                </p>
              </div>
            </div>
          </FloatingCard>

          {/* Card Funciona 24/7 · accent escuro com relógio */}
          <FloatingCard
            className="col-span-6 md:col-span-3 row-span-1"
            delay={0.2}
            variant="accent"
          >
            <div className="relative h-full p-5 flex flex-col justify-between">
              <ClockIcon />
              <div>
                <h3
                  style={{
                    fontSize: 'clamp(1.5rem, 1.9vw, 1.875rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.02,
                    color: 'var(--color-white)',
                  }}
                >
                  {t('cards.always.title')}
                </h3>
                <p
                  style={{
                    fontSize: '11.5px',
                    lineHeight: 1.45,
                    color: 'rgba(255,255,255,0.72)',
                    marginTop: 6,
                  }}
                >
                  {t('cards.always.body')}
                </p>
              </div>
            </div>
          </FloatingCard>

          {/* Card Polygon · branco com borda roxa */}
          <FloatingCard
            className="col-span-6 md:col-span-2 row-span-1"
            delay={0.3}
            variant="dual-network"
          >
            <div className="relative h-full p-4 flex flex-col justify-end overflow-hidden">
              {/* Logo no canto superior direito */}
              <div
                aria-hidden
                className="absolute top-3 right-3 pointer-events-none flex items-center"
              >
                <div
                  style={{
                    filter: 'drop-shadow(0 2px 6px rgba(108,0,246,0.3))',
                  }}
                >
                  <ChainLogo chain="polygon" size={34} />
                </div>
              </div>
              <div className="relative max-w-[80%]">
                <h3
                  style={{
                    fontSize: 'clamp(1.125rem, 1.55vw, 1.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.02,
                    color: 'var(--color-ink-900)',
                  }}
                >
                  {t('cards.networks.title')}
                </h3>
              </div>
            </div>
          </FloatingCard>

          {/* Card Taxa fixa */}
          <FloatingCard
            className="col-span-12 md:col-span-5 row-span-1"
            delay={0.4}
          >
            <div className="relative h-full p-5 flex items-center gap-4">
              <div
                className="shrink-0 w-12 h-12 rounded-2xl grid place-items-center"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-green-100), var(--color-green-300))',
                }}
              >
                <span
                  className="mono-num"
                  style={{
                    color: 'var(--color-green-900)',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                  }}
                >
                  $
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  style={{
                    fontSize: 'clamp(1.75rem, 2.4vw, 2.125rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.02,
                    color: 'var(--color-ink-900)',
                  }}
                >
                  {t('cards.fee.title')}
                </h3>
                <p
                  className="mt-2"
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: 'var(--color-ink-700)',
                  }}
                >
                  {t('cards.fee.body')}
                </p>
              </div>
            </div>
          </FloatingCard>

          {/* Card Sem cadastro, sem KYC.
           * Mobile: título → body → chips embaixo (mais natural na leitura).
           * Desktop ≥sm: chips à esquerda em coluna + texto à direita. */}
          <FloatingCard
            className="col-span-12 md:col-span-7 row-span-1"
            delay={0.5}
          >
            <div className="relative h-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="hidden sm:flex sm:flex-col gap-1.5 shrink-0">
                <KycChip label="SEM CADASTRO" />
                <KycChip label="SEM BUROCRACIA" />
                <KycChip label="SUA CARTEIRA" />
              </div>
              <div className="min-w-0 flex-1 order-1 sm:order-none">
                <h3
                  style={{
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.375rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.02,
                    color: 'var(--color-ink-900)',
                  }}
                >
                  {t('cards.noKyc.title')}
                </h3>
                <p
                  className="mt-2 max-w-[46ch]"
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: 'var(--color-ink-700)',
                  }}
                >
                  {t('cards.noKyc.body')}
                </p>
              </div>
              <div className="flex sm:hidden flex-nowrap gap-1.5 order-2">
                <KycChip label="SEM CADASTRO" compact />
                <KycChip label="SEM BUROCRACIA" compact />
                <KycChip label="SUA CARTEIRA" compact />
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  children,
  className = '',
  delay,
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  variant?: 'default' | 'accent' | 'polygon' | 'dual-network';
}) {
  const styleAccent: React.CSSProperties =
    variant === 'accent'
      ? {
          background:
            'linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)',
          boxShadow: '0 12px 32px rgba(91, 33, 182, 0.25)',
        }
      : variant === 'polygon'
        ? {
            background:
              'linear-gradient(135deg, #8347FF 0%, #4A00A8 100%)',
            boxShadow: '0 12px 32px rgba(108, 0, 246, 0.28)',
          }
        : {};

  // Card branco com borda gradiente roxa (rede Polygon) ·
  // implementação via "padding box" technique (background-clip + dois layers).
  if (variant === 'dual-network') {
    return (
      <motion.article
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.55, ease: easeOut, delay }}
        className={`
          ${className}
          relative rounded-3xl overflow-hidden
          transition-shadow duration-300
          hover:shadow-lift
        `}
        style={{
          background:
            'linear-gradient(white, white) padding-box, linear-gradient(135deg, #6C00F6 0%, #9d2bed 100%) border-box',
          border: '2px solid transparent',
          boxShadow: '0 10px 30px rgba(108,0,246,0.16)',
        }}
      >
        {children}
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, ease: easeOut, delay }}
      className={`
        ${variant === 'default' ? 'bg-white border border-ink-200 shadow-pop' : 'shadow-lift'}
        ${className}
        relative rounded-3xl overflow-hidden
        transition-shadow duration-300
        hover:shadow-lift
      `}
      style={styleAccent}
    >
      {children}
    </motion.article>
  );
}

function ClockIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="19"
        cy="19"
        r="17"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.8"
      />
      {/* Marcações horárias */}
      <g stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round">
        <line x1="19" y1="5" x2="19" y2="8" />
        <line x1="19" y1="30" x2="19" y2="33" />
        <line x1="5" y1="19" x2="8" y2="19" />
        <line x1="30" y1="19" x2="33" y2="19" />
      </g>
      {/* Ponteiros */}
      <line
        x1="19"
        y1="19"
        x2="19"
        y2="10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="19"
        y1="19"
        x2="26"
        y2="19"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="19" cy="19" r="1.6" fill="white" />
    </svg>
  );
}

function KycChip({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-bold ${compact ? 'tracking-tight whitespace-nowrap' : 'tracking-wider'}`}
      style={{
        fontSize: compact ? '8px' : '9px',
        padding: compact ? '2.5px 5px' : '3px 6px',
        background: 'var(--color-green-100)',
        color: 'var(--color-green-900)',
      }}
    >
      <span aria-hidden>✓</span>
      {label}
    </span>
  );
}
