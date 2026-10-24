"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { refundChain, type RefundResult } from "./types";

const easeOut = [0.16, 1, 0.3, 1] as const;

/** WhatsApp do atendimento · mesmo número do ExpiredHashFlow e do rodapé. */
const SUPPORT_WHATSAPP = "5511974101010";

type Props = {
  isOpen: boolean;
  data: RefundResult | null;
  onClose: () => void;
};

/** Comprovante de devolução (pedido do Emerson, 20/10). Abre quando o polling da ordem
 * recebe REFUNDED: o PIX não saiu e o USDT voltou pra carteira de retorno. Também cobre
 * FAILED, que antes só parava o polling e deixava o usuário na tela de espera.
 * Mesmo molde do ReceiptDialog (header escuro, corpo claro, borda girando) pra ler como
 * documento da mesma casa; o selo âmbar é o que diferencia de um PIX concluído. */
export function RefundDialog({ isOpen, data, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && data && <RefundInner data={data} onClose={onClose} />}
    </AnimatePresence>
  );
}

function RefundInner({
  data,
  onClose,
}: {
  data: RefundResult;
  onClose: () => void;
}) {
  const t = useTranslations("wizard.refund");
  const locale = useLocale();
  const refunded = data.kind === "refunded";
  const [copied, setCopied] = useState<"hash" | "order" | null>(null);

  const d = new Date(data.createdAt);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  const numberLocale =
    locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  const amount = (() => {
    const n = Number.parseFloat(data.amountUSDT);
    if (!Number.isFinite(n)) return data.amountUSDT;
    return n.toLocaleString(numberLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  })();

  // A devolução de Tron sai em Polygon (bridge), então a rede do estorno vem
  // de refundChain, não direto da rede da ordem.
  const orderNetwork =
    data.network.charAt(0) + data.network.slice(1).toLowerCase();
  const chain = data.returnTxid
    ? refundChain(data.returnTxid, data.network)
    : null;
  const returnNetwork = chain ? chain.label : orderNetwork;

  const supportHref = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
    t(refunded ? "waRefunded" : "waFailed", {
      order: data.orderId,
      hash: data.returnTxid || "-",
    }),
  )}`;

  const copy = async (label: "hash" | "order", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* fallback silencioso */
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-8 overflow-y-auto opr-refund-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="opr-refund-title"
    >
      <motion.button
        type="button"
        aria-label={t("close")}
        className="absolute inset-0 cursor-default opr-refund-noprint"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,40,20,0.7) 0%, rgba(0,8,4,0.92) 90%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="relative z-10 w-full max-w-[440px] my-auto opr-refund-card opr-refund-print"
      >
        {/* Header escuro institucional · selo âmbar marca que não é um PIX concluído */}
        <div
          className="px-6 py-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #2a0548 0%, #150226 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-12 -right-8 w-40 h-40 rounded-full blur-2xl opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #f5b544 0%, transparent 70%)",
            }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <span
              id="opr-refund-title"
              className="text-[10.5px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--color-green-300)" }}
            >
              {t(refunded ? "label" : "labelFailed")}
            </span>
            <span
              className="
                inline-flex items-center gap-1.5 shrink-0
                px-2 py-0.5 rounded-full
                text-[9px] font-bold tracking-wider uppercase
              "
              style={
                refunded
                  ? {
                      background: "rgba(245, 181, 68, 0.14)",
                      color: "#f8c76a",
                      border: "1px solid rgba(245, 181, 68, 0.45)",
                    }
                  : {
                      background: "rgba(248, 113, 113, 0.14)",
                      color: "#fca5a5",
                      border: "1px solid rgba(248, 113, 113, 0.45)",
                    }
              }
            >
              <span
                aria-hidden
                className="w-1 h-1 rounded-full"
                style={{
                  background: "currentColor",
                  boxShadow: "0 0 6px currentColor",
                }}
              />
              {t(refunded ? "status" : "statusFailed")}
            </span>
          </div>
          <p
            className="mono-num mt-2"
            style={{
              fontSize: "1.25rem",
              color: "white",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {dd}/{mm}/{yyyy} · {hh}:{min}
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3.5">
          <p
            className="text-[12.5px] leading-relaxed"
            style={{ color: "var(--color-ink-700)" }}
          >
            {t(refunded ? "lead" : "leadFailed")}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <RefundCell
              label={t(refunded ? "amount" : "amountFailed")}
              value={`${amount} USDT`}
              highlight
            />
            <RefundCell
              label={t("network")}
              value={refunded ? returnNetwork : orderNetwork}
            />
          </div>

          <div
            className="pt-3 border-t flex flex-col gap-3"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
          >
            {data.reason && (
              <RefundBlock label={t("reason")}>
                <span
                  className="text-[12px] font-semibold break-words"
                  style={{ color: "var(--color-ink-900)" }}
                >
                  {data.reason}
                </span>
              </RefundBlock>
            )}

            {refunded && data.returnWallet && (
              <RefundBlock label={t("wallet")}>
                <span className="mono-num text-[11px] break-all">
                  {data.returnWallet}
                </span>
              </RefundBlock>
            )}

            {refunded && data.returnTxid && (
              <RefundBlock label={t("hash")}>
                <span className="mono-num text-[11px] break-all">
                  {data.returnTxid}
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 opr-refund-noprint">
                  <a
                    href={chain?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11.5px] font-semibold underline underline-offset-2"
                    style={{ color: "var(--color-green-900)" }}
                  >
                    {t("explorer")} ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => copy("hash", data.returnTxid)}
                    className="text-[11.5px] font-semibold text-ink-500 hover:text-ink-900 transition"
                  >
                    {copied === "hash" ? t("copied") : t("copy")}
                  </button>
                </span>
              </RefundBlock>
            )}

            <RefundBlock label={t("order")}>
              <span className="mono-num text-[11px] break-all">
                {data.orderId}
              </span>
              {!refunded && (
                <button
                  type="button"
                  onClick={() => copy("order", data.orderId)}
                  className="ml-2 text-[11.5px] font-semibold text-ink-500 hover:text-ink-900 transition opr-refund-noprint"
                >
                  {copied === "order" ? t("copied") : t("copy")}
                </button>
              )}
            </RefundBlock>

            <RefundBlock label={t("representative")}>
              <strong style={{ color: "var(--color-ink-900)" }}>OprPay</strong>
            </RefundBlock>
          </div>

          <div className="mt-1 flex flex-col gap-2 opr-refund-noprint">
            {refunded ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="
                  w-full inline-flex items-center justify-center gap-2
                  px-5 py-3 rounded-full
                  text-white font-semibold tracking-tight text-[14px]
                  transition-transform duration-200 hover:-translate-y-px
                "
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
                  boxShadow: "0 8px 22px rgba(91, 33, 182,0.28)",
                }}
              >
                {t("save")}
              </button>
            ) : null}
            <a
              href={supportHref}
              target="_blank"
              rel="noopener noreferrer"
              className={
                refunded
                  ? "w-full inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[13px] font-semibold tracking-tight border transition hover:bg-black/[0.03]"
                  : "w-full inline-flex items-center justify-center px-5 py-3 rounded-full text-white text-[14px] font-semibold tracking-tight transition-transform duration-200 hover:-translate-y-px"
              }
              style={
                refunded
                  ? {
                      color: "var(--color-ink-900)",
                      borderColor: "rgba(0,0,0,0.14)",
                    }
                  : {
                      background:
                        "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
                      boxShadow: "0 8px 22px rgba(91, 33, 182,0.28)",
                    }
              }
            >
              {t("support")}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="
                mt-1 text-[12px] font-semibold tracking-tight
                text-ink-500 hover:text-ink-900 transition
                self-center
              "
            >
              {t("close")}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Borda girando igual ao ReceiptDialog, em âmbar + violeta da marca.
       * Impressão: só o card, sem animação, sem botões (vira o PDF do comprovante). */}
      <style>{`
        @property --opr-refund-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        .opr-refund-card {
          position: relative;
          border-radius: 24px;
          padding: 2px;
          background: conic-gradient(
            from var(--opr-refund-angle),
            rgba(245, 181, 68, 0.9),
            rgba(157, 43, 237, 0.85),
            rgba(245, 181, 68, 0.9),
            rgba(91, 33, 182, 0.85),
            rgba(245, 181, 68, 0.9)
          );
          animation: opr-refund-border-spin 6s linear infinite;
          box-shadow: 0 0 40px rgba(245, 181, 68, 0.16), 0 28px 70px rgba(0, 30, 15, 0.5);
        }
        .opr-refund-card::before {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          z-index: 0;
        }
        .opr-refund-card > * {
          position: relative;
          z-index: 1;
        }
        .opr-refund-card > *:first-child {
          border-top-left-radius: 22px;
          border-top-right-radius: 22px;
          overflow: hidden;
        }
        @keyframes opr-refund-border-spin {
          to { --opr-refund-angle: 360deg; }
        }
        @media (prefers-reduced-motion: reduce) {
          .opr-refund-card { animation: none; }
        }
        @media print {
          /* fixed se repete em toda página impressa · vira absolute e o resto do
           * site é cortado numa folha só. */
          html, body { height: 100% !important; overflow: hidden !important; }
          .opr-refund-root { position: absolute !important; overflow: visible !important; }
          body * { visibility: hidden !important; }
          .opr-refund-print, .opr-refund-print * { visibility: visible !important; }
          .opr-refund-print {
            position: absolute !important;
            top: 24px; left: 50%;
            transform: translateX(-50%) !important;
            animation: none !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .opr-refund-noprint { display: none !important; }
        }
      `}</style>
    </motion.div>
  );
}

function RefundCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p
        className="text-[9.5px] uppercase tracking-wider font-semibold"
        style={{ color: "var(--color-ink-500)" }}
      >
        {label}
      </p>
      <p
        className="mono-num truncate"
        style={{
          fontSize: "14px",
          color: highlight ? "var(--color-green-900)" : "var(--color-ink-900)",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          marginTop: "3px",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function RefundBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[9.5px] uppercase tracking-wider font-bold mb-0.5"
        style={{ color: "var(--color-ink-500)" }}
      >
        {label}:
      </p>
      <div
        className="text-[12px] leading-relaxed"
        style={{ color: "var(--color-ink-700)" }}
      >
        {children}
      </div>
    </div>
  );
}
