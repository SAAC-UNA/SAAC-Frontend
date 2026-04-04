/**
 * PublicLinkModal - Modal para gestionar enlaces públicos de archivos
 * HU023 - Enlaces Únicos para Evidencias
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Button } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { axiosInstance } from '@/Config/axios';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import { cn } from '@/Utils/ClassNames';

interface Archivo {
  archivo_id: number;
  nombre_original: string;
  ruta_archivo: string;
  token_publico?: string;
  is_publico: boolean;
  link_expira_en?: string;
}

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
}

interface PublicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivo: Archivo | null;
  evidencia: Evidencia | null;
  onSuccess: () => void;
}

export const PublicLinkModal: React.FC<PublicLinkModalProps> = ({
  isOpen,
  onClose,
  archivo,
  evidencia,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopiedToClipboard(false);
    }
  }, [isOpen]);

  if (!archivo || !evidencia) return null;

  const publicUrl = archivo.token_publico
    ? `${window.location.origin}/api/p/${archivo.token_publico}`
    : '';

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      await axiosInstance.post(`/archivos/${archivo.archivo_id}/make-public`);
      onSuccess();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al generar enlace',
        message: error.response?.data?.message || 'No se pudo generar el enlace público'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeLink = async () => {
    const confirmacion = confirm('¿Está seguro que desea revocar el enlace público? El enlace actual dejará de funcionar.');
    if (!confirmacion) return;

    setIsRevoking(true);
    try {
      await axiosInstance.post(`/archivos/${archivo.archivo_id}/revoke-public`);
      onSuccess();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al revocar enlace',
        message: error.response?.data?.message || 'No se pudo revocar el enlace público'
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      showToast({
        type: 'error',
        title: 'Error al copiar',
        message: 'No se pudo copiar el enlace al portapapeles'
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enlace público"
      size="md"
      variant="info"
      heroIcon={<SystemIcons.modal.document className={cn(ICON_SIZES.md, 'text-blanco-una')} />}
    >
      <div className="flex flex-col gap-4">

        {/* Información del archivo */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
              {evidencia.nomenclatura}
            </span>
            <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>—</span>
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              {evidencia.descripcion}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <SystemIcons.modal.document className={cn(ICON_SIZES.sm, 'text-gris-una')} />
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              {archivo.nombre_original}
            </span>
          </div>
        </div>

        <hr className="border-gris-light" />

        {/* Estado del enlace */}
        {archivo.is_publico && archivo.token_publico ? (
          <div className="flex flex-col gap-3">
            {/* Encabezado estado activo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SystemIcons.actions.linkIcon className={cn(ICON_SIZES.sm, 'text-verde')} />
                <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
                  Enlace público activo
                </span>
              </div>
              {archivo.link_expira_en && (
                <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>
                  Expira: {new Date(archivo.link_expira_en).toLocaleString()}
                </span>
              )}
            </div>

            {/* URL */}
            <div className="flex flex-col gap-1">
              <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2 uppercase tracking-wider font-semibold')}>
                URL pública
              </span>
              <div className="flex items-center gap-2 border border-gris-light rounded px-3 py-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className={cn(TYPOGRAPHY.modal.body, 'flex-1 bg-transparent border-none focus:outline-none text-gris-una-2')}
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleCopyLink} className="flex-1">
                {copiedToClipboard ? (
                  <><SystemIcons.interface.check className={ICON_SIZES.sm} /> Copiado</>
                ) : (
                  <><SystemIcons.actions.copy className={ICON_SIZES.sm} /> Copiar enlace</>
                )}
              </Button>
              <Button variant="error" size="sm" onClick={handleRevokeLink} disabled={isRevoking} className="flex-1">
                {isRevoking ? 'Revocando...' : 'Revocar enlace'}
              </Button>
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2">
              <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, 'text-info mt-0.5 shrink-0')} />
              <div className="flex flex-col gap-0.5">
                <span className={cn(TYPOGRAPHY.modal.subtitle, 'font-semibold text-negro-una')}>Sobre los enlaces públicos</span>
                <ul className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2 list-disc list-inside')}>
                  <li>Cualquier persona con este enlace puede acceder al archivo</li>
                  <li>No se requiere autenticación para ver el contenido</li>
                  <li>Puede revocar el enlace en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Sin enlace */}
            <div className="flex flex-col items-center gap-2 py-4">
              <StatusBadge
                label="Sin enlace público"
                colorClasses={BADGE_COLORS.warning.colorClasses}
              />
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 text-center')}>
                Genere un enlace para compartir este archivo sin necesidad de autenticación.
              </span>
              <Button variant="primary" size="sm" onClick={handleGenerateLink} disabled={isGenerating}>
                <SystemIcons.actions.linkIcon className={ICON_SIZES.sm} />
                {isGenerating ? 'Generando...' : 'Generar enlace público'}
              </Button>
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2">
              <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, 'text-info mt-0.5 shrink-0')} />
              <div className="flex flex-col gap-0.5">
                <span className={cn(TYPOGRAPHY.modal.subtitle, 'font-semibold text-negro-una')}>¿Qué es un enlace público?</span>
                <p className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>
                  Un enlace público permite compartir este archivo con personas que no tienen
                  acceso al sistema. El archivo será visible para cualquiera que tenga el enlace.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
