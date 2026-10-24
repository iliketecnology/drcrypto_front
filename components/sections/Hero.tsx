"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { TransactionCard } from "@/components/ui/TransactionCard";
import {
  ServiceAlertBadge,
  ServiceAlertDialog,
} from "@/components/ui/ServiceAlert";
import { USDTLogo, PIXLogo } from "@/components/illustrations/BrandLogos";
import { GlobeWireframe } from "@/components/illustrations/GlobeWireframe";
import { useSwapWizard } from "@/components/wizard/SwapWizardProvider";
import type { PaymentMode } from "@/components/wizard/types";
import { isUnstable } from "@/lib/service-status";

const easeOut = [0.16, 1, 0.3, 1] as const;

type PaymentCard = {
  mode: PaymentMode;
  /** Destino do swap mostrado depois da seta (PIX, Boleto, QR Code). */
  to: string;
  /** Sufixo opcional em accent (ex.: "(BRL)" no PIX). */
  accent?: string;
  description: string;
};

const PAYMENT_CARDS: PaymentCard[] = [
  {
    mode: "pix",
    to: "PIX",
    accent: "(BRL)",
    description: "Informe a chave PIX do destinatário.",
  },
  // Boleto pronto, porém OCULTO até o Emerson finalizar o fluxo de boleto.
  // Para reativar, basta descomentar este card.
  {
    mode: "boleto",
    to: "Boleto",
    description: "Escaneie o código de barras ou digite.",
  },
  {
    mode: "qr",
    to: "QR Copia e Cola",
    description: "Escaneie o QR Code do PIX ou cole o código.",
  },
];

