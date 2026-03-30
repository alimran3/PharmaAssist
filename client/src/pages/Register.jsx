import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerPatient, registerStoreOwner, clearError } from '../store/slices/authSlice';
import { useAuth } from '../hooks/useAuth';
import AddressSelector from '../components/common/AddressSelector';
import toast from 'react-hot-toast';
import { BLOOD_GROUPS } from '../utils/constants';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, loading, error } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(searchParams.get('role') === 'store' ? 'storeOwner' : 'patient');
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', bloodGroup: '',
    appAddress: { division: '', district: '', upazilla: '', area: '' },
    exactAddress: '',
    // Store fields
    pharmacyName: '', drugLicenseNumber: '', tradeLicenseNumber: '',
    establishmentYear: '', logoUrl: '', coverPhotoUrl: '',
    operatingHours: { openingTime: '08:00', closingTime: '23:00', weeklyOffDay: 'None', is24Hours: false },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const path = user.role === 'storeOwner' ? '/store' : '/patient';
      navigate(path, { replace: true });
      toast.success('Registration successful!');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const validateStep1 = () => {
    if (!form.fullName || !form.email || !form.phone || !form.password) return toast.error('Fill all required fields.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Invalid email.');
    if (!/^01[3-9]\d{8}$/.test(form.phone)) return toast.error('Invalid BD phone number.');
    if (form.password.length < 8) return toast.error('Password must be 8+ characters.');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    return true;
  };

  const handleSubmit = () => {
    console.log('Submitting registration with data:', {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      appAddress: form.appAddress,
    });
    
    if (role === 'patient') {
      dispatch(registerPatient({
        fullName: form.fullName, email: form.email, phone: form.phone, password: form.password,
        dateOfBirth: form.dateOfBirth || undefined, gender: form.gender || undefined, bloodGroup: form.bloodGroup || undefined,
        appAddress: form.appAddress, exactAddress: form.exactAddress,
      })).then((result) => {
        console.log('Registration result:', result);
        if (registerPatient.rejected.match(result)) {
          console.error('Registration error payload:', result.payload);
          console.error('Registration error meta:', result.meta);
        }
      }).catch((err) => {
        console.error('Registration catch error:', err);
      });
    } else {
      dispatch(registerStoreOwner({
        fullName: form.fullName, email: form.email, phone: form.phone, password: form.password,
        pharmacyName: form.pharmacyName, drugLicenseNumber: form.drugLicenseNumber,
        tradeLicenseNumber: form.tradeLicenseNumber, establishmentYear: parseInt(form.establishmentYear) || undefined,
        logoUrl: form.logoUrl, coverPhotoUrl: form.coverPhotoUrl,
        appAddress: form.appAddress, exactAddress: form.exactAddress,
        operatingHours: form.operatingHours,
      })).then((result) => {
        console.log('Registration result:', result);
        if (registerStoreOwner.rejected.match(result)) {
          console.error('Registration error payload:', result.payload);
          console.error('Registration error meta:', result.meta);
        }
      }).catch((err) => {
        console.error('Registration catch error:', err);
      });
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && role === 'storeOwner' && !form.pharmacyName) return toast.error('Pharmacy name is required.');
    if (step === 3 && (!form.appAddress.division || !form.appAddress.district || !form.appAddress.upazilla)) return toast.error('Select your location.');
    setStep(step + 1);
  };

  const totalSteps = role === 'storeOwner' ? 4 : 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-500/[0.08] blur-[100px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-neon">
              <span className="text-white font-display font-extrabold text-sm">P</span>
            </div>
            <span className="font-display font-bold text-xl"><span className="gradient-text">pharma</span><span className="text-surface-700 dark:text-surface-300">Assist</span></span>
          </Link>
          <h1 className="text-3xl font-display font-extrabold text-surface-900 dark:text-white">Create Account</h1>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 p-1 rounded-2xl bg-surface-100 dark:bg-surface-800 mb-6">
          {[{ key: 'patient', label: '🙋 Patient' }, { key: 'storeOwner', label: '🏪 Store Owner' }].map((r) => (
            <button key={r.key} onClick={() => { setRole(r.key); setStep(1); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${role === r.key ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700'}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? 'bg-gradient-to-r from-brand-500 to-emerald-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
          ))}
        </div>

        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-glass-lg animate-fade-in">
          {/* Step 1 — Basic */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg mb-4">Basic Information</h2>
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Full Name *</label>
                <div className="relative"><HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Enter your full name" className="input-field pl-11" /></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Email *</label>
                <div className="relative"><HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className="input-field pl-11" /></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Phone *</label>
                <div className="relative"><HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01XXXXXXXXX" className="input-field pl-11" /></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Password *</label>
                <div className="relative"><HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min 8 characters" className="input-field pl-11 pr-11" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400">{showPw ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}</button></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Repeat your password" className="input-field" />
              </div>
            </div>
          )}

          {/* Step 2 — Role-specific */}
          {step === 2 && role === 'patient' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg mb-4">Personal Details <span className="text-surface-400 font-normal text-sm">(Optional)</span></h2>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} className="input-field" /></div>
                <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Gender</label>
                  <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="input-field">
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
              </div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Blood Group</label>
                <select value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} className="input-field">
                  <option value="">Select</option>{BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}</select></div>
            </div>
          )}

          {step === 2 && role === 'storeOwner' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg mb-4">Pharmacy Information</h2>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Pharmacy Name *</label>
                <input value={form.pharmacyName} onChange={(e) => set('pharmacyName', e.target.value)} placeholder="e.g., New Life Pharmacy" className="input-field" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Drug License No.</label>
                  <input value={form.drugLicenseNumber} onChange={(e) => set('drugLicenseNumber', e.target.value)} className="input-field" /></div>
                <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Trade License No.</label>
                  <input value={form.tradeLicenseNumber} onChange={(e) => set('tradeLicenseNumber', e.target.value)} className="input-field" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Establishment Year</label>
                <input type="number" value={form.establishmentYear} onChange={(e) => set('establishmentYear', e.target.value)} placeholder="e.g., 2015" className="input-field" /></div>
            </div>
          )}

          {/* Step 3 — Address (shared) */}
          {((step === 3 && role === 'storeOwner') || (step === 2 + 1 && role === 'patient')) && step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg mb-4">Location</h2>
              <AddressSelector value={form.appAddress} onChange={(v) => set('appAddress', v)} />
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Exact Address</label>
                <textarea value={form.exactAddress} onChange={(e) => set('exactAddress', e.target.value)} placeholder="Full physical address..." rows={2} className="input-field resize-none" /></div>
            </div>
          )}

          {/* Step 4 — Operating hours (store only) */}
          {step === 4 && role === 'storeOwner' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg mb-4">Operating Hours</h2>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Opening</label>
                  <input type="time" value={form.operatingHours.openingTime} onChange={(e) => set('operatingHours', { ...form.operatingHours, openingTime: e.target.value })} className="input-field" /></div>
                <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Closing</label>
                  <input type="time" value={form.operatingHours.closingTime} onChange={(e) => set('operatingHours', { ...form.operatingHours, closingTime: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Weekly Off Day</label>
                <select value={form.operatingHours.weeklyOffDay} onChange={(e) => set('operatingHours', { ...form.operatingHours, weeklyOffDay: e.target.value })} className="input-field">
                  {['None', 'Friday', 'Saturday', 'Sunday'].map((d) => <option key={d}>{d}</option>)}</select></div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.operatingHours.is24Hours} onChange={(e) => set('operatingHours', { ...form.operatingHours, is24Hours: e.target.checked })}
                  className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                <span className="text-sm font-medium">Open 24/7</span></label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-surface-200/50 dark:border-surface-700/30">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary text-sm">← Back</button>
            ) : (
              <Link to="/login" className="text-sm text-surface-500 hover:text-surface-700 transition-colors">Already have an account?</Link>
            )}
            {step < totalSteps ? (
              <button onClick={nextStep} className="btn-primary text-sm">Next →</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-emerald text-sm">
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span> : 'Create Account ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}