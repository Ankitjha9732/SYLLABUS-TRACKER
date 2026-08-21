import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpenCheck,
  LogOut,
  GraduationCap,
  X,
  Code2,
  BrainCircuit,
  Atom,
  Leaf,
  Server,
  Brain,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/syllabus', label: 'Syllabus', icon: BookOpenCheck },
];

export const SUBJECTS = {
  mern: { label: 'MERN Stack', icon: Code2, badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  dsa: { label: 'DSA', icon: BrainCircuit, badge: 'bg-teal-50 text-teal-700 ring-teal-200' },
  pcm: { label: 'PCM', icon: Atom, badge: 'bg-[#F4F9F6] text-[#146B3A] ring-[#16834A]/30' },
  pcb: { label: 'PCB (NEET)', icon: Leaf, badge: 'bg-violet-50 text-violet-700 ring-violet-200' },
  python: { label: 'Python Backend', icon: Server, badge: 'bg-sky-50 text-sky-700 ring-sky-200' },
  ml: { label: 'Machine Learning', icon: Brain, badge: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export const subjectLabel = (subject) => SUBJECTS[subject]?.label || 'Learning';

const isActive = (pathname, to) => pathname === to;

const SidebarContent = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const subject = SUBJECTS[user?.subject] || SUBJECTS.mern;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0 pr-2">
          <p className="truncate text-sm font-bold text-slate-800">ProgressTracker</p>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${subject.badge}`}>
            {subject.icon ? <subject.icon className="h-3 w-3" /> : null} {subject.label}
          </span>
        </div>
        <button
          type="button"
          className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          onClick={onNavigate}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(pathname, to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? 'text-brand-600' : 'text-slate-400'}`} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-semibold text-white">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarContent;