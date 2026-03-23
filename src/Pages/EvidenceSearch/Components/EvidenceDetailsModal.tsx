/**
 * EvidenceDetailsModal - Modal para mostrar los detalles completos de una evidencia
 *
 * Muestra información detallada de la evidencia incluyendo:
 * - Información básica (criterio, descripción, evidencias asociadas)
 * - Recursos disponibles (archivos y enlaces) agrupados por responsable
 * - Roles con acceso
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Accordion, type EvidenciaEntry } from '@/Components/Ui/Upload/Accordion';
import type { ResponsableGroup } from '@/Components/Ui/Upload/Accordion';
import { fileService } from '@/Services/FileService';
import { evidenceSearchService, mapBackendToFrontend } from '@/Services/EvidenceSearchService';
import type { FileModel } from '@/Types/FileTypes';
import { type EvidenceSearchResult } from '@/Types/EvidenceSearchTypes';
import { useAuth } from '@/Context/AuthContext';
import { AdminFileUploadModal } from './AdminFileUploadModal';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';

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

// Componentes locales de layout

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
  </div>
);

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

export const EvidenceDetailsModal: React.FC<EvidenceDetailsModalProps> = ({
  isOpen,
  onClose,
  criterioId,
}) => {
  const { isSuperUser, isAdmin } = useAuth();
  const isPrivileged = isSuperUser() || isAdmin();

  const [evidencias, setEvidencias] = useState<EvidenceSearchResult[]>([]);
  const [filesByEvidencia, setFilesByEvidencia] = useState<Map<number, FilesByUser[]>>(new Map());
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [adminUpload, setAdminUpload] = useState<{ isOpen: boolean; evidenciaId: number; procesoId: number }>({
    isOpen: false, evidenciaId: 0, procesoId: 0,
  });

  const criterio = evidencias[0] ?? null;

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
    for (const [evId, groups] of filesByEvidencia.entries()) {
      const found = groups.some(g => g.archivos.some(f => f.archivo_id === fileId));
      if (found) {
        await reloadFilesForEvidencia(evId);
        break;
      }
    }
  };

  const handleOpenUpload = (evidenciaId: number, group: ResponsableGroup) => {
    const procesoId = group.archivos.find(f => f.proceso_id)?.proceso_id ?? 0;
    setAdminUpload({ isOpen: true, evidenciaId, procesoId });
  };

  const loadAll = async () => {
    if (!criterioId) return;
    setLoadingFiles(true);
    try {
      const response = await evidenceSearchService.search(
        { criterio: String(criterioId) },
        1,
        100,
      );
      const mapped = response.data.map(mapBackendToFrontend);
      setEvidencias(mapped);

      if (mapped.length > 0 && isPrivileged) {
        const results = await Promise.all(
          mapped.map(ev => fileService.listFiles({ evidencia_id: ev.evidencia_id })),
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
                archivos: [],
              });
            }
            groupMap.get(f.usuario_id)!.archivos.push(f);
          });
          map.set(ev.evidencia_id, Array.from(groupMap.values()));
        });
        setFilesByEvidencia(map);
      }
    } catch (error) {
      console.error('Error al cargar datos del criterio:', error);
      setEvidencias([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  if (!criterioId) return null;

  const accordionEntries: EvidenciaEntry[] = evidencias.map(ev => ({
    evidencia: {
      id: ev.evidencia_id,
      nomenclatura: ev.nomenclatura,
      descripcion: ev.descripcion,
    },
    groups: filesByEvidencia.get(ev.evidencia_id) ?? [],
  }));

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Criterio"
      subtitle={criterio?.criterio_nomenclatura}
      variant="info"
      size="xl"
      maxHeight="xl"
      heroIcon={<SystemIcons.modal.document className={`${ICON_SIZES.md} text-blanco-una`} />}
      showCancel={false}
      showConfirm={false}
    >
      {loadingFiles && evidencias.length === 0 ? (
        <div className={cn('flex items-center justify-center py-12 text-gris-una', TYPOGRAPHY.modal.body)}>
          Cargando información del criterio…
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* INFORMACIÓN DEL CRITERIO */}
          {criterio && (
            <div>
              <SectionLabel label="Información del criterio" />
              <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoCell label="Nomenclatura">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 font-medium')}>
                    {criterio.criterio_nomenclatura}
                  </span>
                </InfoCell>
                <InfoCell label="Evidencias asociadas">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                    {evidencias.length}
                  </span>
                </InfoCell>
                <InfoCell label="Descripción" className="col-span-2">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                    {criterio.criterio_descripcion}
                  </span>
                </InfoCell>
              </div>
            </div>
          )}

          {/* ROLES CON ACCESO */}
          {criterio && criterio.roles_acceso && criterio.roles_acceso.length > 0 && (
            <div>
              <SectionLabel label="Roles con acceso" />
              <div className="border border-gray-200 rounded-corner p-4">
                <div className="flex flex-wrap gap-2">
                  {criterio.roles_acceso.map((rol) => (
                    <span
                      key={rol}
                      className={cn(
                        'inline-flex px-2.5 py-1 font-semibold rounded-full',
                        'bg-azul-una/10 text-azul-una border border-azul-una/20',
                        TYPOGRAPHY.badge,
                      )}
                    >
                      {rol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GESTIÓN DE RECURSOS (solo Superusuario / Administrador) */}
          {isPrivileged && (
            <div>
              <SectionLabel label="Gestión de recursos" />
              <Accordion
                entries={accordionEntries}
                loading={loadingFiles}
                onDelete={handleDeleteFile}
                onUpload={handleOpenUpload}
              />
            </div>
          )}

        </div>
      )}
    </Modal>

    {isPrivileged && (
      <AdminFileUploadModal
        isOpen={adminUpload.isOpen}
        onClose={() => setAdminUpload(prev => ({ ...prev, isOpen: false }))}
        evidenciaId={adminUpload.evidenciaId}
        procesoId={adminUpload.procesoId}
        onSuccess={() => reloadFilesForEvidencia(adminUpload.evidenciaId)}
      />
    )}
  </>
  );
};
