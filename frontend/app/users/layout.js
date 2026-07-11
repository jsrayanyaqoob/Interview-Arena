import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'User Directory - Interview Arena AI',
  description: 'Browse candidates and recruiters on the platform.',
};

export default function UsersLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
