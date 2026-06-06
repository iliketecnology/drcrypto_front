'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { CTAButton } from '@/components/wizard/CTAButton';

const easeOut = [0.16, 1, 0.3, 1] as const;

export function About() {
  const t = useTranslations('about');

  return (
    <section
      id="about"
      className="relative py-16 md:py-24 lg:py-28 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 70% 30%, #2a0548 0%, #150226 60%, #080110 100%)',
      }}
    >
      {/* Aurora · 3 blobs verdes flutuando suavemente */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl opacity-50"
          style={{
            width: 720,
            height: 720,
            background:
              'radial-gradient(circle, #9d2bed 0%, transparent 60%)',
            top: '-15%',
            left: '5%',
            animation: 'usp-aurora-1 24s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-40"
          style={{
            width: 640,
            height: 640,
            background:
              'radial-gradient(circle, #cf9bf5 0%, transparent 60%)',
            bottom: '-10%',
            right: '8%',
            animation: 'usp-aurora-2 28s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-30"
          style={{
            width: 520,
            height: 520,
            background:
              'radial-gradient(circle, #3b0764 0%, transparent 70%)',
            top: '35%',
            left: '50%',
            animation: 'usp-aurora-3 32s ease-in-out infinite',
          }}
        />
      </div>

      {/* Grid de linhas verticais decorativas · subindo lentamente */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-green-300) 1px, transparent 1px)',
          backgroundSize: '120px 100%',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
        }}
      />

      {/* Grain sobre o dark */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23a)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="container-app grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="lg:col-span-7"
        >
          <span
            className="eyebrow"
            style={{ color: 'var(--color-green-300)' }}
          >
            {t('eyebrow')}
          </span>
          <h2
            className="display-lg mt-4 max-w-[14ch]"
            style={{ color: 'white' }}
          >
            {t('title').split(' ').map((word, i, arr) => {
              const isHighlight =
                word.toLowerCase().includes('pix') ||
                word.toLowerCase().includes('rápido');
              return (
                <span
                  key={i}
                  style={
                    isHighlight
                      ? {
                          fontStyle: 'italic',
                          color: 'var(--color-green-300)',
                          fontWeight: 900,
                        }
                      : undefined
                  }
                >
                  {word}
                  {i < arr.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </h2>

          <p
            className="body-lg mt-10 max-w-prose"
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            {t('body')}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ValueChip>Pague em 4 etapas</ValueChip>
            <ValueChip>Polygon</ValueChip>
            <ValueChip>Liquidação 24/7</ValueChip>
            <ValueChip>Sem cadastro</ValueChip>
          </div>

          <div className="mt-10">
            <CTAButton size="lg">Clique aqui</CTAButton>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.15 }}
          className="lg:col-span-5"
        >
          <div
            className="relative overflow-hidden rounded-3xl p-10"
            style={{
              background:
                'linear-gradient(140deg, rgba(157, 43, 237,0.18) 0%, rgba(91, 33, 182,0.4) 100%)',
              border: '1px solid rgba(104,221,189,0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 24px 60px rgba(0, 30, 15, 0.45)',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.22] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            <div
              aria-hidden
              className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full opacity-50 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, var(--color-green-300) 0%, transparent 70%)',
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'white',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white"
                    style={{ boxShadow: '0 0 8px white' }}
                  />
                  Em tempo real
                </span>
                <span
                  className="mono-num text-xs"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  v01.2026
                </span>
              </div>

              <p
                className="display-md text-[26px] leading-tight"
                style={{ color: 'white' }}
              >
                {t('highlight')}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-6">
                <Stat value="R$ 12M+" label="Processado no último mês" />
                <Stat value="180K+" label="Transações concluídas" />
              </div>
            </div>
          </div>
        </motion.aside>
      </div>

      <style>{`
        @keyframes usp-aurora-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(80px, 40px) scale(1.1); }
        }
        @keyframes usp-aurora-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, -30px) scale(0.95); }
        }
        @keyframes usp-aurora-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-40%, -45%) scale(1.15); }
        }
      `}</style>
    </section>
  );
}

function ValueChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold tracking-tight"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.14)',
        color: 'rgba(255,255,255,0.92)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: 'var(--color-green-300)',
          boxShadow: '0 0 6px var(--color-green-300)',
        }}
        aria-hidden
      />
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span
        className="mono-num block"
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: 'white',
          textShadow: '0 0 24px rgba(157, 43, 237, 0.35)',
        }}
      >
        {value}
      </span>
      <p
        className="text-[11px] mt-2"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        {label}
      </p>
    </div>
  );
}
