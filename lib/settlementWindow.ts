/**
 * Janela de liquidação para operações de alto valor (pedido do Thiago, 28/07).
 *
 * Regra do provedor: operações a partir de R$ 30.000 só são processadas dentro da
 * janela de 9h às 20h (horário de Brasília) em dia útil. Dentro da janela, a
 * liquidação pode levar até 1 hora. Fora dela, a operação entra na fila e é
 * processada a partir das 9h do próximo dia útil.
 *
 * Tudo é calculado em America/Sao_Paulo, nunca no fuso do navegador: o site tem
 * versão en/es e alguém acessando de fora do Brasil veria um aviso errado se a
 * conta fosse feita na hora local do aparelho.
 *
 * Módulo puro de propósito (sem React, sem DOM) — a borda das 20h é a parte que
 * mais erra, então precisa ser testável passando `now` na mão.
 */

/**
 * A regra vale para valores ACIMA deste piso · R$ 30.000,00 exatos não entram,
 * R$ 30.000,01 entra (decisão do Thiago, 28/07).
 */
export const SETTLEMENT_THRESHOLD_BRL = 30000;

/** Toda a regra roda no horário de Brasília. */
export const SETTLEMENT_TZ = "America/Sao_Paulo";

/** Abertura e corte da janela de processamento (hora cheia, horário de Brasília). */
export const WINDOW_OPEN_HOUR = 9;
export const WINDOW_CLOSE_HOUR = 20;

/** Validade padrão do QR no step 4 · usada pra prever se o pagamento cruza o corte. */
const DEFAULT_WINDOW_MINUTES = 15;

export type SettlementNotice = {
  /** `sameDay` = dentro da janela (até 1h) · `nextBusinessDay` = entra na fila. */
  status: "sameDay" | "nextBusinessDay";
  /**
   * Está dentro da janela, mas o corte das 20h acontece antes do QR expirar —
   * ou seja, dá pra gerar o QR às 19h55 e o pagamento confirmar às 20h02.
   * Só faz sentido quando `status === "sameDay"`.
   */
  crossesCutoff: boolean;
  /** Dia em que a operação seria processada quando não cabe na janela · ISO YYYY-MM-DD (data civil em SP). */
  processingDay: string;
  /** Minutos restantes até o corte das 20h (0 quando a janela já está fechada). */
  minutesToCutoff: number;
};

type ZonedParts = { year: number; month: number; day: number; minutes: number };

/** Quebra um instante nos componentes de data/hora do horário de Brasília. */
function zonedParts(date: Date): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SETTLEMENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    // hour12:false devolve "24" pra meia-noite em alguns runtimes — normaliza pra 0.
    minutes: (get("hour") % 24) * 60 + get("minute"),
  };
}

/** Domingo de Páscoa do ano (Meeus/Jones/Butcher) — base dos feriados móveis. */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

const holidayCache = new Map<number, Set<string>>();

/**
 * Feriados nacionais + os dias sem expediente bancário que a liquidação segue
 * (Carnaval e Corpus Christi são ponto facultativo, mas na prática o provedor
 * não processa). Não cobre feriado municipal/estadual.
 */
function holidaysOf(year: number): Set<string> {
  const cached = holidayCache.get(year);
  if (cached) return cached;

  const easter = easterSunday(year);
  const set = new Set<string>([
    `${year}-01-01`, // Confraternização Universal
    `${year}-04-21`, // Tiradentes
    `${year}-05-01`, // Dia do Trabalho
    `${year}-09-07`, // Independência
    `${year}-10-12`, // Nossa Senhora Aparecida
    `${year}-11-02`, // Finados
    `${year}-11-15`, // Proclamação da República
    `${year}-11-20`, // Consciência Negra (nacional desde a Lei 14.759/2023)
    `${year}-12-25`, // Natal
    toISODate(shiftDays(easter, -48)), // segunda de Carnaval
    toISODate(shiftDays(easter, -47)), // terça de Carnaval
    toISODate(shiftDays(easter, -2)), // Sexta-feira Santa
    toISODate(shiftDays(easter, 60)), // Corpus Christi
  ]);

  holidayCache.set(year, set);
  return set;
}

/** Dia útil = segunda a sexta que não é feriado. Recebe data civil, não instante. */
export function isBusinessDay(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !holidaysOf(y).has(iso);
}

/** Próximo dia útil depois de `iso` (nunca devolve o próprio dia). */
function nextBusinessDayAfter(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  let cursor = new Date(Date.UTC(y, m - 1, d));
  // 10 iteracões cobrem qualquer emenda de feriado real; o teto evita loop infinito.
  for (let i = 0; i < 10; i++) {
    cursor = shiftDays(cursor, 1);
    const candidate = toISODate(cursor);
    if (isBusinessDay(candidate)) return candidate;
  }
  return toISODate(cursor);
}

/**
 * Qual aviso mostrar pra uma operação de `amountBRL` neste instante.
 * Devolve `null` quando o valor está abaixo do limiar (o caso comum).
 *
 * @param windowMinutes validade restante do QR — define se o pagamento pode cruzar as 20h.
 */
export function getSettlementNotice(
  amountBRL: number,
  now: Date = new Date(),
  windowMinutes: number = DEFAULT_WINDOW_MINUTES,
): SettlementNotice | null {
  if (!Number.isFinite(amountBRL) || amountBRL <= SETTLEMENT_THRESHOLD_BRL) {
    return null;
  }

  const { year, month, day, minutes } = zonedParts(now);
  const today = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const open = WINDOW_OPEN_HOUR * 60;
  const close = WINDOW_CLOSE_HOUR * 60;
  const businessDay = isBusinessDay(today);

  if (businessDay && minutes >= open && minutes < close) {
    const minutesToCutoff = close - minutes;
    return {
      status: "sameDay",
      crossesCutoff: minutesToCutoff <= windowMinutes,
      // Se o pagamento escorregar pra depois das 20h, cai no próximo dia útil.
      processingDay: nextBusinessDayAfter(today),
      minutesToCutoff,
    };
  }

  // Antes das 9h de um dia útil a fila abre no mesmo dia; caso contrário, no próximo.
  const processingDay =
    businessDay && minutes < open ? today : nextBusinessDayAfter(today);

  return {
    status: "nextBusinessDay",
    crossesCutoff: false,
    processingDay,
    minutesToCutoff: 0,
  };
}

/** Rótulo do dia de processamento no idioma da interface ("terça-feira, 04/08"). */
export function formatProcessingDay(iso: string, locale: string): string {
  // Meio-dia UTC = 9h em SP · imune à virada de dia na conversão de fuso.
  const date = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    timeZone: SETTLEMENT_TZ,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}
