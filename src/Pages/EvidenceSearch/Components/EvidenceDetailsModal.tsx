/**
 * EvidenceDetailsModal - Modal para mostrar los detalles completos de una evidencia
 * 
 * Muestra información detallada de la evidencia incluyendo:
 * - Información básica (criterio, descripción, estado)
 * - Lista completa de responsables con nombres y correos
 * - Recursos disponibles (archivos y enlaces) agrupados por responsable
 * - Roles con acceso
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Accordion, type EvidenciaEntry } from '@/Components/Ui/Upload/Accordion';
import type { ResponsableGroup } from '@/Components/Ui/Upload/Accordion';
import { fileService } from '@/Services/FileService';
import { evidenceSearchService, mapBackendToFrontend } from '@/Services/EvidenceSearchService';
import type { FileModel } from '@/Types/FileTypes';
import { 
  type EvidenceSearchResult 
} from '@/Types/EvidenceSearchTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

interface EvidenceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** ID del criterio a mostrar. El modal carga internamente todas sus evidencias. */
  criterioId: number | null;
}

interface FilesByUser {
  usuario_id: number;
  nombre: string;
  email: string;
  archivos: FileModel[];
}

interface BasicInfoProps {
  criterio: EvidenceSearchResult;
  evidenciasCount: number;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ criterio, evidenciasCount }) => (
  <div className="mb-6">
    <div className="flex items-center space-x-2 mb-3">
      <SystemIcons.modal.document className={`text-gris-una-2 ${ICON_SIZES.sm}`} />
      <h3 className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.subtitle}`}>Información General</h3>
    </div>
    <div className="bg-white border border-gray-200 rounded-corner p-4 space-y-3">
      <div>
        <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>Criterio:</span>
        <p className={`text-gris-una-2 mt-1 ${TYPOGRAPHY.modal.body}`}>
          {criterio.criterio_nomenclatura} - {criterio.criterio_descripcion}
        </p>
      </div>
      <div>
        <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>Evidencias asociadas:</span>
        <p className={`text-gris-una-2 mt-1 ${TYPOGRAPHY.modal.body}`}>{evidenciasCount}</p>
      </div>
    </div>
  </div>
);

interface RecursosProps {
  evidencias: EvidenceSearchResult[];
  filesByEvidencia: Map<number, FilesByUser[]>;
  loadingFiles: boolean;
  onDelete: (fileId: number) => Promise<void>;
  onUpload: (evidenciaId: number, group: ResponsableGroup) => void;
}

const Recursos: React.FC<RecursosProps> = ({ evidencias, filesByEvidencia, loadingFiles, onDelete, onUpload }) => {
  const entries: EvidenciaEntry[] = evidencias.map(ev => ({
    evidencia: {
      id: ev.evidencia_id,
      nomenclatura: ev.nomenclatura,
      descripcion: ev.descripcion,
    },
    groups: filesByEvidencia.get(ev.evidencia_id) ?? [],
  }));
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <SystemIcons.interface.link className={`text-gris-una-2 ${ICON_SIZES.sm}`} />
        <h3 className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.subtitle}`}>Responsables y Recursos</h3>
      </div>
      <Accordion
        entries={entries}
        loading={loadingFiles}
        onDelete={onDelete}
        onUpload={onUpload}
      />
    </div>
  );
};

interface RolesAccesoProps { criterio: EvidenceSearchResult; }

