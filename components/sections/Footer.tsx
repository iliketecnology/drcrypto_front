import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  XLogo,
  InstagramLogo,
  WhatsAppLogo,
  MailIcon,
} from '@/components/illustrations/BrandLogos';

/** Rodapé canônico OprPay · entidade TMBS, LLC (Delaware).
 * Modelo definido pelo Thiago: bloco escuro, OprPay em pill branca centralizada,
 * endereço da LLC empilhado, ícones sociais e selo "Powered by TMBS". */
export function Footer() {
  const tFooter = useTranslations('footer');

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #26043f 0%, #150226 60%, #0a0114 100%)',
        color: 'rgba(255,255,255,0.86)',
      }}
    >
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(157, 43, 237,0.45) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23a)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative container-app py-24 flex flex-col items-center text-center">
        {/* OprPay · wordmark direto sobre o fundo escuro (sem caixa) */}
        <span
          style={{
            fontWeight: 900,
            letterSpacing: '-0.04em',
            fontSize: '2.5rem',
            lineHeight: 1,
            color: 'white',
          }}
        >
          Opr
          <span style={{ color: 'var(--color-green-500)' }}>Pay</span>
        </span>

        {/* Endereço LLC */}
        <address
          className="mt-8 not-italic"
          style={{
            fontSize: '15px',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.78)',
          }}
        >
          {tFooter('address.line1')}
          <br />
          {tFooter('address.line2')}
          <br />
          {tFooter('address.line3')}
        </address>

        {/* Ícones sociais */}
        <div className="mt-8 flex items-center gap-3">
          {/* TODO: trocar pelas handles reais do OprPay (aguardando Chris) */}
          <Social label="X" href="#">
            <XLogo size={14} />
          </Social>
          <Social label="Email" href="mailto:tmbs@tmbs.tech">
            <MailIcon size={15} />
          </Social>
          <Social label="WhatsApp" href="https://wa.me/5511974101010">
            <WhatsAppLogo size={15} />
          </Social>
          <Social label="Instagram" href="#">
            <InstagramLogo size={15} />
          </Social>
        </div>

        {/* Divisor sutil */}
        <div
          aria-hidden
          className="mt-16 h-px w-full max-w-md"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 50%, transparent)',
          }}
        />

        {/* Powered by TMBS · logo oficial extraída de tmbs.technology */}
        <div className="mt-10 flex items-center gap-3">
          <span
            className="text-[12px] uppercase tracking-[0.18em]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {tFooter('poweredBy')}
          </span>
          <img
            src="/brand/tmbs-logo.png"
            alt="TMBS"
            width={88}
            height={24}
            style={{
              height: 24,
              width: 'auto',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
              opacity: 0.92,
            }}
          />
        </div>

        {/* Copyright + legal */}
        <p
          className="mt-6 text-[12px]"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {tFooter('copyright')}
        </p>
        <div className="mt-3 flex items-center gap-5">
          <Link
            href="/termos"
            className="text-[13px] transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            {tFooter('legal.terms')}
          </Link>
          <span
            aria-hidden
            className="w-1 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          />
          <Link
            href="/privacidade"
            className="text-[13px] transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            {tFooter('legal.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Social({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="
        w-11 h-11 rounded-full grid place-items-center
        transition-all duration-300
        hover:scale-105
      "
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.85)',
      }}
      aria-label={label}
    >
      {children}
    </a>
  );
}
