/**
 * PublicLinkModal - Modal para gestionar enlaces públicos de archivos
 * HU023 - Enlaces Únicos para Evidencias
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modal';
import { Button } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { axiosInstance } from '@/Config/axios';

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

  const handleGenerarEnlace = async () => {
    setIsGenerating(true);
    try {
      await axiosInstance.post(`/archivos/${archivo.archivo_id}/make-public`);
      onSuccess();
    } catch (error: any) {
      console.error('Error generando enlace:', error);
      alert(error.response?.data?.message || 'Error al generar enlace público');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevocarEnlace = async () => {
    const confirmacion = confirm('¿Está seguro que desea revocar el enlace público? El enlace actual dejará de funcionar.');
    if (!confirmacion) return;

    setIsRevoking(true);
    try {
      await axiosInstance.post(`/archivos/${archivo.archivo_id}/revoke-public`);
      onSuccess();
    } catch (error: any) {
      console.error('Error revocando enlace:', error);
      alert(error.response?.data?.message || 'Error al revocar enlace público');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      alert('No se pudo copiar el enlace');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enlace Público"
      size="md"
      closable
    >
      <div className="space-y-4">
        {/* Información del archivo */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-900 mb-1">
            {evidencia.nomenclatura}
          </div>
          <div className="text-sm text-gray-500 mb-2">
            {evidencia.descripcion}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <SystemIcons.modal.document className="w-4 h-4" />
            <span className="font-medium">{archivo.nombre_original}</span>
          </div>
        </div>

        {/* Estado del enlace */}
        {archivo.is_publico && archivo.token_publico ? (
          <>
            {/* Enlace público activo */}
            <div className="border border-green-200 bg-green-50 rounded-md p-4">
              <div className="flex items-start gap-2 mb-3">
                <SystemIcons.actions.linkIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-green-900 mb-1">
                    Enlace público activo
                  </div>
                  {archivo.link_expira_en && (
                    <div className="text-xs text-green-700">
                      Expira: {new Date(archivo.link_expira_en).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* URL para copiar */}
              <div className="bg-white border border-green-200 rounded p-2 mb-3">
                <div className="text-xs text-gray-500 mb-1">URL pública:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none text-gray-700"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopiarEnlace}
                  className="flex-1"
                >
                  {copiedToClipboard ? (
                    <>
                      <SystemIcons.interface.check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <SystemIcons.actions.copy className="w-4 h-4" />
                      Copiar enlace
                    </>
                  )}
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={handleRevocarEnlace}
                  disabled={isRevoking}
                  className="flex-1"
                >
                  {isRevoking ? 'Revocando...' : 'Revocar enlace'}
                </Button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-start gap-2">
                <SystemIcons.interface.informationCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Sobre los enlaces públicos:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Cualquier persona con este enlace puede acceder al archivo</li>
                    <li>No se requiere autenticación para ver el contenido</li>
                    <li>Puede revocar el enlace en cualquier momento</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Sin enlace público */}
            <div className="border border-gray-200 bg-gray-50 rounded-md p-4 text-center">
              <SystemIcons.actions.linkIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <div className="text-sm font-medium text-gray-900 mb-1">
                Este archivo no tiene enlace público
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Genere un enlace para compartir este archivo sin necesidad de autenticación
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerarEnlace}
                disabled={isGenerating}
              >
                <SystemIcons.actions.linkIcon className="w-4 h-4" />
                {isGenerating ? 'Generando...' : 'Generar enlace público'}
              </Button>
            </div>

            {/* Información adicional */}
            <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-start gap-2">
                <SystemIcons.interface.informationCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">¿Qué es un enlace público?</p>
                  <p className="text-blue-800">
                    Un enlace público permite compartir este archivo con personas que no tienen
                    acceso al sistema. El archivo será visible para cualquiera que tenga el enlace.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
