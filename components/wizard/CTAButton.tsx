'use client';

import { useSwapWizard } from './SwapWizardProvider';

type Variant = 'solid' | 'ghost' | 'inline';

type Props = {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
};

/** Botão que dispara o SwapWizard. Reusável em qualquer seção. */
export function CTAButton({
  variant = 'solid',
  size = 'md',
  className = '',
  children,
}: Props) {
  const { open } = useSwapWizard();

  const sizing =
    size === 'lg'
      ? 'px-8 py-4 text-[15px]'
      : size === 'sm'
        ? 'px-4 py-2 text-[13px]'
        : 'px-6 py-3 text-[14px]';

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={open}
        className={`
          inline-flex items-center gap-1.5
          font-semibold tracking-tight underline-offset-4 hover:underline
          ${className}
        `}
        style={{ color: 'var(--color-green-700)' }}
      >
        {children}
        <span aria-hidden>→</span>
      </button>
    );
  }

  if (variant === 'ghost') {
    return (
      <button
        type="button"
        onClick={open}
        className={`
          group inline-flex items-center gap-2 rounded-full
          font-semibold tracking-tight
          border transition-all duration-300
          lift-on-hover
          ${sizing}
          ${className}
        `}
        style={{
          borderColor: 'var(--color-green-300)',
          color: 'var(--color-green-900)',
          background: 'white',
        }}
      >
        {children}
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className={`
        group inline-flex items-center gap-3 rounded-full
        text-white font-semibold tracking-tight
        transition-all duration-300
        lift-on-hover
        ${sizing}
        ${className}
      `}
      style={{
        background:
          'linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)',
        boxShadow: '0 8px 24px rgba(91, 33, 182, 0.22)',
      }}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}
