import Link from 'next/link';
import { User, Settings, ShoppingCart, Crown, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { headerIconButton } from '@/lib/ui';

interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
}

interface UserMenuProps {
  user: User | null;
  isAuthenticated: boolean;
  logoutUser: () => void;
}

export function UserMenu({ user, isAuthenticated, logoutUser }: UserMenuProps) {
  if (!isAuthenticated || !user) {
    return (
      <Button 
        asChild
        variant="outline"
        size="icon"
        className="
          bg-card border-border
          hover:bg-secondary-hover
          hover:border-primary/30
          shadow-sm hover:shadow-md
          transition-all duration-300
          h-10 w-10
          rounded-md
        "
      >
        <Link href="/login" className="flex items-center justify-center w-full h-full">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
     <Button variant="outline" size="icon" className={headerIconButton}>
  <Avatar className="h-6 w-6">
    <AvatarFallback className="text-xs font-semibold">
      {user.firstName?.[0] ?? 'U'}
    </AvatarFallback>
  </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {/* User Info */}
        <div className="px-3 py-2">
          <p className="font-semibold truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            My Orders
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Profile Settings
          </Link>
        </DropdownMenuItem>

        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logoutUser}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
