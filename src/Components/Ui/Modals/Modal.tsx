import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';
import { Button } from '../Buttons/Button';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { MODAL_BACKDROP_VARIANTS, MODAL_PANEL_VARIANTS } from '@/Constants/Animations';

export type ModalVariant = 'info' | 'success' | 'danger' | 'warning' | 'neutral' | 'upload';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;

  // ── Hero card ──
  /** Título visible en la tarjeta de color */
  title: string;
  /** Subtítulo/descripción debajo del título */
  subtitle?: string;
  /** Badge de estado en la parte inferior de la tarjeta (ej: "Activo", "Pendiente") */
  heroBadge?: string;
  /** Nodo personalizado para el ícono/avatar de la tarjeta (si no se pasa, se usa el ícono por variante) */
  heroIcon?: React.ReactNode;

  // ── Layout ──
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  /** Altura máxima del modal. Por defecto crece con el contenido hasta el 90vh */
  maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  /** Si se puede cerrar haciendo clic fuera o con Escape */
  closable?: boolean;
  /** Texto pequeño alineado a la izquierda del footer (meta-información) */
  footerMeta?: React.ReactNode;
  /** Botones del footer. Si se omite y se pasa onConfirm, se generan automáticamente */
  footerButtons?: React.ReactNode;

  // ── Acciones automáticas ──
  variant?: ModalVariant;
  showConfirm?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void | Promise<void>;
  confirmLoading?: boolean;
  showCancel?: boolean;
  cancelLabel?: string;

  /** Clases CSS extra para el DialogPanel */
  className?: string;
  children?: React.ReactNode;
}

interface VariantConfig {
  /** Clases Tailwind para el fondo de la tarjeta hero */
  cardBg: string;
  /** Sombra de color de la tarjeta */
  cardShadow: string;
  /** Ícono por defecto */
  Icon: React.FC<{ className?: string }>;
  /** Variante del botón de confirmar */
  confirmVariant: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  /** Color del texto del footerMeta cuando es una advertencia */
  metaColor?: string;
}

const VARIANT_CONFIG: Record<ModalVariant, VariantConfig> = {
  info: {
    cardBg: 'bg-info-dark',
    cardShadow: 'shadow-[0_4px_14px_rgba(3,73,145,0.28)]',
    Icon: ({ className }) => <SystemIcons.interface.informationCircle className={className}/>,
    confirmVariant: 'primary',
  },
  success: {
    cardBg: 'bg-verde',
    cardShadow: 'shadow-[0_4px_14px_rgba(16,185,129,0.28)]',
    Icon: ({ className }) => <SystemIcons.interface.checkCircle className={className} />,
    confirmVariant: 'success',
  },
  danger: {
    cardBg: 'bg-error',
    cardShadow: 'shadow-[0_4px_14px_rgba(239,68,68,0.28)]',
    Icon: ({ className }) => <SystemIcons.structure.trashCan className={className} />,
    confirmVariant: 'secondary',
    metaColor: 'text-error',
  },
  warning: {
    cardBg: 'bg-warning',
    cardShadow: 'shadow-[0_4px_14px_rgba(245,158,11,0.28)]',
    Icon: ({ className }) => <SystemIcons.interface.alert className={className} />,
    confirmVariant: 'warning',
    metaColor: 'text-warning',
  },
  neutral: {
    cardBg: 'bg-gris-una',
    cardShadow: 'shadow-[0_4px_14px_rgba(107,114,128,0.22)]',
    Icon: ({ className }) => <SystemIcons.actions.view className={className} />,
    confirmVariant: 'secondary',
  },
  upload: {
    cardBg: 'bg-teal',
    cardShadow: 'shadow-[0_4px_14px_rgba(20,184,166,0.28)]',
    Icon: ({ className }) => <SystemIcons.interface.uploadArrow className={className} />,
    confirmVariant: 'primary',
    metaColor: 'text-teal',
  },
};

