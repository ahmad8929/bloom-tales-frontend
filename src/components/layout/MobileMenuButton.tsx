import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden relative bg-accent hover:bg-secondary-hover border border-border transition-all duration-300 hover:scale-105 w-10 h-10"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <X className="h-5 w-5 text-primary transition-transform duration-200" />
      ) : (
        <Menu className="h-5 w-5 text-primary transition-transform duration-200" />
      )}
    </Button>
  );
}