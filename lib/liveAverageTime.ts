'use client';

import { useEffect, useState } from 'react';

/** Singleton subscriber pattern pro "tempo médio" (segundos) usado em
 * múltiplas seções do site (Trust Metrics + card flagship dos Diferenciais).
 * Todos os componentes que usam `useLiveAverageTime` recebem o MESMO valor
 * e mudam ao mesmo instante. */

const VALUES = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;
const INITIAL = 12;
const MIN_DELAY_MS = 5_000;
const MAX_DELAY_MS = 15_000;

let current: number = INITIAL;
const listeners = new Set<(v: number) => void>();
let started = false;

function pickNext(prev: number): number {
  let next = VALUES[Math.floor(Math.random() * VALUES.length)];
  if (next === prev) {
    next = VALUES[(VALUES.indexOf(prev) + 1) % VALUES.length];
  }
  return next;
}

function start() {
  if (started) return;
  started = true;
  function scheduleNext() {
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    setTimeout(() => {
      current = pickNext(current);
      listeners.forEach((fn) => fn(current));
      scheduleNext();
    }, delay);
  }
  scheduleNext();
}

/** Hook que devolve o tempo médio sincronizado entre seções. */
export function useLiveAverageTime(): number {
  const [value, setValue] = useState<number>(current);

  useEffect(() => {
    start();
    setValue(current);
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);

  return value;
}
