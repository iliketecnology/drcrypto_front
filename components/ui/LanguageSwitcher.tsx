'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

/** Seletor de idioma · responsivo.
 * Desktop (md+): pill inline com 3 opções clicáveis.
 * Mobile (<md): dropdown compacto com idioma ativo + chevron. */

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const pick = (loc: (typeof routing.locales)[number]) => {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: loc });
    });
  };

  return (
    <>
      {/* Desktop · inline */}
      <div className="hidden md:flex items-center gap-1 rounded-full border border-ink-200 bg-white/60 p-1">
        {routing.locales.map((loc) => (
          <button
            key={loc}
            type="button"
            disabled={pending}
            onClick={() => pick(loc)}
            className={`
              text-[11px] font-semibold uppercase tracking-wider
              px-2.5 py-1 rounded-full
              transition-all duration-200
              ${
                loc === locale
                  ? 'bg-green-900 text-white'
                  : 'text-ink-500 hover:text-ink-900'
              }
            `}
            aria-current={loc === locale ? 'true' : undefined}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* Mobile · dropdown */}
      <div ref={dropdownRef} className="relative md:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="
            inline-flex items-center gap-1.5 rounded-full
            border border-ink-200 bg-white/80
            text-[11px] font-semibold uppercase tracking-wider
            text-ink-700
            px-3 py-1.5
            transition-colors
            hover:text-ink-900
          "
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {locale}
          <ChevronIcon open={open} />
        </button>

        {open && (
          <div
            role="listbox"
            className="
              absolute right-0 top-[calc(100%+6px)]
              min-w-[80px] rounded-xl
              border border-ink-200 bg-white
              shadow-lift
              overflow-hidden
              z-50
            "
          >
            {routing.locales.map((loc) => (
              <button
                key={loc}
                type="button"
                disabled={pending}
                onClick={() => pick(loc)}
                role="option"
                aria-selected={loc === locale}
                className={`
                  w-full text-left px-4 py-2
                  text-[12px] font-semibold uppercase tracking-wider
                  transition-colors
                  ${
                    loc === locale
                      ? 'bg-green-100 text-green-900'
                      : 'text-ink-700 hover:bg-ink-100'
                  }
                `}
              >
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0)',
        transition: 'transform 200ms',
      }}
      aria-hidden
    >
      <path
        d="M2 3.5L5 6.5L8 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
