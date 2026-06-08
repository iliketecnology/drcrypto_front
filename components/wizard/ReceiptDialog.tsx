"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { LIQUIDITY_FEE, type SwapResult } from "./types";

const easeOut = [0.16, 1, 0.3, 1] as const;

type Props = {
  isOpen: boolean;
  data: SwapResult | null;
  onClose: () => void;
};

/** Janela própria do comprovante, exibida fora do SwapWizard.
 * Layout institucional alinhado ao template fornecido pelo cliente:
 * Remetente / Beneficiário / ID Transação E2E / Representante.
 * Aplica glassmorph leve pra diferenciar do wizard. */
export function ReceiptDialog({ isOpen, data, onClose }: Props) {
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
      {isOpen && data && <ReceiptInner data={data} onClose={onClose} />}
    </AnimatePresence>
  );
}

function ReceiptInner({
  data,
  onClose,
}: {
  data: SwapResult;
  onClose: () => void;
}) {
  const t = useTranslations("wizard");
  const d = new Date(data.completedAt);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  const e2eId = data.endtoend || "Beneficiário PIX";
  const [sent, setSent] = useState(false);

  const beneficiary = data.beneficiary || "Beneficiário PIX";
  const networkLabel = "Polygon";

  // Parse seguro do valor enviado em USDT pra calcular a taxa do provedor de liquidez.
  // Aceita formato BR (1.234,56) ou US (1234.56).
  const usdtNumber = (() => {
    const raw = (data.amountUSDT || "0").replace(/\./g, "").replace(",", ".");
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  })();
  const feePct = LIQUIDITY_FEE[data.network];
  const feeUSDT = usdtNumber * feePct;
  const feeBRL = feeUSDT * data.rate;
  const fmtUSDT = (n: number) => n.toFixed(2).replace(".", ",");
  const fmtBRL = (n: number) =>
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="opr-receipt-title"
    >
      {/* Overlay com gradiente verde escuro · diferencia do overlay do wizard */}
      <motion.button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default"
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

      {/* Card glassmorph · borda gradient verde rotacionando + glow pulsante */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="relative z-10 w-full max-w-[440px] opr-receipt-card"
      >
        {/* Header escuro institucional */}
        <div
          className="px-6 py-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #2a0548 0%, #150226 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-12 -right-8 w-40 h-40 rounded-full blur-2xl opacity-35 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--color-green-300) 0%, transparent 70%)",
            }}
          />
          <div className="relative flex items-center justify-between">
            <span
              id="opr-receipt-title"
              className="text-[10.5px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--color-green-300)" }}
            >
              {t("receipt.label")}
            </span>
            <span
              className="
                inline-flex items-center gap-1.5
                px-2 py-0.5 rounded-full
                text-[9px] font-bold tracking-wider uppercase
              "
              style={{
                background: "rgba(157, 43, 237, 0.18)",
                color: "var(--color-green-300)",
                border: "1px solid rgba(157, 43, 237, 0.4)",
              }}
            >
              <span
                aria-hidden
                className="w-1 h-1 rounded-full"
                style={{
                  background: "var(--color-green-300)",
                  boxShadow: "0 0 6px var(--color-green-300)",
                }}
              />
              {t("receipt.status")}
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

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <ReceiptCell
              label={t("receipt.totalUsdt")}
              value={`${data.amountUSDT || "0"} · ${networkLabel}`}
            />
            <ReceiptCell
              label={t("receipt.pixValue")}
              value={`R$ ${data.amountBRL || "0,00"}`}
              highlight
            />

            {/* <ReceiptCell
              label={t("receipt.rate")}
              value={`R$ ${data.rate.toFixed(2).replace(".", ",")}`}
            /> */}

            {/* <ReceiptCell
              label={t("receipt.fee", {
                pct: (feePct * 100).toLocaleString("pt-BR", {
                  maximumFractionDigits: 2,
                }),
              })}
              value={`${fmtUSDT(feeUSDT)} USDT · R$ ${fmtBRL(feeBRL)}`}
            /> */}
          </div>

          <div
            className="pt-3 border-t flex flex-col gap-3"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
          >
            <ReceiptBlock label={t("receipt.sender")}>
              Virtual
              <br />
              <span className="mono-num">CNPJ: 32.545.471/0001-96</span>
            </ReceiptBlock>

            <ReceiptBlock label={t("receipt.beneficiary")}>
              {beneficiary}
              <br />
              <span className="text-[10px] uppercase tracking-wider font-bold text-ink-500">
                {t("receipt.txId")}
              </span>{" "}
              <span className="mono-num text-[10.5px] break-all">{e2eId}</span>
            </ReceiptBlock>

            <ReceiptBlock label={t("receipt.representative")}>
              <strong style={{ color: "var(--color-ink-900)" }}>
                OprPay
              </strong>
              {" · "}
              <a
                href="mailto:tmbs@tmbs.tech"
                style={{ color: "var(--color-green-700)" }}
                className="underline underline-offset-2"
              >
                tmbs@tmbs.tech
              </a>
              <br />
              <span className="mono-num">+1 (872) 359-9292</span>
              {" · "}
              TMBS, LLC.
              <br />8 The Green, Ste R, Dover · State of Delaware ·{" "}
              <span className="mono-num">19901</span>
            </ReceiptBlock>
          </div>
          {/* 
          <button
            type="button"
            onClick={() => setSent(true)}
            disabled={sent}
            className="
              mt-1 w-full inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-full
              text-white font-semibold tracking-tight text-[14px]
              transition-all duration-300
              disabled:opacity-90 disabled:cursor-default
            "
            style={{
              background: sent
                ? "var(--color-green-700)"
                : "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
              boxShadow: sent ? "none" : "0 8px 22px rgba(91, 33, 182,0.28)",
            }}
          >
            {sent ? (
              <>
                ✓ Comprovante enviado
                {data.receiptEmail ? ` para ${data.receiptEmail}` : ""}
              </>
            ) : (
              <>
                Enviar Comprovante <span aria-hidden>→</span>
              </>
            )}
          </button> */}

          <button
            type="button"
            onClick={onClose}
            className="
              text-[12px] font-semibold tracking-tight
              text-ink-500 hover:text-ink-900 transition
              self-center
            "
          >
            {t("receipt.close")}
          </button>
        </div>
      </motion.div>

      {/* Estilos do card animado · borda gradient verde rotacionando + glow pulsante.
       * Técnica: @property pra animar a variável CSS --opr-angle no conic-gradient.
       * background em duas camadas (padding-box pro interior glassmorph, border-box pro gradient). */}
      <style>{`
        @property --opr-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        .opr-receipt-card {
          position: relative;
          border-radius: 24px;
          padding: 2px;
          background: conic-gradient(
            from var(--opr-angle),
            rgba(157, 43, 237, 0.95),
            rgba(104, 221, 189, 0.7),
            rgba(157, 43, 237, 0.95),
            rgba(91, 33, 182, 0.85),
            rgba(157, 43, 237, 0.95)
          );
          animation:
            opr-receipt-border-spin 5s linear infinite,
            opr-receipt-glow-pulse 3.6s ease-in-out infinite;
        }
        .opr-receipt-card::before {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
          z-index: 0;
        }
        .opr-receipt-card > * {
          position: relative;
          z-index: 1;
        }
        .opr-receipt-card > *:first-child {
          border-top-left-radius: 22px;
          border-top-right-radius: 22px;
          overflow: hidden;
        }
        .opr-receipt-card > *:last-child {
          border-bottom-left-radius: 22px;
          border-bottom-right-radius: 22px;
        }
        @keyframes opr-receipt-border-spin {
          to { --opr-angle: 360deg; }
        }
        @keyframes opr-receipt-glow-pulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(157, 43, 237, 0.22),
              0 0 70px rgba(157, 43, 237, 0.1),
              0 28px 70px rgba(0, 30, 15, 0.5);
          }
          50% {
            box-shadow:
              0 0 50px rgba(157, 43, 237, 0.5),
              0 0 130px rgba(157, 43, 237, 0.28),
              0 28px 70px rgba(0, 30, 15, 0.5);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .opr-receipt-card {
            animation: none;
            background: linear-gradient(135deg, rgba(157, 43, 237,0.85), rgba(91, 33, 182,0.85));
            box-shadow: 0 28px 70px rgba(0,30,15,0.5);
          }
        }
      `}</style>
    </motion.div>
  );
}

/** Gera identificador no formato End-to-End do PIX. Memoizado por instância. */
function useEndToEndId() {
  const [id] = useState(() => {
    const d = new Date();
    const datePart =
      String(d.getFullYear()) +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let tail = "";
    for (let i = 0; i < 18; i++) {
      tail += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `E17028875${datePart}${tail}`.slice(0, 32);
  });
  return id;
}

function ReceiptCell({
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

function ReceiptBlock({
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
