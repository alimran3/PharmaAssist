import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../ui/Loader';

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, initialized, loading } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (!initialized || loading) {
    return <PageLoader message="Verifying session..." />;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to their correct dashboard
    const dashboardPaths = {
      patient: '/patient',
      storeOwner: '/store',
      admin: '/admin',
    };
    const correctPath = dashboardPaths[user?.role] || '/';
    return <Navigate to={correctPath} replace />;
  }

  // Account suspended
  if (user?.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-strong rounded-3xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-display font-extrabold text-surface-900 dark:text-white">
            Account Suspended
          </h1>
          <p className="text-surface-500 mt-2">
            Your account has been suspended. Please contact the administrator for more information.
          </p>
          <a href="mailto:admin@pharmaassist.com" className="btn-primary text-sm mt-6 inline-flex">
            Contact Admin
          </a>
        </div>
      </div>
    );
  }

  return children;
}