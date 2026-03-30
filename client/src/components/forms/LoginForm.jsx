import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function LoginForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useAuth();
  const [form, setForm] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone is required';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await dispatch(loginUser(form)).unwrap();
      toast.success('Welcome back!');
      if (onSuccess) onSuccess(result);
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email or Phone"
        icon={HiOutlineMail}
        value={form.emailOrPhone}
        onChange={(e) => set('emailOrPhone', e.target.value)}
        placeholder="you@example.com or 01XXXXXXXXX"
        error={errors.emailOrPhone}
        required
        autoComplete="username"
      />

      <Input
        label="Password"
        type="password"
        icon={HiOutlineLockClosed}
        value={form.password}
        onChange={(e) => set('password', e.target.value)}
        placeholder="Enter your password"
        error={errors.password}
        required
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      >
        Sign In
      </Button>
    </form>
  );
}