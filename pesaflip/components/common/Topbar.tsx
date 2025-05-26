import React from "react";
import { Bell, Search, ChevronDown, Calendar, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    businessName: string;
    avatar?: string;
    role?: string;
    notifications?: number;
  };
  title?: string;
  showSearch?: boolean;
}

export function Topbar({ user, title, showSearch = true }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      {title && (
        <div className="hidden lg:block text-xl font-semibold">
          {title}
        </div>
      )}
      
      {showSearch && (
        <div className="flex flex-1 items-center">
          <form className="relative w-full max-w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 h-9 md:w-full bg-background rounded-lg border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
            />
          </form>
        </div>
      )}
      
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            aria-label="Calendar"
          >
            <Calendar className="h-5 w-5" />
            <span className="sr-only">Calendar</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {user.notifications && user.notifications > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {user.notifications}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto py-1">
              <div className="px-2 py-3 hover:bg-neutral-50 cursor-pointer rounded-md">
                <div className="text-sm font-medium mb-1">New Invoice Paid</div>
                <div className="text-xs text-neutral-500">
                  Invoice #INV-001 for KES 12,500 has been paid by Acme Co.
                </div>
                <div className="text-xs text-neutral-400 mt-1">10 minutes ago</div>
              </div>
              <div className="px-2 py-3 hover:bg-neutral-50 cursor-pointer rounded-md">
                <div className="text-sm font-medium mb-1">Payment Received</div>
                <div className="text-xs text-neutral-500">
                  You've received a payment of KES 8,750 from Widget Ltd.
                </div>
                <div className="text-xs text-neutral-400 mt-1">2 hours ago</div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-neutral-100 py-1 pl-1 pr-3 transition-colors">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {user.name.split(' ').map(name => name[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-neutral-500 truncate max-w-[150px]">{user.businessName}</p>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Business Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Help Center</DropdownMenuItem>
            <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 