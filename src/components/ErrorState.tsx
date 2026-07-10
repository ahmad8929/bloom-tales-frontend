'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/primitives';
import { cn } from '@/lib/utils';

interface ErrorStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** A calm fallback path forward — e.g. "Continue Shopping" */
  secondaryAction?: ErrorStateAction;
  className?: string;
  /** Use inside a smaller section (cart, dashboard card) instead of a full page */
  compact?: boolean;
}

/**
 * On-brand replacement for raw/red error screens. Keeps the tone calm and
 * human — no alarming red text, no leaked technical messages — while still
 * giving the visitor a clear way forward. Technical detail belongs in
 * console.error at the call site, not in `message`.
 */
export function ErrorState({
  title = 'We hit a snag',
  message = "That didn't load — please try again in a moment.",
  onRetry,
  secondaryAction,
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <FadeIn className={cn('text-center', compact ? 'py-12' : 'py-24', className)}>
      <div className="mx-auto max-w-md">
        <h2 className="mb-3 font-display text-2xl text-heading md:text-3xl">{title}</h2>
        <p className="mb-8 text-sm leading-relaxed text-text-muted">{message}</p>
        {(onRetry || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onRetry && <Button onClick={onRetry}>Try Again</Button>}
            {secondaryAction &&
              (secondaryAction.href ? (
                <Button variant="outline" asChild>
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
