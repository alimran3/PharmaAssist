import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { StatCard } from '../../components/ui/GlassCard';
import GlassCard from '../../components/ui/GlassCard';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import {
  HiOutlineArchive, HiOutlineCurrencyBangladeshi, HiOutlineExclamation,
  HiOutlineClock, HiOutlinePlusCircle, HiOutlineReceiptTax,
  HiOutlineChartBar, HiOutlineBan,
} from 'react-icons/hi';

export default function StoreDashboard() {
  const { user, store } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stores/my-store/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
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
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
              <div className="h-7 w-16 bg-surface-200 dark:bg-surface-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900 dark:text-white">
            {store?.pharmacyName || 'Dashboard'} 🏪
          </h1>
          <p className="text-sm text-surface-500 mt-1">Welcome back, {user?.fullName?.split(' ')[0]}. Here's your overview.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/store/add-medicine" className="btn-primary text-sm">
            <HiOutlinePlusCircle className="w-4 h-4" /> Add Medicine
          </Link>
          <Link to="/store/billing" className="btn-emerald text-sm">
            <HiOutlineReceiptTax className="w-4 h-4" /> New Bill
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={HiOutlineArchive}
          label="Total Medicines"
          value={stats?.totalMedicines || 0}
          color="brand"
        />
        <StatCard
          icon={HiOutlineCurrencyBangladeshi}
          label="Today's Sales"
          value={formatCurrency(stats?.todaySales?.total || 0)}
          subValue={`${stats?.todaySales?.count || 0} bills`}
          color="emerald"
        />
        <StatCard
          icon={HiOutlineCurrencyBangladeshi}
          label="This Month"
          value={formatCurrency(stats?.monthSales?.total || 0)}
          subValue={`${stats?.monthSales?.count || 0} bills`}
          color="purple"
        />
        <StatCard
          icon={HiOutlineExclamation}
          label="Low Stock"
          value={stats?.lowStockCount || 0}
          subValue={`${stats?.outOfStockCount || 0} out of stock`}
          color="amber"
        />
      </div>

      {/* Alert cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <GlassCard className="flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <HiOutlineClock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-display font-extrabold text-amber-600">{stats?.expiringSoonCount || 0}</p>
            <p className="text-xs text-surface-500 font-medium">Expiring in 30 days</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 border-l-4 border-red-500">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
            <HiOutlineBan className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-display font-extrabold text-red-600">{stats?.expiredCount || 0}</p>
            <p className="text-xs text-surface-500 font-medium">Expired Medicines</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 border-l-4 border-brand-500">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <HiOutlineChartBar className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p className="text-2xl font-display font-extrabold text-brand-600">{stats?.outOfStockCount || 0}</p>
            <p className="text-xs text-surface-500 font-medium">Out of Stock Items</p>
          </div>
        </GlassCard>
      </div>

      {/* Recent Bills */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Recent Bills</h2>
          <Link to="/store/analytics" className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">View All →</Link>
        </div>

        {!stats?.recentBills || stats.recentBills.length === 0 ? (
          <div className="text-center py-10 text-surface-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">No bills yet. Create your first bill!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700/50">
                  <th className="text-left py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Bill #</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Patient</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Items</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {stats.recentBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-brand-500">{bill.billNumber}</td>
                    <td className="py-3 px-3">{bill.patient?.fullName || bill.walkInCustomer?.name || 'Walk-in'}</td>
                    <td className="py-3 px-3 text-surface-500">{bill.items?.length || 0} items</td>
                    <td className="py-3 px-3 text-right font-semibold">{formatCurrency(bill.grandTotal)}</td>
                    <td className="py-3 px-3 text-right text-xs text-surface-500">{formatDateTime(bill.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}