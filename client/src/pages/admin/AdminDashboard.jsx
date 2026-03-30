import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard, { StatCard } from '../../components/ui/GlassCard';
import { formatCurrency } from '../../utils/helpers';
import {
  HiOutlineOfficeBuilding, HiOutlineUsers, HiOutlineBeaker,
  HiOutlineReceiptTax, HiOutlineExclamation,
} from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
              <div className="h-8 w-16 bg-surface-200 dark:bg-surface-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900 dark:text-white">
          Admin Dashboard 🛡️
        </h1>
        <p className="text-sm text-surface-500 mt-1">Platform overview and management controls.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={HiOutlineOfficeBuilding}
          label="Pharmacies"
          value={stats?.totalPharmacies || 0}
          color="brand"
        />
        <StatCard
          icon={HiOutlineUsers}
          label="Patients"
          value={stats?.totalPatients || 0}
          color="emerald"
        />
        <StatCard
          icon={HiOutlineBeaker}
          label="Medicines (DB)"
          value={stats?.totalMedicines || 0}
          color="purple"
        />
        <StatCard
          icon={HiOutlineReceiptTax}
          label="Today's Bills"
          value={stats?.todayBills || 0}
          color="amber"
        />
        <StatCard
          icon={HiOutlineExclamation}
          label="Reported Reviews"
          value={stats?.reportedReviews || 0}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard hover className="group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 group-hover:scale-110 transition-transform">
              <HiOutlineOfficeBuilding className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h3 className="font-display font-bold">Manage Pharmacies</h3>
              <p className="text-xs text-surface-500 mt-0.5">View, approve, suspend pharmacy accounts</p>
            </div>
          </div>
          <a href="/admin/pharmacies" className="mt-4 inline-block text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
            View All →
          </a>
        </GlassCard>

        <GlassCard hover className="group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 group-hover:scale-110 transition-transform">
              <HiOutlineUsers className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-display font-bold">Manage Patients</h3>
              <p className="text-xs text-surface-500 mt-0.5">View patient accounts and activity</p>
            </div>
          </div>
          <a href="/admin/patients" className="mt-4 inline-block text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
            View All →
          </a>
        </GlassCard>

        <GlassCard hover className="group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
              <HiOutlineBeaker className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-display font-bold">Medicine Database</h3>
              <p className="text-xs text-surface-500 mt-0.5">Add, edit, manage master medicine records</p>
            </div>
          </div>
          <a href="/admin/medicines" className="mt-4 inline-block text-sm font-semibold text-purple-500 hover:text-purple-600 transition-colors">
            Manage →
          </a>
        </GlassCard>
      </div>
    </div>
  );
}