import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'User Directory - Interview Arena AI',
  description: 'User management for administrators.',
};

export default function UsersLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      {children}
    </ProtectedRoute>
  );
}
