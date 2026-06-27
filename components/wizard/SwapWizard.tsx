"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { USDTLogo, PIXLogo } from "@/components/illustrations/BrandLogos";
import {
  ChainLogo,
  CHAIN_COLORS,
  type ChainKey,
} from "@/components/illustrations/ChainLogo";
import { useUsdtBrlRate, formatBRL } from "@/lib/useUsdtBrlRate";
import {
  NETWORK_ADDRESS,
  isValidWallet,
  type Network,
  type PixKeyType,
  type PaymentMode,
  type SwapResult,
} from "./types";
import { CameraScanner } from "./CameraScanner";
import { parsePixQr } from "@/lib/pixEmvParser";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { Logo } from "../ui/Logo";

const easeOut = [0.16, 1, 0.3, 1] as const;
const TOTAL_STEPS = 4;
const PIX_EXPIRY_SECONDS = 15 * 60;

/** Mínimo em USDT e teto em BRL por transação (limite regulatório). */
const MIN_USDT = 10;
const MAX_BRL = 99_000;

/** WhatsApp do atendimento (TMBS) — destino do deep-link de recuperação pós-timeout (hash).
 * Mesmo número do rodapé do site. Ver ExpiredHashFlow. */
const SUPPORT_WHATSAPP = "5511974101010";

const PIX_KEY_OPTIONS: Array<{
  id: PixKeyType;
  label: string;
  placeholder: string;
}> = [
  { id: "cpf", label: "CPF/CNPJ", placeholder: "000.000.000-00" },
  { id: "email", label: "E-mail", placeholder: "voce@email.com" },
  { id: "phone", label: "Telefone", placeholder: "(11) 99999-9999" },
  {
    id: "evp",
    label: "Aleatória",
    placeholder: "00000000-0000-0000-0000-000000000000",
  },
];

type Props = {
  isOpen: boolean;
  mode: PaymentMode;
  onClose: () => void;
  onComplete: (result: SwapResult) => void;
};

type WizardState = {
  step: 1 | 2 | 3 | 4;
  verifying: boolean;
  /** O timer de 15 min zerou sem o pagamento ser detectado → mostra o fluxo de recuperação (hash). */
  expired: boolean;
  network: Network;
  amountUSDT: string;
  amountBRL: string;
  pixKeyType: PixKeyType;
  pixKey: string;
  returnWallet: string;
  receiptEmail: string;
  txHash: string;
  endtoend: string;
  address_send: string;
  order_id: string;
  beneficiary: string;
  rate: number;
  /** Boleto: código de barras digitado (44, 47 ou 48 dígitos numéricos). */
  boletoCode: string;
  /** PIX QR: payload EMV completo colado/scaneado pelo usuário. */
  pixQrRaw: string;
  /** true quando o QR escaneado já continha valor embutido no campo 54. */
  pixQrHasAmount: boolean;
};

const INITIAL_STATE: WizardState = {
  step: 1,
  verifying: false,
  expired: false,
  network: "polygon",
  amountUSDT: "",
  pixKeyType: "cpf",
  pixKey: "",
  returnWallet: "",
  receiptEmail: "",
  amountBRL: "",
  txHash: "",
  endtoend: "",
  address_send: "",
  order_id: "string",
  beneficiary: "",
  rate: 0,
  boletoCode: "",
  pixQrRaw: "",
  pixQrHasAmount: false,
};

