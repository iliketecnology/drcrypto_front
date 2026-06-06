/** Logo lockup: medalhão DR.CRIPTO (doutor + balança, fundo removido) +
 * wordmark DR.CRIPTO PAY em Geist Black, tracking apertado. */

import Image from 'next/image';

export function Logo({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark';
  const inkPrimary = isDark ? 'var(--color-white)' : 'var(--color-ink-900)';
  return (
    <span aria-label="Dr. Crypto Pay" className="inline-flex items-center gap-2.5">
      {/* Medalhão · navy + dourado, contrasta nos dois fundos */}
      <Image
        src="/brand/dr-cripto-mark.png"
        alt=""
        width={40}
        height={40}
        priority
        className="shrink-0 select-none"
      />
      <span
        aria-hidden
        className="inline-flex items-baseline"
        style={{
          fontWeight: 900,
          letterSpacing: '-0.04em',
          fontSize: '1.625rem',
          lineHeight: 1,
        }}
      >
        <span style={{ color: inkPrimary }}>Dr.</span>
        <span style={{ color: 'var(--color-green-500)' }}>Crypto</span>
        <span
          style={{
            color: isDark ? 'var(--color-ink-300)' : 'var(--color-ink-500)',
            fontWeight: 600,
            fontSize: '0.85em',
            letterSpacing: '-0.02em',
            marginLeft: '0.12em',
          }}
        >
          Pay
        </span>
      </span>
    </span>
  );
}
