/** Tipos compartilhados entre SwapWizard e ReceiptDialog.
 * Centralizado aqui pra evitar import circular wizard ↔ provider. */

export type Network = "polygon" | "solana" | "plasma";

/** Ordem de exibição das redes no seletor. */
export const NETWORKS: Network[] = ["polygon", "solana", "plasma"];

/** Nome e ticker de cada rede, usados no wizard e no comprovante. */
export const NETWORK_META: Record<Network, { label: string; ticker: string }> = {
  polygon: { label: "Polygon", ticker: "USDT.POL" },
  solana: { label: "Solana", ticker: "USDT.SPL" },
  plasma: { label: "Plasma", ticker: "USDT0" },
};

export type PixKeyType = "cpf" | "email" | "phone" | "evp" | "cnpj";

/** Modalidade de pagamento destino. */
export type PaymentMode = "pix" | "boleto" | "qr";

/** Snapshot do swap concluído. Passado do wizard pro ReceiptDialog. */
export type SwapResult = {
  amountUSDT: string;
  amountBRL: string;
  network: Network;
  pixKey: string;
  pixKeyType: PixKeyType;
  returnWallet: string;
  receiptEmail: string;
  txHash: string;
  completedAt: number;
  endtoend: string;
  beneficiary: string;
  paymentMode: PaymentMode;
  boletoCode?: string;
  pixQrRaw?: string;

  /** Cotação USD→BRL travada no momento da geração do QR (R$ por 1 USDT). */
  rate: number;
};

export type RefundResult = {
  kind: "refunded" | "failed";
  orderId: string;
  /** Valor devolvido em USDT (amount_usd da API, cai pro valor digitado). */
  amountUSDT: string;
  /** Rede da operação original (cryptoNetwork da API). */
  network: string;
  /** Carteira que recebeu o estorno (wallet_ret da API). */
  returnWallet: string;
  /** Hash on-chain da devolução (returnTxid da API). */
  returnTxid: string;
  /** Motivo do estorno/falha (msg da API), exibido como vier. */
  reason: string;
  /** Data da ordem (createdAt da API), em ms. */
  createdAt: number;
};

/** Rede e explorer da hash de devolução. Solana e Plasma devolvem na própria rede;
 * Tron passa pela bridge e devolve em Polygon (hash 0x), então só hash sem 0x
 * de ordem Tron vai pro Tronscan. */
export function refundChain(
  txid: string,
  orderNetwork: string,
): { label: string; url: string } {
  const net = orderNetwork.toUpperCase();
  if (net === "SOLANA")
    return { label: "Solana", url: `https://solscan.io/tx/${txid}` };
  if (net === "PLASMA")
    return { label: "Plasma", url: `https://plasmascan.to/tx/${txid}` };
  if (net === "TRON" && !txid.startsWith("0x"))
    return { label: "Tron", url: `https://tronscan.org/#/transaction/${txid}` };
  return { label: "Polygon", url: `https://polygonscan.com/tx/${txid}` };
}

/** Taxa do provedor de liquidez sobre o valor enviado em USDT.
 * Polygon paga taxa de gas em MATIC e tem spread cambial.
 * Solana e Plasma seguem a taxa da Polygon até o Emerson definir a delas. */
export const LIQUIDITY_FEE: Record<Network, number> = {
  polygon: 0.03,
  solana: 0.03,
  plasma: 0.03,
};

export const NETWORK_ADDRESS: Record<Network, string> = {
  polygon: "0x9aF3c2B8e5F1d4A6c0E7b9D2f8A1c3B5e7F0a9D4",
  solana: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  plasma: "0x9aF3c2B8e5F1d4A6c0E7b9D2f8A1c3B5e7F0a9D4",
};

/** Regex de validação dos endereços de carteira por rede.
 * Polygon (EVM): 0x + 40 hex chars.
 * Solana: 32 a 44 chars base58.
 * Plasma (EVM): mesmo formato da Polygon. */
export const WALLET_REGEX: Record<Network, RegExp> = {
  polygon: /^0x[a-fA-F0-9]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  plasma: /^0x[a-fA-F0-9]{40}$/,
};

export function isValidWallet(network: Network, address: string): boolean {
  return WALLET_REGEX[network].test(address.trim());
}
