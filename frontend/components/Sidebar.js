'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, BarChart3, PlayCircle,
  Settings, LogOut, ChevronLeft, ChevronRight, Sparkles,
  Briefcase, UserCheck, ClipboardList, TrendingUp, Menu, X,
  GraduationCap, Star
} from 'lucide-react';

const roleConfig = {
  candidate: {
    label: 'Candidate Portal',
    gradient: 'from-emerald-500 to-teal-500',
    links: [
      { href: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/candidate/interview', label: 'AI Interview', icon: PlayCircle },
      { href: '/candidate/performance', label: 'Performance', icon: TrendingUp },
      { href: '/candidate/profile', label: 'Profile', icon: UserCheck },
    ]
  },
  recruiter: {
    label: 'Recruiter Portal',
    gradient: 'from-indigo-500 to-purple-500',
    links: [
      { href: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/recruiter/templates', label: 'Templates', icon: ClipboardList },
      { href: '/candidate/dashboard', label: 'Candidates', icon: Users },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  admin: {
    label: 'Admin Portal',
    gradient: 'from-rose-500 to-orange-500',
    links: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/recruiter/dashboard', label: 'Recruiters', icon: Briefcase },
      { href: '/candidate/dashboard', label: 'Candidates', icon: Users },
    ]
  }
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show sidebar on landing page or sign-in
  const isDashboard = pathname.startsWith('/candidate') ||
    pathname.startsWith('/recruiter') ||
    pathname.startsWith('/admin');

  if (!isDashboard) return null;

  // Determine current role from pathname
  const role = pathname.startsWith('/recruiter')
    ? 'recruiter'
    : pathname.startsWith('/admin')
    ? 'admin'
    : 'candidate';

  const config = roleConfig[role];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent truncate">
                Interview Arena
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className={`px-4 py-3 mx-3 mt-3 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-xs font-medium flex items-center gap-2`}>
            <GraduationCap className="w-3.5 h-3.5" />
            {config.label}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {config.links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? link.label : undefined}
              >
                <div className={`p-1.5 rounded-lg ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 border-t border-slate-200 dark:border-slate-800 pt-3">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Settings"
          >
            <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
              <Settings className="w-4 h-4" />
            </div>
            {!collapsed && 'Settings'}
          </Link>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <div className="p-1.5 rounded-lg text-red-400 group-hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </div>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  );
}
