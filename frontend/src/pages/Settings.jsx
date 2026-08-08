import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, AlertTriangle, Trash2, Save, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API, { getErrorMessage } from '../services/api.js';
import { formatDate } from '../utils/index.js';

export const Settings = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile(name.trim());
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await API.delete('/progress');
      toast.success('Your progress has been reset');
      setConfirmReset(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account and learning data.</p>
      </motion.div>

      {/* Profile */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-brand-500" />
          <h2 className="text-sm font-semibold text-slate-700">Profile</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="set-name" className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
            <input
              id="set-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {savingProfile ? 'Saving...' : 'Save changes'}
        </button>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-500" /> Role: {user?.role || 'user'}
          </span>
          <span>Member since {user?.createdAt ? formatDate(user.createdAt) : '—'}</span>
        </div>
      </section>

      {/* Data */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-500" />
          <h2 className="text-sm font-semibold text-slate-700">Danger zone</h2>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Reset all progress</p>
            <p className="text-xs text-slate-400">Wipes your status, notes and streaks. The syllabus itself is untouched.</p>
          </div>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {resetting ? 'Resetting...' : 'Yes, reset'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              <Trash2 className="h-4 w-4" /> Reset progress
            </button>
          )}
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pb-4 text-xs text-slate-400">
        <HeartHandshake className="h-4 w-4" />
        Built as a portfolio-ready MERN application.
      </div>
    </div>
  );
};