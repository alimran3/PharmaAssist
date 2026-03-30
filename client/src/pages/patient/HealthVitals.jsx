import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../hooks/useAuth';
import { getBMICategory } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiOutlineHeart, HiOutlinePlusCircle, HiOutlineX,
  HiOutlineTrendingUp, HiOutlineBeaker,
} from 'react-icons/hi';

const VITAL_TYPES = [
  { key: 'bloodPressure', label: 'Blood Pressure', icon: '🩸', color: 'from-red-500 to-pink-500' },
  { key: 'heartRate', label: 'Heart Rate', icon: '❤️', color: 'from-rose-500 to-red-500' },
  { key: 'bloodSugar', label: 'Blood Sugar', icon: '🧪', color: 'from-amber-500 to-orange-500' },
  { key: 'bloodOxygen', label: 'SpO2', icon: '🫁', color: 'from-blue-500 to-cyan-500' },
  { key: 'temperature', label: 'Temperature', icon: '🌡️', color: 'from-purple-500 to-violet-500' },
];

export default function HealthVitals() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [vitals, setVitals] = useState([]);
  const [activeType, setActiveType] = useState('bloodPressure');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    systolic: '', diastolic: '', bpm: '', context: 'Resting',
    sugarType: 'Fasting', sugarValue: '', spo2: '',
    temperatureValue: '', temperatureUnit: 'F', notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, vitalsRes] = await Promise.all([
        api.get('/health/summary'),
        api.get('/health/vitals', { params: { type: activeType, limit: 20 } }),
      ]);
      setSummary(summaryRes.data.data.summary);
      setVitals(vitalsRes.data.data.vitals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeType]);

  const handleSubmit = async () => {
    const payload = { type: activeType, notes: form.notes };

    if (activeType === 'bloodPressure') {
      if (!form.systolic || !form.diastolic) return toast.error('Enter systolic and diastolic values.');
      payload.systolic = parseInt(form.systolic);
      payload.diastolic = parseInt(form.diastolic);
    } else if (activeType === 'heartRate') {
      if (!form.bpm) return toast.error('Enter BPM value.');
      payload.bpm = parseInt(form.bpm);
      payload.context = form.context;
    } else if (activeType === 'bloodSugar') {
      if (!form.sugarValue) return toast.error('Enter sugar value.');
      payload.sugarType = form.sugarType;
      payload.sugarValue = parseFloat(form.sugarValue);
    } else if (activeType === 'bloodOxygen') {
      if (!form.spo2) return toast.error('Enter SpO2 value.');
      payload.spo2 = parseInt(form.spo2);
    } else if (activeType === 'temperature') {
      if (!form.temperatureValue) return toast.error('Enter temperature.');
      payload.temperatureValue = parseFloat(form.temperatureValue);
      payload.temperatureUnit = form.temperatureUnit;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/health/vitals', payload);
      toast.success('Vital recorded!');
      if (data.data.alerts?.length) {
        data.data.alerts.forEach((a) => toast(a, { icon: '⚠️', duration: 6000 }));
      }
      setShowAddModal(false);
      setForm({ systolic: '', diastolic: '', bpm: '', context: 'Resting', sugarType: 'Fasting', sugarValue: '', spo2: '', temperatureValue: '', temperatureUnit: 'F', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log vital.');
    } finally {
      setSubmitting(false);
    }
  };

  const bmiCategory = getBMICategory(user?.bmi);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Health Vitals</h1>
          <p className="text-sm text-surface-500 mt-0.5">Track and monitor your health readings.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
          <HiOutlinePlusCircle className="w-4 h-4" /> Log Reading
        </button>
      </div>

      {/* BMI Card */}
      <GlassCard className="mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Body Mass Index</p>
            <p className="text-3xl font-display font-extrabold mt-1">{user?.bmi || '—'}</p>
            <p className={`text-sm font-semibold mt-0.5 ${bmiCategory.color}`}>{bmiCategory.label}</p>
          </div>
          <div className="text-right text-sm text-surface-500">
            <p>Height: {user?.height || '—'} cm</p>
            <p>Weight: {user?.weight || '—'} kg</p>
            <p>Blood: <span className="font-semibold text-red-500">{user?.bloodGroup || '—'}</span></p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 opacity-[0.04]" />
      </GlassCard>

      {/* Vital Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {VITAL_TYPES.map((vt) => (
          <button key={vt.key} onClick={() => setActiveType(vt.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeType === vt.key
                ? `bg-gradient-to-r ${vt.color} text-white shadow-lg`
                : 'glass text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}>
            <span>{vt.icon}</span> {vt.label}
          </button>
        ))}
      </div>

      {/* Latest reading */}
      {summary[activeType] && (
        <GlassCard className="mb-4 border-l-4 border-brand-500">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Latest Reading</p>
          <div className="text-2xl font-display font-extrabold">
            {activeType === 'bloodPressure' && `${summary[activeType].systolic}/${summary[activeType].diastolic} mmHg`}
            {activeType === 'heartRate' && `${summary[activeType].bpm} BPM`}
            {activeType === 'bloodSugar' && `${summary[activeType].sugarValue} mg/dL (${summary[activeType].sugarType})`}
            {activeType === 'bloodOxygen' && `${summary[activeType].spo2}%`}
            {activeType === 'temperature' && `${summary[activeType].temperatureValue}°${summary[activeType].temperatureUnit}`}
          </div>
          <p className="text-xs text-surface-500 mt-1">{new Date(summary[activeType].recordedAt).toLocaleString()}</p>
        </GlassCard>
      )}

      {/* History */}
      <GlassCard>
        <h2 className="font-display font-bold text-lg mb-4">History</h2>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />)}</div>
        ) : vitals.length === 0 ? (
          <p className="text-center py-8 text-surface-400 text-sm">No readings recorded for this type yet.</p>
        ) : (
          <div className="space-y-2">
            {vitals.map((v) => (
              <div key={v._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div>
                  <p className="font-semibold text-sm">
                    {v.type === 'bloodPressure' && `${v.systolic}/${v.diastolic} mmHg`}
                    {v.type === 'heartRate' && `${v.bpm} BPM ${v.context ? `(${v.context})` : ''}`}
                    {v.type === 'bloodSugar' && `${v.sugarValue} mg/dL (${v.sugarType})`}
                    {v.type === 'bloodOxygen' && `${v.spo2}%`}
                    {v.type === 'temperature' && `${v.temperatureValue}°${v.temperatureUnit}`}
                  </p>
                  {v.notes && <p className="text-xs text-surface-500 mt-0.5">{v.notes}</p>}
                </div>
                <span className="text-xs text-surface-400">{new Date(v.recordedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-strong rounded-3xl p-6 w-full max-w-md shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Log {VITAL_TYPES.find((v) => v.key === activeType)?.label}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"><HiOutlineX className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {activeType === 'bloodPressure' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Systolic *</label>
                    <input type="number" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: e.target.value })} placeholder="120" className="input-field" /></div>
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Diastolic *</label>
                    <input type="number" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: e.target.value })} placeholder="80" className="input-field" /></div>
                </div>
              )}
              {activeType === 'heartRate' && (
                <>
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">BPM *</label>
                    <input type="number" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} placeholder="72" className="input-field" /></div>
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Context</label>
                    <select value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} className="input-field">
                      <option>Resting</option><option>Active</option><option>Post-Exercise</option></select></div>
                </>
              )}
              {activeType === 'bloodSugar' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Type</label>
                    <select value={form.sugarType} onChange={(e) => setForm({ ...form, sugarType: e.target.value })} className="input-field">
                      <option>Fasting</option><option>After Meal</option><option>Random</option><option>HbA1c</option></select></div>
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Value (mg/dL) *</label>
                    <input type="number" value={form.sugarValue} onChange={(e) => setForm({ ...form, sugarValue: e.target.value })} placeholder="100" className="input-field" /></div>
                </div>
              )}
              {activeType === 'bloodOxygen' && (
                <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">SpO2 % *</label>
                  <input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} placeholder="98" className="input-field" /></div>
              )}
              {activeType === 'temperature' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Temperature *</label>
                    <input type="number" step="0.1" value={form.temperatureValue} onChange={(e) => setForm({ ...form, temperatureValue: e.target.value })} placeholder="98.6" className="input-field" /></div>
                  <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Unit</label>
                    <select value={form.temperatureUnit} onChange={(e) => setForm({ ...form, temperatureUnit: e.target.value })} className="input-field">
                      <option value="F">°F</option><option value="C">°C</option></select></div>
                </div>
              )}
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Notes</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." className="input-field" /></div>

              <button onClick={handleSubmit} disabled={submitting} className="btn-emerald w-full mt-2">
                {submitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Save Reading'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}