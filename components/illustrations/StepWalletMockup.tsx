/** Mockup step 3 · carteira de retorno (endereço USDT pra estorno) + e-mail do comprovante.
 *
 * Bate com o card "Carteira de retorno": um endereço USDT na rede Polygon truncado
 * (0x…) e o campo de e-mail. Nada de notificação de PIX aqui — o recebimento só
 * acontece no último passo. */

import { ChainLogo } from './ChainLogo';

export function StepWalletMockup() {
  return (
    <div className="w-full max-w-[200px] flex flex-col gap-2">
      {/* Endereço da carteira USDT (Polygon) */}
      <div
        className="rounded-xl bg-white border border-ink-200 px-4 py-2.5"
        style={{ boxShadow: '0 2px 8px rgba(91, 33, 182,0.06)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[9px] tracking-wider font-semibold"
            style={{ color: 'var(--color-ink-500)' }}
          >
            CARTEIRA USDT
          </span>
          <span
            className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded shrink-0"
            style={{
              background: 'var(--color-green-100)',
              color: 'var(--color-green-900)',
            }}
          >
            <ChainLogo chain="polygon" size={11} />
            POL
          </span>
        </div>
        <div
          className="mono-num text-sm mt-1 flex items-center gap-1.5"
          style={{ color: 'var(--color-ink-900)', fontWeight: 600 }}
        >
          <span aria-hidden>0x</span>
          <span>7a3f…e21b</span>
        </div>
      </div>

      <div className="flex items-center justify-center -my-1">
        <span
          className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white"
          style={{ background: 'var(--color-green-500)' }}
          aria-hidden
        >
          ↓
        </span>
      </div>

      {/* E-mail do comprovante */}
      <div
        className="rounded-xl bg-white border border-ink-200 px-4 py-2.5"
        style={{ boxShadow: '0 2px 8px rgba(91, 33, 182,0.06)' }}
      >
        <span
          className="text-[9px] tracking-wider font-semibold"
          style={{ color: 'var(--color-ink-500)' }}
        >
          E-MAIL DO COMPROVANTE
        </span>
        <div
          className="text-sm mt-1"
          style={{ color: 'var(--color-ink-900)', fontWeight: 600 }}
        >
          usuario@email.com
        </div>
      </div>
    </div>
  );
}
