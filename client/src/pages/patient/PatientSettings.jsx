import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import GlassCard from '../../components/ui/GlassCard';
import AddressSelector from '../../components/common/AddressSelector';
import { BLOOD_GROUPS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function PatientSettings() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    photoUrl: user?.photoUrl || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    height: user?.height || '',
    weight: user?.weight || '',
    appAddress: user?.appAddress || { division: '', district: '', upazilla: '', area: '' },
    exactAddress: user?.exactAddress || '',
    smokingStatus: user?.smokingStatus || 'Never',
    pregnancyStatus: user?.pregnancyStatus || 'Not Applicable',
  });

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile({
        ...form,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      })).unwrap();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'health', label: 'Health Info' },
    { key: 'address', label: 'Location' },
  ];

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-6">Settings</h1>

      <div className="flex gap-1 p-1 rounded-2xl bg-surface-100 dark:bg-surface-800 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === t.key ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <GlassCard>
        {tab === 'profile' && (
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Full Name</label>
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="input-field" /></div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" /></div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Photo URL</label>
              <input value={form.photoUrl} onChange={(e) => set('photoUrl', e.target.value)} placeholder="https://..." className="input-field" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Gender</label>
                <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="input-field">
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
            </div>
          </div>
        )}

        {tab === 'health' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Blood Group</label>
                <select value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} className="input-field">
                  <option value="">Select</option>{BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Smoking Status</label>
                <select value={form.smokingStatus} onChange={(e) => set('smokingStatus', e.target.value)} className="input-field">
                  <option>Never</option><option>Former</option><option>Current</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Height (cm)</label>
                <input type="number" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="170" className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="70" className="input-field" /></div>
            </div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Pregnancy Status</label>
              <select value={form.pregnancyStatus} onChange={(e) => set('pregnancyStatus', e.target.value)} className="input-field">
                <option>Not Applicable</option><option>Pregnant</option><option>Not Pregnant</option><option>Breastfeeding</option></select></div>
          </div>
        )}

        {tab === 'address' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-2">App Location (for pharmacy discovery)</label>
              <AddressSelector value={form.appAddress} onChange={(v) => set('appAddress', v)} />
            </div>
            <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Exact Address</label>
              <textarea value={form.exactAddress} onChange={(e) => set('exactAddress', e.target.value)} rows={2} placeholder="Full home address..." className="input-field resize-none" /></div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-surface-200/50 dark:border-surface-700/30 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}