"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { SwapWizard } from "./SwapWizard";
import { ReceiptDialog } from "./ReceiptDialog";
import { RefundDialog } from "./RefundDialog";
import type { PaymentMode, RefundResult, SwapResult } from "./types";

type Ctx = {
  isOpen: boolean;
  open: () => void;
  openWithMode: (mode: PaymentMode) => void;
  close: () => void;
  openReceipt: (data: SwapResult) => void;
};

const SwapWizardContext = createContext<Ctx | null>(null);

export function SwapWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PaymentMode>("pix");
  const [receiptData, setReceiptData] = useState<SwapResult | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [refundData, setRefundData] = useState<RefundResult | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const open = useCallback(() => { setMode("pix"); setIsOpen(true); }, []);
  const openWithMode = useCallback((m: PaymentMode) => { setMode(m); setIsOpen(true); }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const openReceipt = useCallback((data: SwapResult) => {
    setReceiptData(data);
    setIsOpen(false);
    setReceiptOpen(true);
  }, []);

  const closeReceipt = useCallback(() => {
    setReceiptOpen(false);
    setTimeout(() => setReceiptData(null), 400);
  }, []);

  const openRefund = useCallback((data: RefundResult) => {
    setRefundData(data);
    setIsOpen(false);
    setRefundOpen(true);
  }, []);

  const closeRefund = useCallback(() => {
    setRefundOpen(false);
    setTimeout(() => setRefundData(null), 400);
  }, []);

  return (
    <SwapWizardContext.Provider value={{ isOpen, open, openWithMode, close, openReceipt }}>
      {children}
      <SwapWizard isOpen={isOpen} mode={mode} onClose={close} onComplete={openReceipt} onRefund={openRefund} />
      <ReceiptDialog
        isOpen={receiptOpen}
        data={receiptData}
        onClose={closeReceipt}
      />
      <RefundDialog
        isOpen={refundOpen}
        data={refundData}
        onClose={closeRefund}
      />
    </SwapWizardContext.Provider>
  );
}

export function useSwapWizard(): Ctx {
  const ctx = useContext(SwapWizardContext);
  if (!ctx) {
    throw new Error("useSwapWizard must be used inside <SwapWizardProvider>");
  }
  return ctx;
}
