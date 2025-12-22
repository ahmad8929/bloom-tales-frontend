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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            asChild
            variant="outline"
            size="icon"
            className={headerIconButton}
          >
            <Link href="/login" className="flex items-center justify-center w-full h-full">
              <User className="h-5 w-5 text-text-normal" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-primary text-primary-foreground border-none">
          <p className="font-medium">Login / Sign Up</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className={headerIconButton}>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs font-semibold bg-secondary-hover text-text-normal">
                  {user.firstName?.[0] ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="bg-primary text-primary-foreground border-none">
          <p className="font-medium">Account Menu</p>
        </TooltipContent>

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
    </Tooltip>
  );
}
