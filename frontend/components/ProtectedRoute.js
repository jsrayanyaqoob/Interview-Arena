'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
      // Redirect to appropriate dashboard based on role
      const roleRoutes = {
        CANDIDATE: '/candidate/dashboard',
        RECRUITER: '/recruiter/dashboard',
        ADMIN: '/admin/dashboard',
      };
      router.replace(roleRoutes[user?.role] || '/sign-in');
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
