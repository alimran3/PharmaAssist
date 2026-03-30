import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import GlassCard from '../../components/ui/GlassCard';
import AddressSelector from '../../components/common/AddressSelector';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StoreSettings() {
  const { store } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    pharmacyName: store?.pharmacyName || '',
    drugLicenseNumber: store?.drugLicenseNumber || '',
    tradeLicenseNumber: store?.tradeLicenseNumber || '',
    establishmentYear: store?.establishmentYear || '',
    logoUrl: store?.logoUrl || '',
    coverPhotoUrl: store?.coverPhotoUrl || '',
    phone: store?.phone || '',
    appAddress: store?.appAddress || { division: '', district: '', upazilla: '', area: '' },
    exactAddress: store?.exactAddress || '',
    lowStockThreshold: store?.lowStockThreshold || 5,
    operatingHours: store?.operatingHours || { openingTime: '08:00', closingTime: '23:00', weeklyOffDay: 'None', is24Hours: false },
    billSettings: store?.billSettings || { showLogo: true, footerMessage: 'Thank you!', defaultPaymentMethod: 'Cash' },
  });

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/stores/my-store', form);
      toast.success('Store settings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-6">Store Settings</h1>

      <div className="space-y-5">
        <GlassCard>
          <h2 className="font-display font-bold mb-4">Pharmacy Info</h2>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Pharmacy Name</label>
              <input value={form.pharmacyName} onChange={(e) => set('pharmacyName', e.target.value)} className="input-field" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Drug License</label>
                <input value={form.drugLicenseNumber} onChange={(e) => set('drugLicenseNumber', e.target.value)} className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Trade License</label>
                <input value={form.tradeLicenseNumber} onChange={(e) => set('tradeLicenseNumber', e.target.value)} className="input-field" /></div>
            </div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" /></div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Low Stock Threshold</label>
              <input type="number" min="1" value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', parseInt(e.target.value))} className="input-field" /></div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display font-bold mb-4">Location</h2>
          <AddressSelector value={form.appAddress} onChange={(v) => set('appAddress', v)} className="mb-4" />
          <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Exact Address</label>
            <textarea value={form.exactAddress} onChange={(e) => set('exactAddress', e.target.value)} rows={2} className="input-field resize-none" /></div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display font-bold mb-4">Operating Hours</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Opening</label>
              <input type="time" value={form.operatingHours.openingTime} onChange={(e) => set('operatingHours', { ...form.operatingHours, openingTime: e.target.value })} className="input-field" /></div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Closing</label>
              <input type="time" value={form.operatingHours.closingTime} onChange={(e) => set('operatingHours', { ...form.operatingHours, closingTime: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Weekly Off Day</label>
            <select value={form.operatingHours.weeklyOffDay} onChange={(e) => set('operatingHours', { ...form.operatingHours, weeklyOffDay: e.target.value })} className="input-field">
              {['None', 'Friday', 'Saturday', 'Sunday'].map((d) => <option key={d}>{d}</option>)}</select></div>
          <label className="flex items-center gap-2 cursor-pointer mt-3">
            <input type="checkbox" checked={form.operatingHours.is24Hours} onChange={(e) => set('operatingHours', { ...form.operatingHours, is24Hours: e.target.checked })}
              className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
            <span className="text-sm font-medium">Open 24/7</span></label>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display font-bold mb-4">Bill Settings</h2>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Footer Message</label>
              <input value={form.billSettings.footerMessage} onChange={(e) => set('billSettings', { ...form.billSettings, footerMessage: e.target.value })} className="input-field" /></div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Default Payment</label>
              <select value={form.billSettings.defaultPaymentMethod} onChange={(e) => set('billSettings', { ...form.billSettings, defaultPaymentMethod: e.target.value })} className="input-field">
                {['Cash', 'bKash', 'Nagad', 'Card'].map((m) => <option key={m}>{m}</option>)}</select></div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}