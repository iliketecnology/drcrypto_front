/** Mockup step 1 · mini-form de valor + chave PIX */

export function StepFormMockup() {
  return (
    <div className="w-full max-w-[200px] flex flex-col gap-2">
      <FieldMockup label="VALOR" value="1.000,00" suffix="USDT" />
      <div className="flex items-center justify-center -my-1">
        <span
          className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white"
          style={{ background: 'var(--color-green-500)' }}
          aria-hidden
        >
          ↓
        </span>
      </div>
      <FieldMockup label="CHAVE PIX" value="usuario@email.com" />
    </div>
  );
}

function FieldMockup({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div
      className="rounded-xl bg-white border border-ink-200 px-5 py-2.5"
      style={{ boxShadow: '0 2px 8px rgba(91, 33, 182,0.06)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[9px] tracking-wider font-semibold"
          style={{ color: 'var(--color-ink-500)' }}
        >
          {label}
        </span>
        {suffix && (
          <span
            className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded shrink-0"
            style={{
              background: 'var(--color-green-100)',
              color: 'var(--color-green-900)',
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      <div
        className="mono-num text-sm mt-1"
        style={{ color: 'var(--color-ink-900)', fontWeight: 600 }}
      >
        {value}
      </div>
    </div>
  );
}