/** Parse de número PT-BR (1.234,56 → 1234.56). */
function parsePtBR(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Sanitiza input numérico mantendo dígitos, ponto e vírgula. */
function sanitizeNumberInput(value: string): string {
  return value.replace(/[^\d.,]/g, "");
}

/** Parse de número no campo USDT (separador decimal interno = ponto).
 * Aceita vírgula também: o teclado decimal do iOS em pt-BR só oferece vírgula,
 * então normalizamos pra ponto antes do parse. */
function parseUSD(value: string): number {
  const n = Number.parseFloat(
    String(value)
      .replace(/,/g, ".")
      .replace(/[^\d.]/g, ""),
  );
  return Number.isFinite(n) ? n : 0;
}

/** Sanitiza input USDT: só dígitos e um único separador decimal.
 * Vírgula (teclado iOS pt-BR) é convertida em ponto, o separador interno. */
function sanitizeUSDInput(value: string): string {
  const cleaned = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
}

/** Aplica máscara visual à chave PIX conforme o tipo.
 * CPF/CNPJ → 000.000.000-00 (até 11 dígitos) ou 00.000.000/0000-00 (12+) ·
 * Telefone → (00) 00000-0000 · Aleatória → UUID 8-4-4-4-12 · E-mail → sem máscara. */
function maskPixKey(type: PixKeyType, value: string): string {
  if (type === "cpf") {
    // Documento aceita CPF (11) e CNPJ (14); troca de máscara assim que
    // passa dos 11 dígitos, mantendo só dígitos como fonte da verdade.
    const d = value.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 11) {
      return d
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    }
    return d
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
  }
  if (type === "phone") {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (type === "evp") {
    const h = value.replace(/[^a-fA-F0-9]/g, "").slice(0, 32);
    return h
      .replace(/^(.{8})(.)/, "$1-$2")
      .replace(/^(.{8}-.{4})(.)/, "$1-$2")
      .replace(/^(.{8}-.{4}-.{4})(.)/, "$1-$2")
      .replace(/^(.{8}-.{4}-.{4}-.{4})(.)/, "$1-$2");
  }
  return value;
}

/** Remove a máscara antes de enviar pro backend.
 * CPF/CNPJ/Telefone → só dígitos · E-mail/Aleatória → texto cru (trim). */
function cleanPixKey(type: PixKeyType, value: string): string {
  if (type === "cpf" || type === "phone") return value.replace(/\D/g, "");
  return value.trim();
}

/** Trunca endereço de carteira preservando início e fim.
 * Generoso por padrão (14 iniciais + 8 finais) pra dar leitura confortável;
 * o CSS `truncate` no container faz fallback se ainda não couber em viewports muito estreitos. */
function truncateAddress(address: string): string {
  if (address.length <= 24) return address;
  return `${address.slice(0, 14)}…${address.slice(-8)}`;
}

/** Valida código de boleto: 44 dígitos (código de barras) ou 47/48 (linha digitável). */
function isValidBoletoCode(code: string): boolean {
  const digits = code.replace(/\D/g, "");
  return digits.length === 44 || digits.length === 47 || digits.length === 48;
}

/** Tenta extrair valor do boleto bancário (código de barras 44 dígitos, posições 9-18). */
function extractBoletoAmount(code: string): string {
  const digits = code.replace(/\D/g, "");
  if (digits.length !== 44) return "";
  const raw = digits.slice(9, 19);
  const cents = parseInt(raw, 10);
  if (isNaN(cents) || cents === 0) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** Valida payload EMV de PIX (copia-e-cola): começa com "00020126" e tem tamanho razoável. */
function isValidPixQr(raw: string): boolean {
  const t = raw.trim();
  return t.length >= 50 && t.toUpperCase().startsWith("000201");
}

export function SwapWizard({ isOpen, mode, onClose, onComplete }: Props) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const { rate } = useUsdtBrlRate();

  const amountNumber = parseUSD(state.amountUSDT);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

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

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(reset, 350);
      return () => clearTimeout(t);
    }
  }, [isOpen, reset]);

  const walletValid = isValidWallet(state.network, state.returnWallet);
  const emailValid = /\S+@\S+\.\S+/.test(state.receiptEmail.trim());

  const amountBrlNumber = parsePtBR(state.amountBRL);

  const canAdvance = (() => {
    if (mode === "boleto") {
      if (state.step === 1) return isValidBoletoCode(state.boletoCode);
      if (state.step === 2)
        return amountNumber >= MIN_USDT && amountBrlNumber <= MAX_BRL;
    } else if (mode === "qr") {
      if (state.step === 1)
        // payload EMV válido (chave pode estar em campo não-padrão em alguns bancos)
        return isValidPixQr(state.pixQrRaw);
      if (state.step === 2)
        // valor confirmado (pode ter vindo do QR ou digitado)
        return amountNumber >= MIN_USDT && amountBrlNumber <= MAX_BRL;
    } else {
      // modo pix
      if (state.step === 1)
        return amountNumber >= MIN_USDT && amountBrlNumber <= MAX_BRL;
      if (state.step === 2) return state.pixKey.trim().length >= 4;
    }
    if (state.step === 3) return walletValid && emailValid;
    if (state.step === 4) return true;
    return false;
  })();

  const goNext = () => {
    if (!canAdvance) return;
    if (state.step === 4) {
      setState((s) => ({ ...s, verifying: true }));
      return;
    }
    setState((s) => ({
      ...s,
      step: Math.min(TOTAL_STEPS, s.step + 1) as WizardState["step"],
    }));
  };
  const goBack = () =>
    setState((s) => ({
      ...s,
      step: Math.max(1, s.step - 1) as WizardState["step"],
    }));

  const handleComplete = () => {
    onComplete({
      amountUSDT: state.amountUSDT || "0",
      amountBRL: state.amountBRL,
      network: state.network,
      pixKey: state.pixKey,
      pixKeyType: state.pixKeyType,
      returnWallet: state.returnWallet,
      receiptEmail: state.receiptEmail,
      txHash: state.txHash,
      beneficiary: state.beneficiary,
      endtoend: state.endtoend,
      completedAt: Date.now(),
      rate: state.rate,
      paymentMode: mode,
      boletoCode: state.boletoCode || undefined,
      pixQrRaw: state.pixQrRaw || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="opr-wizard-title"
        >
          <motion.button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 cursor-default"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,30,15,0.65) 0%, rgba(0,8,4,0.85) 90%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="
              relative z-10 w-full max-w-[560px] rounded-3xl overflow-hidden
              bg-white border border-ink-200
              flex flex-col
            "
            style={{ boxShadow: "0 32px 80px rgba(0,30,15,0.4)" }}
          >
            <Header step={state.step} onClose={onClose} />

            <ProgressBar step={state.step} />

            <div className="px-8 sm:px-10 pb-2 pt-6">
              <AnimatePresence mode="wait">
                {/* Boleto: step 1 = barcode, step 2 = amount+network */}
                {mode === "boleto" && state.step === 1 && (
                  <Step1Boleto
                    key="s1b"
                    boletoCode={state.boletoCode}
                    onBoletoCode={(v) => {
                      const extracted = extractBoletoAmount(v);
                      setState((s) => ({
                        ...s,
                        boletoCode: v,
                        ...(extracted ? { amountBRL: extracted } : {}),
                      }));
                    }}
                  />
                )}
                {mode === "boleto" && state.step === 2 && (
                  <Step1Network
                    key="s2b"
                    network={state.network}
                    amountUSDT={state.amountUSDT}
                    overLimit={amountBrlNumber > MAX_BRL}
                    rate={rate}
                    onNetwork={(v) => setState((s) => ({ ...s, network: v }))}
                    onAmountUSDT={(v) =>
                      setState((s) => ({ ...s, amountUSDT: v }))
                    }
                    onAmountBRL={(v) =>
                      setState((s) => ({ ...s, amountBRL: v }))
                    }
                    onRate={(v) => setState((s) => ({ ...s, rate: v }))}
                  />
                )}
                {/* PIX: step 1 = amount+network */}
                {mode === "pix" && state.step === 1 && (
                  <Step1Network
                    key="s1"
                    network={state.network}
                    amountUSDT={state.amountUSDT}
                    overLimit={amountBrlNumber > MAX_BRL}
                    rate={rate}
                    onNetwork={(v) => setState((s) => ({ ...s, network: v }))}
                    onAmountUSDT={(v) =>
                      setState((s) => ({ ...s, amountUSDT: v }))
                    }
                    onAmountBRL={(v) =>
                      setState((s) => ({ ...s, amountBRL: v }))
                    }
                    onRate={(v) => setState((s) => ({ ...s, rate: v }))}
                  />
                )}
                {/* QR: step 1 = scanner, step 2 = confirmação/entrada de valor */}
                {mode === "qr" && state.step === 1 && (
                  <Step1PixQR
                    key="s1qr"
                    pixQrRaw={state.pixQrRaw}
                    onScan={(raw, parsed) => {
                      const hasAmt = !!parsed.amount;
                      setState((s) => ({
                        ...s,
                        pixQrRaw: raw,
                        pixKey: parsed.pixKey ?? s.pixKey,
                        beneficiary: parsed.merchantName ?? s.beneficiary,
                        pixQrHasAmount: hasAmt,
                        amountBRL: hasAmt ? parsed.amount!.replace(".", ",") : s.amountBRL,
                      }));
                    }}
                  />
                )}
                {mode === "qr" && state.step === 2 && (
                  <Step2PixQRConfirm
                    key="s2qr"
                    beneficiary={state.beneficiary}
                    hasAmount={state.pixQrHasAmount}
                    amountBRL={state.amountBRL}
                    amountUSDT={state.amountUSDT}
                    overLimit={amountBrlNumber > MAX_BRL}
                    rate={rate}
                    network={state.network}
                    onAmountBRL={(v) => setState((s) => ({ ...s, amountBRL: v }))}
                    onAmountUSDT={(v) => setState((s) => ({ ...s, amountUSDT: v }))}
                    onRate={(v) => setState((s) => ({ ...s, rate: v }))}
                    onNetwork={(v) => setState((s) => ({ ...s, network: v }))}
                  />
                )}
                {/* PIX key: step 2 */}
                {mode === "pix" && state.step === 2 && (
                  <Step2Pix
                    key="s2"
                    pixKeyType={state.pixKeyType}
                    pixKey={state.pixKey}
                    onPixKeyType={(v) =>
                      setState((s) => ({ ...s, pixKeyType: v, pixKey: "" }))
                    }
                    onPixKey={(v) => setState((s) => ({ ...s, pixKey: v }))}
                  />
                )}
                {state.step === 3 && (
                  <Step3Return
                    key="s3"
                    returnWallet={state.returnWallet}
                    receiptEmail={state.receiptEmail}
                    network={state.network}
                    walletValid={walletValid}
                    onReturnWallet={(v) =>
                      setState((s) => ({ ...s, returnWallet: v }))
                    }
                    onReceiptEmail={(v) =>
                      setState((s) => ({ ...s, receiptEmail: v }))
                    }
                  />
                )}
                {state.step === 4 && (
                  <Step4QR
                    key="s4"
                    amount={state.amountUSDT || "0"}
                    network={state.network}
                    address_send={state.address_send}
                    order_id={state.order_id}
                    verifying={state.verifying}
                    expired={state.expired}
                    onExpire={() => setState((s) => ({ ...s, expired: true }))}
                    onClose={onClose}
                    onRestart={reset}
                    onSimulatePaid={() => {
                      setState((s) => ({ ...s, verifying: false }));
                      handleComplete();
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {!state.verifying && !state.expired && (
              <Footer
                state={state}
                setState={setState}
                step={state.step}
                canAdvance={canAdvance}
                onBack={goBack}
                onNext={goNext}
                mode={mode}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ====================== Chrome ====================== */

function Header({ step, onClose }: { step: number; onClose: () => void }) {
  const t = useTranslations("wizard");
  return (
    <div
      className="flex items-center justify-between px-7 py-4"
      style={{
        background:
          "linear-gradient(180deg, var(--color-off-white) 0%, white 100%)",
        borderBottom: "1px solid var(--color-ink-200)",
      }}
    >
      <div className="flex items-center gap-3">
        <Logo />
        <span
          className="mono-num text-[11px] tracking-wider font-bold uppercase"
          style={{ color: "var(--color-ink-500)" }}
        >
          {t("stepLabel", { step, total: TOTAL_STEPS })}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          w-8 h-8 rounded-full grid place-items-center
          text-ink-500 hover:text-ink-900
          hover:bg-ink-100 transition
        "
        aria-label={t("close")}
      >
        <CloseIcon />
      </button>

      <style>{`
        @keyframes opr-wiz-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div className="h-1 relative bg-ink-100 overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-green-500), var(--color-green-700))",
        }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: easeOut }}
      />
    </div>
  );
}

const BASE_API = "https://crypto2pay-backend-drcrypto.mebq4k.easypanel.host/v1/sell";

function Footer({
  step,
  setState,
  canAdvance,
  onBack,
  onNext,
  state,
  mode,
}: {
  step: number;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
  state: WizardState;
  mode: PaymentMode;
}) {
  const t = useTranslations("wizard");
  // Loading enquanto o POST de criação do swap roda (~5s) + erro inline.
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Trava síncrona contra reentrância: o `disabled={submitting}` só vale no
  // próximo render, então cliques rápidos no mesmo tick passariam e disparariam
  // múltiplos POSTs (= múltiplos swaps reais). O ref bloqueia já no 1º clique.
  const submitLock = useRef(false);

  const nextLabel = (() => {
    if (submitting) return t("wait");
    if (step === 3) return t("generateQr");
    return t("next");
  })();

  const GetStatusOrder = (orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `https://crypto2pay-backend-drcrypto.mebq4k.easypanel.host/v1/sell/get-status-crypto-to-pix?uuid=${orderId}`,
        );
        if (data.res.status === "SUCCESS") {
          clearInterval(interval);
          setState((s) => ({ ...s, verifying: true }));
          setState((prev) => ({
            ...prev,
            endtoend: data.res.endtoend,
          }));

          setState((prev) => ({
            ...prev,
            amountBRL: data.res.send_brl,
          }));

          setState((prev) => ({
            ...prev,
            beneficiary: data.res.displayDestination,
          }));
          onNext();
        }
        if (data.res.status === "FAILED") {
          clearInterval(interval);
        }
      } catch (error) {
        console.error(error);
      }
    }, 10000);
  };

  const handleNext = async () => {
    if (step === 3) {
      if (submitLock.current) return;
      submitLock.current = true;
      setSubmitting(true);
      setSubmitError(null);

      const params = new URLSearchParams(window.location.search);
      const referral = params.get("ref") || "";

      try {
        let endpoint: string;
        let body: Record<string, unknown>;

        if (mode === "boleto") {
          endpoint = `${BASE_API}/create-crypto-to-boleto`;
          body = {
            network: state.network.toUpperCase(),
            boletoCode: state.boletoCode.replace(/\D/g, ""),
            walletRet: state.returnWallet,
            email: state.receiptEmail,
            amount: parsePtBR(state.amountBRL),
            referal_code: referral,
          };
        } else if (mode === "qr") {
          endpoint = `${BASE_API}/create-crypto-to-pix-qr`;
          body = {
            network: state.network.toUpperCase(),
            pixQrPayload: state.pixQrRaw.trim(),
            walletRet: state.returnWallet,
            email: state.receiptEmail,
            amount: parsePtBR(state.amountBRL),
            referal_code: referral,
          };
        } else {
          // modo pix (padrão)
          let keyType = state.pixKeyType;
          if (keyType === "cpf") {
            const d = state.pixKey.replace(/\D/g, "");
            if (d.length > 11) keyType = "cnpj";
          }
          endpoint = `${BASE_API}/create-crypto-to-pix`;
          body = {
            network: state.network.toUpperCase(),
            key: cleanPixKey(state.pixKeyType, state.pixKey),
            walletRet: state.returnWallet,
            email: state.receiptEmail,
            amount: parsePtBR(state.amountBRL),
            typeKey: keyType.toUpperCase(),
            referal_code: referral,
          };
        }

        const { data } = await axios.post(endpoint, body);

        setState((prev) => ({
          ...prev,
          address_send: data.data.res.origemAddress,
          amountUSDT: data.data.res.amount_usd,
          order_id: data.data.res.uuid,
        }));
        GetStatusOrder(data.data.res.uuid);
      } catch (error) {
        console.error("Erro ao gerar QR", error);
        submitLock.current = false;
        setSubmitting(false);
        setSubmitError(t("pixInvalid"));
        return;
      }
    }
    onNext();
  };

  return (
    <div
      className="flex flex-col gap-2 px-7 py-4 border-t border-ink-200"
      style={{ background: "var(--color-off-white)" }}
    >
      {submitError && (
        <p
          className="text-[12px] font-medium leading-snug"
          style={{ color: "#b42121" }}
          role="alert"
        >
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="
              text-sm font-semibold tracking-tight
              text-ink-500 hover:text-ink-900
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            ← {t("back")}
          </button>
        ) : (
          <span aria-hidden />
        )}
        {step !== 4 && (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance || submitting}
            className="
          inline-flex items-center gap-2
          px-6 py-3 rounded-full
          text-white font-semibold tracking-tight text-[14px]
          transition-all duration-300
          disabled:opacity-40 disabled:cursor-not-allowed
        "
            style={{
              background:
                "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
              boxShadow:
                canAdvance && !submitting
                  ? "0 8px 20px color-mix(in srgb, var(--color-green-900) 22%, transparent)"
                  : "none",
            }}
          >
            {submitting && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden
                style={{ animation: "opr-spin 0.7s linear infinite" }}
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                <path
                  d="M 7 1.5 a 5.5 5.5 0 0 1 5.5 5.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {nextLabel}
            {!submitting && <span aria-hidden>→</span>}
          </button>
        )}
      </div>

      <style>{`
        @keyframes opr-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ====================== Steps ====================== */

const fadeProps = {
  // initial:false → abre já no estado final, sem animação de entrada
  // (a entrada animada causava um "pulinho" na abertura do modal).
  initial: false as const,
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: easeOut },
};

/** Step 1 · escolha de rede + dual input USDT/BRL sincronizado.
 * - Source of truth: amountUSDT no state pai.
 * - O input BRL é derivado (USDT × rate) quando o user não está editando ele.
 * - Quando o user digita no BRL, traduzimos pra USDT (÷ rate) e propagamos. */
function Step1Network({
  network,
  amountUSDT,
  overLimit,
  rate,
  onNetwork,
  onAmountUSDT,
  onAmountBRL,
  onRate,
  headerOverride,
  subOverride,
}: {
  network: Network;
  amountUSDT: string;
  overLimit: boolean;
  rate: number;
  onNetwork: (v: Network) => void;
  onAmountUSDT: (v: string) => void;
  onAmountBRL: (v: string) => void;
  onRate: (v: number) => void;
  headerOverride?: string;
  subOverride?: string;
}) {
  const t = useTranslations("wizard");
  const [editing, setEditing] = useState<"usdt" | "brl" | null>(null);
  const [brlDraft, setBrlDraft] = useState("");
  let markup = 0;

  if (network === "polygon") {
    markup = 1 - 3.99 / 100;
    rate = Number(Number(rate * markup).toFixed(4));
  }

  const usdtNumber = parseUSD(amountUSDT);

  const brlDerived = usdtNumber > 0 ? formatBRL(usdtNumber * rate) : "";

  const brlDisplayed = editing === "brl" ? brlDraft : brlDerived;

  const handleUSDT = (v: string) => {
    const clean = sanitizeUSDInput(v);
    setEditing("usdt");
    onAmountUSDT(clean);
    let markup = 0;

    console.log("rate 02 ===>", rate);

    const usdt = parseUSD(clean);

    if (usdt > 0 && rate > 0) {
      onAmountBRL((usdt * rate).toFixed(2).replace(".", ","));
    } else {
      onAmountBRL("");
    }
    onRate(rate);
  };

  const handleBRL = (v: string) => {
    setEditing("brl");

    const clean = sanitizeNumberInput(v);

    setBrlDraft(clean);
    onAmountBRL(clean);

    const brl = parsePtBR(clean);

    if (brl > 0 && rate > 0) {
      const usdt = brl / rate;
      onAmountUSDT(usdt.toFixed(2));
    } else {
      onAmountUSDT("");
    }
  };

  return (
    <motion.div {...fadeProps} className="flex flex-col gap-5">
      <StepTitle title={headerOverride ?? t("step1.title")} sub={subOverride ?? t("step1.sub")} />

      <div className="flex flex-col gap-2">
        <Label>{t("step1.networkLabel")}</Label>
        <div className="grid grid-cols-2 gap-3">
          <NetworkOption
            chain="polygon"
            label="Polygon"
            selected={network === "polygon"}
            onClick={() => onNetwork("polygon")}
          />
        </div>
      </div>

      {/* Dual input USDT ↔ BRL · 2 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <FieldShell
          label={t("step1.youSend")}
          right={
            <span className="inline-flex items-center gap-1.5">
              <USDTLogo size={18} />
            </span>
          }
        >
          <input
            inputMode="decimal"
            value={amountUSDT}
            onChange={(e) => handleUSDT(e.target.value)}
            onFocus={() => setEditing("usdt")}
            placeholder="100.00"
            className="
              w-full bg-transparent outline-none mono-num
              text-xl font-bold text-ink-900
              placeholder:text-ink-300
            "
            aria-label="Valor em USDT"
          />
        </FieldShell>

        <span
          aria-hidden
          className="hidden sm:grid place-items-center text-ink-300 font-bold text-lg"
        >
          ⇄
        </span>

        <FieldShell
          label={t("step1.youReceive")}
          right={
            <span className="inline-flex items-center gap-1.5">
              <PIXLogo size={18} />
            </span>
          }
        >
          <div className="flex items-baseline gap-1">
            <span className="mono-num text-xl font-bold text-ink-900">R$</span>
            <input
              inputMode="decimal"
              value={brlDisplayed}
              onChange={(e) => handleBRL(e.target.value)}
              onFocus={() => {
                setEditing("brl");
                setBrlDraft(brlDerived);
              }}
              placeholder="0,00"
              className="
                w-full bg-transparent outline-none mono-num
                text-xl font-bold text-ink-900
                placeholder:text-ink-300
              "
              aria-label="Valor em BRL"
            />
          </div>
        </FieldShell>
      </div>

      {overLimit ? (
        <p
          className="text-[11.5px] leading-relaxed font-semibold"
          style={{ color: "var(--color-red-600, #dc2626)" }}
        >
          {t("step1.overLimit")}
        </p>
      ) : (
        <Hint>{t("step1.hint")}</Hint>
      )}
    </motion.div>
  );
}

/* ====================== Step 1 Boleto ====================== */

function Step1Boleto({
  boletoCode,
  onBoletoCode,
}: {
  boletoCode: string;
  onBoletoCode: (v: string) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const digits = boletoCode.replace(/\D/g, "");
  const valid = isValidBoletoCode(digits);

  function handleChange(raw: string) {
    onBoletoCode(raw.replace(/\D/g, ""));
  }

  function displayCode(d: string) {
    if (d.length <= 10) return d;
    if (d.length === 44)
      return `${d.slice(0, 10)}.${d.slice(10, 20)} ${d.slice(20, 31)}.${d.slice(31, 41)} ${d.slice(41)}`;
    return d.replace(/(.{10})/g, "$1 ").trim();
  }

  return (
    <motion.div
      key="s1-boleto"
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {scanning && (
        <CameraScanner
          mode="barcode"
          onResult={(text) => {
            setScanning(false);
            handleChange(text);
          }}
          onClose={() => setScanning(false)}
        />
      )}

      <p className="body-sm mb-5" style={{ color: "var(--color-ink-600)" }}>
        Digite, cole ou escaneie o código de barras do boleto. Compensação bancária em até 48h.{" "}
        <strong className="font-bold" style={{ color: "var(--color-ink-900)" }}>
          Não são aceitos boletos vencidos.
        </strong>
      </p>

      <div className="space-y-3">
        {/* Botão câmera — destaque (mesmo estilo do botão de QR Code) */}
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="w-full flex items-center justify-center gap-3 rounded-xl py-4 font-semibold text-[14px] tracking-tight text-white transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
            boxShadow: "0 6px 20px rgba(0,100,40,0.2)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="3" y="5" width="1.6" height="14" rx="0.4"/>
            <rect x="6.4" y="5" width="1" height="14" rx="0.4"/>
            <rect x="9" y="5" width="2.2" height="14" rx="0.4"/>
            <rect x="12.8" y="5" width="1" height="14" rx="0.4"/>
            <rect x="15.4" y="5" width="2.4" height="14" rx="0.4"/>
            <rect x="19.4" y="5" width="1.6" height="14" rx="0.4"/>
          </svg>
          Escanear código de barras
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--color-ink-100)" }} />
          <span className="text-[11px] font-semibold" style={{ color: "var(--color-ink-400)" }}>ou digite</span>
          <div className="flex-1 h-px" style={{ background: "var(--color-ink-100)" }} />
        </div>

        <div>
          <label className="block mono-num text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-ink-500)" }}>
            CÓDIGO DO BOLETO
          </label>
          <textarea
            className="w-full rounded-xl border px-4 py-3 font-mono text-[13px] resize-none focus:outline-none focus:ring-2"
            style={{
              borderColor: valid ? "var(--color-green-400)" : digits.length > 0 ? "var(--color-ink-300)" : "var(--color-ink-200)",
              background: "var(--color-off-white)",
              color: "var(--color-ink-900)",
              minHeight: 80,
            }}
            rows={3}
            placeholder="Cole aqui o código de barras..."
            value={displayCode(digits)}
            onChange={(e) => handleChange(e.target.value)}
          />
          <p className="mt-1.5 text-[11px] font-medium" style={{ color: valid ? "var(--color-green-600)" : "var(--color-ink-400)" }}>
            {digits.length === 0 ? "44, 47 ou 48 dígitos numéricos" : valid ? `${digits.length} dígitos · Código válido` : `${digits.length} dígitos · Continue digitando...`}
          </p>
        </div>

        {valid && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(0, 200, 83, 0.06)", border: "1px solid rgba(0, 200, 83, 0.2)" }}>
            <span style={{ color: "var(--color-green-500)" }}>✓</span>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--color-ink-900)" }}>Boleto reconhecido</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--color-ink-500)" }}>Na próxima etapa confirme o valor em reais.</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ====================== Step 1 PIX QR (scan + parse) ====================== */

function Step1PixQR({
  pixQrRaw,
  onScan,
}: {
  pixQrRaw: string;
  onScan: (raw: string, parsed: ReturnType<typeof parsePixQr>) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const parsed = pixQrRaw ? parsePixQr(pixQrRaw) : null;
  const valid = isValidPixQr(pixQrRaw);

  function handleRaw(raw: string) {
    const p = parsePixQr(raw.trim());
    onScan(raw.trim(), p);
  }

  return (
    <motion.div
      key="s1-pixqr"
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {scanning && (
        <CameraScanner
          mode="qr"
          onResult={(text) => {
            setScanning(false);
            handleRaw(text);
          }}
          onClose={() => setScanning(false)}
        />
      )}

      <p className="body-sm mb-5" style={{ color: "var(--color-ink-600)" }}>
        Digite, escaneie ou cole o QR Code PIX. Pagamento instantâneo.{" "}
        <strong className="font-bold" style={{ color: "var(--color-ink-900)" }}>
          Não são aceitos QR codes com vencimento inferior a 10 minutos.
        </strong>
      </p>

      <div className="space-y-3">
        {/* Botão câmera — destaque */}
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="w-full flex items-center justify-center gap-3 rounded-xl py-4 font-semibold text-[14px] tracking-tight text-white transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
            boxShadow: "0 6px 20px rgba(0,100,40,0.2)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>
          </svg>
          Escanear QR Code
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--color-ink-100)" }} />
          <span className="text-[11px] font-semibold" style={{ color: "var(--color-ink-400)" }}>ou cole o código</span>
          <div className="flex-1 h-px" style={{ background: "var(--color-ink-100)" }} />
        </div>

        <div>
          <label className="block mono-num text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-ink-500)" }}>
            CÓDIGO COPIA E COLA (PIX)
          </label>
          <textarea
            className="w-full rounded-xl border px-4 py-3 font-mono text-[11px] resize-none focus:outline-none focus:ring-2"
            style={{
              borderColor: valid ? "var(--color-green-400)" : pixQrRaw.trim().length > 0 ? "var(--color-ink-300)" : "var(--color-ink-200)",
              background: "var(--color-off-white)",
              color: "var(--color-ink-900)",
              minHeight: 80,
            }}
            rows={3}
            placeholder="00020126..."
            value={pixQrRaw}
            onChange={(e) => handleRaw(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Resultado do parse */}
        {valid && parsed && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 space-y-2" style={{ background: "rgba(0, 200, 83, 0.06)", border: "1px solid rgba(0, 200, 83, 0.2)" }}>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--color-green-700)" }}>QR reconhecido</p>
            {parsed.merchantName && (
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold" style={{ color: "var(--color-ink-400)" }}>Destinatário</span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--color-ink-900)" }}>{parsed.merchantName}</span>
              </div>
            )}
            {parsed.amount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold" style={{ color: "var(--color-ink-400)" }}>Valor</span>
                <span className="text-[13px] font-bold" style={{ color: "var(--color-green-700)" }}>R$ {Number(parsed.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            ) : (
              <p className="text-[12px]" style={{ color: "var(--color-ink-500)" }}>Valor não informado no QR — você vai digitar na próxima etapa.</p>
            )}
          </motion.div>
        )}

        {pixQrRaw.trim().length > 10 && !valid && (
          <p className="text-[11px] font-medium" style={{ color: "#b42121" }}>
            QR inválido ou incompleto. Tente escanear novamente.
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ====================== Step 2 PIX QR — confirma/digita valor ====================== */

function Step2PixQRConfirm({
  beneficiary,
  hasAmount,
  amountBRL,
  amountUSDT,
  overLimit,
  rate,
  network,
  onAmountBRL,
  onAmountUSDT,
  onRate,
  onNetwork,
}: {
  beneficiary: string;
  hasAmount: boolean;
  amountBRL: string;
  amountUSDT: string;
  overLimit: boolean;
  rate: number;
  network: Network;
  onAmountBRL: (v: string) => void;
  onAmountUSDT: (v: string) => void;
  onRate: (v: number) => void;
  onNetwork: (v: Network) => void;
}) {
  if (hasAmount) {
    // Valor veio do QR — mostra tela de confirmação (read-only)
    return (
      <motion.div
        key="s2-qr-confirm"
        initial={false}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="body-sm mb-5" style={{ color: "var(--color-ink-600)" }}>
          Confirme os dados da cobrança PIX antes de prosseguir.
        </p>
        <div className="space-y-3">
          {beneficiary && (
            <InfoRow label="Destinatário" value={beneficiary} />
          )}
          <InfoRow label="Valor em BRL" value={`R$ ${Number(amountBRL.replace(",", ".")).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} accent />
          {rate > 0 && amountBRL && (
            <InfoRow label="Equivalente em USDT" value={`≈ ${amountUSDT || (parsePtBR(amountBRL) / rate).toFixed(2)} USDT`} />
          )}
          <NetworkSelectorMini network={network} onNetwork={onNetwork} />
        </div>
      </motion.div>
    );
  }

  // Valor não está no QR — pede que o usuário informe
  return (
    <Step1Network
      key="s2-qr-amount"
      network={network}
      amountUSDT={amountUSDT}
      overLimit={overLimit}
      rate={rate}
      onNetwork={onNetwork}
      onAmountUSDT={onAmountUSDT}
      onAmountBRL={onAmountBRL}
      onRate={onRate}
      headerOverride={beneficiary ? `Valor a pagar para ${beneficiary}` : "Valor da cobrança PIX"}
      subOverride="O QR não continha o valor. Digite o montante em USDT ou BRL a enviar."
    />
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b" style={{ borderColor: "var(--color-ink-100)" }}>
      <span className="text-[12px] font-semibold" style={{ color: "var(--color-ink-400)" }}>{label}</span>
      <span className="text-[14px] font-bold" style={{ color: accent ? "var(--color-green-700)" : "var(--color-ink-900)" }}>{value}</span>
    </div>
  );
}

function NetworkSelectorMini({ network, onNetwork }: { network: Network; onNetwork: (v: Network) => void }) {
  return (
    <div className="pt-2">
      <p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-ink-400)" }}>Rede USDT</p>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer"
        style={{ borderColor: "var(--color-green-300)", background: "rgba(0,200,83,0.04)" }}
        onClick={() => onNetwork("polygon")}
      >
        <ChainLogo chain="polygon" size={20} />
        <span className="text-[13px] font-semibold" style={{ color: "var(--color-ink-900)" }}>Polygon (MATIC)</span>
      </div>
    </div>
  );
}

/* ====================== Step 2 PIX Key ====================== */

function Step2Pix({
  pixKeyType,
  pixKey,
  onPixKeyType,
  onPixKey,
}: {
  pixKeyType: PixKeyType;
  pixKey: string;
  onPixKeyType: (v: PixKeyType) => void;
  onPixKey: (v: string) => void;
}) {
  const t = useTranslations("wizard");
  const selected = PIX_KEY_OPTIONS.find((o) => o.id === pixKeyType)!;
  return (
    <motion.div {...fadeProps} className="flex flex-col gap-5">
      <StepTitle title={t("step2.title")} sub={t("step2.sub")} />

      <div className="flex flex-col gap-2">
        <Label>{t("step2.keyTypeLabel")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PIX_KEY_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onPixKeyType(o.id)}
              className="
                text-[12px] font-semibold tracking-tight px-3 py-2.5 rounded-xl
                transition-all duration-200
              "
              style={{
                background:
                  pixKeyType === o.id
                    ? "var(--color-green-100)"
                    : "var(--color-off-white)",
                color:
                  pixKeyType === o.id
                    ? "var(--color-green-900)"
                    : "var(--color-ink-700)",
                border:
                  pixKeyType === o.id
                    ? "1px solid var(--color-green-300)"
                    : "1px solid var(--color-ink-200)",
              }}
            >
              {t(`pixTypes.${o.id}`)}
            </button>
          ))}
        </div>
      </div>

      <FieldShell
        label={t("step2.keyField", {
          type: t(`pixTypes.${pixKeyType}`).toUpperCase(),
        })}
      >
        <input
          value={pixKey}
          onChange={(e) => onPixKey(maskPixKey(pixKeyType, e.target.value))}
          placeholder={selected.placeholder}
          inputMode={
            pixKeyType === "cpf" || pixKeyType === "phone" ? "numeric" : "text"
          }
          className="
            w-full bg-transparent outline-none
            text-base font-medium text-ink-900
            placeholder:text-ink-300
          "
          aria-label="Chave PIX"
        />
      </FieldShell>

      <Hint>{t("step2.hint")}</Hint>
    </motion.div>
  );
}

function Step3Return({
  returnWallet,
  receiptEmail,
  network,
  walletValid,
  onReturnWallet,
  onReceiptEmail,
}: {
  returnWallet: string;
  receiptEmail: string;
  network: Network;
  walletValid: boolean;
  onReturnWallet: (v: string) => void;
  onReceiptEmail: (v: string) => void;
}) {
  const t = useTranslations("wizard");
  const hasInput = returnWallet.trim().length > 0;
  const showError = hasInput && !walletValid;
  const networkLabel = network === "polygon" ? "Polygon" : "Polygon";

  return (
    <motion.div {...fadeProps} className="flex flex-col gap-5">
      <StepTitle
        title={t("step3.title")}
        sub={t("step3.sub", { network: networkLabel })}
      />

      <FieldShell
        label={t("step3.walletField", { network: network.toUpperCase() })}
      >
        <input
          value={returnWallet}
          onChange={(e) => onReturnWallet(e.target.value.trim())}
          placeholder={
            network === "polygon"
              ? "0x... (42 caracteres)"
              : "T... (34 caracteres)"
          }
          className="
            w-full bg-transparent outline-none mono-num
            text-[13px] font-medium text-ink-900
            placeholder:text-ink-300
          "
          aria-label="Carteira de retorno"
          aria-invalid={showError}
        />
      </FieldShell>

      {showError && (
        <p
          className="text-[11.5px] -mt-2 leading-snug"
          style={{ color: "#b42121" }}
        >
          {network === "polygon"
            ? t("step3.walletErrorPolygon")
            : t("step3.walletErrorPolygon")}
        </p>
      )}

      <FieldShell label={t("step3.emailField")}>
        <input
          type="email"
          value={receiptEmail}
          onChange={(e) => onReceiptEmail(e.target.value)}
          placeholder="voce@email.com"
          className="
            w-full bg-transparent outline-none
            text-base font-medium text-ink-900
            placeholder:text-ink-300
          "
          aria-label="E-mail para o comprovante"
        />
      </FieldShell>
    </motion.div>
  );
}

function Step4QR({
  amount,
  network,
  address_send,
  order_id,
  verifying,
  expired,
  onExpire,
  onClose,
  onRestart,
  onSimulatePaid,
}: {
  amount: string;
  network: Network;
  address_send: string;
  order_id: string;
  verifying: boolean;
  expired: boolean;
  onExpire: () => void;
  onClose: () => void;
  onRestart: () => void;
  onSimulatePaid: () => void;
}) {
  const t = useTranslations("wizard");
  const [seconds, setSeconds] = useState(PIX_EXPIRY_SECONDS);
  const [copied, setCopied] = useState<"amount" | "address" | null>(null);

  useEffect(() => {
    if (verifying) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [verifying]);

  // Zerou sem o pagamento ser detectado → dispara o fluxo de recuperação (hash) UMA vez.
  // Se o SUCCESS chegar atrasado pelo polling, `verifying` tem precedência abaixo e mostra o comprovante.
  useEffect(() => {
    if (seconds === 0 && !verifying && !expired) onExpire();
  }, [seconds, verifying, expired, onExpire]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const address = NETWORK_ADDRESS[network];
  const networkLabel = network === "polygon" ? "Polygon" : "Polygon";

  const copy = async (label: "amount" | "address", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* fallback silencioso */
    }
  };

  if (verifying) {
    return <VerifyingFlow onComplete={onSimulatePaid} />;
  }

  if (expired || seconds === 0) {
    return (
      <ExpiredHashFlow
        orderId={order_id}
        amount={amount}
        onClose={onClose}
        onRestart={onRestart}
      />
    );
  }

  return (
    <motion.div {...fadeProps} className="flex flex-col gap-4">
      <StepTitle
        title={t("step4.title")}
        sub={t("step4.sub", { amount, network: networkLabel })}
      />

      {/* Mobile: stack vertical (QR centralizado em cima, blocos embaixo).
       * sm+: grid 2 cols (QR à esquerda, blocos à direita). */}
      <div className="flex flex-col items-center sm:items-start sm:grid sm:grid-cols-[140px_1fr] gap-4 sm:gap-5">
        <div
          className="relative w-[140px] h-[140px] rounded-2xl bg-white grid place-items-center p-2.5 shrink-0"
          style={{ boxShadow: "0 8px 24px color-mix(in srgb, var(--color-green-900) 12%, transparent)" }}
        >
          <div
            className="grid"
            style={{
              gap: "1px",
              width: "120px",
              height: "120px",
            }}
            aria-hidden
          >
            <QRCodeReal value={address_send} />
          </div>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div
              className="rounded-full grid place-items-center bg-white"
              style={{
                width: 32,
                height: 32,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <ChainLogo chain={network} size={24} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full min-w-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start"
            style={{
              background:
                seconds < 60
                  ? "rgba(220, 38, 38, 0.1)"
                  : "var(--color-green-100)",
              color: seconds < 60 ? "#a52121" : "var(--color-green-900)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: seconds < 60 ? "#dc2626" : "var(--color-green-700)",
                animation: "opr-wiz-blink 1.4s infinite",
              }}
              aria-hidden
            />
            <span className="text-[11px] font-semibold mono-num">
              {t("step4.expiresIn", { time: `${mm}:${ss}` })}
            </span>
          </div>

          <CopyRow
            label={t("step4.amountLabel")}
            value={amount}
            display={`${amount}`}
            copied={copied === "amount"}
            onCopy={() => copy("amount", amount)}
          />
          <CopyRow
            label={t("step4.addressLabel", { network: networkLabel })}
            value={address_send}
            display={truncateAddress(address_send)}
            copied={copied === "address"}
            onCopy={() => copy("address", address_send)}
          />
        </div>
      </div>
    </motion.div>
  );
}

/** Recuperação pós-timeout (pedido do Thiago/Moya): quando os 15 min zeram sem o pagamento
 * cair, em vez de só travar no 00:00, perguntamos se a pessoa pagou. Se sim, ela cola a hash
 * (TXID) e a gente abre o WhatsApp do atendimento JÁ com a hash — o time confirma manualmente e
 * libera o PIX. Se não, encerra com leveza. Reaproveitável nos whitelabels (oprpay/uspix). */
export type ExpiredPhase = "ask" | "hash" | "sent" | "restart" | "thanks";

export function ExpiredHashFlow({
  orderId,
  amount,
  onClose,
  onRestart,
  initialPhase = "ask",
}: {
  orderId: string;
  amount: string;
  onClose: () => void;
  /** Recomeça uma nova operação (reseta o wizard pro passo 1). */
  onRestart: () => void;
  /** Só pra página de preview — em produção sempre começa em "ask". */
  initialPhase?: ExpiredPhase;
}) {
  const t = useTranslations("wizard");
  const [phase, setPhase] = useState<ExpiredPhase>(initialPhase);
  const [hash, setHash] = useState("");

  const sendHash = () => {
    if (!hash.trim()) return;
    const msg = t("expired.waMessage", {
      hash: hash.trim(),
      order: orderId,
      amount,
    });
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setPhase("sent");
  };

  return (
    <motion.div {...fadeProps} className="flex flex-col gap-5 pb-2">
      {phase === "ask" && (
        <>
          <div className="flex flex-col items-center text-center gap-3 pt-1">
            <ExpiredClockIcon />
            <StepTitle title={t("expired.title")} sub={t("expired.askSub")} />
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-center text-[13px] font-semibold text-ink-900">
              {t("expired.askTitle")}
            </p>
            <button
              type="button"
              onClick={() => setPhase("hash")}
              className="
                w-full inline-flex items-center justify-center
                px-6 py-3.5 rounded-2xl text-white font-semibold tracking-tight text-[14px]
                transition-all duration-300
              "
              style={{
                background:
                  "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
                boxShadow: "0 8px 20px color-mix(in srgb, var(--color-green-900) 22%, transparent)",
              }}
            >
              {t("expired.yes")}
            </button>
            <button
              type="button"
              onClick={() => setPhase("restart")}
              className="
                w-full px-6 py-3 rounded-2xl text-[14px] font-semibold tracking-tight
                text-ink-700 transition
              "
              style={{
                background: "var(--color-off-white)",
                border: "1px solid var(--color-ink-200)",
              }}
            >
              {t("expired.no")}
            </button>
          </div>
        </>
      )}

      {phase === "hash" && (
        <>
          <StepTitle
            title={t("expired.hashTitle")}
            sub={t("expired.hashSub")}
          />
          <FieldShell label={t("expired.hashLabel")}>
            <input
              value={hash}
              onChange={(e) => setHash(e.target.value.trim())}
              placeholder={t("expired.hashPlaceholder")}
              className="
                w-full bg-transparent outline-none mono-num
                text-[13px] font-medium text-ink-900
                placeholder:text-ink-300
              "
              aria-label={t("expired.hashLabel")}
            />
          </FieldShell>
          <button
            type="button"
            onClick={sendHash}
            disabled={!hash.trim()}
            className="
              w-full inline-flex items-center justify-center gap-2
              px-6 py-3.5 rounded-2xl text-white font-semibold tracking-tight text-[14px]
              transition-all duration-300
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            style={{
              background:
                "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
              boxShadow: hash.trim() ? "0 8px 20px color-mix(in srgb, var(--color-green-900) 22%, transparent)" : "none",
            }}
          >
            <WhatsAppGlyph />
            {t("expired.sendHash")}
          </button>
          <button
            type="button"
            onClick={() => setPhase("ask")}
            className="text-[13px] font-semibold text-ink-500 hover:text-ink-900 transition self-center"
          >
            ← {t("back")}
          </button>
        </>
      )}

      {phase === "sent" && (
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <SuccessCheck />
          <StepTitle title={t("expired.sentTitle")} sub={t("expired.sentSub")} />
          <button
            type="button"
            onClick={onClose}
            className="
              mt-1 px-6 py-3 rounded-2xl text-[14px] font-semibold tracking-tight
              text-ink-700 transition
            "
            style={{
              background: "var(--color-off-white)",
              border: "1px solid var(--color-ink-200)",
            }}
          >
            {t("expired.close")}
          </button>
        </div>
      )}

      {phase === "restart" && (
        <div className="flex flex-col items-center text-center gap-4 py-3">
          <StepTitle
            title={t("expired.restartTitle")}
            sub={t("expired.restartSub")}
          />
          {/* Sim em destaque; "Não, obrigado" como link de texto abaixo. */}
          <button
            type="button"
            onClick={onRestart}
            className="
              w-full inline-flex items-center justify-center
              px-6 py-3.5 rounded-2xl text-white font-semibold tracking-tight text-[14px]
              transition-all duration-300
            "
            style={{
              background:
                "linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-900) 100%)",
              boxShadow: "0 8px 20px color-mix(in srgb, var(--color-green-900) 22%, transparent)",
            }}
          >
            {t("expired.restartYes")}
          </button>
          <button
            type="button"
            onClick={() => setPhase("thanks")}
            className="
              text-[13px] font-medium text-ink-500 hover:text-ink-900
              underline underline-offset-2 transition
            "
          >
            {t("expired.restartNo")}
          </button>
        </div>
      )}

      {phase === "thanks" && (
        <div className="flex flex-col items-center text-center gap-3 py-3">
          <HeartIcon />
          <StepTitle
            title={t("expired.thanksTitle")}
            sub={t("expired.thanksSub")}
          />
          <button
            type="button"
            onClick={onClose}
            className="
              mt-1 px-6 py-3 rounded-2xl text-[14px] font-semibold tracking-tight
              text-ink-700 transition
            "
            style={{
              background: "var(--color-off-white)",
              border: "1px solid var(--color-ink-200)",
            }}
          >
            {t("expired.close")}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function HeartIcon() {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="w-12 h-12 rounded-full grid place-items-center"
      style={{ background: "var(--color-green-100)" }}
      aria-hidden
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 20s-6.5-4.35-9-8.5C1.5 8.5 3 5.5 6 5.5c1.8 0 3 1 4 2.2 1-1.2 2.2-2.2 4-2.2 3 0 4.5 3 3 6-2.5 4.15-9 8.5-9 8.5Z"
          fill="var(--color-green-700)"
        />
      </svg>
    </motion.span>
  );
}

function ExpiredClockIcon() {
  return (
    <span
      className="w-12 h-12 rounded-full grid place-items-center"
      style={{ background: "rgba(220, 38, 38, 0.1)" }}
      aria-hidden
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="8" stroke="#dc2626" strokeWidth="1.8" />
        <path
          d="M12 9.5V13l2.5 1.5M9 3h6"
          stroke="#dc2626"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function SuccessCheck() {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="w-12 h-12 rounded-full grid place-items-center text-white text-lg font-bold"
      style={{
        background:
          "linear-gradient(135deg, var(--color-green-500), var(--color-green-700))",
        boxShadow: "0 0 0 5px rgba(3, 187, 133, 0.15)",
      }}
      aria-hidden
    >
      ✓
    </motion.span>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 18.13c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

function CopyRow({
  label,
  value,
  display,
  copied,
  onCopy,
}: {
  label: string;
  /** Valor real que vai pro clipboard (não truncado). */
  value: string;
  /** Valor que aparece visualmente (pode ser truncado). */
  display: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const t = useTranslations("wizard");
  return (
    <div
      className="rounded-xl px-3 py-2 flex items-center justify-between gap-2 min-w-0"
      style={{ background: "var(--color-off-white)" }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] uppercase tracking-wider font-bold text-ink-500">
          {label}
        </p>
        <p
          className="text-[12px] text-ink-900 mt-0.5 mono-num truncate"
          style={{ fontWeight: 600 }}
          title={value}
        >
          {display}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="
          shrink-0 inline-flex items-center
          px-2.5 py-1 rounded-full
          text-[10px] font-bold tracking-wider uppercase
          transition-all
        "
        style={{
          background: copied ? "var(--color-green-700)" : "white",
          color: copied ? "white" : "var(--color-ink-700)",
          border: copied ? "none" : "1px solid var(--color-ink-200)",
        }}
      >
        {copied ? "✓" : t("step4.copy")}
      </button>
    </div>
  );
}

function VerifyingFlow({ onComplete }: { onComplete: () => void }) {
  const t = useTranslations("wizard");
  const STEPS = [
    { title: t("verifying.step1Title"), sub: t("verifying.step1Sub") },
    { title: t("verifying.step2Title"), sub: t("verifying.step2Sub") },
    { title: t("verifying.step3Title"), sub: t("verifying.step3Sub") },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length) {
      const t = setTimeout(onComplete, 700);
      return () => clearTimeout(t);
    }
    const durationMs = 2800 + Math.random() * 1800;
    const t = setTimeout(() => setCurrent((c) => c + 1), durationMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  return (
    <motion.div
      key="verifying"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="flex flex-col gap-5 pb-6"
    >
      <StepTitle title={t("verifying.title")} sub={t("verifying.sub")} />

      <ul className="flex flex-col gap-2.5">
        {STEPS.map((step, idx) => {
          const state =
            idx < current ? "done" : idx === current ? "loading" : "pending";
          return (
            <li
              key={step.title}
              className="
                relative flex items-center gap-4
                rounded-2xl px-5 py-3.5
                transition-colors
              "
              style={{
                background:
                  state === "done"
                    ? "rgba(3, 187, 133, 0.06)"
                    : state === "loading"
                      ? "var(--color-off-white)"
                      : "transparent",
                border: `1px solid ${
                  state === "done"
                    ? "rgba(3, 187, 133, 0.25)"
                    : state === "loading"
                      ? "var(--color-ink-200)"
                      : "var(--color-ink-100)"
                }`,
              }}
            >
              <StateIcon state={state} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-semibold tracking-tight"
                  style={{
                    color:
                      state === "pending"
                        ? "var(--color-ink-300)"
                        : "var(--color-ink-900)",
                  }}
                >
                  {step.title}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{
                    color:
                      state === "pending"
                        ? "var(--color-ink-300)"
                        : "var(--color-ink-500)",
                  }}
                >
                  {step.sub}
                </p>
              </div>
              {state === "done" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ color: "var(--color-green-700)" }}
                >
                  {t("verifying.ok")}
                </motion.span>
              )}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function StateIcon({ state }: { state: "pending" | "loading" | "done" }) {
  if (state === "done") {
    return (
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-white text-sm font-bold"
        style={{
          background:
            "linear-gradient(135deg, var(--color-green-500), var(--color-green-700))",
          boxShadow: "0 0 0 4px rgba(3, 187, 133, 0.15)",
        }}
        aria-label="concluído"
      >
        ✓
      </motion.span>
    );
  }
  if (state === "loading") {
    return (
      <span
        className="shrink-0 w-9 h-9 rounded-full grid place-items-center relative"
        style={{ background: "var(--color-green-100)" }}
        aria-label="processando"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          style={{ animation: "opr-spin 0.85s linear infinite" }}
        >
          <circle
            cx="9"
            cy="9"
            r="7"
            fill="none"
            stroke="rgba(3, 187, 133, 0.2)"
            strokeWidth="2"
          />
          <path
            d="M 9 2 a 7 7 0 0 1 7 7"
            fill="none"
            stroke="var(--color-green-700)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <style>{`
          @keyframes opr-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </span>
    );
  }
  return (
    <span
      className="shrink-0 w-9 h-9 rounded-full border-2 grid place-items-center"
      style={{
        borderColor: "var(--color-ink-200)",
        background: "transparent",
      }}
      aria-label="aguardando"
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--color-ink-300)" }}
      />
    </span>
  );
}

/* ====================== Building blocks ====================== */

function StepTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h3
        id="opr-wizard-title"
        className="text-[19px] font-bold tracking-tight text-ink-900"
        style={{ letterSpacing: "-0.02em" }}
      >
        {title}
      </h3>
      <p className="text-[12.5px] text-ink-500 mt-1.5 leading-relaxed">{sub}</p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-wider font-bold text-ink-500">
      {children}
    </span>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11.5px] leading-relaxed"
      style={{ color: "var(--color-ink-500)" }}
    >
      {children}
    </p>
  );
}

function FieldShell({
  label,
  right,
  highlight,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-3.5 transition-colors"
      style={{
        background: highlight
          ? "var(--color-green-100)"
          : "var(--color-off-white)",
        border: highlight
          ? "1px solid var(--color-green-300)"
          : "1px solid var(--color-ink-200)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5 gap-3">
        <span className="text-[9.5px] uppercase tracking-wider font-bold text-ink-500">
          {label}
        </span>
        {right}
      </div>
      {children}
    </div>
  );
}

function NetworkOption({
  chain,
  label,
  selected,
  onClick,
}: {
  chain: ChainKey;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative flex items-center gap-3 px-4 py-2.5 rounded-2xl
        text-left transition-all duration-200
      "
      style={{
        background: selected ? "white" : "var(--color-off-white)",
        border: selected
          ? `2px solid ${CHAIN_COLORS[chain]}`
          : "2px solid var(--color-ink-200)",
        boxShadow: selected ? `0 6px 18px ${CHAIN_COLORS[chain]}25` : "none",
      }}
      aria-pressed={selected}
    >
      <ChainLogo chain={chain} size={26} />
      <span
        className="flex-1 text-sm font-bold tracking-tight text-ink-900"
        style={{ lineHeight: 1.1 }}
      >
        {label}
      </span>
      {selected && (
        <span
          aria-hidden
          className="hidden sm:grid w-5 h-5 rounded-full place-items-center text-white text-[10px] font-bold"
          style={{ background: CHAIN_COLORS[chain] }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QRCodeMock() {
  const SIZE = 15;
  const cells: Array<{ x: number; y: number; on: boolean }> = [];
  console.log(cells);
  const seed = (x: number, y: number) =>
    Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      cells.push({
        x,
        y,
        on: seed(x, y) - Math.floor(seed(x, y)) > 0.5,
      });
    }
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${SIZE}, 1fr)`,
        gap: "1px",
        width: "120px",
        height: "120px",
      }}
      aria-hidden
    >
      {cells.map((c, i) => (
        <span
          key={i}
          style={{
            background: c.on ? "var(--color-green-900)" : "transparent",
            borderRadius: "0.5px",
          }}
        />
      ))}
      <CornerFinder x={0} y={0} size={SIZE} />
      <CornerFinder x={SIZE - 3} y={0} size={SIZE} />
      <CornerFinder x={0} y={SIZE - 3} size={SIZE} />
    </div>
  );
}

function QRCodeReal({ value }: { value: string }) {
  return <QRCodeSVG value={value} size={120} level="M" />;
}

function CornerFinder({ x, y }: { x: number; y: number; size: number }) {
  return (
    <span
      style={{
        gridColumn: `${x + 1} / span 3`,
        gridRow: `${y + 1} / span 3`,
        background: "var(--color-green-900)",
        boxShadow:
          "inset 0 0 0 1.5px var(--color-white), inset 0 0 0 3px var(--color-green-900)",
        borderRadius: "1px",
      }}
      aria-hidden
    />
  );
}
