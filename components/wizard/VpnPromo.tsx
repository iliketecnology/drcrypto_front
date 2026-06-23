"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Cores da marca VPN.vu · base teal #099EB4 (extraída do logo).
 * Versão "elétrica" pro CTA: mais saturada/brilhante pra dar destaque sobre o card branco. */
const VPN = {
  brand: "#099EB4",
  glow: "#5BC8DA",
  electric: "#19C6DF",
  deep: "#0795A9",
} as const;

/** Destino do anúncio · `ref=oprpay` permite o Thiago medir conversões vindas do comprovante. */
const VPN_URL = "https://vpn.vu/?ref=oprpay";

/** Glyphs do embaralhamento · mix de hex/símbolos pra dar leitura "cripto/terminal". */
// Sem `-` `/` `\`: esses são oportunidades de quebra de linha (soft-wrap) e fariam
// o texto pular de linha durante o embaralho quando o headline quebra (mobile).
const SCRAMBLE_GLYPHS = "ABCDEF0123456789!<>_[]{}=+*?#§%&";

/**
 * Revela `text` caractere a caractere ("descriptografando"): os ainda-não-revelados
 * piscam com glyphs aleatórios até serem fixados, da esquerda pra direita.
 * - Espaços e quebras de linha são preservados (não embaralham).
 * - `prefers-reduced-motion` → devolve o texto final direto, sem animar.
 * - Roda só quando `start` vira true (sincroniza com a entrada do bloco).
 */
function useScramble(
  text: string,
  { start, reduced }: { start: boolean; reduced: boolean },
): string {
  const [out, setOut] = useState(reduced ? text : "");
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    if (!start) return;
    // Re-roda o embaralho sempre que `text` muda (ex.: troca de idioma i18n),
    // pra o headline acompanhar a tradução em vez de ficar preso no 1º render.
    startedRef.current = true;

    let tick = 0;
    let revealed = 0;
    // Embaralha 2× mais rápido do que revela: dá a sensação de "processando".
    const id = setInterval(() => {
      tick += 1;
      if (tick % 2 === 0) revealed += 1;

      const next = text
        .split("")
        .map((ch, i) => {
          // espaços e quebras de linha não embaralham (preservam o formato da frase)
          if (ch === " " || ch === "\n") return ch;
          if (i < revealed) return ch;
          return SCRAMBLE_GLYPHS[
            Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)
          ];
        })
        .join("");
      setOut(next);

      if (revealed >= text.length) clearInterval(id);
    }, 26);

    return () => clearInterval(id);
  }, [text, start, reduced]);

  return out;
}

/**
 * Bloco de cross-promo do VPN.vu exibido no rodapé do comprovante OprPay.
 * Logo da marca (entrada com glow) + headline "descriptografando" + CTA teal elétrico com shimmer.
 */
