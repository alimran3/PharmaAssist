import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../store/slices/authSlice';
import GlassCard from '../../components/ui/GlassCard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [changingPw, setChangingPw] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    photoUrl: user?.photoUrl || '',
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile(form)).unwrap();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword.length < 8) return toast.error('Password must be 8+ characters.');
    if (pwForm.newPassword !== pwForm.confirmNew) return toast.error('Passwords do not match.');

    setChangingPw(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="section-title">Admin Settings</h1>
      </div>

      {/* Profile */}
      <GlassCard className="mb-5">
        <h2 className="font-display font-bold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Photo URL</label>
            <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." className="input-field" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Change Password */}
      <GlassCard className="mb-5">
        <h2 className="font-display font-bold mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Current Password</label>
            <input type="password" value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">New Password</label>
            <input type="password" value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input-field" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Confirm New Password</label>
            <input type="password" value={pwForm.confirmNew}
              onChange={(e) => setPwForm({ ...pwForm, confirmNew: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleChangePassword} disabled={changingPw} className="btn-danger text-sm">
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Info */}
      <GlassCard>
        <h2 className="font-display font-bold mb-4">System Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-surface-500">Email</span>
            <span className="font-semibold">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Role</span>
            <span className="badge badge-info text-[10px]">Admin</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Version</span>
            <span className="font-mono text-xs">v1.0.0</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}