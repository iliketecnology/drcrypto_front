'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { USDTLogo, PIXLogo } from '@/components/illustrations/BrandLogos';
import { CTAButton } from '@/components/wizard/CTAButton';

// Globo 3D só no client (R3F não faz SSR). Variante 'light' pro fundo branco.
const GlobeWireframe = dynamic(
  () =>
    import('@/components/illustrations/GlobeWireframe').then(
      (m) => m.GlobeWireframe,
    ),
  { ssr: false },
);

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative isolate overflow-hidden">
      {/* Atmosfera de fundo */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-white" />

      {/* Halo verde sob o headline */}
      <div
        aria-hidden
        className="absolute -z-10 top-[28%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            'radial-gradient(ellipse, var(--color-green-100) 0%, transparent 65%)',
        }}
      />

      {/* Halo secundário canto inferior direito */}
      <div
        aria-hidden
        className="absolute -z-10 bottom-0 right-[-200px] w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            'radial-gradient(circle, var(--color-green-300) 0%, transparent 70%)',
        }}
      />

      {/* Globo 3D wireframe · atmosfera à direita, sangra pra fora da borda.
          Concentrado no lado direito (atrás do card) pra deixar o texto à
          esquerda limpo. maskImage radial do próprio globo esmaece as bordas. */}
      <div
        aria-hidden
        className="
          absolute -z-10 pointer-events-none
          top-1/2 -translate-y-1/2 aspect-square
          right-[-28%] sm:right-[-16%] lg:right-[-6%]
          opacity-90 lg:opacity-100
        "
        style={{ height: '118%' }}
      >
        <GlobeWireframe variant="light" />
      </div>

      {/* Grain overlay sutil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.035] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23a)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="container-app relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28 lg:min-h-[80vh]">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna principal · texto */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
              className="
                eyebrow inline-flex items-center gap-3
                px-3.5 py-1.5 rounded-full
              "
              style={{
                background: 'rgba(157, 43, 237, 0.08)',
                border: '1px solid rgba(157, 43, 237, 0.18)',
                color: 'var(--color-green-900)',
              }}
            >
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'var(--color-green-500)',
                  boxShadow: '0 0 12px var(--color-green-500)',
                }}
              />
              {t('eyebrow')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: easeOut, delay: 0.2 }}
              className="display-xl mt-8 max-w-[16ch]"
            >
              {t('headlineStart')}{' '}
              <span
                style={{
                  color: 'var(--color-green-500)',
                  fontStyle: 'italic',
                  fontWeight: 900,
                  display: 'inline-block',
                  letterSpacing: '-0.04em',
                }}
              >
                {t('headlineHighlight')}
              </span>{' '}
              {t('headlineEnd')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.5 }}
              className="body-lg mt-8 max-w-[46ch]"
            >
              {t('sub')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.65 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <CTAButton size="lg">{t('cta')}</CTAButton>

              <div
                className="
                  inline-flex items-center gap-3 rounded-full
                  bg-white/85 border border-ink-200
                  shadow-soft px-4 py-2.5
                  backdrop-blur-sm
                "
              >
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight text-ink-900">
                  <USDTLogo size={22} />
                  USDT
                </span>
                <span
                  className="text-base"
                  style={{ color: 'var(--color-green-500)' }}
                  aria-hidden
                >
                  →
                </span>
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight text-ink-900">
                  <PIXLogo size={22} />
                  PIX
                </span>
              </div>
            </motion.div>

            {/* Prova institucional · 3 badges curtos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-ink-700">
                <USDTLogo size={18} />
                {t('badgeSteps')}
              </span>
              <span
                aria-hidden
                className="w-px h-4 hidden sm:inline-block"
                style={{ background: 'var(--color-ink-200)' }}
              />
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-ink-700">
                <PIXLogo size={18} />
                {t('badgeInstant')}
              </span>
              <span
                aria-hidden
                className="w-px h-4 hidden sm:inline-block"
                style={{ background: 'var(--color-ink-200)' }}
              />
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-ink-700">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--color-green-500)' }}
                  aria-hidden
                />
                {t('badgeNoBureaucracy')}
              </span>
            </motion.div>
          </div>

          {/* Coluna lateral · card mockup de transação */}
          <div className="lg:col-span-4 relative h-[420px] hidden lg:block">
            <TransactionCard />
          </div>
        </div>
      </div>

      {/* Borda inferior sutil */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-ink-200) 30%, var(--color-ink-200) 70%, transparent)',
        }}
      />
    </section>
  );
}
