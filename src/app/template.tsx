'use client';

// Route-level template: re-mounts on navigation, giving every page a
// gentle, consistent entrance without layout shift.
import { motion, useReducedMotion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
