import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Admin Dashboard - Interview Arena AI',
  description: 'Platform management and analytics.',
};

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      {children}
    </ProtectedRoute>
  );
}
