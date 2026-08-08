import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { STATUS, STATUS_META, nextStatus } from '../utils/index.js';

/**
 * Animated circular progress ring.
 */
export const CircularProgress = ({ value = 0, size = 140, stroke = 10, label = '' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-brand-500"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-800">{value}%</span>
        {label ? <span className="text-xs font-medium text-slate-500">{label}</span> : null}
      </div>
    </div>
  );
};

/**
 * Status chip with color coding.
 */
export const StatusBadge = ({ status, size = 'sm' }) => {
  const meta = STATUS_META[status] || STATUS_META[STATUS.NOT_STARTED];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} ${meta.border} border px-2.5 py-0.5 ${meta.textColor} ${textSize} font-medium`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

/**
 * Dropdown to change a subtopic's status directly.
 */
export const StatusSelector = ({ status = 'not_started', onChange, disabled = false }) => {
  const meta = STATUS_META[status];
  return (
    <div className="relative">
      <select
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer appearance-none rounded-lg border px-8 py-1.5 pr-8 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-300 ${meta.bg} ${meta.border} ${meta.textColor} disabled:cursor-not-allowed disabled:opacity-60`}
        style={{ backgroundImage: 'none' }}
      >
        {Object.keys(STATUS_META).map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Step-through status toggle used inside syllabus tree (click cycles status).
 */
export const StepStatusButton = ({ status, onClick }) => {
  const meta = STATUS_META[status];
  const next = nextStatus(status);
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Mark as ${STATUS_META[next].label}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:scale-105 ${meta.bg} ${meta.border} ${meta.textColor}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </button>
  );
};

/**
 * Direct "check off" toggle for a whole topic/module. One click marks every
 * subtopic under it as Completed (or resets them when checked again).
 */
export const CheckTopicButton = ({ checked, partiallyChecked = false, busy = false, onClick }) => {
  const stateClass = checked
    ? 'border-emerald-500 bg-emerald-500 text-white'
    : partiallyChecked
    ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
    : 'border-slate-300 bg-white text-slate-400 hover:border-emerald-400 hover:text-emerald-500';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={checked ? 'Reset to Not Started' : 'Mark as Completed'}
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-wait disabled:opacity-60 ${stateClass}`}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  );
};