import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, store, token, loading, initialized } = useSelector((state) => state.auth);

  return {
    user,
    store,
    token,
    loading,
    initialized,
    isAuthenticated: !!user && !!token,
    isPatient: user?.role === 'patient',
    isStoreOwner: user?.role === 'storeOwner',
    isAdmin: user?.role === 'admin',
  };
};