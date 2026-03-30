import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import { getMedicineImage, formatCurrency, formatDate, daysFromNow } from '../../utils/helpers';
import { STOCK_STATUS_CONFIG, EXPIRY_STATUS_CONFIG, MEDICINE_CATEGORIES } from '../../utils/constants';
import {
  HiOutlinePlusCircle, HiOutlineSearch, HiOutlinePencil,
  HiOutlineTrash, HiOutlineRefresh, HiOutlineFilter,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;

      const { data } = await api.get('/inventory/my-store', { params });
      setInventory(data.data.inventory);
      setStats(data.data.stats);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, [filterStatus, filterCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this item from inventory?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Item removed');
      fetchInventory(pagination.page);
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleRestock = async (id) => {
    const qty = prompt('Enter quantity to add:');
    if (!qty || isNaN(qty) || parseInt(qty) < 1) return;
    try {
      await api.patch(`/inventory/${id}/restock`, { additionalQuantity: parseInt(qty) });
      toast.success('Restocked successfully');
      fetchInventory(pagination.page);
    } catch (err) {
      toast.error('Restock failed');
    }
  };

  const getStockStatusConfig = (item) => {
    if (item.status === 'expired') return STOCK_STATUS_CONFIG.expired;
    if (item.stockQuantity === 0) return STOCK_STATUS_CONFIG.outOfStock;
    if (item.stockQuantity <= 5) return STOCK_STATUS_CONFIG.low;
    return STOCK_STATUS_CONFIG.healthy;
  };

  const getExpiryInfo = (item) => {
    const days = daysFromNow(item.expiryDate);
    if (days === null) return { ...EXPIRY_STATUS_CONFIG.safe, days: '?' };
    if (days <= 0) return { ...EXPIRY_STATUS_CONFIG.expired, days };
    if (days <= 7) return { ...EXPIRY_STATUS_CONFIG.critical, days };
    if (days <= 30) return { ...EXPIRY_STATUS_CONFIG.warning, days };
    if (days <= 90) return { ...EXPIRY_STATUS_CONFIG.approaching, days };
    return { ...EXPIRY_STATUS_CONFIG.safe, days };
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="section-title">Inventory Management</h1>
          <p className="text-sm text-surface-500 mt-1">{stats.totalItems || 0} items in your inventory</p>
        </div>
        <Link to="/store/add-medicine" className="btn-primary text-sm">
          <HiOutlinePlusCircle className="w-4 h-4" /> Add Medicine
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.totalItems || 0, cls: 'text-brand-600' },
          { label: 'Low Stock', value: stats.lowStock || 0, cls: 'text-amber-600' },
          { label: 'Out of Stock', value: stats.outOfStock || 0, cls: 'text-red-600' },
          { label: 'Expired', value: stats.expired || 0, cls: 'text-surface-500' },
        ].map((s) => (
          <GlassCard key={s.label} padding="p-3">
            <p className={`text-xl font-display font-extrabold ${s.cls}`}>{s.value}</p>
            <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..." className="input-field pl-11" />
        </form>
        <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary text-sm ${showFilters ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-300' : ''}`}>
          <HiOutlineFilter className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-down">
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm">
              <option value="">All Status</option>
              <option value="inStock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field text-sm">
              <option value="">All Categories</option>
              {MEDICINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-surface-200 dark:bg-surface-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-3 w-32 bg-surface-100 dark:bg-surface-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <GlassCard className="text-center py-16">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-display font-bold text-lg">Inventory is empty</p>
          <p className="text-sm text-surface-500 mt-1 mb-4">Start by adding medicines from the master database.</p>
          <Link to="/store/add-medicine" className="btn-primary text-sm inline-flex">Add Your First Medicine</Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {inventory.map((item) => {
            const stockConfig = getStockStatusConfig(item);
            const expiryInfo = getExpiryInfo(item);
            const med = item.medicine || {};

            return (
              <GlassCard key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-brand-500/20 transition-colors">
                {/* Image */}
                <img
                  src={getMedicineImage(item.imageUrl || med.imageUrl)}
                  alt={med.brandName}
                  className="w-14 h-14 rounded-xl object-cover bg-surface-100 dark:bg-surface-800 flex-shrink-0"
                  onError={(e) => { e.target.src = '/placeholder-medicine.png'; }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-sm">{med.brandName} {med.strength}</h3>
                    <span className={`badge text-[10px] ${stockConfig.bgLight} ${stockConfig.textColor}`}>{stockConfig.label}</span>
                  </div>
                  <p className="text-xs text-surface-500 truncate">{med.genericName} · {med.category} · {med.dosageForm}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-surface-500">
                    <span>Stock: <strong className="text-surface-700 dark:text-surface-300">{item.stockQuantity}</strong></span>
                    <span>Buy: {formatCurrency(item.buyingPrice)}</span>
                    <span>Sell: <strong className="text-brand-600">{formatCurrency(item.sellingPrice)}</strong></span>
                    {item.discountPercentage > 0 && <span className="text-red-500 font-semibold">-{item.discountPercentage}%</span>}
                  </div>
                </div>

                {/* Expiry */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-semibold ${expiryInfo.color}`}>{expiryInfo.label}</p>
                  <p className="text-[10px] text-surface-500">Exp: {formatDate(item.expiryDate)}</p>
                  {expiryInfo.days !== '?' && expiryInfo.days > 0 && (
                    <p className="text-[10px] text-surface-400">{expiryInfo.days} days left</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleRestock(item._id)} title="Restock" className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors">
                    <HiOutlineRefresh className="w-4 h-4" />
                  </button>
                  <button title="Edit" className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-500 transition-colors">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchInventory(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200
                    ${pagination.page === i + 1
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'glass hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600'
                    }`}
                >
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