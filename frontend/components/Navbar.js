'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, ChevronDown, LogOut, User, Settings, Bell, Sparkles,
  Home, Briefcase, Users, BarChart3, GraduationCap, Building2,
  ExternalLink, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dirDropdownOpen, setDirDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dirRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dirRef.current && !dirRef.current.contains(e.target)) {
        setDirDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show navbar on dashboard pages (they have sidebar)
  const isDashboard = pathname.startsWith('/candidate') ||
    pathname.startsWith('/recruiter') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/users');

  if (isDashboard) return null;

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/#features', label: 'Features', icon: Sparkles },
    { href: '/#solutions', label: 'Solutions', icon: Briefcase },
    { href: '/#pricing', label: 'Pricing', icon: BarChart3 },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Interview Arena
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Directory Dropdown — visible only to admin */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <div className="relative" ref={dirRef}>
                <button
                  onClick={() => setDirDropdownOpen(!dirDropdownOpen)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname.startsWith('/users')
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Directory
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dirDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dirDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/5 py-1.5 animate-scale-in z-50" style={{ transformOrigin: 'top' }}>
                    <Link
                      href="/users/candidates"
                      onClick={() => { setDirDropdownOpen(false); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="flex-1">Candidates</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                    </Link>
                    <Link
                      href="/users/recruiters"
                      onClick={() => { setDirDropdownOpen(false); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="flex-1">Recruiters</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/5 py-1.5 animate-scale-in z-50" style={{ transformOrigin: 'top' }}>
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href={user?.role === 'CANDIDATE' ? '/candidate/dashboard' : user?.role === 'RECRUITER' ? '/recruiter/dashboard' : '/admin/dashboard'}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        href="/users/candidates"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        User Directory
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="btn-ghost text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in?register=true"
                  className="btn-primary text-sm"
                >
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in?register=true"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center mt-2 px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
