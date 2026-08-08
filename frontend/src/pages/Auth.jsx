import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen bg-slate-50">
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-12 text-white lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <GraduationCap className="h-6 w-6" />
        </div>
        <span className="text-lg font-bold">SyllabusTracker</span>
      </div>
      <div>
        <h1 className="max-w-md text-4xl font-extrabold leading-tight">
          Track your journey through the MERN stack curriculum.
        </h1>
        <p className="mt-4 max-w-sm text-brand-100">
          Modules, topics and subtopics — mark your progress, add custom topics, keep notes and build a
          learning streak that sticks.
        </p>
        <div className="mt-10 grid max-w-sm grid-cols-3 gap-4">
          {[
            { value: '10+', label: 'Modules' },
            { value: '30+', label: 'Topics' },
            { value: '150+', label: 'Subtopics' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-brand-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-brand-200">© {new Date().getFullYear()} SyllabusTracker</p>
    </div>

    <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-lg font-bold text-slate-800">SyllabusTracker</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
      </motion.div>
    </div>
  </div>
);

export const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Email is required';
    if (!password) nextErrors.password = 'Password is required';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setErrors({});

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your learning journey."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          error={errors.password}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setErrors({});

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created — welcome aboard!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your MERN progress in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Name" value={form.name} onChange={set('name')} placeholder="Ankit Sharma" error={errors.name} autoComplete="name" />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} autoComplete="email" />
        <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" error={errors.password} autoComplete="new-password" />
        <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" error={errors.confirmPassword} autoComplete="new-password" />
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
};

const Field = ({ label, type = 'text', value, onChange, placeholder, error, autoComplete }) => (
  <div>
    <label htmlFor={`field-${label}`} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      id={`field-${label}`}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        error
          ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
          : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
      }`}
    />
    {error ? <p className="mt-1.5 text-xs text-rose-500">{error}</p> : null}
  </div>
);