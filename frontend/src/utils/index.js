export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const STATUS_META = {
  [STATUS.NOT_STARTED]: {
    label: 'Not Started',
    color: 'gray',
    textColor: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  [STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'amber',
    textColor: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
  },
  [STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    textColor: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export const DIFFICULTY_META = {
  easy: { label: 'Easy', className: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  medium: { label: 'Medium', className: 'text-amber-600 bg-amber-50 border-amber-200' },
  hard: { label: 'Hard', className: 'text-rose-600 bg-rose-50 border-rose-200' },
};

export const STATUS_ORDER = [STATUS.NOT_STARTED, STATUS.IN_PROGRESS, STATUS.COMPLETED];

// Next status when cycling (submit-topic usage: go up one level).
export const nextStatus = (status) => {
  const idx = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[idx === STATUS_ORDER.length - 1 ? 0 : idx + 1];
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');