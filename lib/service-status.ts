import type { PaymentMode } from "@/components/wizard/types";

/**
 * Service status per payment method.
 *
 * A method flagged as unstable shows a warning badge on its hero card; tapping
 * the badge opens a notice explaining the instability. The card itself keeps
 * working.
 *
 * Two ways to toggle:
 *  1. Env var (no code change, needs a rebuild):
 *       NEXT_PUBLIC_SERVICE_ALERTS=boleto        -> only boleto
 *       NEXT_PUBLIC_SERVICE_ALERTS=boleto,qr     -> boleto and QR Code
 *       NEXT_PUBLIC_SERVICE_ALERTS=              -> nothing (empty string = all clear)
 *  2. Default below, used when the env var is not defined at all.
 */
const DEFAULT_ALERTS: Record<PaymentMode, boolean> = {
  pix: false,
  boleto: false,
  qr: false,
};

export const SUPPORT_EMAIL = "tmbs@tmbs.tech";

const ALL_MODES: PaymentMode[] = ["pix", "boleto", "qr"];

function fromEnv(): Record<PaymentMode, boolean> | null {
  const raw = process.env.NEXT_PUBLIC_SERVICE_ALERTS;
  if (raw === undefined) return null;
  const flagged = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return {
    pix: flagged.has("pix"),
    boleto: flagged.has("boleto"),
    qr: flagged.has("qr"),
  };
}

export const SERVICE_ALERTS: Record<PaymentMode, boolean> =
  fromEnv() ?? DEFAULT_ALERTS;

/** Payment methods currently flagged, in display order. */
export const UNSTABLE_MODES: PaymentMode[] = ALL_MODES.filter(
  (m) => SERVICE_ALERTS[m],
);

export function isUnstable(mode: PaymentMode): boolean {
  return SERVICE_ALERTS[mode];
}
