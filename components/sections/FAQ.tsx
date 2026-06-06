'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export function FAQ() {
  const t = useTranslations('faq');
  const [open, setOpen] = useState<string | null>('q1');

  return (
    <section id="faq" className="relative py-16 md:py-24 lg:py-28 bg-off-white">
      <div className="container-app grid grid-cols-1 lg:grid-cols-12 gap-12">
        <header className="lg:col-span-4">
          <span className="eyebrow">{t('eyebrow')}</span>
          <h2 className="display-lg mt-4">{t('title')}</h2>
        </header>

        <div className="lg:col-span-8 flex flex-col gap-3">
          {FAQ_KEYS.map((key) => {
            const isOpen = open === key;
            return (
              <article
                key={key}
                className="
                  rounded-2xl bg-white border border-ink-200 overflow-hidden
                  transition-shadow duration-200
                  hover:shadow-card
                "
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="
                    w-full text-left flex items-start justify-between gap-6
                    px-6 py-5
                    transition-colors
                  "
                  aria-expanded={isOpen}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      letterSpacing: '-0.005em',
                      lineHeight: 1.4,
                      color: isOpen
                        ? 'var(--color-green-900)'
                        : 'var(--color-ink-900)',
                    }}
                  >
                    {t(`items.${key}.question`)}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 mt-1 w-7 h-7 rounded-full grid place-items-center text-sm font-bold transition-all duration-300"
                    style={{
                      background: isOpen ? 'var(--color-green-700)' : 'var(--color-ink-100)',
                      color: isOpen ? 'white' : 'var(--color-ink-700)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="
                    grid transition-[grid-template-rows] duration-300 ease-out
                  "
                  style={{
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 body-md max-w-[60ch]">
                      {t(`items.${key}.answer`)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
