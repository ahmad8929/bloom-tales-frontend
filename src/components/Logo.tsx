import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <Leaf className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
      <span className="font-headline text-2xl font-bold text-foreground">
        Bloomtales
      </span>
    </Link>
  );
}
