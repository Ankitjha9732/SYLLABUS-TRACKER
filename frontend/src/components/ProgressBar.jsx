import { motion } from 'framer-motion';

const ProgressBar = ({ value = 0, className = '', showLabel = false, size = 'md' }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`${className}`}>
      {showLabel ? (
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      ) : null}
      <div className={`${height} w-full overflow-hidden rounded-full bg-slate-100`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;