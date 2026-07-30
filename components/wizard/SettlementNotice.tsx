"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatProcessingDay,
  getSettlementNotice,
  type SettlementNotice,
} from "@/lib/settlementWindow";

/**
 * Aviso de prazo pra operações a partir de R$ 30.000 (regra da janela 9h-20h).
 * Ver `lib/settlementWindow.ts` pra regra de negócio.
 */

/**
 * Recalcula o aviso enquanto a tela fica aberta — o relógio corre e às 19h58 o
 * texto muda sozinho. Devolve `null` no primeiro render de propósito: a conta
 * depende da hora do cliente e renderizar no servidor quebraria a hidratação.
 *
 * @param windowMinutes validade restante do QR (o step 4 passa o timer real).
 */
export function useSettlementNotice(
  amountBRL: number,
  windowMinutes?: number,
): SettlementNotice | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  return getSettlementNotice(amountBRL, now, windowMinutes);
}

export function SettlementNoticeBanner({
  notice,
}: {
  notice: SettlementNotice | null;
}) {
  const t = useTranslations("wizard.settlement");
  const locale = useLocale();

  if (!notice) return null;

  const day = formatProcessingDay(notice.processingDay, locale);

  return (
    <div
      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
      style={{
        background: "#fff8e6",
        border: "1px solid #f0dca8",
        color: "#7a5310",
      }}
      role="status"
    >
      <ClockIcon />
      {/* Sem título separado de propósito: no mobile cada linha extra empurra
       * o botão de avançar contra a barra do navegador. */}
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-[11.5px] leading-snug">
          {notice.status === "sameDay"
            ? t("sameDay")
            : t("nextBusinessDay", { day })}
        </p>
        {notice.crossesCutoff && (
          <p className="text-[11.5px] leading-snug font-semibold">
            {t("crossesCutoff", { day })}
          </p>
        )}
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b7791f"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 mt-0.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
