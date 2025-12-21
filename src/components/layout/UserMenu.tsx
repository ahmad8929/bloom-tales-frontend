import Link from 'next/link';
import { User, Settings, ShoppingCart, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
          <Link href="/login">
            <Button 
              className="bg-primary hover:bg-hover text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 border-none font-medium px-4 sm:px-6 text-sm"
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="bg-primary text-primary-foreground border-none">
          <p className="font-medium">Join Bloomtales Family</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="group bg-accent hover:bg-hover border border-border transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 w-10 h-10 sm:w-11 sm:h-11"
            >
              <Avatar className="transition-all duration-300 group-hover:scale-110 w-6 h-6 sm:w-8 sm:h-8">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs sm:text-sm">
                  {user.firstName?.[0] ?? 'U'}
                </AvatarFallback>
              </Avatar>
              {user.role === 'admin' && (
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="bg-primary text-primary-foreground border-none">
          <p className="font-medium">Welcome, {user.firstName}!</p>
        </TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 sm:w-64 bg-card/95 backdrop-blur-lg border border-border shadow-2xl shadow-primary/20"
      >
        <DropdownMenuLabel className="bg-accent border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {user.firstName?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              {user.role === 'admin' && (
                <div className="flex items-center gap-1 mt-1">
                  <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                  <span className="text-xs text-yellow-600 font-medium">Administrator</span>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-hover hover:text-hover-foreground transition-all duration-200">
          <Link href="/orders" className="flex items-center gap-3 px-3 py-2">
            <ShoppingCart className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium">My Orders</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-hover hover:text-hover-foreground transition-all duration-200">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2">
            <Settings className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium">Profile Settings</span>
          </Link>
        </DropdownMenuItem>

        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-200">
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2">
                <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <span className="font-medium text-yellow-800">Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={logoutUser} 
          className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 transition-all duration-200"
        >
          <User className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}