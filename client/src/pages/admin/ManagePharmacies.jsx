import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import { formatDate, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineCheck, HiOutlineBan,
  HiOutlineRefresh, HiOutlineArrowLeft,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function ManagePharmacies() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchStores = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/admin/pharmacies', { params });
      setStores(data.data.stores);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    const confirm = window.confirm(`Are you sure you want to ${status} this pharmacy?`);
    if (!confirm) return;
    try {
      await api.put(`/admin/pharmacies/${id}/status`, { status });
      toast.success(`Pharmacy ${status}`);
      fetchStores(pagination.page);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="section-title">Manage Pharmacies</h1>
          <p className="text-sm text-surface-500 mt-0.5">{stores.length} pharmacies found</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['', 'active', 'suspended', 'deactivated'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${statusFilter === s
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                : 'glass text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-3xl mb-2">🏪</p>
          <p className="text-surface-500">No pharmacies found.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <GlassCard key={store._id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-emerald-100 dark:from-brand-900/30 dark:to-emerald-900/30 flex items-center justify-center flex-shrink-0 text-lg">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>{getInitials(store.pharmacyName)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-sm">{store.pharmacyName}</h3>
                  <span className={`badge text-[10px] ${
                    store.status === 'active' ? 'badge-success' :
                    store.status === 'suspended' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {store.status}
                  </span>
                </div>
                <p className="text-xs text-surface-500 mt-0.5">
                  Owner: {store.owner?.fullName || 'N/A'} · {store.owner?.phone || ''} · {store.owner?.email || ''}
                </p>
                <p className="text-xs text-surface-400">
                  {store.appAddress?.area}, {store.appAddress?.upazilla}, {store.appAddress?.district}
                  {store.establishmentYear ? ` · Est. ${store.establishmentYear}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {store.status !== 'active' && (
                  <button onClick={() => updateStatus(store._id, 'active')}
                    className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors"
                    title="Activate">
                    <HiOutlineCheck className="w-5 h-5" />
                  </button>
                )}
                {store.status !== 'suspended' && (
                  <button onClick={() => updateStatus(store._id, 'suspended')}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    title="Suspend">
                    <HiOutlineBan className="w-5 h-5" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button key={i} onClick={() => fetchStores(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                    ${pagination.page === i + 1
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                      : 'glass hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600'
                    }`}>
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