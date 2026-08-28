'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Logo } from '@/components/ui/Logo';

export function Header() {
  const t = useTranslations('header.nav');
  const tFooter = useTranslations('footer');
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
        {/* Wordmark + selo TMBS · o selo alinha pela esquerda da caixa da logo.
            Crédito visual apenas, sem link · o link fica só no rodapé. */}
        <div className="flex shrink-0 flex-col items-start gap-px">
          <Link href="/" className="flex items-center" aria-label="FastPix home">
            <Logo />
          </Link>
          <span className="flex items-center gap-[4px] leading-none opacity-70">
            {/* top-px compensa o descendente vazio da caixa do texto · sem isso
                as maiúsculas ficam 1px acima do eixo óptico da logo */}
            <span
              className="relative top-px text-[5.5px] uppercase tracking-[0.16em]"
              style={{ color: 'var(--color-ink-500)' }}
            >
              {tFooter('poweredBy')}
            </span>
            {/* Versão sem a moldura transparente do arquivo original (63px de cada
                lado), que desalinhava o selo em relação ao wordmark. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/tmbs-logo-tight.png"
              alt="TMBS"
              width={30}
              height={8}
              style={{ height: 8, width: 'auto', objectFit: 'contain' }}
            />
          </span>
        </div>

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
