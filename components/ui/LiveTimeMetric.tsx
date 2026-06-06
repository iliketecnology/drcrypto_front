'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useLiveAverageTime } from '@/lib/liveAverageTime';

/** Métrica "tempo médio" sincronizada com outras seções (Diferenciais).
 * Valor vem do singleton em lib/liveAverageTime. */

type Props = {
  className?: string;
  style?: React.CSSProperties;
  suffix?: string;
};

export function LiveTimeMetric({ className, style, suffix = 's' }: Props) {
  const value = useLiveAverageTime();

  return (
    <span
      className={className}
      style={{ ...style, display: 'inline-flex', alignItems: 'baseline' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span>{suffix}</span>
    </span>
  );
}
