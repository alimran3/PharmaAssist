import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, error } = useAuth();
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const path = user.role === 'storeOwner' ? '/store' : user.role === 'admin' ? '/admin' : '/patient';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.emailOrPhone || !form.password) return toast.error('Please fill in all fields.');
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-500/[0.08] blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[100px]" />
      </div>

      {/* Left panel - visual */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-neon mb-8">
            <span className="text-white font-display font-extrabold text-3xl">P</span>
          </div>
          <h2 className="text-4xl font-display font-extrabold">
            <span className="gradient-text">pharma</span>
            <span className="text-surface-700 dark:text-surface-300">Assist</span>
          </h2>
          <p className="mt-4 text-surface-500 text-lg">Your Neighborhood Pharmacy, Now Digital</p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {['Smart Search', 'Health Tracking', 'Drug Safety', 'POS System'].map((f, i) => (
              <div key={i} className="glass rounded-xl p-4 text-left">
                <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-neon">
              <span className="text-white font-display font-extrabold text-sm">P</span>
            </div>
            <span className="font-display font-bold text-xl"><span className="gradient-text">pharma</span><span className="text-surface-700 dark:text-surface-300">Assist</span></span>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-surface-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-surface-500">Sign in to continue to your dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Email or Phone</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type="text" value={form.emailOrPhone} onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })} placeholder="you@example.com or 01XXXXXXXXX" className="input-field pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-2xl text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">Create one</Link>
          </p>
          <p className="mt-2 text-center">
            <Link to="/" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}