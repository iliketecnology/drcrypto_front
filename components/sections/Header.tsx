'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Logo } from '@/components/ui/Logo';
import { useSwapWizard } from '@/components/wizard/SwapWizardProvider';

export function Header() {
  const t = useTranslations('header.nav');
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { open } = useSwapWizard();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="
        fixed inset-x-0 top-0 z-50
        transition-[background-color,border-color,backdrop-filter] duration-300
        data-[scrolled=true]:bg-white/85
        data-[scrolled=true]:backdrop-blur-md
        data-[scrolled=true]:border-b
        data-[scrolled=true]:border-ink-200
      "
    >
      <div className="container-app flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0" aria-label="Dr. Crypto Pay home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          <NavLink href="#how" active={pathname === '/'}>
            {t('how')}
          </NavLink>
          <NavLink href="#differentials" active={pathname === '/'}>
            {t('differentials')}
          </NavLink>
          <NavLink href="#about" active={pathname === '/'}>
            {t('about')}
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={open}
            className="
              group inline-flex items-center gap-2
              px-4 sm:px-5 py-2 sm:py-2.5 rounded-full
              text-white font-semibold tracking-tight
              text-[13px]
              transition-all duration-300
              hover:-translate-y-px
            "
            style={{
              background:
                'linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)',
              boxShadow: '0 6px 18px rgba(91, 33, 182, 0.22)',
            }}
            aria-label="Trocar USDT por PIX"
          >
            <span className="font-bold">USDT</span>
            <svg
              aria-hidden
              width="16"
              height="10"
              viewBox="0 0 16 10"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-0.5 shrink-0"
            >
              <path
                d="M1 5 H13 M9 1 L13 5 L9 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-bold">PIX</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="
        text-[14px] font-medium text-ink-700
        transition-colors duration-200
        hover:text-green-700
      "
    >
      {children}
    </a>
  );
}
