import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard, { StatCard } from '../../components/ui/GlassCard';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/helpers';
import { HiOutlineCurrencyBangladeshi, HiOutlineReceiptTax, HiOutlineCalendar, HiOutlineTrendingUp } from 'react-icons/hi';

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchPurchases = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get('/bills/my-purchases', { params: { page, limit: 10 } });
      setPurchases(data.data.purchases);
      setStats(data.data.stats);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, []);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Purchase History</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HiOutlineCurrencyBangladeshi} label="Total Spent" value={formatCurrency(stats.totalSpent || 0)} color="brand" />
        <StatCard icon={HiOutlineReceiptTax} label="Total Purchases" value={stats.totalBills || 0} color="emerald" />
        <StatCard icon={HiOutlineTrendingUp} label="Avg Per Visit" value={formatCurrency(stats.avgBillAmount || 0)} color="purple" />
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
              <div className="h-3 w-32 bg-surface-100 dark:bg-surface-800 rounded" />
            </div>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <GlassCard className="text-center py-16">
          <p className="text-5xl mb-3">🧾</p>
          <p className="font-display font-bold text-xl text-surface-700 dark:text-surface-300">No purchases yet</p>
          <p className="text-sm text-surface-500 mt-1">When a pharmacy links your profile to a bill, it will appear here automatically.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {purchases.map((bill) => (
            <GlassCard key={bill._id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-500 font-semibold">{bill.billNumber}</span>
                    <span className="badge badge-info text-[10px]">{bill.paymentMethod}</span>
                  </div>
                  <p className="font-semibold text-sm mt-0.5">{bill.store?.pharmacyName || 'Pharmacy'}</p>
                  <p className="text-xs text-surface-500">
                    {bill.store?.appAddress?.area}, {bill.store?.appAddress?.upazilla}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-extrabold text-emerald-600">{formatCurrency(bill.grandTotal)}</p>
                  <p className="text-xs text-surface-500 flex items-center justify-end gap-1">
                    <HiOutlineCalendar className="w-3 h-3" /> {formatDateTime(bill.createdAt)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-surface-200/50 dark:border-surface-700/30 pt-3">
                <div className="space-y-1.5">
                  {bill.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-surface-600 dark:text-surface-400">
                        {item.medicine?.brandName || item.medicineName} {item.medicine?.strength || item.strength}
                        <span className="text-surface-400 ml-1">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button key={i} onClick={() => fetchPurchases(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                    ${pagination.page === i + 1 ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg' : 'glass hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}