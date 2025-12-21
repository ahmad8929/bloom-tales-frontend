import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group relative", className)}>
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150"></div>
      
      {/* Logo image container */}
      <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-card rounded-full shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105 p-0.5">
        <Image
          src="/image.png"
          alt="Bloomtales Logo"
          width={60}
          height={60}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 rounded-full"
          priority
        />
      </div>
      
      {/* Text with gold color - Now visible on mobile */}
      <div className="relative">
        <span className="font-headline text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary group-hover:text-hover transition-all duration-300 whitespace-nowrap">
          Bloomtales
        </span>
        
        {/* Animated underline */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500 rounded-full"></div>
      </div>
    </Link>
  );
}