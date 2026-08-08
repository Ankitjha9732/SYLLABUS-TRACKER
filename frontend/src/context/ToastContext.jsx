import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let nextId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'success', options = {}) => {
      const { autoClose = true } = options;
      const id = nextId++;
      setToasts((t) => [...t, { id, message, type }]);
      if (autoClose) {
        setTimeout(() => dismiss(id), options.duration || 3500);
      }
      return id;
    },
    [dismiss]
  );

  const toast = useCallback(
    (message, options) => push(message, 'info', options),
    [push]
  );

  const toastTypes = {
    success: (message, options) => push(message, 'success', options),
    error: (message, options) => push(message, 'error', { ...options, autoClose: true, duration: 5000 }),
    info: toast,
    loading: (message, options) => push(message, 'info', { autoClose: false, ...options }),
  };

  const value = { ...toastTypes, dismiss };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const STYLES = {
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" /> },
  error: { bg: 'bg-rose-50', border: 'border-rose-200', icon: <AlertCircle className="h-5 w-5 text-rose-500" /> },
  info: { bg: 'bg-slate-50', border: 'border-slate-200', icon: <Info className="h-5 w-5 text-slate-500" /> },
};

const ToastItem = ({ toast, onDismiss }) => {
  const s = STYLES[toast.type] || STYLES.info;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${s.bg} ${s.border} px-4 py-3 shadow-card`}
    >
      <span className="mt-0.5 shrink-0">{s.icon}</span>
      <p className="flex-1 text-sm font-medium text-slate-800">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 text-slate-400 transition hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};