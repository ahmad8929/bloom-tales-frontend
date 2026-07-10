'use client';

import { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  type MotionProps,
} from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE_LUXE } from '@/lib/motion';

/* ————————————————— FadeIn: scroll-triggered reveal ————————————————— */

interface FadeInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.9,
  y = 28,
  once = true,
  ...rest
}: FadeInProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration, delay, ease: EASE_LUXE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ————————————————— Stagger: reveal children one by one ————————————————— */

export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.09,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 26,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_LUXE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ————————————————— Parallax: element drifts as you scroll ————————————————— */

export function Parallax({
  children,
  className,
  amount = 60,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/* ————————————————— TiltCard: subtle mouse-based 3D tilt ————————————————— */

export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(900px)');
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`
    );
  };

  const onLeave = () => setTransform('perspective(900px)');

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('transition-transform duration-300 ease-luxe will-change-transform', className)}
      style={{ transform, transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/* ————————————————— HoverLift: gentle rise + shadow on hover ————————————————— */

export function HoverLift({
  children,
  className,
  lift = 6,
}: {
  children: React.ReactNode;
  className?: string;
  lift?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduce ? undefined : { y: -lift }}
      transition={{ duration: 0.35, ease: EASE_LUXE }}
    >
      {children}
    </motion.div>
  );
}

/* ————————————— FloatingDepth: mouse-responsive 3D parallax layer ————————————— */
/* Decorative elements drift toward the cursor at different depths,      */
/* creating layered dimension without a WebGL payload.                   */

export function FloatingDepth({
  children,
  className,
  depth = 20,
}: {
  children: React.ReactNode;
  className?: string;
  /** px of travel at the pointer extremes — higher = closer to the viewer */
  depth?: number;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px * depth);
    y.set(py * depth);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={cn('relative', className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div style={reduce ? undefined : { x: springX, y: springY }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/* ————————————————— Accordion: animated content blocks ————————————————— */

export function MotionAccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg text-heading transition-colors hover:text-gold"
      >
        {title}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35, ease: EASE_LUXE }}
          className="shrink-0 text-gold"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm leading-relaxed text-text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ————————————————— Marquee: infinite editorial strip ————————————————— */

export function Marquee({
  children,
  className,
  speed = 32,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden whitespace-nowrap',
        pauseOnHover && 'marquee-pause',
        className
      )}
    >
      <div
        className="animate-scroll-infinite w-max items-center"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex w-max items-center">{children}</div>
        <div className="flex w-max items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
