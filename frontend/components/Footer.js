'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Only show on landing page and sign-in
  const isLanding = pathname === '/' || pathname === '/sign-in';

  if (!isLanding) return null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Interview Arena
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/#features" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Pricing
            </Link>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Terms
            </a>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Interview Arena AI
          </p>
        </div>
      </div>
    </footer>
  );
}
