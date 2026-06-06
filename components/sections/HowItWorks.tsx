'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { StepFormMockup } from '@/components/illustrations/StepFormMockup';
import { StepQRMockup } from '@/components/illustrations/StepQRMockup';
import { StepWalletMockup } from '@/components/illustrations/StepWalletMockup';
import { StepNetworkMockup } from '@/components/illustrations/StepNetworkMockup';

const easeOut = [0.16, 1, 0.3, 1] as const;

const STEPS = [1, 2, 3, 4] as const;

export function HowItWorks() {
  const t = useTranslations('how');

  return (
    <section id="how" className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
      {/* Decorativo · linha tracejada vertical conectando steps no desktop */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-[48%] left-0 right-0 h-px"
        style={{
          backgroundImage:
            'linear-gradient(90deg, var(--color-green-300) 50%, transparent 50%)',
          backgroundSize: '14px 1px',
          opacity: 0.4,
        }}
      />

      <div className="container-app relative">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="max-w-2xl mb-12 lg:mb-16"
        >
          <span className="eyebrow">04 PASSOS · 30 SEGUNDOS</span>
          <h2 className="display-lg mt-4">{t('title')}</h2>
          <p className="body-lg mt-6">{t('body')}</p>
        </motion.header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((n, i) => (
            <StepCard
              key={n}
              index={n}
              title={t(`steps.${n}.title`)}
              hint={t(`steps.${n}.hint`)}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  index,
  title,
  hint,
  delay,
}: {
  index: number;
  title: string;
  hint: string;
  delay: number;
}) {
  const Mockup =
    index === 1
      ? StepNetworkMockup
      : index === 2
        ? StepFormMockup
        : index === 3
          ? StepWalletMockup
          : StepQRMockup;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.7, ease: easeOut, delay }}
      className="
        group relative
        rounded-3xl bg-white border border-ink-200
        flex flex-col overflow-hidden
        shadow-pop
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-lift
        hover:border-green-300
      "
    >
      {/* Mockup visual · fundo off-white com elementos sintéticos */}
      <div
        className="relative h-[240px] overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--color-off-white) 0%, var(--color-green-100) 200%)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, var(--color-green-300) 0%, transparent 40%)',
          }}
        />
        <div className="absolute inset-0 grid place-items-center p-6">
          <Mockup />
        </div>
      </div>

      {/* Texto · número + título + hint */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span
            className="mono-num text-xs"
            style={{ color: 'var(--color-green-700)', fontWeight: 700 }}
          >
            {`STEP 0${index}`}
          </span>
          <span
            className="w-7 h-7 rounded-full grid place-items-center text-xs font-bold"
            style={{
              background: 'var(--color-green-100)',
              color: 'var(--color-green-900)',
            }}
          >
            {index}
          </span>
        </div>
        <h3
          className="display-md leading-tight"
          style={{
            fontSize: 'clamp(17px, 1.45vw, 20px)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 'calc(2 * 1.1em)',
            wordBreak: 'break-word',
          }}
        >
          {title}
        </h3>
        <p className="body-sm">{hint}</p>
      </div>
    </motion.article>
  );
}
