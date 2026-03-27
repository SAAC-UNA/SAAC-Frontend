import React, { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <SystemIcons.toasts.success />,
  error:   <SystemIcons.toasts.error />,
  warning: <SystemIcons.toasts.warning />,
  info:    <SystemIcons.toasts.info />,
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
    <div
      className={`toast-${variant}`}
      style={{
        borderRadius: 'var(--radius-corner)',
        width: '320px',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        overflow: 'hidden',
        animation: isExiting ? `toastSlideOut ${EXIT_ANIMATION_MS}ms ease-in forwards` : undefined,
      }}
    >
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {ICONS[variant]}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className={TYPOGRAPHY.toast.title} style={{ margin: 0, lineHeight: 1.3 }}>{title}</p>
          {message && <p className={TYPOGRAPHY.toast.message} style={{ margin: '2px 0 0', opacity: 0.75, fontWeight: '400', lineHeight: 1.3 }}>{message}</p>}
        </div>
      </div>
      <div ref={barRef} style={{ height: '3px', backgroundColor: 'var(--toast-bar)', width: '100%' }} />
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