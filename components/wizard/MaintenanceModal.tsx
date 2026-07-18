"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Janela de manutenção (UTC-3). Fora dela o modal não aparece.
 * Datas em ISO com offset explícito pra não depender do fuso do navegador. */
const MAINTENANCE_START = new Date("2026-07-18T01:00:00-03:00");
const MAINTENANCE_END = new Date("2026-07-19T14:00:00-03:00");

/** Modal de manutenção — bloqueante e sem saída.
 *
 * Sem botão de fechar, sem clique no backdrop, sem ESC, sem scroll no body.
 * É o último elemento clicável da página enquanto estiver montado: o z-index
 * fica acima do SwapWizard (z-1000) e o overlay captura todos os eventos.
 *
 * Uso: montar no layout raiz, acima de tudo.
 *   <MaintenanceModal />
 *
 * Para forçar a exibição (teste/produção fora da janela), passe `force`:
 *   <MaintenanceModal force />
 */
export function MaintenanceModal({ force = false }: { force?: boolean }) {
  const now = Date.now();
  const inWindow =
    now >= MAINTENANCE_START.getTime() && now <= MAINTENANCE_END.getTime();
  const active = force || inWindow;

  // Trava scroll e intercepta teclas de escape/atalhos de navegação enquanto ativo.
  useEffect(() => {
    if (!active) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function blockKeys(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    // capture: true → pega o evento antes de qualquer handler de modal existente
    document.addEventListener("keydown", blockKeys, true);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", blockKeys, true);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="maintenance-title"
      aria-describedby="maintenance-desc"
    >
      {/* Backdrop escuro · sem onClick: não fecha de jeito nenhum */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "rgba(0, 6, 14, 0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="relative z-10 w-full max-w-[480px] rounded-3xl overflow-hidden bg-white"
        style={{
          border: "1px solid var(--color-ink-200)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(90deg, var(--color-green-500), var(--color-green-700))",
          }}
        />

        <div className="px-8 sm:px-10 py-9 flex flex-col items-center text-center gap-4">
          <span
            className="w-14 h-14 rounded-full grid place-items-center"
            style={{ background: "var(--color-green-100)" }}
            aria-hidden
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-5 5a1.5 1.5 0 0 0 0 2.1l.9.9a1.5 1.5 0 0 0 2.1 0l5-5a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.1-2.1 2.4-2.4Z"
                stroke="var(--color-green-700)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <h2
            id="maintenance-title"
            className="text-[21px] font-bold tracking-tight"
            style={{ color: "var(--color-ink-900)", letterSpacing: "-0.02em" }}
          >
            Aviso de Manutenção
          </h2>

          <p
            id="maintenance-desc"
            className="text-[14px] leading-relaxed"
            style={{ color: "var(--color-ink-600)" }}
          >
            Informamos que estamos realizando uma manutenção entre{" "}
            <strong style={{ color: "var(--color-ink-900)" }}>
              18/07 às 01:00 (UTC-3)
            </strong>{" "}
            até{" "}
            <strong style={{ color: "var(--color-ink-900)" }}>
              19/07 às 14:00 (UTC-3)
            </strong>
            .
          </p>

          <div
            className="w-full h-px my-1"
            style={{ background: "var(--color-ink-100)" }}
          />

          <div className="flex flex-col gap-1">
            <p
              className="text-[13px]"
              style={{ color: "var(--color-ink-500)" }}
            >
              Atenciosamente,
            </p>
            <p
              className="text-[14px] font-semibold"
              style={{ color: "var(--color-ink-900)" }}
            >
              Equipe TMBS, LLC.
            </p>
            <a
              href="https://tmbs.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold underline underline-offset-2 transition"
              style={{ color: "var(--color-green-700)" }}
            >
              https://tmbs.tech
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
