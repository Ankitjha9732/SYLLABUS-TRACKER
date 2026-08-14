import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BookOpenCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader } from '../components/Loading.jsx';
import { SUBJECTS, subjectLabel } from '../components/Sidebar.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/syllabus', label: 'Syllabus', icon: BookOpenCheck },
];

const isActive = (pathname, to) => pathname === to;

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const { pathname } = useLocation();
  const subject = SUBJECTS[user?.subject] || SUBJECTS.mern;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F9F6] pt-14">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F9F6]">
      {/* Top navigation bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-4 border-b border-[#D9E1DC] bg-white px-3 sm:px-6 max-sm:gap-1.5">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#16834A] to-[#0f572f] text-white shadow-sm">
            <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="hidden text-sm font-bold tracking-tight text-gray-900 min-[420px]:block">Progress Tracker</span>
        </NavLink>

        <nav className="flex min-w-0 flex-1 items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition max-sm:px-2 max-sm:py-2.5 ${
                  active ? 'bg-emerald-50 text-[#146B3A]' : 'text-gray-500 hover:bg-[#F4F9F6] hover:text-gray-700'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] max-sm:h-4 max-sm:w-4 ${active ? 'text-[#16834A]' : 'text-gray-400'}`} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <span
          className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 sm:inline-flex ${subject.badge}`}
        >
          {subject.icon ? <subject.icon className="h-3 w-3" /> : null} {subjectLabel(user?.subject)}
        </span>

        <div className="flex shrink-0 items-center gap-3 max-sm:gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#146B3A] to-[#16834A] text-sm font-semibold text-white">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-lg p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600 max-sm:p-2.5"
            aria-label="Logout"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
