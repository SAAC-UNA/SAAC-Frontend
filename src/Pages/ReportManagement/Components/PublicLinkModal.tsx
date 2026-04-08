/**
 * PublicLinkModal - Modal para gestionar enlaces públicos de archivos
 * HU023 - Enlaces Únicos para Evidencias
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Feedback/Tooltip';
import { axiosInstance } from '@/Config/axios';
import { config } from '@/Config/app.config';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';

interface Archivo {
  archivo_id: number;
  nombre_original: string;
  ruta_archivo: string;
  token_publico?: string;
  url_publica?: string;
  url_publica_carpeta?: string;
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
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [successState, setSuccessState] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setCopiedToClipboard(false);
      setShowRevokeConfirm(false);
    }
  }, [isOpen]);

  const handleSuccessClose = () => {
    setSuccessState({ open: false, title: '', message: '' });
    onSuccess();
  };

  if (!archivo || !evidencia) {
    return successState.open ? (
      <SuccessModal
        isOpen={successState.open}
        title={successState.title}
        message={successState.message}
        onClose={handleSuccessClose}
        autoClose
        autoCloseDelay={2200}
      />
    ) : null;
  }

  const publicUrl = archivo.token_publico
    ? `${config.FRONTEND_BASE_URL}/p/${archivo.token_publico}`
    : (archivo.url_publica_carpeta
      ?? archivo.url_publica
      ?? '');

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      try {
        await axiosInstance.post(`/archivos/${archivo.archivo_id}/make-public`);
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          throw error;
        }
        await axiosInstance.post(`/elementos-archivos/${archivo.archivo_id}/make-public`);
      }
      setSuccessState({
        open: true,
        title: 'Enlace público generado',
        message: 'El enlace público se generó exitosamente.',
      });
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

  const confirmRevokeLink = async () => {
    setIsRevoking(true);
    try {
      try {
        await axiosInstance.post(`/archivos/${archivo.archivo_id}/revoke-public`);
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          throw error;
        }
        await axiosInstance.post(`/elementos-archivos/${archivo.archivo_id}/revoke-public`);
      }
      setShowRevokeConfirm(false);
      setSuccessState({
        open: true,
        title: 'Enlace público revocado',
        message: 'El enlace público se revocó exitosamente.',
      });
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
    <>
      <Modal
        isOpen={isOpen && !successState.open}
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
          {archivo.is_publico && (archivo.token_publico || archivo.url_publica) ? (
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 border border-gris-light rounded px-3 py-2 flex-1">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className={cn(TYPOGRAPHY.modal.body, 'flex-1 bg-transparent border-none focus:outline-none text-gris-una-2')}
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="shrink-0 cursor-help text-slate">
                        {SystemIcons.interface.informationCircle({ size: 'sm' })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-[360px] whitespace-normal break-words px-3 py-2 leading-relaxed"
                    >
                      <div>
                        <span className={cn(TYPOGRAPHY.modal.subtitle, 'font-semibold text-blanco-una block')}>
                          Sobre los enlaces públicos
                        </span>
                        <ul className={cn(TYPOGRAPHY.modal.subtitle, 'text-blanco-una mt-1 pl-4 list-disc')}>
                          <li>Cualquier persona con este enlace puede acceder al archivo</li>
                          <li>No se requiere autenticación para ver el contenido</li>
                          <li>Puede revocar el enlace en cualquier momento</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-1.5">
                {copiedToClipboard && (
                  <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-verde-dark')}>
                    Copiado
                  </span>
                )}

                <ButtonWithTooltip
                  variant="tableView"
                  size="sm"
                  tooltip="Copiar enlace"
                  onClick={handleCopyLink}
                  className="p-1"
                  aria-label="Copiar enlace"
                >
                  <SystemIcons.actions.copy className={ICON_SIZES.sm} />
                </ButtonWithTooltip>

                <ButtonWithTooltip
                  variant="tableDelete"
                  size="sm"
                  tooltip={isRevoking ? 'Revocando...' : 'Revocar enlace'}
                  onClick={() => setShowRevokeConfirm(true)}
                  disabled={isRevoking}
                  className="p-1"
                  aria-label="Revocar enlace"
                >
                  <SystemIcons.interface.xCircle className={ICON_SIZES.sm} />
                </ButtonWithTooltip>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SystemIcons.actions.linkIcon className={cn(ICON_SIZES.sm, 'text-warning-dark')} />
                  <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
                    Sin enlace público
                  </span>
                </div>
              </div>

              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                Genere un enlace para compartir este archivo sin necesidad de autenticación.
              </p>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-gris-light rounded px-3 py-2 flex-1 bg-gris-light/10">
                  <input
                    type="text"
                    readOnly
                    value="No hay enlace generado"
                    className={cn(TYPOGRAPHY.modal.body, 'flex-1 bg-transparent border-none focus:outline-none text-gris-una')}
                  />
                </div>

                <ButtonWithTooltip
                  variant="tableView"
                  size="sm"
                  tooltip={isGenerating ? 'Generando...' : 'Generar enlace público'}
                  tooltipPosition="left"
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="p-1"
                  aria-label="Generar enlace público"
                >
                  <SystemIcons.actions.linkIcon className={ICON_SIZES.sm} />
                </ButtonWithTooltip>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showRevokeConfirm && !successState.open}
        onClose={() => setShowRevokeConfirm(false)}
        onConfirm={confirmRevokeLink}
        title="Revocar enlace público"
        variant="warning"
        confirmLabel="Revocar"
        cancelLabel="Cancelar"
        confirmLoading={isRevoking}
        showCancel
        showConfirm
        footerMeta="El enlace actual dejará de funcionar inmediatamente"
      >
        <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
          ¿Está seguro de que desea revocar este enlace público?
        </p>
      </Modal>

      <SuccessModal
        isOpen={successState.open}
        title={successState.title}
        message={successState.message}
        onClose={handleSuccessClose}
        autoClose
        autoCloseDelay={2200}
      />
    </>
  );
};
