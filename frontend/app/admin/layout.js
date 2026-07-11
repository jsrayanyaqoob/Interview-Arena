'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2, ShieldAlert } from 'lucide-react';

const ADMIN_EMAIL = 'rayanyaqoob83@gmail.com';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.email !== ADMIN_EMAIL) {
      router.replace('/recruiter/dashboard');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Admin access is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminGuard>
        {children}
      </AdminGuard>
    </ProtectedRoute>
  );
}
