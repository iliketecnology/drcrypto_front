/**
 * Decodificador de boleto (FEBRABAN) — sem consulta a banco.
 *
 * Aceita:
 *  - Boleto bancário: código de barras (44 dígitos) ou linha digitável (47)
 *  - Boleto de arrecadação (inicia em 8): código de barras (44) ou linha digitável (48)
 *
 * Retorna { valor, tipo, qtd, line, vencimento } ou null se o código for inválido
 * (tamanho errado ou dígitos verificadores incorretos).
 *
 *  - valor:      string com 2 casas decimais ("1500.75"). null se o boleto for
 *                de valor em aberto (zerado) ou se o campo representar quantidade.
 *  - tipo:       "bancario" | "arrecadacao"
 *  - qtd:        quantidade de moeda (arrecadação com código moeda 7/9). null nos demais.
 *  - line:       sempre a linha digitável formatada (se entrar barcode, converte).
 *  - vencimento: "YYYY-MM-DD" ou null (arrecadação nem sempre codifica a data).
 */

export type TipoBoleto = "bancario" | "arrecadacao";

export interface BoletoInfo {
  valor: string | null;
  tipo: TipoBoleto;
  qtd: string | null;
  line: string;
  vencimento: string | null;
}

const BASE_FATOR_UTC = Date.UTC(1997, 9, 7); // 07/10/1997
const DIA_MS = 86_400_000;

/* ---------------------------- dígitos verificadores ---------------------------- */

function mod10(bloco: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = bloco.length - 1; i >= 0; i--) {
    let p = Number(bloco[i]) * peso;
    if (p > 9) p -= 9;
    soma += p;
    peso = peso === 2 ? 1 : 2;
  }
  return (10 - (soma % 10)) % 10;
}

