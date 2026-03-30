import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import { formatCurrency, getMedicineImage } from '../../utils/helpers';
import { PAYMENT_METHODS } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineTrash, HiOutlinePlus,
  HiOutlineMinus, HiOutlineExclamation, HiOutlineUser,
  HiOutlineReceiptTax, HiOutlineDownload, HiOutlineShieldExclamation,
} from 'react-icons/hi';

export default function BillCreation() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [walkIn, setWalkIn] = useState({ name: '', phone: '' });
  const [useWalkIn, setUseWalkIn] = useState(false);

  const [medSearch, setMedSearch] = useState('');
  const [inventoryResults, setInventoryResults] = useState([]);
  const [billItems, setBillItems] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);

  // Search patient
  useEffect(() => {
    if (patientSearch.length < 3) { setPatientResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/patients/search', { params: { q: patientSearch } });
        setPatientResults(data.data.patients);
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Search own inventory
  useEffect(() => {
    if (medSearch.length < 2) { setInventoryResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/inventory/my-store', { params: { search: medSearch, limit: 10 } });
        setInventoryResults(data.data.inventory.filter((i) => i.status === 'active' && i.stockQuantity > 0));
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(timer);
  }, [medSearch]);

  const selectPatient = (p) => {
    setPatient(p);
    setPatientSearch('');
    setPatientResults([]);
    setUseWalkIn(false);
    toast.success(`Patient linked: ${p.fullName}`);
  };

  const addItem = (invItem) => {
    const exists = billItems.find((b) => b.inventoryItemId === invItem._id);
    if (exists) {
      if (exists.quantity >= invItem.stockQuantity) return toast.error('Max stock reached.');
      setBillItems(billItems.map((b) =>
        b.inventoryItemId === invItem._id ? { ...b, quantity: b.quantity + 1 } : b
      ));
    } else {
      setBillItems([...billItems, {
        inventoryItemId: invItem._id,
        medicine: invItem.medicine,
        medicineName: invItem.medicine?.brandName || '',
        strength: invItem.medicine?.strength || '',
        unitPrice: invItem.sellingPrice,
        discountOverride: invItem.discountPercentage,
        quantity: 1,
        maxStock: invItem.stockQuantity,
        imageUrl: invItem.imageUrl || invItem.medicine?.imageUrl,
      }]);
    }
    setMedSearch('');
    setInventoryResults([]);
  };

  const updateQuantity = (idx, delta) => {
    setBillItems(billItems.map((item, i) => {
      if (i !== idx) return item;
      const newQty = item.quantity + delta;
      if (newQty < 1 || newQty > item.maxStock) return item;
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (idx) => {
    setBillItems(billItems.filter((_, i) => i !== idx));
  };

  const subtotal = billItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalDiscount = billItems.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity * (item.discountOverride / 100));
  }, 0);
  const grandTotal = subtotal - totalDiscount;

  const handleSubmit = async () => {
    if (billItems.length === 0) return toast.error('Add at least one medicine.');

    setLoading(true);
    try {
      const payload = {
        items: billItems.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          discountOverride: item.discountOverride,
        })),
        paymentMethod,
        notes,
      };

      if (patient) {
        payload.patientId = patient._id;
      } else if (useWalkIn && walkIn.name) {
        payload.walkInCustomer = walkIn;
      }

      const { data } = await api.post('/bills', payload);
      setGeneratedBill(data.data.bill);
      toast.success(`Bill ${data.data.bill.billNumber} created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill.');
    } finally {
      setLoading(false);
    }
  };

  // Bill generated — success view
  if (generatedBill) {
    const downloadPDF = async () => {
      try {
        const response = await api.get(`/bills/${generatedBill._id}/pdf`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${generatedBill.billNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('PDF download error:', error);
        alert('Failed to download PDF. Please try again.');
      }
    };

    return (
      <div className="page-container max-w-2xl">
        <GlassCard className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-neon-emerald">
            <HiOutlineReceiptTax className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-surface-900 dark:text-white">Bill Created!</h1>
          <p className="text-surface-500 mt-1">{generatedBill.billNumber}</p>
          <p className="text-3xl font-display font-extrabold gradient-text mt-4">{formatCurrency(generatedBill.grandTotal)}</p>
          <p className="text-sm text-surface-500 mt-1">{generatedBill.items.length} items · {generatedBill.paymentMethod}</p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => navigate('/store')} className="btn-secondary text-sm">← Dashboard</button>
            <button onClick={downloadPDF} className="btn-primary text-sm">
              <HiOutlineDownload className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={() => { setGeneratedBill(null); setBillItems([]); setPatient(null); }} className="btn-emerald text-sm">
              New Bill
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Create New Bill</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient + Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Patient Section */}
          <GlassCard>
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-brand-500" /> Link Patient
              <span className="text-surface-400 font-normal text-sm">(Optional)</span>
            </h2>

            {patient ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
                <div>
                  <p className="font-semibold text-sm">{patient.fullName}</p>
                  <p className="text-xs text-surface-500">{patient.phone} · {patient.bloodGroup || 'N/A'}</p>
                  {patient.allergies?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {patient.allergies.map((a, i) => (
                        <span key={i} className="badge badge-danger text-[10px]">⚠ {a.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setPatient(null)} className="text-xs text-red-500 hover:text-red-600 font-semibold">Remove</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search patient by name or phone..."
                    className="input-field pl-10 text-sm" />
                </div>

                {patientResults.length > 0 && (
                  <div className="glass rounded-xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800">
                    {patientResults.map((p) => (
                      <button key={p._id} onClick={() => selectPatient(p)}
                        className="w-full p-3 text-left hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-sm">
                        <span className="font-semibold">{p.fullName}</span>
                        <span className="text-surface-500 ml-2">{p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useWalkIn} onChange={(e) => setUseWalkIn(e.target.checked)}
                    className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                  <span className="text-xs font-medium text-surface-600">Walk-in customer (optional name/phone)</span>
                </label>

                {useWalkIn && (
                  <div className="grid grid-cols-2 gap-2">
                    <input value={walkIn.name} onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })}
                      placeholder="Customer name" className="input-field text-sm" />
                    <input value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })}
                      placeholder="Phone (optional)" className="input-field text-sm" />
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Add Medicine */}
          <GlassCard>
            <h2 className="font-display font-bold mb-3">Add Medicines</h2>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input value={medSearch} onChange={(e) => setMedSearch(e.target.value)}
                placeholder="Search your inventory..."
                className="input-field pl-10 text-sm" />
            </div>

            {inventoryResults.length > 0 && (
              <div className="mt-2 glass rounded-xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800 max-h-48 overflow-y-auto">
                {inventoryResults.map((inv) => (
                  <button key={inv._id} onClick={() => addItem(inv)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left">
                    <img src={getMedicineImage(inv.imageUrl || inv.medicine?.imageUrl)} alt=""
                      className="w-9 h-9 rounded-lg object-cover bg-surface-100 dark:bg-surface-800" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{inv.medicine?.brandName} {inv.medicine?.strength}</p>
                      <p className="text-[10px] text-surface-500">Stock: {inv.stockQuantity} · {formatCurrency(inv.sellingPrice)}</p>
                    </div>
                    <HiOutlinePlus className="w-4 h-4 text-emerald-500" />
                  </button>
                ))}
              </div>
            )}

            {/* Bill Items */}
            {billItems.length > 0 && (
              <div className="mt-4 space-y-2">
                {billItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/30">
                    <img src={getMedicineImage(item.imageUrl)} alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-surface-100 dark:bg-surface-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.medicineName} {item.strength}</p>
                      <p className="text-xs text-surface-500">{formatCurrency(item.unitPrice)} / unit</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center hover:bg-surface-300 transition-colors">
                        <HiOutlineMinus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center hover:bg-surface-300 transition-colors">
                        <HiOutlinePlus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-sm font-semibold w-20 text-right">
                      {formatCurrency(item.unitPrice * item.quantity * (1 - item.discountOverride / 100))}
                    </p>

                    <button onClick={() => removeItem(idx)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right: Summary */}
        <div className="space-y-5">
          <GlassCard className="sticky top-20">
            <h2 className="font-display font-bold mb-4">Bill Summary</h2>

            {billItems.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">No items added yet</p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {billItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-surface-600 dark:text-surface-400 truncate flex-1">
                        {item.medicineName} × {item.quantity}
                      </span>
                      <span className="font-semibold ml-2">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-surface-200 dark:border-surface-700/50 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Discount</span>
                      <span>-{formatCurrency(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-display font-extrabold pt-2 border-t border-surface-200 dark:border-surface-700/50">
                    <span>Total</span>
                    <span className="gradient-text">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field text-sm">
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>

                {/* Notes */}
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    placeholder="e.g., Take Napa after meals." className="input-field text-sm resize-none" />
                </div>

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading}
                  className="btn-emerald w-full mt-5 py-3 text-base">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <>
                      <HiOutlineReceiptTax className="w-5 h-5" />
                      Generate Bill
                    </>
                  )}
                </button>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}