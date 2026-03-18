import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: '✓',
  error:   '⚠',
  info:    '◈',
  warning: '▲',
};

const TOAST_COLORS = {
  success: { color: 'var(--accent-green)',  bg: 'rgba(63,185,80,0.1)',   border: 'rgba(63,185,80,0.25)'  },
  error:   { color: 'var(--accent-red)',    bg: 'rgba(255,123,114,0.1)', border: 'rgba(255,123,114,0.25)' },
  info:    { color: 'var(--accent-primary)',bg: 'rgba(88,166,255,0.1)',  border: 'rgba(88,166,255,0.25)'  },
  warning: { color: 'var(--accent-orange)', bg: 'rgba(255,166,87,0.1)',  border: 'rgba(255,166,87,0.25)'  },
};

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur),
    info:    (msg, dur) => addToast(msg, 'info',    dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px',
        maxWidth: '380px', width: '100%',
        pointerEvents: 'none',
      }}>
        {toasts.map(({ id, message, type }) => {
          const cfg = TOAST_COLORS[type] || TOAST_COLORS.info;
          return (
            <div key={id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              border: `1px solid ${cfg.border}`,
              borderLeft: `3px solid ${cfg.color}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              animation: 'slideInLeft 250ms ease',
              pointerEvents: 'all',
            }}>
              {/* Icon */}
              <span style={{
                flexShrink: 0, width: '20px', height: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: cfg.bg, borderRadius: 'var(--radius-sm)',
                color: cfg.color, fontSize: '11px', fontWeight: 700,
              }}>
                {TOAST_ICONS[type]}
              </span>

              {/* Message */}
              <p style={{
                flex: 1,
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                {message}
              </p>

              {/* Close */}
              <button onClick={() => removeToast(id)} style={{
                flexShrink: 0, background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-muted)',
                fontSize: '14px', lineHeight: 1, padding: '0 2px',
                transition: 'color var(--transition-fast)',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >✕</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};