export function VpnPromo() {
  const t = useTranslations("wizard");
  const reduced = useReducedMotion() ?? false;

  // Dispara as animações um instante depois do card de comprovante assentar,
  // pra o promo não competir com a entrada do comprovante.
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (reduced) {
      setStarted(true);
      return;
    }
    const id = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(id);
  }, [reduced]);

  const headline = t("receipt.vpnPromo");
  const scrambled = useScramble(headline, { start: started, reduced });

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut, delay: reduced ? 0 : 0.45 }}
      className="relative overflow-hidden rounded-2xl px-4 py-3.5"
      style={{
        // fundo OPACO (sólido) pra o roxo da borda/efeito do comprovante não vazar por baixo.
        // degradê começa no branco (esquerda) e vai pro teal claro da marca (direita).
        background:
          "linear-gradient(120deg, #ffffff 0%, #ffffff 30%, #d6eff3 100%)",
        border: `1px solid rgba(9,158,180,0.35)`,
      }}
    >
      <div className="relative z-[1] flex flex-col gap-3">
        {/* Topo · logo VPN.vu à esquerda + plataformas suportadas à direita */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo VPN.vu · entra com fade+scale e um flash de glow teal atrás */}
          <div className="relative">
            {!reduced && (
              <motion.span
                aria-hidden
                className="absolute -inset-2 rounded-full pointer-events-none"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={
                  started
                    ? { opacity: [0, 0.85, 0], scale: [0.6, 1.2, 1.1] }
                    : {}
                }
                transition={{ duration: 0.9, ease: easeOut, delay: 0.5 }}
                style={{
                  background: `radial-gradient(ellipse, ${VPN.glow}66 0%, transparent 70%)`,
                }}
              />
            )}
            <motion.img
              src="/brand/vpnvu-logo.webp"
              alt="VPN.vu"
              width={156}
              height={38}
              className="relative block"
              style={{ height: 36, width: "auto", objectFit: "contain" }}
              initial={reduced ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: easeOut,
                delay: reduced ? 0 : 0.5,
              }}
            />
          </div>

          {/* Plataformas suportadas · Windows / Apple / Android */}
          <div
            className="flex items-center gap-2.5 shrink-0"
            style={{ color: VPN.brand }}
            aria-label="Disponível para Windows, Mac e Android"
          >
            <WindowsIcon />
            <AppleIcon />
            <AndroidIcon />
          </div>
        </div>

        <p
          aria-label={headline}
          className="leading-snug font-semibold"
          style={{
            color: "var(--color-ink-900)",
            fontFamily: "ui-monospace, 'JetBrains Mono', 'Menlo', monospace",
            letterSpacing: "-0.02em",
            // Fonte fluida + sem nowrap: encolhe e quebra pra nunca vazar o card.
            fontSize: "clamp(10.5px, 3vw, 13px)",
          }}
        >
          <span aria-hidden>{scrambled || (reduced ? headline : "")}</span>
        </p>

        <a
          href={VPN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="vpn-promo-cta relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-bold tracking-tight text-[13px] transition-transform duration-200 hover:-translate-y-px"
          style={{
            background: `linear-gradient(135deg, ${VPN.electric} 0%, ${VPN.deep} 100%)`,
          }}
        >
          <span className="relative z-[1]">{t("receipt.vpnCta")}</span>
          <span aria-hidden className="relative z-[1]">
            →
          </span>
          {!reduced && <span aria-hidden className="vpn-promo-shimmer" />}
        </a>
      </div>

      <style>{`
        .vpn-promo-cta {
          box-shadow: 0 8px 22px rgba(25, 198, 223, 0.42),
            0 0 0 1px rgba(255, 255, 255, 0.12) inset;
        }
        .vpn-promo-shimmer {
          position: absolute;
          inset: 0;
          transform: translateX(-130%);
          background: linear-gradient(
            100deg,
            transparent 30%,
            rgba(255, 255, 255, 0.55) 50%,
            transparent 70%
          );
          animation: vpn-promo-sweep 3.4s ease-in-out infinite;
        }
        @keyframes vpn-promo-sweep {
          0%, 16% { transform: translateX(-130%); }
          52%, 100% { transform: translateX(230%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vpn-promo-shimmer { display: none; }
        }
      `}</style>
    </motion.div>
  );
}

/* ============== Ícones de plataforma · idênticos ao site vpn.vu ==============
 * Windows: mesmo path da landing download.vpn.vu (PlatformBadges.tsx).
 * Apple/Android: paths do simple-icons (siApple/siAndroid) inline pra não puxar a dep. */

function WindowsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 5.5L10.5 4.4v7.1H3zM10.5 12.5v7.1L3 18.5v-6zM11.5 4.25L21 3v8.5h-9.5zM21 12.5V21l-9.5-1.25V12.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ transform: "translateY(-2px)" }}
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.4395 5.5586c-.675 1.1664-1.352 2.3318-2.0274 3.498-.0366-.0155-.0742-.0286-.1113-.043-1.8249-.6957-3.484-.8-4.42-.787-1.8551.0185-3.3544.4643-4.2597.8203-.084-.1494-1.7526-3.021-2.0215-3.4864a1.1451 1.1451 0 0 0-.1406-.1914c-.3312-.364-.9054-.4859-1.379-.203-.475.282-.7136.9361-.3886 1.5019 1.9466 3.3696-.0966-.2158 1.9473 3.3593.0172.031-.4946.2642-1.3926 1.0177C2.8987 12.176.452 14.772 0 18.9902h24c-.119-1.1108-.3686-2.099-.7461-3.0683-.7438-1.9118-1.8435-3.2928-2.7402-4.1836a12.1048 12.1048 0 0 0-2.1309-1.6875c.6594-1.122 1.312-2.2559 1.9649-3.3848.2077-.3615.1886-.7956-.0079-1.1191a1.1001 1.1001 0 0 0-.8515-.5332c-.5225-.0536-.9392.3128-1.0488.5449zm-.0391 8.461c.3944.5926.324 1.3306-.1563 1.6503-.4799.3197-1.188.0985-1.582-.4941-.3944-.5927-.324-1.3307.1563-1.6504.4727-.315 1.1812-.1086 1.582.4941zM7.207 13.5273c.4803.3197.5506 1.0577.1563 1.6504-.394.5926-1.1038.8138-1.584.4941-.48-.3197-.5503-1.0577-.1563-1.6504.4008-.6021 1.1087-.8106 1.584-.4941z" />
    </svg>
  );
}
