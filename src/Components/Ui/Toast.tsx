import React, { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

const STYLES: Record<ToastVariant, { bg: string; border: string; color: string; barColor: string; shadow: string }> = {
  success: {
    bg: 'rgba(220, 252, 231, 0.6)',
    border: '#4ade80',
    color: '#16a34a',
    barColor: '#16a34a',
    shadow: '0 4px 14px -2px rgba(22, 163, 74, 0.3)',
  },
  error: {
    bg: 'rgba(254, 226, 226, 0.6)',
    border: '#f87171',
    color: '#dc2626',
    barColor: '#dc2626',
    shadow: '0 4px 14px -2px rgba(220, 38, 38, 0.3)',
  },
  warning: {
    bg: 'rgba(254, 249, 195, 0.6)',
    border: '#fbbf24',
    color: '#b45309',
    barColor: '#f59e0b',
    shadow: '0 4px 14px -2px rgba(202, 138, 4, 0.3)',
  },
  info: {
    bg: 'rgba(219, 234, 254, 0.6)',
    border: '#93c5fd',
    color: '#1d4ed8',
    barColor: '#3b82f6',
    shadow: '0 4px 14px -2px rgba(59, 130, 246, 0.3)',
  },
};

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  ),
  error: (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
    </div>
  ),
  warning: (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>!</span>
    </div>
  ),
  info: (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>i</span>
    </div>
  ),
};

interface CustomToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration: number;
}

const EXIT_ANIMATION_MS = 300;

const CustomToast: React.FC<CustomToastProps> = ({ id, variant, title, message, duration }) => {
  const s = STYLES[variant];
  const barRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => toast.dismiss(id), EXIT_ANIMATION_MS);
    }, duration - EXIT_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [id, duration]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '100%';
    bar.getBoundingClientRect();
    bar.style.transition = `width ${duration}ms linear`;
    bar.style.width = '0%';
  }, [duration]);

  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: '100px',
      fontSize: '12px',
      width: '320px',
      fontWeight: '600',
      boxShadow: s.shadow,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      overflow: 'hidden',
      color: s.color,
      animation: isExiting ? `toastSlideOut ${EXIT_ANIMATION_MS}ms ease-in forwards` : undefined,
    }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {ICONS[variant]}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, lineHeight: 1.3, fontSize: '12px' }}>{title}</p>
          {message && <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.75, fontWeight: '400', lineHeight: 1.3 }}>{message}</p>}
        </div>
      </div>
      <div ref={barRef} style={{ height: '3px', backgroundColor: s.barColor, width: '100%' }} />
    </div>
  );
};

export const showCustomToast = (variant: ToastVariant, title: string, message?: string, duration = 5000) => {
  toast.custom(
    (t) => <CustomToast id={t.id} variant={variant} title={title} message={message} duration={duration} />,
    { duration: Infinity },
  );
};

export const ToastContainer: React.FC = () => (
  <>
    <style>{`
      @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to   { transform: translateX(120%); opacity: 0; }
      }
    `}</style>
    <Toaster position="bottom-right" gutter={8} toastOptions={{ duration: Infinity }} />
  </>
);