'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  Menu, X, MessageSquare, LayoutDashboard, LogOut,
  MapPin, Calendar, Car, ChevronDown,
  PlusCircle, Home, ClipboardCheck, Users, UserCircle, ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/lib/types';
import { NotificationBell } from '@/components/notification-bell';

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
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true as const },
    { href: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck },
    { href: '/admin/owners', label: 'Owners', icon: Users },
    { href: '/admin/renters', label: 'Renters', icon: UserCircle },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  ];

  type HeaderNavLink = (typeof adminNavLinks)[number];
  const navItemIsActive = (
    link: HeaderNavLink | (typeof ownerNavLinks)[number] | (typeof renterNavLinks)[number]
  ) => {
    if ('exact' in link && link.exact) return pathname === link.href;
    if (link.href === '/') return pathname === '/';
    return pathname === link.href || pathname.startsWith(link.href + '/');
  };

  const getNavLinks = () => {
    if (!effectiveRole) return [];
    if (effectiveRole === 'owner') return ownerNavLinks;
    if (effectiveRole === 'admin') return adminNavLinks;
    return renterNavLinks;
  };

  const navLinks = getNavLinks();
  const accountName = currentUser?.name?.trim() || 'Account';
  const accountInitial = accountName.charAt(0).toUpperCase() || '?';
  const accountFirstWord = accountName.split(/\s+/)[0] || accountName;

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/90 font-sans shadow-[0_4px_24px_rgba(6,62,86,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-7">
        {/* Logo */}
        <Link href="/" className="group shrink-0 rounded-xl bg-primary px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5">
          <Image
            src="/White & Light Green Logo EN.svg"
            alt="MotoRent"
            width={148}
            height={46}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        {effectiveRole && (
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  navItemIsActive(link) ? 'bg-secondary/12 text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted'
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
            <Link href="/browse" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/browse') ? 'bg-secondary/12 text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
              <Car size={15} /> Browse vehicles
            </Link>
            <Link href="/#how-it-works" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-muted hover:text-primary">
              <MapPin size={15} /> How it works
            </Link>
            <Link href="/#partners" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-muted hover:text-primary">
              <PlusCircle size={15} /> List your vehicle
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
              <NotificationBell />

              {effectiveRole === 'renter' && (
                <Link
                  href="/kyc"
                  aria-label="Identity verification"
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-primary/10 bg-muted/50 px-2.5 text-xs font-bold text-primary transition-colors hover:bg-muted"
                >
                  <ShieldCheck size={16} />
                  <span className="hidden lg:inline">Verification</span>
                </Link>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 hover:bg-muted transition-colors rounded-xl border border-transparent hover:border-border">
                    <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                      {accountInitial}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-black leading-none">{accountFirstWord}</span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-0.5 capitalize">{currentUser.role}</span>
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-2xl border border-border mt-2">
                  <div className="px-3 py-2 mb-1">
                    <p className="font-bold text-sm">{accountName}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.phone}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                    <Link href={getDashboardLink()} className="flex items-center gap-2.5 font-bold">
                      <LayoutDashboard size={16} className="text-muted-foreground" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                    <Link
                      href={effectiveRole === 'admin' ? '/admin/messages' : '/messages'}
                      className="flex items-center gap-2.5 font-bold"
                    >
                      <MessageSquare size={16} className="text-muted-foreground" /> Messages
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
                className="h-10 rounded-full bg-secondary px-5 text-xs font-black text-secondary-foreground shadow-lg shadow-secondary/20 hover:bg-secondary/90"
                onClick={() => router.push('/login/renter')}
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
                    {accountInitial}
                  </div>
                  <div>
                    <p className="font-black text-sm">{accountName}</p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      navItemIsActive(link) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
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
              <Link href="/browse" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <Car size={18} /> Browse Vehicles
              </Link>
              <Link href="/#how-it-works" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <MapPin size={18} /> How it works
              </Link>
              <Link href="/#partners" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <PlusCircle size={18} /> List your vehicle
              </Link>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="h-12 rounded-xl font-black" onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}>Sign In</Button>
                <Button className="h-12 rounded-xl font-black shadow-xl" onClick={() => { router.push('/login/renter'); setMobileMenuOpen(false); }}>Join Free</Button>
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
