// Unified animation system — every animated component draws from these
// tokens so motion feels consistent across the site.
import type { Variants, Transition } from 'framer-motion';
import { EASE_LUXE } from '@/lib/constants';

export { EASE_LUXE };

/** Standard durations (seconds) */
export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 0.9,
  hero: 1.1,
} as const;

export const TRANSITION_LUXE: Transition = { duration: DURATION.slow, ease: EASE_LUXE };
export const TRANSITION_FAST: Transition = { duration: DURATION.fast, ease: EASE_LUXE };

/** Fade + rise — the signature reveal */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: TRANSITION_LUXE },
};

/** Plain fade */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base, ease: 'easeOut' } },
};

/** Soft scale-in for modals, quick views and overlays */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: TRANSITION_FAST },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2, ease: 'easeIn' } },
};

/** Container that staggers its children */
export const staggerContainer = (gap = 0.09, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Page-level transition used by app/template.tsx */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_LUXE } },
};
