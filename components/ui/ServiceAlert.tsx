"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import type { PaymentMode } from "@/components/wizard/types";
import { SUPPORT_EMAIL, UNSTABLE_MODES } from "@/lib/service-status";

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Amber triangle with a dark exclamation mark, like the ⚠️ emoji but crisp at any size. */
function WarningGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M10.27 3.98a2 2 0 0 1 3.46 0l8.02 13.98A2 2 0 0 1 20.02 21H3.98a2 2 0 0 1-1.73-3.04l8.02-13.98Z"
        fill="#F5B301"
      />
      <path
        d="M12 8.6v5.2"
        stroke="#1A1400"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17.2" r="1.35" fill="#1A1400" />
    </svg>
  );
}

type BadgeProps = {
  mode: PaymentMode;
  onOpen: (mode: PaymentMode) => void;
};

/**
 * Bare warning glyph placed inline after the method name on the hero card.
 * Discreet on purpose (Thiago, 2026-10-16): no pill, no ring, no pulse.
 * Stops propagation so the card itself does not open the wizard.
 *
 * Desktop (hover-capable pointer): a tooltip on hover/focus, click opens the notice.
 * Touch: no hover exists, tap opens the notice straight away.
 * The tooltip is portaled because the card clips overflow.
 */
export function ServiceAlertBadge({ mode, onOpen }: BadgeProps) {
  const t = useTranslations("hero.alert");
  const ref = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const showTip = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ x: r.left + r.width / 2, y: r.bottom + 10 });
  };
  const hideTip = () => setTip(null);

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          hideTip();
          onOpen(mode);
        }}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
        aria-label={t("badge", { method: t(`methods.${mode}`) })}
        className="
          service-alert-badge
          relative z-20 ml-1.5 shrink-0 grid place-items-center
          w-6 h-6 rounded-md cursor-pointer
          opacity-80 transition-[opacity,transform] duration-200
          hover:opacity-100 hover:scale-110
        "
      >
        <WarningGlyph size={17} />
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {tip && (
              <motion.div
                role="tooltip"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: easeOut }}
                className="fixed z-[1050] pointer-events-none"
                style={{ left: tip.x, top: tip.y, transform: "translateX(-50%)" }}
              >
                <div
                  className="relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold tracking-tight text-white whitespace-nowrap"
                  style={{
                    background: "var(--color-ink-900)",
                    boxShadow:
                      "0 0 0 1px rgba(245,179,1,0.35), 0 12px 28px rgba(26,15,46,0.3)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                    style={{ background: "var(--color-ink-900)" }}
                  />
                  <WarningGlyph size={15} />
                  <span>
                    {t("tooltip", { method: t(`methods.${mode}`) })}
                    <span className="ml-1.5 font-normal text-white/60">
                      {t("tooltipHint")}
                    </span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

type DialogProps = {
  mode: PaymentMode | null;
  onClose: () => void;
};

/**
 * Notice explaining the instability. Portaled to <body> so the hero's own
 * stacking context (section.isolate + fixed header) cannot trap it.
 */
export function ServiceAlertDialog({ mode, onClose }: DialogProps) {
  const t = useTranslations("hero.alert");

  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  if (typeof document === "undefined") return null;

  // The notice lists every flagged method, so if two go down at once the copy
  // stays truthful ("only boletos" would be wrong).
  const flagged = UNSTABLE_MODES.length > 0 ? UNSTABLE_MODES : mode ? [mode] : [];
  const names = flagged.map((m) => t(`methods.${m}`));
  const body =
    names.length <= 1
      ? t("bodyOne", { method: names[0] ?? "" })
      : t("bodyMany", { methods: names.join(t("joiner")) });

  return createPortal(
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-alert-title"
        >
          <motion.button
            type="button"
            aria-label={t("close")}
            className="absolute inset-0 cursor-default"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(26,15,46,0.55) 0%, rgba(26,15,46,0.8) 90%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            /* Focus lands on the card (not the button) so keyboard users are
               inside the dialog without a focus ring flashing on "Entendi". */
            ref={(el) => el?.focus()}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="
              relative z-10 w-full max-w-[440px] rounded-3xl overflow-hidden outline-none
              bg-white border border-ink-200
              px-7 pt-7 pb-6 sm:px-8 sm:pt-8 sm:pb-7
            "
            style={{ boxShadow: "0 32px 80px rgba(26,15,46,0.4)" }}
          >
            {/* Amber wash behind the icon */}
            <div
              aria-hidden
              className="absolute -top-16 -left-10 w-[220px] h-[220px] rounded-full blur-3xl opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,179,1,0.35) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-start gap-4">
              <span
                className="shrink-0 grid place-items-center w-12 h-12 rounded-2xl"
                style={{
                  background: "rgba(245,179,1,0.14)",
                  boxShadow: "inset 0 0 0 1px rgba(245,179,1,0.35)",
                }}
              >
                <WarningGlyph size={26} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-[11px] text-ink-500">{t("eyebrow")}</p>
                <h2
                  id="service-alert-title"
                  className="mt-1 text-[20px] sm:text-[22px] font-extrabold tracking-tight leading-tight text-ink-900"
                >
                  {t("title")}
                </h2>
              </div>
            </div>

            <p className="relative mt-5 text-[15px] leading-relaxed text-ink-700">
              {body}
            </p>

            <p className="relative mt-4 text-[13px] leading-relaxed text-ink-500">
              {t("signature")}
              <br />
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-green-700 underline underline-offset-4 decoration-green-700/30 hover:decoration-green-700"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>

            <button
              type="button"
              onClick={onClose}
              className="
                relative mt-6 w-full h-12 rounded-full
                text-[15px] font-bold tracking-tight text-white
                transition-[transform,box-shadow] duration-200
                hover:-translate-y-px active:translate-y-0
              "
              style={{
                background: "var(--color-green-500)",
                boxShadow: "0 8px 20px rgba(157,43,237,0.35)",
              }}
            >
              {t("close")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
