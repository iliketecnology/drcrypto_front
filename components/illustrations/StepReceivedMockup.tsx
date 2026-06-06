/** Mockup step 4 · notificação de PIX recebido */

export function StepReceivedMockup() {
  return (
    <div
      className="
        w-full max-w-[220px] rounded-2xl bg-white p-4
        border border-ink-200
      "
      style={{ boxShadow: '0 6px 20px rgba(91, 33, 182,0.12)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="
            shrink-0 w-10 h-10 rounded-full grid place-items-center
            text-white text-lg font-bold
          "
          style={{
            background:
              'linear-gradient(135deg, var(--color-green-500), var(--color-green-700))',
            boxShadow: '0 0 0 6px var(--color-green-100)',
          }}
          aria-hidden
        >
          ✓
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: 'var(--color-green-700)' }}
          >
            PIX recebido
          </p>
          <p
            className="mono-num text-lg leading-tight mt-1"
            style={{ color: 'var(--color-ink-900)', fontWeight: 700 }}
          >
            R$ 5.450,00
          </p>
          <p
            className="text-[10px] mt-1"
            style={{ color: 'var(--color-ink-500)' }}
          >
            agora · Bradesco
          </p>
        </div>
      </div>
      {/* Barra de progresso decorativa "concluído 100%" */}
      <div
        className="mt-3 h-1 rounded-full overflow-hidden"
        style={{ background: 'var(--color-ink-100)' }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              'linear-gradient(90deg, var(--color-green-500), var(--color-green-700))',
          }}
        />
      </div>
    </div>
  );
}
