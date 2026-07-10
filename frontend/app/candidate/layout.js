import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Candidate Dashboard - Interview Arena AI',
  description: 'Manage your interviews, performance, and profile.',
};

export default function CandidateLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="CANDIDATE">
      {children}
    </ProtectedRoute>
  );
}