export function Hero() {
  const t = useTranslations("hero");
  const { openWithMode } = useSwapWizard();
  const [alertMode, setAlertMode] = useState<PaymentMode | null>(null);
  const closeAlert = useCallback(() => setAlertMode(null), []);
  const activateCard = (mode: PaymentMode) =>
    isUnstable(mode) ? setAlertMode(mode) : openWithMode(mode);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Atmosfera de fundo */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-white" />

      {/* Halo verde sob o headline */}
      <div
        aria-hidden
        className="absolute -z-10 top-[28%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(ellipse, var(--color-green-100) 0%, transparent 65%)",
        }}
      />

      {/* Halo secundário canto inferior direito */}
      <div
        aria-hidden
        className="absolute -z-10 bottom-0 right-[-200px] w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, var(--color-green-300) 0%, transparent 70%)",
        }}
      />

      {/* Halo roxo dedicado ATRÁS dos botões de pagamento (lado esquerdo).
          Dá base pro vidro translúcido refratar — equivalente ao mapa que
          cobre os botões na USPIX. Sem isto, o glass ficaria sobre branco
          liso e "sumiria". */}
      <div
        aria-hidden
        className="absolute -z-10 pointer-events-none left-[-4%] top-[56%] w-[720px] max-w-[60vw] h-[380px] rounded-[45%] blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(ellipse, var(--color-green-300) 0%, var(--color-green-100) 38%, transparent 72%)",
        }}
      />

      {/* Globo wireframe 3D · atmosfera à direita, sangra pra fora da borda.
          Concentrado no lado direito (atrás do card) pra deixar o texto à
          esquerda limpo. maskImage radial (no próprio Canvas) esmaece as bordas. */}
      <div
        aria-hidden
        className="
          absolute -z-10 pointer-events-none
          top-1/2 -translate-y-1/2 aspect-square
          right-[-28%] sm:right-[-16%] lg:right-[-6%]
          opacity-90 lg:opacity-100
        "
        style={{ height: "118%" }}
      >
        <GlobeWireframe variant="light" />
      </div>

      {/* Grain overlay sutil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.035] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23a)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* min-h-svh (não dvh): no mobile o `dvh` é re-medido durante o scroll
          conforme a barra de URL recolhe, fazendo o hero "crescer" e arrastar
          o header fixed. `svh` é a altura com a barra visível e é estável. */}
      <div className="container-app relative flex flex-col justify-center min-h-[70svh] pt-24 pb-16 sm:block sm:min-h-0 md:pt-32 md:pb-24 lg:flex lg:flex-col lg:justify-center lg:pt-24 lg:pb-20 lg:min-h-[100vh]">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna principal · texto */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
              className="
                eyebrow inline-flex items-center gap-3
                px-3.5 py-1.5 rounded-full
              "
              style={{
                background: "rgba(157, 43, 237, 0.08)",
                border: "1px solid rgba(157, 43, 237, 0.18)",
                color: "var(--color-green-900)",
              }}
            >
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--color-green-500)",
                  boxShadow: "0 0 12px var(--color-green-500)",
                }}
              />
              {t("eyebrow")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: easeOut, delay: 0.2 }}
              className="display-xl mt-8 max-w-[16ch]"
            >
              {t("headlineStart")}{" "}
              <span
                style={{
                  color: "var(--color-green-500)",
                  fontStyle: "italic",
                  fontWeight: 900,
                  display: "inline-block",
                  letterSpacing: "-0.04em",
                }}
              >
                {t("headlineHighlight")}
              </span>{" "}
              {t("headlineEnd")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.5 }}
              className="body-lg mt-8 max-w-[46ch]"
            >
              {t("sub")}
            </motion.p>

            {/* Cards de modalidade de pagamento */}
            <div className="mt-8 sm:mt-10 w-full flex flex-col items-stretch gap-2.5 sm:grid sm:grid-cols-3 sm:gap-3">
              {PAYMENT_CARDS.map((card, i) => (
                /* Animação de entrada em cascata (stagger). SÓ opacity:
                   animar transform/y quebraria a composição do backdrop-filter. */
                /* div[role=button], não <button>: o badge de alerta é um
                   botão de verdade dentro do card, e botão dentro de botão é
                   HTML inválido (o navegador achata o DOM). */
                <motion.div
                  key={card.mode}
                  role="button"
                  tabIndex={0}
                  /* Método com alerta: o card inteiro abre o aviso, igual à
                     exclamação, em vez do wizard (Thiago, 16/10). */
                  onClick={() => activateCard(card.mode)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activateCard(card.mode);
                    }
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: easeOut,
                    delay: 0.7 + i * 0.13,
                  }}
                  className="
                    pay-glass-light group relative flex items-center text-left
                    sm:flex-col sm:items-start
                    rounded-full sm:rounded-2xl
                    px-5 py-4 sm:p-4 sm:min-h-[84px]
                    transition-shadow duration-300
                    cursor-pointer select-none
                  "
                >
                  <span
                    className={`relative z-10 flex flex-col min-w-0 sm:w-full sm:pr-9 ${
                      card.mode === "qr" ? "sm:max-w-[82%]" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[15px] sm:text-[14px] font-bold tracking-tight whitespace-nowrap text-ink-900">
                      USDT
                      <svg
                        className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-green-500)"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M5 12h13M13 6l6 6-6 6" />
                      </svg>
                      <span>
                        {card.to}
                        {card.accent && (
                          <span className="text-green-700"> {card.accent}</span>
                        )}
                      </span>
                      {isUnstable(card.mode) && (
                        <ServiceAlertBadge
                          mode={card.mode}
                          onOpen={setAlertMode}
                        />
                      )}
                    </span>
                    <span className="hidden sm:block text-[11px] mt-1.5 leading-snug text-ink-500">
                      {card.description}
                    </span>
                  </span>
                  {/* Seta-CTA no canto · inline à direita no mobile, topo-direito no desktop */}
                  <span
                    className="
                      pointer-events-none z-10 shrink-0 grid place-items-center rounded-full
                      ml-auto sm:ml-0 sm:absolute sm:top-4 sm:right-4
                      transition-transform duration-300
                      group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                    "
                    style={{
                      width: 30,
                      height: 30,
                      background: "var(--color-green-500)",
                      color: "#ffffff",
                      boxShadow: "0 4px 12px rgba(157,43,237,0.4)",
                    }}
                    aria-hidden
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17 L17 7 M8 7 H17 V16" />
                    </svg>
                  </span>
                </motion.div>
              ))}
            </div>

            <ServiceAlertDialog mode={alertMode} onClose={closeAlert} />

            {/* Prova institucional · 3 badges curtos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-10 hidden sm:flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-ink-700">
                <USDTLogo size={18} />
                {t("badgeSteps")}
              </span>
              <span
                aria-hidden
                className="w-px h-4 hidden sm:inline-block"
                style={{ background: "var(--color-ink-200)" }}
              />
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-ink-700">
                <PIXLogo size={18} />
                {t("badgeInstant")}
              </span>
              <span
                aria-hidden
                className="w-px h-4 hidden sm:inline-block"
                style={{ background: "var(--color-ink-200)" }}
              />
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-ink-700">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--color-green-500)" }}
                  aria-hidden
                />
                {t("badgeNoBureaucracy")}
              </span>
            </motion.div>
          </div>

          {/* Coluna lateral · card mockup de transação */}
          <div className="lg:col-span-4 relative h-[420px] hidden lg:block">
            <TransactionCard />
          </div>
        </div>
      </div>

      {/* Borda inferior sutil */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-ink-200) 30%, var(--color-ink-200) 70%, transparent)",
        }}
      />
    </section>
  );
}
