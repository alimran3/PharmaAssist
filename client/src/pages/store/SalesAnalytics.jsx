import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard, { StatCard } from '../../components/ui/GlassCard';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import {
  HiOutlineCurrencyBangladeshi, HiOutlineReceiptTax,
  HiOutlineTrendingUp, HiOutlineCalendar,
} from 'react-icons/hi';

const downloadPDF = async (billId, billNumber) => {
  try {
    const response = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${billNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF download error:', error);
    alert('Failed to download PDF. Please try again.');
  }
};

export default function SalesAnalytics() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState({ todaySales: {}, monthSales: {} });

  const fetchBills = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const [billRes, statRes] = await Promise.all([
        api.get('/bills/store', { params }),
        api.get('/stores/my-store/stats'),
      ]);

      setBills(billRes.data.data.bills);
      setPagination(billRes.data.data.pagination);
      setStats(statRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const handleFilter = () => fetchBills(1);

  const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const avgBill = bills.length > 0 ? totalRevenue / bills.length : 0;

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Sales Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={HiOutlineCurrencyBangladeshi} label="Today" value={formatCurrency(stats.todaySales?.total || 0)} subValue={`${stats.todaySales?.count || 0} bills`} color="emerald" />
        <StatCard icon={HiOutlineCurrencyBangladeshi} label="This Month" value={formatCurrency(stats.monthSales?.total || 0)} subValue={`${stats.monthSales?.count || 0} bills`} color="brand" />
        <StatCard icon={HiOutlineTrendingUp} label="Avg Bill" value={formatCurrency(avgBill)} color="purple" />
        <StatCard icon={HiOutlineReceiptTax} label="Page Total" value={formatCurrency(totalRevenue)} subValue={`${bills.length} shown`} color="amber" />
      </div>

      {/* Date Filter */}
      <GlassCard className="mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field text-sm" />
          </div>
          <button onClick={handleFilter} className="btn-primary text-sm">
            <HiOutlineCalendar className="w-4 h-4" /> Filter
          </button>
          <button onClick={() => { setDateFrom(''); setDateTo(''); fetchBills(); }} className="btn-secondary text-sm">Clear</button>
        </div>
      </GlassCard>

      {/* Bills Table */}
      <GlassCard>
        <h2 className="font-display font-bold text-lg mb-4">Sales History</h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12 text-surface-400">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">No bills found for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700/50">
                    <th className="text-left py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Bill #</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Patient</th>
                    <th className="text-center py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Items</th>
                    <th className="text-center py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Payment</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-center py-2.5 px-3 font-semibold text-surface-500 text-xs uppercase tracking-wider">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                  {bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-brand-500">{bill.billNumber}</td>
                      <td className="py-3 px-3">{bill.patient?.fullName || bill.walkInCustomer?.name || 'Walk-in'}</td>
                      <td className="py-3 px-3 text-center">{bill.items?.length || 0}</td>
                      <td className="py-3 px-3 text-center"><span className="badge badge-info text-[10px]">{bill.paymentMethod}</span></td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-600">{formatCurrency(bill.grandTotal)}</td>
                      <td className="py-3 px-3 text-right text-xs text-surface-500">{formatDateTime(bill.createdAt)}</td>
                      <td className="py-3 px-3 text-center">
                        <button onClick={() => downloadPDF(bill._id, bill.billNumber)}
                          className="btn-secondary text-xs px-2 py-1">
                          📄 PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-surface-200/50 dark:border-surface-700/30">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button key={i} onClick={() => fetchBills(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                      ${pagination.page === i + 1 ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg' : 'glass hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
}