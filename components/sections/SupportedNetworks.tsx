'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ChainLogo, CHAIN_COLORS } from '@/components/illustrations/ChainLogo';

const easeOut = [0.16, 1, 0.3, 1] as const;

export function SupportedNetworks() {
  const t = useTranslations('networks');

  return (
    <section className="relative py-16 md:py-24 lg:py-28 overflow-hidden" id="networks">
      <div className="container-app relative">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10 lg:mb-14"
        >
          <div className="lg:col-span-7">
            <span className="eyebrow">{t('eyebrow')}</span>
            <h2 className="display-lg mt-4 max-w-[18ch]">{t('title')}</h2>
          </div>
          <div className="lg:col-span-5">
            <p className="body-lg">{t('body')}</p>
          </div>
        </motion.header>

        <div>
          {/* Polygon · rede única suportada */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="
              group relative overflow-hidden
              rounded-3xl bg-white border border-ink-200
              shadow-card lift-on-hover
            "
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 80% 50%, ${CHAIN_COLORS.polygon}33 0%, transparent 60%)`,
              }}
            />

            <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col gap-6 min-h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <ChainLogo chain="polygon" size={64} />
                  <div className="min-w-0">
                    <p
                      className="mono-num text-[11px] tracking-wider font-bold uppercase truncate"
                      style={{ color: CHAIN_COLORS.polygon }}
                    >
                      {t('polygonHeadline')}
                    </p>
                    <h3 className="display-md mt-1" style={{ fontSize: '28px' }}>
                      Polygon
                    </h3>
                  </div>
                </div>
                <span
                  className="
                    shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-1 rounded-full whitespace-nowrap
                    text-[10px] uppercase tracking-wider font-bold
                  "
                  style={{
                    background: 'var(--color-green-100)',
                    color: 'var(--color-green-900)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-green-700)' }}
                    aria-hidden
                  />
                  {t('defaultBadge')}
                </span>
              </div>

              <p className="body-md max-w-[52ch]">{t('polygonBody')}</p>
            </div>
          </motion.article>
        </div>

        <p
          className="text-xs mt-8 max-w-3xl"
          style={{ color: 'var(--color-ink-500)' }}
        >
          {t('footnote')}
        </p>
      </div>
    </section>
  );
}

