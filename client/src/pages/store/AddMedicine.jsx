import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { getMedicineImage, formatCurrency } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineCheck, HiOutlineExclamation,
  HiOutlinePhotograph, HiOutlineCalendar, HiOutlineSearch, HiOutlineX,
} from 'react-icons/hi';

export default function AddMedicine() {
  const navigate = useNavigate();
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);

  const [form, setForm] = useState({
    batchNumber: '',
    buyingDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    buyingPrice: '',
    sellingPrice: '',
    discountPercentage: 0,
    stockQuantity: '',
    imageUrl: '',
    notes: '',
  });

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  // Fetch suggested medicines on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        // Simply fetch all medicines - don't filter by inventory
        const { data } = await api.get('/medicines/search', {
          params: { page: 1, limit: 30 },
        });
        console.log('Fetched medicines:', data);
        setSuggestedMedicines(data.data.medicines || []);
        if (!data.data.medicines || data.data.medicines.length === 0) {
          toast.error('No medicines found in database. Please add medicines from admin panel first.');
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        toast.error('Failed to load medicines. Please check if the server is running.');
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, []);

  // Search medicines as user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const { data } = await api.get('/medicines/search', {
            params: { q: searchQuery, limit: 10 },
          });
          console.log('Search results:', data);
          setSearchResults(data.data.medicines || []);
          setShowDropdown(true);
        } catch (err) {
          console.error('Search failed:', err);
          setSearchResults([]);
          toast.error('Search failed. Please try again.');
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setWarnings([]);
    setForm({
      batchNumber: '',
      buyingDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      buyingPrice: '',
      sellingPrice: medicine.standardMrp || '',
      discountPercentage: 0,
      stockQuantity: '',
      imageUrl: '',
      notes: '',
    });
  };

  const handleReset = () => {
    setSelectedMedicine(null);
    setSearchQuery('');
    setSearchResults([]);
    setWarnings([]);
  };

  const calculateFinalPrice = () => {
    const sp = parseFloat(form.sellingPrice) || 0;
    const dp = parseFloat(form.discountPercentage) || 0;
    return (sp - (sp * dp / 100)).toFixed(2);
  };

  const calculateProfitMargin = () => {
    const bp = parseFloat(form.buyingPrice) || 0;
    const sp = parseFloat(form.sellingPrice) || 0;
    if (bp === 0) return 0;
    return (((sp - bp) / bp) * 100).toFixed(1);
  };

  const validate = () => {
    if (!form.expiryDate) { toast.error('Expiry date is required.'); return false; }
    if (new Date(form.expiryDate) <= new Date()) { toast.error('Expiry date must be in the future.'); return false; }
    if (!form.buyingPrice || parseFloat(form.buyingPrice) < 0) { toast.error('Valid buying price required.'); return false; }
    if (!form.sellingPrice || parseFloat(form.sellingPrice) < 0) { toast.error('Valid selling price required.'); return false; }
    if (!form.stockQuantity || parseInt(form.stockQuantity) < 1) { toast.error('Stock quantity must be at least 1.'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/inventory', {
        medicineId: selectedMedicine._id,
        batchNumber: form.batchNumber,
        buyingDate: form.buyingDate,
        expiryDate: form.expiryDate,
        buyingPrice: parseFloat(form.buyingPrice),
        sellingPrice: parseFloat(form.sellingPrice),
        discountPercentage: parseFloat(form.discountPercentage) || 0,
        stockQuantity: parseInt(form.stockQuantity),
        imageUrl: form.imageUrl,
        notes: form.notes,
      });

      if (data.data.warnings?.length) {
        setWarnings(data.data.warnings);
      }

      toast.success('Medicine added to inventory!');
      navigate('/store/inventory');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="section-title">Add Medicine to Inventory</h1>
          <p className="text-sm text-surface-500 mt-0.5">Search from master database, then set your stock details.</p>
        </div>
      </div>

      {/* Step 1: Search & Select */}
      {!selectedMedicine && (
        <div className="space-y-5">
          <GlassCard>
            <h2 className="font-display font-bold text-lg mb-4">Step 1: Search Medicine</h2>
            <p className="text-sm text-surface-500 mb-4">
              Type the medicine name below. The system will suggest matches from our database.
            </p>
            
            {/* Search Input */}
            <div ref={searchWrapperRef} className="relative">
              <div className="relative group">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  placeholder="Search medicine by name (e.g., Napa, Seclo, Sergel)..."
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-surface-800/90
                             border border-surface-200 dark:border-surface-700
                             text-surface-800 dark:text-surface-100
                             placeholder:text-surface-400 dark:placeholder:text-surface-500
                             focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
                             shadow-sm hover:shadow-md focus:shadow-lg
                             transition-all duration-300 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  >
                    <HiOutlineX className="w-4 h-4 text-surface-400" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && (searchResults.length > 0 || searchLoading) && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl shadow-glass-lg overflow-hidden z-50 animate-slide-down max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-surface-500">
                      <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm">Searching...</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-100 dark:divide-surface-800/50">
                      {searchResults.map((med) => (
                        <button
                          key={med._id}
                          onClick={() => handleSelect(med)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left group"
                        >
                          <img
                            src={getMedicineImage(med.imageUrl)}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-surface-100 dark:bg-surface-700 flex-shrink-0"
                            onError={(e) => { e.target.src = '/placeholder-medicine.png'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-brand-500 transition-colors">
                              {med.brandName} <span className="text-surface-400 font-normal">{med.strength}</span>
                            </p>
                            <p className="text-xs text-surface-500 truncate">{med.genericName} · {med.manufacturer}</p>
                          </div>
                          <span className="flex-shrink-0 badge badge-info text-[10px]">{med.dosageForm}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Helpful note */}
            <div className="mt-6 p-4 rounded-xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-200/50 dark:border-brand-800/30">
              <p className="text-xs text-brand-700 dark:text-brand-400">
                <strong>Tip:</strong> Even partial names or typos will find results. Try "npa" for Napa or "sec" for Seclo.
              </p>
            </div>
          </GlassCard>

          {/* Suggested Medicines */}
          <GlassCard>
            <h2 className="font-display font-bold text-lg mb-4">Browse All Medicines</h2>
            <p className="text-sm text-surface-500 mb-4">
              Select from our database of medicines.
            </p>
            
            {loadingSuggestions ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : suggestedMedicines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {suggestedMedicines.map((med) => (
                  <button
                    key={med._id}
                    onClick={() => handleSelect(med)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-surface-800/50
                               border border-surface-200/50 dark:border-surface-700/50
                               hover:border-brand-300 dark:hover:border-brand-600
                               hover:shadow-md hover:bg-brand-50/30 dark:hover:bg-brand-900/10
                               transition-all duration-200 text-left group"
                  >
                    <img
                      src={getMedicineImage(med.imageUrl)}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-surface-100 dark:bg-surface-700 flex-shrink-0"
                      onError={(e) => { e.target.src = '/placeholder-medicine.png'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-brand-500 transition-colors">
                        {med.brandName}
                      </p>
                      <p className="text-xs text-surface-500 truncate">
                        {med.genericName} · {med.strength}
                      </p>
                    </div>
                    <span className="flex-shrink-0 badge badge-info text-[10px]">{med.dosageForm}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-surface-500">
                <p>No medicines available in database.</p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Step 2: Medicine selected, show detail form */}
      {selectedMedicine && (
        <div className="space-y-5 animate-slide-up">
          {/* Selected Medicine Preview */}
          <GlassCard className="relative overflow-hidden">
            <button onClick={handleReset} className="absolute top-4 right-4 btn-secondary text-xs py-1.5 px-3">
              Change Medicine
            </button>

            <h2 className="font-display font-bold text-lg mb-4">Selected Medicine</h2>

            <div className="flex items-start gap-4">
              <img
                src={getMedicineImage(selectedMedicine.imageUrl)}
                alt={selectedMedicine.brandName}
                className="w-20 h-20 rounded-xl object-cover bg-surface-100 dark:bg-surface-800 flex-shrink-0"
                onError={(e) => { e.target.src = '/placeholder-medicine.png'; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-xl text-surface-900 dark:text-white">
                  {selectedMedicine.brandName} <span className="text-surface-400 font-normal text-sm">{selectedMedicine.strength}</span>
                </h3>
                <p className="text-sm text-surface-500 mt-0.5">{selectedMedicine.genericName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-info text-[10px]">{selectedMedicine.dosageForm}</span>
                  <span className="badge badge-info text-[10px]">{selectedMedicine.category}</span>
                  <span className="badge text-[10px] bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                    {selectedMedicine.manufacturer}
                  </span>
                  {selectedMedicine.prescriptionRequired && (
                    <span className="badge badge-warning text-[10px]">Rx Required</span>
                  )}
                </div>
                {selectedMedicine.standardMrp > 0 && (
                  <p className="text-xs text-surface-500 mt-2">Standard MRP: {formatCurrency(selectedMedicine.standardMrp)}</p>
                )}
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 opacity-[0.03]" />
          </GlassCard>

          {/* Stock Details Form */}
          <GlassCard>
            <h2 className="font-display font-bold text-lg mb-5">Step 2: Stock Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batch */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Batch Number <span className="text-surface-400 font-normal">(optional)</span>
                </label>
                <input value={form.batchNumber} onChange={(e) => set('batchNumber', e.target.value)}
                  placeholder="e.g., B-2025-001" className="input-field" />
              </div>

              {/* Buying Date */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Buying Date
                </label>
                <div className="relative">
                  <HiOutlineCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input type="date" value={form.buyingDate} onChange={(e) => set('buyingDate', e.target.value)}
                    className="input-field pl-10" />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Expiry Date *
                </label>
                <div className="relative">
                  <HiOutlineCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)}
                    className="input-field pl-10" />
                </div>
              </div>

              {/* Stock Qty */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Stock Quantity *
                </label>
                <input type="number" min="1" value={form.stockQuantity} onChange={(e) => set('stockQuantity', e.target.value)}
                  placeholder="e.g., 200" className="input-field" />
              </div>

              {/* Buying Price */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Buying Price (per unit) *
                </label>
                <input type="number" min="0" step="0.01" value={form.buyingPrice} onChange={(e) => set('buyingPrice', e.target.value)}
                  placeholder="e.g., 4.50" className="input-field" />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Selling Price (per unit) *
                </label>
                <input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)}
                  placeholder="e.g., 6.00" className="input-field" />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Discount %
                </label>
                <input type="number" min="0" max="100" value={form.discountPercentage} onChange={(e) => set('discountPercentage', e.target.value)}
                  placeholder="0" className="input-field" />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                  Image URL <span className="text-surface-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <HiOutlinePhotograph className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)}
                    placeholder="https://..." className="input-field pl-10" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Notes <span className="text-surface-400 font-normal">(optional)</span>
              </label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                placeholder="Any additional notes about this batch..."
                rows={2} className="input-field resize-none" />
            </div>

            {/* Price Summary */}
            {(form.sellingPrice || form.buyingPrice) && (
              <div className="mt-5 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/30">
                <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Price Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-surface-500">Final Price</p>
                    <p className="text-lg font-display font-extrabold text-emerald-600">{formatCurrency(calculateFinalPrice())}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Profit Margin</p>
                    <p className={`text-lg font-display font-extrabold ${parseFloat(calculateProfitMargin()) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {calculateProfitMargin()}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Total Value</p>
                    <p className="text-lg font-display font-extrabold text-brand-600">
                      {formatCurrency((parseFloat(form.sellingPrice) || 0) * (parseInt(form.stockQuantity) || 0))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                    <HiOutlineExclamation className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">{w}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={handleReset} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-emerald text-sm px-6">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <><HiOutlineCheck className="w-4 h-4" /> Add to Inventory</>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
