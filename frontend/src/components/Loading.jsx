import { motion } from 'framer-motion';

export const Spinner = ({ className = 'h-6 w-6' }) => (
  <motion.div
    className={`${className} border-[3px] border-slate-200 border-t-brand-600 rounded-full`}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
    role="status"
    aria-label="Loading"
  />
);

const Loading = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
    <Spinner />
    <p className="text-sm">{label}</p>
  </div>
);

const Skeletons = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="h-14 animate-pulse rounded-xl bg-slate-100"
        style={{ animationDelay: `${i * 80}ms` }}
      />
    ))}
  </div>
);

export const PageLoader = () => (
  <div className="space-y-4 p-4 sm:p-6">
    <div className="h-8 w-1/3 animate-pulse rounded-lg bg-slate-100" />
    <Skeletons />
  </div>
);

export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
    {Icon ? (
      <div className="mb-2 rounded-2xl bg-brand-50 p-3 text-brand-500">
        <Icon className="h-8 w-8" />
      </div>
    ) : null}
    <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
    {message ? <p className="max-w-sm text-sm text-slate-500">{message}</p> : null}
    {action}
  </div>
);

export default Loading;