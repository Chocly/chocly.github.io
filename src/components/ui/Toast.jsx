'use client';
// App-wide toast notifications — replaces window.alert() everywhere.
// Usage: const toast = useToast(); toast.success('Rating saved');
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant, message, { duration = 4000 } = {}) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-3), { id, variant, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
      return id;
    },
    [dismiss]
  );

  const api = useRef({
    success: (msg, opts) => push('success', msg, opts),
    error: (msg, opts) => push('error', msg, { duration: 6000, ...opts }),
    info: (msg, opts) => push('info', msg, opts),
  });
  // Keep push reference fresh without changing api identity
  api.current.success = (msg, opts) => push('success', msg, opts);
  api.current.error = (msg, opts) => push('error', msg, { duration: 6000, ...opts });
  api.current.info = (msg, opts) => push('info', msg, opts);

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div className="toast-viewport" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.variant}`} role="status" aria-live="polite">
            <span className="toast-icon" aria-hidden="true">
              {t.variant === 'success' ? '✓' : t.variant === 'error' ? '!' : 'i'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button
              className="toast-close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // Fail soft outside the provider (tests, isolated renders)
  return {
    success: (msg) => console.log('[toast:success]', msg),
    error: (msg) => console.error('[toast:error]', msg),
    info: (msg) => console.log('[toast:info]', msg),
  };
}
