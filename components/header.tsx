'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Bike, Menu, X, MessageSquare, LayoutDashboard, LogOut,
  MapPin, Calendar, Car, ChevronDown,
  PlusCircle, Home, ClipboardCheck, Users,
} from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/lib/types';

type HeaderProps = {
  /** When set (e.g. on a role-protected layout), nav matches this role even before client session hydrates */
  forcedRole?: UserRole;
};

export function Header({ forcedRole }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authReady, currentUser, logout, messages } = useApp();
  const effectiveRole: UserRole | undefined = forcedRole ?? currentUser?.role;
  const showGuestChrome = authReady && !currentUser && !forcedRole;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getDashboardLink = () => {
    const r = effectiveRole;
    if (r === 'admin') return '/admin';
    if (r === 'owner') return '/owner-dashboard';
    return '/renter-dashboard';
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const unreadCount = messages.filter(
    m => m.recipientId === currentUser?.id && !m.read
  ).length;

  const renterNavLinks = [
    { href: '/home', label: 'Explore', icon: MapPin },
    { href: '/browse', label: 'Browse', icon: Search_ },
    { href: '/renter-dashboard', label: 'My Bookings', icon: Calendar },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const ownerNavLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/owner-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner-dashboard/add-vehicle', label: 'List Vehicle', icon: PlusCircle },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const adminNavLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck },
    { href: '/admin/owners', label: 'Owners', icon: Users },
  ];

  const getNavLinks = () => {
    if (!effectiveRole) return [];
    if (effectiveRole === 'owner') return ownerNavLinks;
    if (effectiveRole === 'admin') return adminNavLinks;
    return renterNavLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-border sticky top-0 z-50 font-sans shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-all duration-300 shrink-0">
          <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <Bike size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">
              MotoRent
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground -mt-0.5">Bangladesh</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {effectiveRole && (
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive(link.href) && link.href !== '/'
                    ? 'bg-primary/10 text-primary'
                    : isActive(link.href) && link.href === '/home'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {showGuestChrome && (
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link href="/home" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/home') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              <MapPin size={15} /> Explore
            </Link>
            <Link href="/browse" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/browse') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              <Car size={15} /> Browse
            </Link>
          </nav>
        )}
        {!effectiveRole && !authReady && (
          <div className="hidden md:flex flex-1 justify-center" aria-hidden />
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Link href="/messages" className="relative p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-primary">
                <MessageSquare size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 hover:bg-muted transition-colors rounded-xl border border-transparent hover:border-border">
                    <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-black leading-none">{currentUser.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-0.5 capitalize">{currentUser.role}</span>
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-2xl border border-border mt-2">
                  <div className="px-3 py-2 mb-1">
                    <p className="font-bold text-sm">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.phone}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                    <Link href={getDashboardLink()} className="flex items-center gap-2.5 font-bold">
                      <LayoutDashboard size={16} className="text-muted-foreground" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                    <Link href="/messages" className="flex items-center gap-2.5 font-bold">
                      <MessageSquare size={16} className="text-muted-foreground" /> Messages
                      {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{unreadCount}</span>}
                    </Link>
                  </DropdownMenuItem>
                  {effectiveRole === 'owner' && (
                    <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                      <Link href="/owner-dashboard/add-vehicle" className="flex items-center gap-2.5 font-bold">
                        <PlusCircle size={16} className="text-muted-foreground" /> List Vehicle
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg py-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 font-bold">
                    <LogOut size={16} className="mr-2.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : showGuestChrome ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="font-bold text-sm hidden sm:flex h-9"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button
                className="h-9 px-5 rounded-xl font-black text-xs shadow-lg shadow-primary/20"
                onClick={() => router.push('/signup')}
              >
                Join Free
              </Button>
            </div>
          ) : (
            <div className="flex h-9 min-w-[7rem] items-center justify-end gap-2 text-muted-foreground">
              <Spinner className="size-5" />
              <span className="sr-only">Loading session</span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-border px-4 py-6 space-y-2 animate-in slide-in-from-top duration-200">
          {effectiveRole ? (
            <>
              {currentUser && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-sm">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                  </div>
                </div>
              )}
              {!currentUser && authReady && (
                <p className="text-sm text-muted-foreground px-1 mb-2">Loading account…</p>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(link.href) ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={18} /> {link.label}
                </Link>
              ))}
              {currentUser && (
                <div className="pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 w-full"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              )}
            </>
          ) : showGuestChrome ? (
            <>
              <Link href="/home" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <MapPin size={18} /> Explore
              </Link>
              <Link href="/browse" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <Car size={18} /> Browse Vehicles
              </Link>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="h-12 rounded-xl font-black" onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}>Sign In</Button>
                <Button className="h-12 rounded-xl font-black shadow-xl" onClick={() => { router.push('/signup'); setMobileMenuOpen(false); }}>Join Free</Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-muted-foreground">
              <Spinner className="size-5" />
              Loading session…
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

// Inline search icon since we can't import
function Search_({ size = 24, ...props }: { size?: number;[key: string]: unknown }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
