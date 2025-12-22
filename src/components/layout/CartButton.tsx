import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { headerIconButton } from '@/lib/ui';

interface CartButtonProps {
  itemCount: number;
}

export function CartButton({ itemCount }: CartButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/cart">
         <Button variant="outline" size="icon" className={headerIconButton}>
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-text-normal transition-colors duration-300" />
 
            {itemCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shadow-md z-10">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              </>
            )}
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