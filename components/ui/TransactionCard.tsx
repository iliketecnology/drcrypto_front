'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useUsdtBrlRate, formatBRL } from '@/lib/useUsdtBrlRate';

const easeOut = [0.16, 1, 0.3, 1] as const;
const USDT_AMOUNT = 100;

/** Comprovante de transferência USDT→PIX (mockup ilustrativo do hero).
 * Conversão direta USDT × dólar do dia, sem fees nem cotações intermediárias. */

export function TransactionCard() {
  const t = useTranslations('hero.mockup');
  const { rate } = useUsdtBrlRate();

  const brlNet = USDT_AMOUNT * rate;

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: easeOut, delay: 0.85 }}
      className="
        absolute right-[-8px] top-1/2 -translate-y-1/2
        hidden lg:block w-[340px]
        z-10
        rounded-2xl overflow-hidden
        bg-white border border-ink-200
        shadow-lift
      "
    >
      {/* Header escuro · igual ao comprovante crypto2pay */}
      <div
        className="px-5 py-4 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #2a0548 0%, #150226 100%)',
        }}
      >
        <div
          aria-hidden
          className="absolute -top-12 -right-8 w-40 h-40 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, var(--color-green-300) 0%, transparent 70%)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <span
            className="text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ color: 'var(--color-green-300)' }}
          >
            {t('label')}
          </span>
          <span
            className="
              inline-flex items-center gap-1.5
              px-2 py-0.5 rounded-full
              text-[9px] font-bold tracking-wider uppercase
            "
            style={{
              background: 'rgba(157, 43, 237, 0.18)',
              color: 'var(--color-green-300)',
              border: '1px solid rgba(157, 43, 237, 0.35)',
            }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{
                background: 'var(--color-green-300)',
                boxShadow: '0 0 6px var(--color-green-300)',
              }}
            />
            {t('status')}
          </span>
        </div>
        <p
          className="mono-num mt-2"
          style={{
            fontSize: '1.5rem',
            color: 'white',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {dd}/{mm}/{yyyy} · {hh}:{min}
        </p>
      </div>

      {/* Body com campos */}
      <div className="p-5 space-y-4">
        {/* Total USDT + Valor Transferido · conversão direta */}
        <div className="grid grid-cols-2 gap-3">
          <Cell label={t('totalUsdt')} value={USDT_AMOUNT.toFixed(2)} />
          <Cell
            label={t('transferred')}
            value={`R$ ${formatBRL(brlNet)}`}
            highlight
          />
        </div>

        {/* Detalhes (sender, beneficiary, txId) */}
        <div
          className="space-y-2 pt-3 border-t"
          style={{ borderColor: 'var(--color-ink-200)' }}
        >
          <DetailRow label={t('sender')} value="OprPay" />
          <DetailRow label={t('beneficiary')} value="usuario@email.com" />
          <DetailRow label={t('txId')} value="E170288752026…30vvW30IkFVm" mono />
        </div>
      </div>
    </motion.div>
  );
}

function Cell({
  label,
  value,
  highlight,
  small,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p
        className="text-[9px] uppercase tracking-wider font-semibold"
        style={{ color: 'var(--color-ink-500)' }}
      >
        {label}
      </p>
      <p
        className="mono-num truncate"
        style={{
          fontSize: small ? '12px' : '17px',
          color: highlight ? 'var(--color-green-900)' : 'var(--color-ink-900)',
          fontWeight: highlight ? 700 : small ? 500 : 600,
          letterSpacing: '-0.01em',
          marginTop: '2px',
        }}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className="text-[10px] uppercase tracking-wider font-semibold shrink-0"
        style={{ color: 'var(--color-ink-500)' }}
      >
        {label}
      </span>
      <span
        className={mono ? 'mono-num' : ''}
        style={{
          fontSize: '11px',
          color: 'var(--color-ink-900)',
          fontWeight: 500,
          textAlign: 'right',
          maxWidth: '60%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}
