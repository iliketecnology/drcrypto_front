"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

/**
 * Scanner de câmera baseado em ZXing (@zxing/browser).
 *
 * IMPORTANTE: usa BrowserMultiFormatReader, que decodifica via canvas/WASM em JS,
 * SEM depender da BarcodeDetector API nativa. Isso garante funcionamento no
 * Safari iOS (iPhone), onde a BarcodeDetector não existe. Mesma lib que o
 * gateway original (crypto2pay) usa em produção.
 */

type ScannerMode = "barcode" | "qr";

type Props = {
  mode: ScannerMode;
  onResult: (text: string) => void;
  onClose: () => void;
};

export function CameraScanner({ mode, onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const cancelledRef = useRef(false);

  const [status, setStatus] = useState<
    "starting" | "scanning" | "no-support" | "error"
  >("starting");
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    try {
      controlsRef.current?.stop();
    } catch {
      /* noop */
    }
    controlsRef.current = null;
    const v = videoRef.current;
    if (v && v.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    async function start() {
      // Suporte mínimo: precisa de getUserMedia (todo browser moderno, inclui Safari iOS 11+)
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("no-support");
        return;
      }

      try {
        // Restringe formatos: acelera o decode e evita falsos positivos.
        const hints = new Map();
        hints.set(
          DecodeHintType.POSSIBLE_FORMATS,
          mode === "barcode"
            ? [
                BarcodeFormat.ITF, // boleto bancário (44 díg) e contas de consumo
                BarcodeFormat.CODE_128,
                BarcodeFormat.CODE_39,
                BarcodeFormat.CODABAR,
                BarcodeFormat.EAN_13,
              ]
            : [BarcodeFormat.QR_CODE],
        );

        const reader = new BrowserMultiFormatReader(hints);

        // Descobre se há mais de uma câmera (pra mostrar o botão de troca)
        try {
          const devices = await BrowserMultiFormatReader.listVideoInputDevices();
          if (!cancelledRef.current) setHasMultipleCameras(devices.length > 1);
        } catch {
          /* alguns iOS não listam devices antes de conceder permissão; segue */
        }

        // decodeFromConstraints força a câmera traseira (environment) no iOS
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: facing } } },
          videoRef.current!,
          (result) => {
            if (cancelledRef.current || !result) return;
            const text = result.getText();

            if (mode === "barcode") {
              const digits = text.replace(/\D/g, "");
              // boleto: 44 (ITF) / 47 / 48 dígitos
              if (/^\d{44,48}$/.test(digits)) {
                stop();
                onResult(digits);
              }
            } else {
              // QR PIX: devolve o payload bruto pro parser EMV
              stop();
              onResult(text);
            }
          },
        );

        if (cancelledRef.current) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus("scanning");
      } catch (e: unknown) {
        if (cancelledRef.current) return;
        const msg = e instanceof Error ? e.message : "";
        if (/permission|notallowed|denied/i.test(msg)) {
          setError(
            "Permissão de câmera negada. Habilite o acesso à câmera nas configurações do navegador e tente de novo.",
          );
        } else if (/notfound|overconstrained|nocamera|device/i.test(msg)) {
          setError("Nenhuma câmera encontrada neste dispositivo.");
        } else {
          setError("Não foi possível acessar a câmera. Tente novamente.");
        }
        setStatus("error");
      }
    }

    start();
    return () => {
      stop();
    };
  }, [mode, facing, onResult, stop]);

  const handleClose = useCallback(() => {
    stop();
    onClose();
  }, [stop, onClose]);

  const toggleCamera = useCallback(() => {
    setStatus("starting");
    setFacing((f) => (f === "environment" ? "user" : "environment"));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.94)" }}
    >
      {/* Fechar */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition"
        aria-label="Fechar câmera"
      >
        <CloseX />
      </button>

      <div className="relative w-full max-w-[420px] mx-4 flex flex-col items-center">
        <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-5">
          {mode === "barcode"
            ? "Aponte para o código de barras do boleto"
            : "Aponte para o QR Code PIX"}
        </p>

        {/* Viewport */}
        <div
          className="relative w-full rounded-2xl overflow-hidden bg-black"
          style={{ aspectRatio: mode === "barcode" ? "16/9" : "1/1" }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />

          {status === "scanning" && mode === "barcode" && <LaserOverlay />}
          {status === "scanning" && mode === "qr" && <QRTargetOverlay />}

          {/* Troca de câmera (frontal/traseira) */}
          {status === "scanning" && hasMultipleCameras && (
            <button
              type="button"
              onClick={toggleCamera}
              className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full grid place-items-center text-white"
              style={{ background: "rgba(157,43,237,0.85)", backdropFilter: "blur(4px)" }}
              aria-label="Trocar câmera"
            >
              <SwitchCam />
            </button>
          )}

          {status === "starting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Spinner />
              <p className="text-white/50 text-[12px]">Iniciando câmera...</p>
            </div>
          )}

          {(status === "error" || status === "no-support") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="text-4xl">📵</span>
              <p className="text-white/80 text-[13px] leading-snug">
                {status === "no-support"
                  ? "Seu navegador não permite acesso à câmera. Atualize o navegador ou digite o código manualmente."
                  : error}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-5 py-2 rounded-full text-[13px] font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                Fechar
              </button>
            </div>
          )}
        </div>

        {status === "scanning" && (
          <p className="text-white/30 text-[11px] mt-4 text-center">
            Detecção automática · segure firme em ambiente iluminado
          </p>
        )}
      </div>

      <style>{`
        @keyframes cs-spin { to { transform: rotate(360deg); } }
        @keyframes laser-move {
          0%   { top: 10%; }
          50%  { top: 85%; }
          100% { top: 10%; }
        }
        @keyframes laser-glow {
          0%   { opacity: 1; box-shadow: 0 0 6px 2px rgba(157,43,237,0.5), 0 0 18px 6px rgba(157,43,237,0.25); }
          18%  { opacity: 0.72; box-shadow: 0 0 14px 5px rgba(157,43,237,0.75), 0 0 32px 12px rgba(157,43,237,0.35); }
          35%  { opacity: 0.95; box-shadow: 0 0 8px 3px rgba(157,43,237,0.55), 0 0 22px 8px rgba(157,43,237,0.28); }
          55%  { opacity: 0.6; box-shadow: 0 0 20px 8px rgba(157,43,237,0.9), 0 0 48px 18px rgba(157,43,237,0.4); }
          72%  { opacity: 0.88; box-shadow: 0 0 10px 4px rgba(157,43,237,0.6), 0 0 28px 10px rgba(157,43,237,0.3); }
          88%  { opacity: 0.5; box-shadow: 0 0 18px 7px rgba(157,43,237,0.8), 0 0 40px 15px rgba(157,43,237,0.38); }
          100% { opacity: 1; box-shadow: 0 0 6px 2px rgba(157,43,237,0.5), 0 0 18px 6px rgba(157,43,237,0.25); }
        }
        @keyframes qr-line {
          0%   { top: 2%; }
          50%  { top: 96%; }
          100% { top: 2%; }
        }
      `}</style>
    </div>
  );
}