/** DV geral do boleto bancário (mod 11, resultado 0/10/11 vira 1). */
function mod11Bancario(bloco43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = bloco43.length - 1; i >= 0; i--) {
    soma += Number(bloco43[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const dv = 11 - (soma % 11);
  return dv === 0 || dv === 10 || dv === 11 ? 1 : dv;
}

/** DV do boleto de arrecadação em mod 11 (resto 0 ou 1 vira 0; resto 10 vira 1). */
function mod11Arrecadacao(bloco: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = bloco.length - 1; i >= 0; i--) {
    soma += Number(bloco[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  if (resto === 0 || resto === 1) return 0;
  return 11 - resto; // resto 10 => 1
}

/* --------------------------------- utilidades --------------------------------- */

function centavosParaValor(campo: string): string | null {
  const centavos = Number(campo);
  if (!Number.isFinite(centavos) || centavos === 0) return null; // valor em aberto
  return (centavos / 100).toFixed(2);
}

/**
 * Fator de vencimento -> data. Trata o rollover da FEBRABAN:
 * o fator estourou 9999 em 21/02/2025 e recomeçou em 1000 (22/02/2025).
 * Escolhe, entre os dois ciclos possíveis, a data mais próxima de hoje.
 */
function fatorParaData(fator: number): string | null {
  if (fator < 1000) return null; // 0000 = sem vencimento
  const hoje = Date.now();
  const ciclo1 = BASE_FATOR_UTC + fator * DIA_MS;
  const ciclo2 = BASE_FATOR_UTC + (fator + 9000) * DIA_MS;
  const escolhida =
    Math.abs(ciclo1 - hoje) <= Math.abs(ciclo2 - hoje) ? ciclo1 : ciclo2;
  return new Date(escolhida).toISOString().slice(0, 10);
}

function dataYYYYMMDDValida(s: string): string | null {
  if (!/^\d{8}$/.test(s)) return null;
  const ano = Number(s.slice(0, 4));
  const mes = Number(s.slice(4, 6));
  const dia = Number(s.slice(6, 8));
  if (ano < 1998 || ano > 2099 || mes < 1 || mes > 12 || dia < 1 || dia > 31)
    return null;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return d.toISOString().slice(0, 10);
}

/* ------------------------------- boleto bancário ------------------------------- */

/** Linha digitável (47) -> código de barras (44). null se DVs inválidos. */
function digitavelParaBarcodeBancario(d: string): string | null {
  const campo1 = d.slice(0, 10);
  const campo2 = d.slice(10, 21);
  const campo3 = d.slice(21, 32);
  const dvGeral = d[32];
  const campo5 = d.slice(33, 47); // fator (4) + valor (10)

  if (mod10(campo1.slice(0, 9)) !== Number(campo1[9])) return null;
  if (mod10(campo2.slice(0, 10)) !== Number(campo2[10])) return null;
  if (mod10(campo3.slice(0, 10)) !== Number(campo3[10])) return null;

  const campoLivre =
    campo1.slice(4, 9) + campo2.slice(0, 10) + campo3.slice(0, 10);
  const barcode = d.slice(0, 4) + dvGeral + campo5 + campoLivre;

  if (mod11Bancario(barcode.slice(0, 4) + barcode.slice(5)) !== Number(dvGeral))
    return null;
  return barcode;
}

/** Código de barras (44) -> linha digitável formatada. null se DV geral inválido. */
function barcodeParaDigitavelBancario(b: string): string | null {
  if (mod11Bancario(b.slice(0, 4) + b.slice(5)) !== Number(b[4])) return null;

  const campoLivre = b.slice(19);
  const f1 = b.slice(0, 4) + campoLivre.slice(0, 5);
  const f2 = campoLivre.slice(5, 15);
  const f3 = campoLivre.slice(15, 25);

  const c1 = f1 + mod10(f1);
  const c2 = f2 + mod10(f2);
  const c3 = f3 + mod10(f3);

  return (
    `${c1.slice(0, 5)}.${c1.slice(5)} ` +
    `${c2.slice(0, 5)}.${c2.slice(5)} ` +
    `${c3.slice(0, 5)}.${c3.slice(5)} ` +
    `${b[4]} ${b.slice(5, 19)}`
  );
}

/* ------------------------------ boleto de arrecadação ------------------------------ */

function dvArrecadacao(bloco: string, moeda: string): number {
  return moeda === "6" || moeda === "7"
    ? mod10(bloco)
    : mod11Arrecadacao(bloco);
}

/** Linha digitável (48) -> código de barras (44). null se DVs inválidos. */
function digitavelParaBarcodeArrecadacao(d: string): string | null {
  const moeda = d[2];
  if (!"6789".includes(moeda)) return null;

  let barcode = "";
  for (let i = 0; i < 4; i++) {
    const bloco = d.slice(i * 12, i * 12 + 11);
    const dv = Number(d[i * 12 + 11]);
    if (dvArrecadacao(bloco, moeda) !== dv) return null;
    barcode += bloco;
  }
  // DV geral (posição 4) sobre os demais 43 dígitos
  if (
    dvArrecadacao(barcode.slice(0, 3) + barcode.slice(4), moeda) !==
    Number(barcode[3])
  ) {
    return null;
  }
  return barcode;
}

/** Código de barras (44) -> linha digitável (48) formatada. null se DV geral inválido. */
function barcodeParaDigitavelArrecadacao(b: string): string | null {
  const moeda = b[2];
  if (!"6789".includes(moeda)) return null;
  if (dvArrecadacao(b.slice(0, 3) + b.slice(4), moeda) !== Number(b[3]))
    return null;

  const blocos: string[] = [];
  for (let i = 0; i < 4; i++) {
    const bloco = b.slice(i * 11, i * 11 + 11);
    blocos.push(`${bloco}-${dvArrecadacao(bloco, moeda)}`);
  }
  return blocos.join(" ");
}

/* ----------------------------------- principal ----------------------------------- */

export function parseBoleto(code: string): BoletoInfo | null {
  const digits = code.replace(/\D/g, "");

  const isArrecadacao = digits[0] === "8" && digits.length !== 47;

  let barcode: string | null = null;
  let line: string | null = null;

  if (isArrecadacao) {
    if (digits.length === 44) {
      barcode = digits;
      line = barcodeParaDigitavelArrecadacao(digits);
    } else if (digits.length === 48) {
      barcode = digitavelParaBarcodeArrecadacao(digits);
      line = barcode ? barcodeParaDigitavelArrecadacao(barcode) : null;
    }
    if (!barcode || !line) return null;

    const moeda = barcode[2];
    const campoValor = barcode.slice(4, 15); // 11 dígitos
    const ehValorEfetivo = moeda === "6" || moeda === "8";

    // Heurística: alguns convênios gravam a data (YYYYMMDD) no início do campo livre.
    const vencimento = dataYYYYMMDDValida(barcode.slice(19, 27));

    return {
      tipo: "arrecadacao",
      valor: ehValorEfetivo ? centavosParaValor(campoValor) : null,
      qtd: ehValorEfetivo ? null : String(Number(campoValor)),
      line,
      vencimento,
    };
  }

  // Boleto bancário
  if (digits.length === 44) {
    barcode = digits;
    line = barcodeParaDigitavelBancario(digits);
  } else if (digits.length === 47) {
    barcode = digitavelParaBarcodeBancario(digits);
    line = barcode ? barcodeParaDigitavelBancario(barcode) : null;
  }
  if (!barcode || !line) return null;

  return {
    tipo: "bancario",
    valor: centavosParaValor(barcode.slice(9, 19)),
    qtd: null,
    line,
    vencimento: fatorParaData(Number(barcode.slice(5, 9))),
  };
}

/** Validador simples (equivalente ao seu isValidBoletoCode, agora com DVs). */
export function isValidBoletoCode(code: string): boolean {
  return parseBoleto(code) !== null;
}
