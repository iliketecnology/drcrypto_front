/** Logo lockup: wordmark OprPay em Geist Black, tracking apertado.
 * "Opr" no tom de tinta, "Pay" no violeta de marca. Sem símbolo/medalhão. */

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  const inkPrimary = isDark ? "var(--color-white)" : "var(--color-ink-900)";
  return (
    <span
      aria-label="OprPay"
      className="inline-flex items-baseline"
      style={{
        fontWeight: 900,
        letterSpacing: "-0.04em",
        fontSize: "1.625rem",
        lineHeight: 1,
      }}
    >
      <span style={{ color: inkPrimary }}>Opr</span>
      <span style={{ color: "var(--color-green-500)" }}>Pay</span>
    </span>
  );
}
