/** Parser mínimo de payload EMV/BR Code (copia-e-cola PIX).
 *  Extrai campo 54 (valor), campo 59 (nome do recebedor) e chave PIX (26→01). */

type EmvFields = Record<string, string>;

function parseTlv(payload: string): EmvFields {
  const result: EmvFields = {};
  let i = 0;
  while (i + 4 <= payload.length) {
    const id = payload.slice(i, i + 2);
    const lenStr = payload.slice(i + 2, i + 4);
    const len = parseInt(lenStr, 10);
    if (isNaN(len) || i + 4 + len > payload.length) break;
    result[id] = payload.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return result;
}

export type PixQrData = {
  amount?: string;       // valor em BRL como string ("123.45"), undefined se não presente
  merchantName?: string; // nome do recebedor
  pixKey?: string;       // chave PIX extraída
  city?: string;
};

export function parsePixQr(payload: string): PixQrData {
  const p = payload.trim();
  const fields = parseTlv(p);

  const amount = fields["54"] || undefined;
  const merchantName = fields["59"] || undefined;
  const city = fields["60"] || undefined;

  // Chave PIX está em field 26, sub-field 01
  let pixKey: string | undefined;
  const f26 = fields["26"];
  if (f26) {
    const sub = parseTlv(f26);
    pixKey = sub["01"] || undefined;
  }

  return { amount, merchantName, pixKey, city };
}
