'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';

/** Conta de 0 até o valor numérico extraído da string, preservando prefixo/sufixo.
 * Ex: "99,98%" → anima de 0,00 até 99,98 + "%".
 * Suporta strings sem números (ex: "24/7") · nesse caso só renderiza estático. */

type Props = {
  value: string;
  className?: string;
  style?: React.CSSProperties;
  durationMs?: number;
};

export function CountUp({ value, className, style, durationMs = 1600 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState<string>(() => prepareInitial(value));

  useEffect(() => {
    if (!inView) return;
    const parsed = parseValue(value);
    if (!parsed) {
      setDisplay(value);
      return;
    }
    const { prefix, target, suffix, decimals, separator } = parsed;
    const controls = animate(0, target, {
      duration: durationMs / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        setDisplay(
          `${prefix}${formatNumber(latest, decimals, separator)}${suffix}`,
        );
      },
    });
    return () => controls.stop();
  }, [inView, value, durationMs]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}

function prepareInitial(value: string): string {
  const parsed = parseValue(value);
  if (!parsed) return value;
  return `${parsed.prefix}${formatNumber(0, parsed.decimals, parsed.separator)}${parsed.suffix}`;
}

type Parsed = {
  prefix: string;
  target: number;
  suffix: string;
  decimals: number;
  separator: ',' | '.';
};

function parseValue(value: string): Parsed | null {
  const match = value.match(/^([^0-9-]*)(-?[\d.,]+)(.*)$/);
  if (!match) return null;
  const [, prefix, rawNum, suffix] = match;
  // Detecta separador decimal usado (PT-BR usa "," / EN-US usa ".")
  let separator: ',' | '.' = '.';
  if (rawNum.includes(',') && !rawNum.includes('.')) separator = ',';
  if (rawNum.includes(',') && rawNum.includes('.')) {
    separator = rawNum.lastIndexOf(',') > rawNum.lastIndexOf('.') ? ',' : '.';
  }
  const clean = rawNum.replace(new RegExp(`[^0-9${separator === ',' ? ',' : '.'}\\-]`, 'g'), '');
  const standard = separator === ',' ? clean.replace(',', '.') : clean;
  const target = parseFloat(standard);
  if (Number.isNaN(target)) return null;
  const decIdx = clean.lastIndexOf(separator);
  const decimals = decIdx >= 0 ? clean.length - decIdx - 1 : 0;
  return { prefix, target, suffix, decimals, separator };
}

function formatNumber(n: number, decimals: number, separator: ',' | '.'): string {
  const fixed = n.toFixed(decimals);
  return separator === ',' ? fixed.replace('.', ',') : fixed;
}
