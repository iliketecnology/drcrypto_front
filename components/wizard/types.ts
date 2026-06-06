/** Tipos compartilhados entre SwapWizard e ReceiptDialog.
 * Centralizado aqui pra evitar import circular wizard ↔ provider. */

export type Network = "polygon";

export type PixKeyType = "cpf" | "email" | "phone" | "evp" | "cnpj";

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

  /** Cotação USD→BRL travada no momento da geração do QR (R$ por 1 USDT). */
  rate: number;
};

/** Taxa do provedor de liquidez sobre o valor enviado em USDT.
 * Polygon paga taxa de gas em MATIC e tem spread cambial. */
export const LIQUIDITY_FEE: Record<Network, number> = {
  polygon: 0.03,
};

export const NETWORK_ADDRESS: Record<Network, string> = {
  polygon: "0x9aF3c2B8e5F1d4A6c0E7b9D2f8A1c3B5e7F0a9D4",
};

/** Regex de validação dos endereços de carteira por rede.
 * Polygon (EVM): 0x + 40 hex chars. */
export const WALLET_REGEX: Record<Network, RegExp> = {
  polygon: /^0x[a-fA-F0-9]{40}$/,
};

export function isValidWallet(network: Network, address: string): boolean {
  return WALLET_REGEX[network].test(address.trim());
}