export const Modal: React.FC<ModalProps> = React.memo(({
  isOpen,
  onClose,
  title,
  subtitle,
  heroBadge,
  heroIcon,
  size = 'md',
  maxHeight = 'auto',
  closable = true,
  footerMeta,
  footerButtons,
  variant,
  showConfirm = true,
  confirmLabel = 'Confirmar',
  onConfirm,
  confirmLoading = false,
  showCancel = true,
  cancelLabel = 'Cancelar',
  className,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const confirmGuardRef = useRef(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const isPending = confirmLoading || internalLoading;

  const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl',
    full: 'sm:max-w-full',
    auto: 'sm:w-auto',
  };

  const maxHeightClasses: Record<NonNullable<ModalProps['maxHeight']>, string> = {
    sm:   'max-h-[40vh]',
    md:   'max-h-[60vh]',
    lg:   'max-h-[75vh]',
    xl:   'max-h-[90vh]',
    full: 'max-h-screen',
    auto: '',
  };

  const cfg = variant ? VARIANT_CONFIG[variant] : null;

  // Foco y scroll
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      previousFocusRef.current?.focus();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      confirmGuardRef.current = false;
      setInternalLoading(false);
    }
  }, [isOpen]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable && !isPending) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closable, isPending, onClose]);

  const handleClose = () => { if (!isPending) onClose(); };

  const isPromiseLike = (v: unknown): v is Promise<void> =>
    typeof v === 'object' && v !== null && 'then' in v;

  const handleConfirm = async () => {
    if (!onConfirm || isPending || confirmGuardRef.current) return;
    confirmGuardRef.current = true;
    try {
      const result = onConfirm();
      if (isPromiseLike(result)) {
        setInternalLoading(true);
        await result;
      }
    } finally {
      confirmGuardRef.current = false;
      setInternalLoading(false);
    }
  };

  // Determinar si renderizar footer
  const hasFooter = !!(footerButtons || onConfirm || showCancel || footerMeta);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={closable ? handleClose : () => {}}
          className="relative z-50"
        >
          <DialogBackdrop
            as={motion.div}
            variants={MODAL_BACKDROP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-[rgba(10,15,35,0.55)] backdrop-blur-[3px]"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div
              className="flex min-h-full items-center justify-center p-4"
              role="presentation"
              onClick={(e) => {
                if (e.target === e.currentTarget && closable && !isPending) onClose();
              }}
            >
              <DialogPanel
                as={motion.div}
                ref={modalRef}
                tabIndex={-1}
                variants={MODAL_PANEL_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  'relative flex flex-col w-full',
                  'bg-blanco-una border border-none rounded-corner',
                  'shadow-[0_6px_16px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)]',
                  'sm:mt-8 sm:mb-8',
                  sizeClasses[size],
                  maxHeightClasses[maxHeight],
                  className,
                )}
              >
            {/* ════════════════════════════════════
                HÉRO CARD — tarjeta de color interna
            ════════════════════════════════════ */}
            {cfg && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] z-20">
                <div
                  className={cn(
                    'relative rounded-corner px-3 py-2.5 overflow-hidden',
                    cfg.cardBg,
                    cfg.cardShadow,
                  )}
                >
                  {/* Brillo superior */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-corner"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)' }}
                  />
                  {/* Círculo decorativo */}
                  <div
                    className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%)' }}
                  />

                  {/* Ícono + texto + botón cerrar en una sola fila */}
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-white/20 border border-white/35 shrink-0">
                        {heroIcon ?? <cfg.Icon className={`${ICON_SIZES.md} text-blanco-una`}/>}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className={cn('font-bold text-white tracking-tight leading-snug wrap-break-word', TYPOGRAPHY.modal.title)}>
                          {title}
                        </p>
                        {(subtitle || heroBadge) && (
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {subtitle && (
                              <span className={cn('text-white/70 leading-snug wrap-anywhere', TYPOGRAPHY.form.helper)}>
                                {subtitle}
                              </span>
                            )}
                            {heroBadge && (
                              <span className={cn('text-white/70 leading-snug wrap-anywhere', TYPOGRAPHY.form.helper)}>
                                · {heroBadge}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {closable && (
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        aria-label="Cerrar modal"
                        className="w-7 h-7 rounded-corner flex items-center justify-center bg-white/15 border border-white/30 text-white/90 hover:bg-white/30 transition-colors duration-150 disabled:opacity-50 shrink-0"
                      >
                        <SystemIcons.interface.closeCircle className={`${ICON_SIZES.md}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/** Espacio entre card de color y el texto del modal */}
            {cfg && <div className="h-10 shrink-0" />}

            <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-corner">
            {/* ════════════════════════════════════
                HEADER sin hero (modo sin variante)
            ════════════════════════════════════ */}
            {!cfg && (
              <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-gray-50 to-white px-5 py-4 shrink-0">
                <p className={cn('font-bold text-negro-una-2 tracking-tight', TYPOGRAPHY.modal.title)}>
                  {title}
                </p>
                {closable && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    aria-label="Cerrar modal"
                    className="rounded-full bg-gray-100 p-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-150 disabled:opacity-50"
                  >
                    <SystemIcons.interface.closeCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* ════════════════════════════════════
                BODY
            ════════════════════════════════════ */}
            {children && (
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {children}
              </div>
            )}

            {/* ════════════════════════════════════
                FOOTER
            ════════════════════════════════════ */}
            {hasFooter && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/60 shrink-0">
                {/* Meta izquierda */}
                <span
                  className={cn(
                    TYPOGRAPHY.form.helper,
                    'text-gris-una-2 truncate flex-1',
                    cfg?.metaColor,
                  )}
                >
                  {footerMeta ?? ''}
                </span>

                {/* Acciones derecha */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {footerButtons ? (
                    footerButtons
                  ) : (
                    <>
                      {showCancel && (
                        <Button
                          variant="outline"
                          onClick={handleClose}
                          disabled={isPending}
                          standardWidth
                        >
                          {cancelLabel}
                        </Button>
                      )}
                      {onConfirm && showConfirm && (
                        <Button
                          variant={cfg?.confirmVariant ?? 'primary'}
                          onClick={handleConfirm}
                          disabled={isPending}
                          isLoading={isPending}
                          loadingText="Procesando"
                          standardWidth
                        >
                          {confirmLabel}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
});
