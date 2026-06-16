"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/** Busca a cotação USDT → BRL em tempo real.
 *
 * Estratégia:
 * - Fonte primária: CoinGecko (free, sem auth, USDT vs BRL real)
 * - Fallback: AwesomeAPI USD-BRL (USDT ≈ USD, dólar comercial)
 * - Cache em memória + localStorage por 60s pra reduzir requests
 * - Refresh automático a cada 90s enquanto o componente está montado
 *
 * Retorna `null` enquanto carrega ou em caso de falha total · o consumer
 * deve usar fallback hardcoded nesse caso (ex: 5.45). */

const CACHE_KEY = "uspix:usdt-brl-rate";
const CACHE_TTL_MS = 60_000;
const REFRESH_MS = 90_000;
const FALLBACK_RATE = 5.45;

type Cached = { rate: number; ts: number };

function readCache(): Cached | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rate: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rate, ts: Date.now() } satisfies Cached),
    );
  } catch {
    /* ignora · localStorage pode estar cheio ou desativado */
  }
}

async function fetchFromCoinGecko(signal: AbortSignal): Promise<number | null> {
  try {
    const res = await axios.get(
      `https://connect.smartpay.com.vc/api/swapix/swapquote?currency=brl&amount=1&type=sell&user=crypto2pay2`,
    );
    if (!res.data?.data?.price_usd) return null;

    return res.data?.data?.price_usd ?? null;
  } catch {
    return null;
  }
}

async function fetchFromAwesomeAPI(
  signal: AbortSignal,
): Promise<number | null> {
  try {
    const res = await axios.get(
      `https://connect.smartpay.com.vc/api/swapix/swapquote?currency=brl&amount=1&type=sell&user=crypto2pay2`,
    );

    console.log(res.data);
    if (!res.data?.data?.price_usd) return null;
    return res.data?.data?.price_usd ?? null;
  } catch {
    return null;
  }
}

export function useUsdtBrlRate(): {
  rate: number;
  isLive: boolean;
  isLoading: boolean;
} {
  const [rate, setRate] = useState<number>(
    () => readCache()?.rate ?? FALLBACK_RATE,
  );
  const [isLive, setIsLive] = useState<boolean>(() => !!readCache());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function tick() {
      setIsLoading(true);
      // 1) tenta CoinGecko · USDT/BRL direto
      let next = await fetchFromCoinGecko(controller.signal);

      console.log("next ====>", next);

      if (next !== null) {
        console.log("next no if ====>", next);

        setRate(next);
        setIsLive(true);
        writeCache(next);
      }
      setIsLoading(false);
    }

    tick();
    const interval = setInterval(tick, REFRESH_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  console.log({ rate, isLive, isLoading });
  return { rate, isLive, isLoading };
}

/** Formata valor BRL no padrão pt-BR (ex: 5450 → "5.450,00") */
export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
