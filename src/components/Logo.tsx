import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group relative", className)}>
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150"></div>
      
      {/* Icon container with gradient background */}
      <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-all duration-300 group-hover:scale-110">
        <Heart className="h-5 w-5 text-white transition-all duration-300 group-hover:scale-110 fill-current" />
        
        {/* Sparkle effects */}
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-bounce delay-100"></div>
      </div>
      
      {/* Text with gradient */}
      <div className="relative">
        <span className="font-headline text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300">
          Bloomtales
        </span>
        
        {/* Subtitle */}
        <div className="text-xs text-gray-500 font-medium -mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          Boutique
        </div>
        
        {/* Animated underline */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
        
        {/* Floating hearts */}
        <div className="absolute inset-0 pointer-events-none">
          <Heart className="absolute -top-2 right-2 w-2 h-2 text-pink-400 opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300 delay-200 fill-current" />
          <Heart className="absolute top-1 -right-3 w-1.5 h-1.5 text-purple-400 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300 delay-300 fill-current" />
        </div>
      </div>
    </Link>
  );
}