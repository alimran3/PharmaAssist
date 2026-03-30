import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerPatient, registerStoreOwner } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import AddressSelector from '../common/AddressSelector';
import { BLOOD_GROUPS } from '../../utils/constants';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function RegisterForm({ role = 'patient', onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useAuth();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    appAddress: { division: '', district: '', upazilla: '', area: '' },
    exactAddress: '',
    pharmacyName: '',
    drugLicenseNumber: '',
    tradeLicenseNumber: '',
    establishmentYear: '',
    operatingHours: {
      openingTime: '08:00',
      closingTime: '23:00',
      weeklyOffDay: 'None',
      is24Hours: false,
    },
  });

  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^01[3-9]\d{8}$/.test(form.phone)) errs.phone = 'Invalid BD phone (01XXXXXXXXX)';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (role === 'storeOwner' && !form.pharmacyName.trim()) {
      errs.pharmacyName = 'Pharmacy name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!form.appAddress.division) errs.division = 'Select division';
    if (!form.appAddress.district) errs.district = 'Select district';
    if (!form.appAddress.upazilla) errs.upazilla = 'Select upazilla';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    try {
      if (role === 'patient') {
        const result = await dispatch(registerPatient({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          bloodGroup: form.bloodGroup || undefined,
          appAddress: form.appAddress,
          exactAddress: form.exactAddress,
        })).unwrap();
        toast.success('Registration successful!');
        if (onSuccess) onSuccess(result);
      } else {
        const result = await dispatch(registerStoreOwner({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          pharmacyName: form.pharmacyName,
          drugLicenseNumber: form.drugLicenseNumber,
          tradeLicenseNumber: form.tradeLicenseNumber,
          establishmentYear: parseInt(form.establishmentYear) || undefined,
          appAddress: form.appAddress,
          exactAddress: form.exactAddress,
          operatingHours: form.operatingHours,
        })).unwrap();
        toast.success('Pharmacy registered successfully!');
        if (onSuccess) onSuccess(result);
      }
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const totalSteps = role === 'storeOwner' ? 3 : 3;

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < step
                ? 'bg-gradient-to-r from-brand-500 to-emerald-500'
                : 'bg-surface-200 dark:bg-surface-700'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="space-y-4">
          <Input label="Full Name" icon={HiOutlineUser} value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} required placeholder="Your full name" />
          <Input label="Email" icon={HiOutlineMail} type="email" value={form.email}
            onChange={(e) => set('email', e.target.value)} error={errors.email} required placeholder="you@example.com" />
          <Input label="Phone" icon={HiOutlinePhone} value={form.phone}
            onChange={(e) => set('phone', e.target.value)} error={errors.phone} required placeholder="01XXXXXXXXX" />
          <Input label="Password" type="password" icon={HiOutlineLockClosed} value={form.password}
            onChange={(e) => set('password', e.target.value)} error={errors.password} required placeholder="Min 8 characters" />
          <Input label="Confirm Password" type="password" value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)} error={errors.confirmPassword} required placeholder="Repeat password" />
        </div>
      )}

      {/* Step 2: Role-specific */}
      {step === 2 && role === 'patient' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold">Personal Details <span className="text-surface-400 font-normal text-sm">(Optional)</span></h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date of Birth" type="date" value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)} />
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Gender</label>
              <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="input-field">
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Blood Group</label>
            <select value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} className="input-field">
              <option value="">Select</option>
              {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
      )}

      {step === 2 && role === 'storeOwner' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold">Pharmacy Information</h3>
          <Input label="Pharmacy Name" value={form.pharmacyName}
            onChange={(e) => set('pharmacyName', e.target.value)} error={errors.pharmacyName} required placeholder="e.g., New Life Pharmacy" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Drug License No." value={form.drugLicenseNumber}
              onChange={(e) => set('drugLicenseNumber', e.target.value)} placeholder="Optional" />
            <Input label="Trade License No." value={form.tradeLicenseNumber}
              onChange={(e) => set('tradeLicenseNumber', e.target.value)} placeholder="Optional" />
          </div>
          <Input label="Establishment Year" type="number" value={form.establishmentYear}
            onChange={(e) => set('establishmentYear', e.target.value)} placeholder="e.g., 2015" />
        </div>
      )}

      {/* Step 3: Address */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-display font-bold">Location</h3>
          <AddressSelector value={form.appAddress} onChange={(v) => set('appAddress', v)} />
          {(errors.division || errors.district || errors.upazilla) && (
            <p className="text-xs text-red-500 font-medium">Please select your location (Division, District, Upazilla).</p>
          )}
          <Input label="Exact Address" type="textarea" value={form.exactAddress}
            onChange={(e) => set('exactAddress', e.target.value)} placeholder="Full physical address..." rows={2} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-surface-200/50 dark:border-surface-700/30">
        {step > 1 ? (
          <Button variant="secondary" size="sm" onClick={handleBack}>← Back</Button>
        ) : (
          <div />
        )}
        {step < totalSteps ? (
          <Button variant="primary" size="sm" onClick={handleNext}>Next →</Button>
        ) : (
          <Button variant="emerald" size="sm" onClick={handleSubmit} loading={loading}>
            Create Account ✓
          </Button>
        )}
      </div>
    </div>
  );
}