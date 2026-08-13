import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  GraduationCap,
  NotebookPen,
  Target,
  ArrowUpRight,
  BarChart3,
  Code,
  Network,
  Atom,
  Github,
  Apple,
  User,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';

// Map backend responses to clean, user-facing copy.
const MESSAGES = {
  'An account with this email already exists': 'Email is already registered.',
  'Invalid email or password': 'Invalid email or password.',
};

const authMessage = (err) => {
  const raw = getErrorMessage(err);
  return MESSAGES[raw] || raw;
};

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#16834A] bg-emerald-50/60 text-[#16834A]">
      <Check className="h-5 w-5" strokeWidth={2.5} />
    </span>
    <span className="text-lg font-bold tracking-tight text-gray-900">Progress Tracker</span>
  </div>
);

const AuthShell = ({ mode, heading, subtitle, footer, children }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] px-4 py-4 sm:px-8">
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex w-full max-w-[1180px] overflow-hidden rounded-[2.5rem] border border-[#E6EFE9] bg-white shadow-[0_24px_80px_rgba(20,107,58,0.08)] lg:min-h-[min(700px,calc(100vh-2rem))]"
    >
      {/* LEFT — authentication form */}
      <div className="flex w-full flex-col lg:w-[40%]">
        <div className="mx-auto w-full max-w-[510px] px-7 sm:px-10 lg:px-4">
          <div className="pt-6">
            <Logo />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[510px] flex-1 flex-col justify-center px-7 py-2 sm:px-10 lg:px-4">
          <h2 className="text-3xl font-bold leading-tight text-gray-900 lg:text-[36px]">{heading}</h2>
          <p className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-gray-500">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>

        {footer ? <div className="mx-auto w-full max-w-[510px] px-7 pb-5 pt-3 sm:px-10 lg:px-4">{footer}</div> : null}
      </div>

      {/* RIGHT — learning visual panel */}
      <VisualPanel />
    </motion.div>
  </div>
);

const inputClass = (error) =>
  `h-[52px] w-full rounded-2xl border bg-white text-base text-gray-900 transition placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
    error
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
      : 'border-[#D9E1DC] focus:border-[#16834A] focus:ring-emerald-100'
  }`;