const RolesAcceso: React.FC<RolesAccesoProps> = ({ criterio }) => {
  if (!criterio.roles_acceso || criterio.roles_acceso.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <SystemIcons.users.roles className={`text-gris-una-2 ${ICON_SIZES.sm}`} />
        <h3 className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.subtitle}`}>Roles con Acceso</h3>
      </div>
      <div className="bg-white border border-gray-200 rounded-corner p-4">
        <div className="flex flex-wrap gap-2">
          {criterio.roles_acceso.map((rol) => (
            <span
              key={rol}
              className={`inline-flex px-3 py-1 font-medium rounded-full bg-azul-una/10 text-azul-una ${TYPOGRAPHY.badge}`}
            >
              {rol}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EvidenceDetailsModal: React.FC<EvidenceDetailsModalProps> = ({
  isOpen,
  onClose,
  criterioId
}) => {
  const navigate = useNavigate();
  const [evidencias, setEvidencias] = useState<EvidenceSearchResult[]>([]);
  // clave = evidencia_id, valor = grupos de responsables con archivos
  const [filesByEvidencia, setFilesByEvidencia] = useState<Map<number, FilesByUser[]>>(new Map());
  const [loadingFiles, setLoadingFiles] = useState(false);

  const criterio = evidencias[0] ?? null;

  // Cuando se abre el modal, cargar todas las evidencias del criterio desde el backend
  useEffect(() => {
    if (isOpen && criterioId) {
      loadAll();
    } else {
      setEvidencias([]);
      setFilesByEvidencia(new Map());
    }
  }, [isOpen, criterioId]);

  const reloadFilesForEvidencia = async (evidenciaId: number) => {
    const files = await fileService.listFiles({ evidencia_id: evidenciaId });
    setFilesByEvidencia(prev => {
      const next = new Map(prev);
      const groupMap = new Map<number, FilesByUser>();
      files.forEach((f: FileModel) => {
        if (!groupMap.has(f.usuario_id)) {
          groupMap.set(f.usuario_id, {
            usuario_id: f.usuario_id,
            nombre: f.usuario?.nombre_completo || `Usuario ${f.usuario_id}`,
            email: f.usuario?.email || '',
            archivos: [],
          });
        }
        groupMap.get(f.usuario_id)!.archivos.push(f);
      });
      next.set(evidenciaId, Array.from(groupMap.values()));
      return next;
    });
  };

  const handleDeleteFile = async (fileId: number) => {
    await fileService.deleteFile(fileId);
    // Encontrar a qué evidencia pertenece el archivo y recargar sus archivos
    for (const [evId, groups] of filesByEvidencia.entries()) {
      const found = groups.some(g => g.archivos.some(f => f.archivo_id === fileId));
      if (found) {
        await reloadFilesForEvidencia(evId);
        break;
      }
    }
  };

  const handleOpenUpload = (evidenciaId: number, group: ResponsableGroup) => {
    const ev = evidencias.find(e => e.evidencia_id === evidenciaId);
    const nombre = ev ? `${ev.nomenclatura} - ${ev.descripcion}` : 'Evidencia';
    const procesoId = group.archivos.find(f => f.proceso_id)?.proceso_id ?? 0;
    const params = new URLSearchParams({
      evidenciaId: String(evidenciaId),
      procesoId: String(procesoId),
      nombre,
    });
    onClose();
    navigate(`/evidencias/subir?${params.toString()}`);
  };

  const loadAll = async () => {
    if (!criterioId) return;
    setLoadingFiles(true);
    try {
      // Traer TODAS las evidencias del criterio (sin límite de página)
      const response = await evidenceSearchService.search(
        { criterio: String(criterioId) },
        1,
        100
      );
      const mapped = response.data.map(mapBackendToFrontend);
      setEvidencias(mapped);

      if (mapped.length === 0) {
        setLoadingFiles(false);
        return;
      }

      // Cargar archivos de todas en paralelo
      const results = await Promise.all(
        mapped.map(ev => fileService.listFiles({ evidencia_id: ev.evidencia_id }))
      );

      const map = new Map<number, FilesByUser[]>();
      mapped.forEach((ev, idx) => {
        const groupMap = new Map<number, FilesByUser>();
        results[idx].forEach((f: FileModel) => {
          if (!groupMap.has(f.usuario_id)) {
            groupMap.set(f.usuario_id, {
              usuario_id: f.usuario_id,
              nombre: f.usuario?.nombre_completo || `Usuario ${f.usuario_id}`,
              email: f.usuario?.email || '',
              archivos: []
            });
          }
          groupMap.get(f.usuario_id)!.archivos.push(f);
        });
        map.set(ev.evidencia_id, Array.from(groupMap.values()));
      });

      setFilesByEvidencia(map);
    } catch (error) {
      console.error('Error al cargar datos del criterio:', error);
      setEvidencias([]);
      setFilesByEvidencia(new Map());
    } finally {
      setLoadingFiles(false);
    }
  };

  if (!criterioId) return null;

  // Mientras cargan las evidencias del backend, mostrar estado de carga
  if (loadingFiles && evidencias.length === 0) {
    return (
      <DetailsModal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalles del Criterio"
        itemName="Cargando..."
        itemType="criterio"
        cancelLabel="Cerrar"
        size="lg"
      >
        <div className={`flex items-center justify-center py-12 text-gris-una ${TYPOGRAPHY.modal.body}`}>
          Cargando información del criterio...
        </div>
      </DetailsModal>
    );
  }

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Criterio"
      itemName={criterio
        ? `${criterio.criterio_nomenclatura} - ${criterio.criterio_descripcion}`
        : 'Cargando...'}
      itemType="criterio"
      cancelLabel="Cerrar"
      size="lg"
    >
      {criterio && <BasicInfo criterio={criterio} evidenciasCount={evidencias.length} />}
      <Recursos
        evidencias={evidencias}
        filesByEvidencia={filesByEvidencia}
        loadingFiles={loadingFiles}
        onDelete={handleDeleteFile}
        onUpload={handleOpenUpload}
      />
      {criterio && <RolesAcceso criterio={criterio} />}
    </DetailsModal>
  );
};
