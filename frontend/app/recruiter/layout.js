import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Recruiter Dashboard - Interview Arena AI',
  description: 'Manage candidates, templates, and hiring pipeline.',
};

export default function RecruiterLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="RECRUITER">
      {children}
    </ProtectedRoute>
  );
}
