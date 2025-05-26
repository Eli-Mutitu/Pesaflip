"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  CreditCard, 
  Receipt, 
  DollarSign, 
  User, 
  Menu, 
  X,
  BarChart3,
  Settings,
  LogOut,
  Wallet 
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

interface RouteItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isNew?: boolean;
}

const NavItem = ({ href, icon, label, isActive, isNew, onClick }: NavItemProps) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors",
      isActive 
        ? "bg-primary/10 text-primary font-medium" 
        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
    )}
    onClick={onClick}
  >
    {icon}
    <span className="flex-1">{label}</span>
    {isNew && (
      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
        NEW
      </span>
    )}
  </Link>
);

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const routes: RouteItem[] = [
    {
      href: "/dashboard/overview",
      label: "Dashboard",
      icon: <Home size={18} />,
    },
    {
      href: "/dashboard/invoices",
      label: "Invoices",
      icon: <FileText size={18} />,
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: <CreditCard size={18} />,
    },
    {
      href: "/dashboard/expenses",
      label: "Expenses",
      icon: <Receipt size={18} />,
    },
    {
      href: "/dashboard/wallet",
      label: "Wallet",
      icon: <Wallet size={18} />,
    },
    {
      href: "/dashboard/credit",
      label: "Credit",
      icon: <DollarSign size={18} />,
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: <BarChart3 size={18} />,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <User size={18} />,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings size={18} />,
    },
  ];

  // For large screens
  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Pesaflip</h2>
      </div>
      
      <div className="px-3 flex-1 space-y-1">
        <nav className="space-y-0.5">
          {routes.map((route) => (
            <NavItem
              key={route.href}
              href={route.href}
              icon={route.icon}
              label={route.label}
              isActive={pathname === route.href}
              isNew={route.isNew}
            />
          ))}
        </nav>
      </div>
      
      <div className="mt-auto px-3 pt-4 border-t border-neutral-100">
        <Link 
          href="/login" 
          className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </div>
  );

  // Mobile sidebar using Sheet
  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 border-b bg-white shadow-sm">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 border-r shadow-lg">
            <div className="px-6 py-4 flex items-center justify-between border-b">
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Pesaflip</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md text-neutral-500 hover:text-neutral-700"
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <nav className="flex flex-col p-4 space-y-1">
                {routes.map((route) => (
                  <NavItem
                    key={route.href}
                    href={route.href}
                    icon={route.icon}
                    label={route.label}
                    isActive={pathname === route.href}
                    isNew={route.isNew}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
                <div className="pt-4 mt-4 border-t border-neutral-100">
                  <Link 
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogOut size={18} />
                    Logout
                  </Link>
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-4 flex-1 flex justify-center lg:justify-start">
          <h1 className="text-lg font-bold text-center lg:text-left bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Pesaflip</h1>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-72 lg:border-r lg:bg-white lg:shadow-sm">
        <SidebarContent />
      </div>
    </>
  );
} 