const TextField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, error, autoComplete, right }) => {
  let pad = 'px-4';
  if (Icon && right) pad = 'pl-12 pr-12';
  else if (Icon) pad = 'pl-12 pr-4';
  else if (right) pad = 'pl-4 pr-12';
  return (
    <div>
      {label ? <label className="mb-1.5 block text-[13px] font-medium text-gray-700">{label}</label> : null}
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /> : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${inputClass(error)} ${pad}`}
        />
        {right ? <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div> : null}
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-500">{error}</p> : null}
    </div>
  );
};

const PasswordInput = ({ value, onChange, placeholder, error, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <TextField
      label="Password"
      icon={Lock}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      autoComplete={autoComplete}
      right={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="rounded-md p-1 text-gray-400 transition hover:text-gray-700"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
    />
  );
};

const LearningPathSelect = ({ value, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const selected = SUBJECT_OPTIONS.find((o) => o.key === value);
  const LabelIcon = selected?.icon || GraduationCap;

  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const triggerClass = `flex h-[52px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-base transition focus:outline-none focus:ring-4 ${
    open || error
      ? error
        ? 'border-rose-400 ring-4 ring-rose-100'
        : 'border-[#16834A] ring-4 ring-emerald-100'
      : 'border-[#D9E1DC] focus:border-[#16834A] focus:ring-emerald-100'
  }`;

  return (
    <div>
      <label id="learning-path-label" className="mb-1.5 block text-[13px] font-medium text-gray-700">
        Learning Path
      </label>
      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby="learning-path-label"
          className={triggerClass}
        >
          <span className="flex min-w-0 items-center gap-3">
            {selected ? (
              <LabelIcon className="h-5 w-5 shrink-0 text-[#16834A]" />
            ) : (
              <GraduationCap className="h-5 w-5 shrink-0 text-gray-400" />
            )}
            <span className={`truncate ${selected ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {selected ? selected.label : 'Select your learning path'}
            </span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            role="listbox"
            aria-labelledby="learning-path-label"
            className="absolute bottom-full left-0 right-0 z-20 mb-2 max-h-72 overflow-y-auto overscroll-contain rounded-2xl border border-[#E6EFE9] bg-white p-2 shadow-xl shadow-emerald-100/50 [scrollbar-width:thin] [scrollbar-color:#C8E6D4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8E6D4] [&::-webkit-scrollbar-thumb:hover]:bg-[#16834A]/60"
          >
            {SUBJECT_OPTIONS.map((opt) => {
              const active = opt.key === value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.key);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    active ? 'bg-emerald-50/80' : 'hover:bg-[#F4F9F6]'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                      active ? 'bg-[#16834A] text-white' : 'bg-emerald-50 text-[#16834A]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[14px] font-semibold ${active ? 'text-[#146B3A]' : 'text-gray-800'}`}>{opt.label}</span>
                    <span className="block truncate text-xs text-gray-400">{opt.description}</span>
                  </span>
                  {active ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16834A] text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-500">{error}</p> : null}
    </div>
  );
};

const PrimaryButton = ({ loading, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#146B3A] text-base font-semibold text-white transition hover:bg-[#0f572f] hover:shadow-lg hover:shadow-emerald-200/60 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-60 disabled:hover:bg-[#146B3A] disabled:hover:shadow-none"
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
    {children}
  </button>
);

const Divider = ({ text }) => (
  <div className="my-4 flex items-center gap-4">
    <span className="h-px flex-1 bg-gray-200" />
    <span className="text-[13px] text-gray-400">{text}</span>
    <span className="h-px flex-1 bg-gray-200" />
  </div>
);

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

const SocialButtons = () => {
  const toast = useToast();
  const btn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#16834A] hover:text-[#16834A] hover:shadow-md';
  return (
    <div className="flex justify-center gap-3">
      <button type="button" onClick={() => toast.info('Sign in with Google is not available yet.')} className={btn} aria-label="Google">
        <GoogleIcon className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => toast.info('Sign in with GitHub is not available yet.')} className={btn} aria-label="GitHub">
        <Github className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => toast.info('Sign in with Apple is not available yet.')} className={btn} aria-label="Apple">
        <Apple className="h-5 w-5" />
      </button>
    </div>
  );
};

const CircleProgress = ({ percent }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <div className="relative h-[76px] w-[76px] shrink-0">
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#E6F0EA" strokeWidth="5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="#16834A" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#146B3A]">{percent}%</span>
    </div>
  );
};

const SubjectRow = ({ icon: Icon, name, percent }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#16834A]">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-gray-700">{name}</span>
        <span className="font-bold text-[#146B3A]">{percent}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-emerald-100">
        <div className="h-1.5 rounded-full bg-[#16834A]" style={{ width: `${percent}%` }} />
      </div>
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
  </div>
);

const ChecklistCard = () => (
  <motion.div
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute left-4 top-8 z-10 w-[190px] rounded-2xl border border-[#E6EFE9] bg-white p-4 shadow-lg shadow-emerald-100/50"
  >
    <p className="mb-3 text-xs font-bold text-gray-800">Today&apos;s Tasks</p>
    {['Arrays practice', 'REST API notes', 'DSA problem #3'].map((t) => (
      <div key={t} className="mb-2.5 flex items-center gap-2 last:mb-0">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16834A]" />
        <span className="truncate text-[11px] text-gray-500">{t}</span>
      </div>
    ))}
  </motion.div>
);

const OpenNotebook = () => (
  <motion.div
    animate={{ y: [0, 6, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute bottom-14 left-8 z-10 w-[150px] rounded-xl border border-[#E6EFE9] bg-white p-3 shadow-lg shadow-emerald-100/50"
  >
    <div className="flex items-center gap-2">
      <NotebookPen className="h-4 w-4 text-[#16834A]" />
      <span className="text-[11px] font-semibold text-gray-600">Learning Notes</span>
    </div>
    <div className="mt-2 space-y-1.5">
      <div className="h-1.5 w-4/5 rounded-full bg-gray-200" />
      <div className="h-1.5 w-full rounded-full bg-gray-100" />
      <div className="h-1.5 w-3/5 rounded-full bg-gray-100" />
    </div>
  </motion.div>
);

const TargetBadge = () => (
  <motion.div
    animate={{ y: [0, -5, 0] }}
    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute right-8 top-10 z-10 flex items-center gap-1.5 rounded-full border border-[#E6EFE9] bg-white px-3.5 py-2 shadow-lg shadow-emerald-100/50"
  >
    <Target className="h-5 w-5 text-[#146B3A]" />
    <ArrowUpRight className="h-4 w-4 text-[#16834A]" />
  </motion.div>
);

const BooksCap = () => (
  <motion.div
    animate={{ y: [0, -5, 0] }}
    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute bottom-10 right-10 z-10 flex flex-col items-center"
  >
    <GraduationCap className="mb-1 h-7 w-7 text-[#146B3A]" />
    <div className="flex flex-col items-center space-y-1">
      <div className="h-2 w-16 rounded bg-[#146B3A]" />
      <div className="h-2 w-11 rounded bg-[#16834A]" />
      <div className="h-2 w-20 rounded bg-[#a8c6b6]" />
    </div>
  </motion.div>
);

const VisualPanel = () => (
  <div className="relative hidden lg:block lg:w-[60%]">
    <div className="relative flex h-full flex-col overflow-hidden bg-[#F4F9F6] p-8">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-20 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />

      {/* dotted paths */}
      <svg className="pointer-events-none absolute left-10 top-1/3 h-24 w-40 text-[#16834A]" fill="none" aria-hidden="true">
        <path d="M0,36 C30,8 90,6 130,26" stroke="currentColor" strokeWidth="2" strokeDasharray="3 6" opacity="0.35" />
      </svg>
      <svg className="pointer-events-none absolute bottom-24 right-8 h-24 w-40 text-[#16834A]" fill="none" aria-hidden="true">
        <path d="M0,10 C40,26 90,20 130,8" stroke="currentColor" strokeWidth="2" strokeDasharray="3 6" opacity="0.35" />
      </svg>

      {/* decorative dots */}
      <div className="pointer-events-none absolute right-1/3 top-6 h-2.5 w-2.5 rounded-full bg-[#16834A]/25" />
      <div className="pointer-events-none absolute left-1/3 bottom-32 h-2 w-2 rounded-full bg-[#16834A]/20" />
      <div className="pointer-events-none absolute right-14 top-1/2 h-2 w-2 rounded-full bg-[#16834A]/20" />

      {/* decorative floating elements */}
      <ChecklistCard />
      <OpenNotebook />
      <TargetBadge />
      <BooksCap />

      {/* central dashboard card */}
      <div className="relative z-10 m-auto w-full max-w-[410px] rounded-[1.75rem] border border-[#E6EFE9] bg-white p-7 shadow-[0_24px_60px_rgba(20,107,58,0.14)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#16834A]">
            <BarChart3 className="h-5 w-5" />
          </span>
          <p className="text-[15px] font-bold text-gray-900">Your Learning Journey</p>
        </div>

        {/* overall progress */}
        <div className="mt-6 flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-gray-500">Overall Progress</p>
            <div className="mt-2.5 h-2.5 w-full rounded-full bg-emerald-100">
              <div className="h-2.5 rounded-full bg-[#16834A]" style={{ width: '72%' }} />
            </div>
            <p className="mt-2 text-[12px] font-semibold text-gray-600">72% Completed</p>
          </div>
          <CircleProgress percent={72} />
        </div>

        {/* subjects */}
        <div className="mt-6 border-t border-[#F0F4F1] pt-5">
          <p className="mb-3.5 text-[13px] font-medium text-gray-500">Your Subjects</p>
          <div className="space-y-4">
            <SubjectRow icon={Code} name="MERN Stack" percent={80} />
            <SubjectRow icon={BarChart3} name="DSA with JS" percent={60} />
          </div>
        </div>
      </div>

      {/* bottom tagline */}
      <div className="relative z-10 mt-6 pb-1 text-center">
        <p className="text-2xl font-bold text-gray-900">
          Learn. Track. <span className="text-[#16834A]">Improve.</span> Repeat.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Stay consistent, track your progress
          <br />
          and become better every day.
        </p>
      </div>
    </div>
  </div>
);

const SUBJECT_OPTIONS = [
  { key: 'mern', label: 'MERN Stack', description: 'MongoDB · Express · React · Node.js', icon: Code },
  { key: 'dsa', label: 'DSA', description: 'Data Structures & Algorithms', icon: Network },
  { key: 'pcm', label: 'PCM', description: 'Physics · Chemistry · Mathematics', icon: Atom },
];

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
    if (!email.trim()) nextErrors.email = 'Email or username is required';
    else if (email.includes('@') && !/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Please enter a valid email';
    if (!password) nextErrors.password = 'Password is required';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setErrors({});

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(authMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      heading={
        <>
          Welcome back! <span className="text-[#16834A]">👋</span>
        </>
      }
      subtitle={'Track your learning journey and\nachieve your goals.'}
      footer={
        <div className="text-center text-base text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[#16834A] transition hover:text-[#12703f]">
            Register now
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="Email or Username"
          icon={User}
          value={email}
          onChange={setEmail}
          placeholder="Enter your email or username"
          autoComplete="email"
          error={errors.email}
        />

        <div>
          <PasswordInput value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" error={errors.password} />
          <div className="mt-1.5 text-right">
            <button
              type="button"
              onClick={() => toast.info('Password reset is not set up yet.')}
              className="text-[13px] font-medium text-[#16834A] transition hover:text-[#12703f]"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <PrimaryButton loading={loading}>{loading ? 'Logging in...' : 'Login'}</PrimaryButton>

        <Divider text="or continue with" />

        <SocialButtons />
      </form>
    </AuthShell>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', subject: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Please enter a valid email';
    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (!form.subject) nextErrors.subject = 'Please select a learning path';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setErrors({});

    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    setLoading(true);
    try {
      await register(name, form.email.trim(), form.password, form.subject);
      toast.success('Account created — welcome aboard!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(authMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="register"
      heading={
        <>
          Create your account <span className="text-[#16834A]">👋</span>
        </>
      }
      subtitle="Start tracking your learning journey and achieve your goals."
      footer={
        <div className="text-center text-base text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#16834A] transition hover:text-[#12703f]">
            Log in
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="First name" autoComplete="given-name" error={errors.firstName} />
          <TextField label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Last name" autoComplete="family-name" error={errors.lastName} />
        </div>

        <TextField
          label="Email"
          icon={User}
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email}
        />

        <PasswordInput value={form.password} onChange={set('password')} placeholder="Enter your password" autoComplete="new-password" error={errors.password} />

        <LearningPathSelect value={form.subject} onChange={set('subject')} error={errors.subject} />

        <PrimaryButton loading={loading}>{loading ? 'Creating account...' : 'Create Account'}</PrimaryButton>
      </form>
    </AuthShell>
  );
};