/* ---- overlays ---- */

function LaserOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* escurece laterais */}
      <div className="absolute inset-y-0 left-0 w-[6%]" style={{ background: "rgba(0,0,0,0.55)" }} />
      <div className="absolute inset-y-0 right-0 w-[6%]" style={{ background: "rgba(0,0,0,0.55)" }} />
      {/* bordas guia */}
      <div className="absolute inset-x-[6%] top-[10%] h-px" style={{ background: "rgba(157,43,237,0.18)" }} />
      <div className="absolute inset-x-[6%] bottom-[10%] h-px" style={{ background: "rgba(157,43,237,0.18)" }} />
      {/* laser beam · cor accent azul com glow variável */}
      <div
        className="absolute inset-x-[6%]"
        style={{
          height: 2,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(157,43,237,0.7) 12%, #9d2bed 40%, #cf9bf5 50%, #9d2bed 60%, rgba(157,43,237,0.7) 88%, transparent 100%)",
          animation:
            "laser-move 1.6s cubic-bezier(0.45,0,0.55,1) infinite, laser-glow 0.9s ease-in-out infinite",
        }}
      />
      {/* reflexo sutil abaixo do laser */}
      <div
        className="absolute inset-x-[6%]"
        style={{
          height: 8,
          marginTop: 2,
          background: "linear-gradient(180deg, rgba(157,43,237,0.12) 0%, transparent 100%)",
          animation: "laser-move 1.6s cubic-bezier(0.45,0,0.55,1) infinite",
        }}
      />
    </div>
  );
}

function QRTargetOverlay() {
  const cornerStyle = (pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: 32,
      height: 32,
      borderColor: "rgba(157, 43, 237, 0.95)",
      borderStyle: "solid",
      borderWidth: 0,
    };
    if (pos === "tl") return { ...base, top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 };
    if (pos === "tr") return { ...base, top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 };
    if (pos === "bl") return { ...base, bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 };
    return { ...base, bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 };
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* escurece fora do alvo */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
      {/* caixa de alvo */}
      <div className="relative" style={{ width: "65%", aspectRatio: "1/1", background: "transparent", zIndex: 1 }}>
        <div style={cornerStyle("tl")} />
        <div style={cornerStyle("tr")} />
        <div style={cornerStyle("bl")} />
        <div style={cornerStyle("br")} />
        {/* linha scan azul accent */}
        <div
          className="absolute inset-x-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(157,43,237,0.85), transparent)",
            boxShadow: "0 0 8px 1px rgba(157,43,237,0.5)",
            animation: "qr-line 2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2"
      style={{
        borderColor: "rgba(255,255,255,0.15)",
        borderTopColor: "white",
        animation: "cs-spin 0.75s linear infinite",
      }}
    />
  );
}

function CloseX() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SwitchCam() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
