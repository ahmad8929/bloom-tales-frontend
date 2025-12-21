import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CartButtonProps {
  itemCount: number;
}

export function CartButton({ itemCount }: CartButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/cart">
          <Button 
            variant="ghost" 
            size="icon" 
          className="
  relative group
  bg-accent
  hover:bg-primary/20
  border border-border
  transition-all duration-300
  hover:scale-110
  hover:shadow-lg hover:shadow-primary/20
  w-10 h-10 sm:w-11 sm:h-11
"

>
<ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground transition-colors duration-300" />
 
            {itemCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 text-xs bg-hover text-hover-foreground rounded-full flex items-center justify-center font-bold shadow-lg z-10 animate-pulse">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 bg-hover/30 rounded-full animate-ping"></div>
              </>
            )}
            
            {/* Floating hearts animation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Heart className="w-2 h-2 text-hover absolute top-1 right-1 animate-bounce delay-100" />
            </div>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent className="bg-primary text-primary-foreground border-none">
        <p className="font-medium">
          Shopping Cart {itemCount > 0 && `(${itemCount} items)`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}