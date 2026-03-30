import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import { useAuth } from './hooks/useAuth';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import MedicineSearch from './pages/patient/MedicineSearch';
import PharmacyView from './pages/patient/PharmacyView';
import PurchaseHistory from './pages/patient/PurchaseHistory';
import HealthVitals from './pages/patient/HealthVitals';
import Prescriptions from './pages/patient/Prescriptions';
import PatientSettings from './pages/patient/PatientSettings';

// Store
import StoreDashboard from './pages/store/StoreDashboard';
import Inventory from './pages/store/Inventory';
import AddMedicine from './pages/store/AddMedicine';
import BillCreation from './pages/store/BillCreation';
import SalesAnalytics from './pages/store/SalesAnalytics';
import StoreSettings from './pages/store/StoreSettings';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePharmacies from './pages/admin/ManagePharmacies';
import ManagePatients from './pages/admin/ManagePatients';
import ManageMedicines from './pages/admin/ManageMedicines';
import AdminSettings from './pages/admin/AdminSettings';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, initialized } = useAuth();
  if (!initialized) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    const paths = { patient: '/patient', storeOwner: '/store', admin: '/admin' };
    return <Navigate to={paths[user?.role] || '/'} replace />;
  }
  return children;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
      </div>
      <p className="text-sm font-medium text-surface-500 animate-pulse">Loading PharmaAssist...</p>
    </div>
  </div>
);

export default function App() {
  const dispatch = useDispatch();
  const { token, initialized } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pharma_dark');
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [dispatch, token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pharma_dark', darkMode);
  }, [darkMode]);

  if (!initialized && token) return <PageLoader />;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Routes */}
        <Route path="/patient" element={
          <ProtectedRoute roles={['patient']}>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        }>
          <Route index element={<PatientDashboard />} />
          <Route path="search" element={<MedicineSearch />} />
          <Route path="pharmacy/:id" element={<PharmacyView />} />
          <Route path="purchases" element={<PurchaseHistory />} />
          <Route path="health" element={<HealthVitals />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="settings" element={<PatientSettings />} />
        </Route>

        {/* Store Owner Routes */}
        <Route path="/store" element={
          <ProtectedRoute roles={['storeOwner']}>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        }>
          <Route index element={<StoreDashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="add-medicine" element={<AddMedicine />} />
          <Route path="billing" element={<BillCreation />} />
          <Route path="analytics" element={<SalesAnalytics />} />
          <Route path="settings" element={<StoreSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="pharmacies" element={<ManagePharmacies />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="medicines" element={<ManageMedicines />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}