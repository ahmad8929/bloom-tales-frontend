import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Hide the wordmark and show only the brand mark */
  markOnly?: boolean;
}

/**
 * Official Bloom Tales logo — brand mark + wordmark.
 * Colors follow the brand palette: Warm Golden Beige text on Champagne White.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Bloomtales — home"
      className={cn('group flex items-center gap-2.5 sm:gap-3', className)}
    >
      {/* Brand mark */}
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-heading/25 transition-all duration-500 ease-luxe group-hover:ring-gold sm:h-10 sm:w-10 lg:h-11 lg:w-11">
        <Image
          src="/image.png"
          alt=""
          width={88}
          height={88}
          priority
          className="h-full w-full object-cover transition-transform duration-500 ease-luxe group-hover:scale-105"
        />
      </span>

      {/* Wordmark */}
      {!markOnly && (
        <span className="flex flex-col items-start leading-none">
          <span className="font-display text-xl font-semibold tracking-wide text-heading transition-colors duration-300 group-hover:text-gold sm:text-2xl lg:text-[26px]">
            Bloomtales
          </span>
          <span className="mt-1 font-sans text-[8px] font-semibold uppercase tracking-wider2 text-heading/70 sm:text-[9px]">
            Boutique
          </span>
        </span>
      )}
    </Link>
  );
}
