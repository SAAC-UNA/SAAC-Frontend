/**
 * EvidenceResourcesModal - Modal de recursos del criterio
 * Muestra las evidencias del criterio, sus responsables y archivos asociados.
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { DataTable, type DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { FileList } from '@/Components/Ui/Upload/FileList';
import { fileService } from '@/Services/FileService';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import type { FileModel } from '@/Types/FileTypes';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import type { EvidenceSearchResult } from '@/Types/EvidenceSearchTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ASSIGNMENT_STATUS_BADGE, EVIDENCE_STATUS_BADGE } from '@/Constants/StatusBadges';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

interface FilesByUser extends Record<string, unknown> {
  usuario_id: number;
  nombre: string;
  email: string;
  archivos: FileModel[];
  fecha_asignacion: string | null;
  fecha_limite: string | null;
  estado_asignacion: AssignmentStatus | null;
}

export interface EvidenceResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidencias: EvidenceSearchResult[];
  criterioNomenclatura?: string;
}

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/** Carga lazy de responsables y archivos para una evidencia concreta */
const EvidenciaResponsablesPanel: React.FC<{ evidenciaId: number }> = ({ evidenciaId }) => {
  const firstColumn = useFirstColumnConfig();
  const [groups, setGroups] = useState<FilesByUser[]>([]);
  const [loading, setLoading] = useState(true);

  const responsablesColumns: DataTableColumn<FilesByUser>[] = [
    {
      key: 'nombre',
      header: 'Responsable',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {item.nombre as string}
        </span>
      ),
    },
    {
      key: 'fecha_asignacion',
      header: 'Fecha Asignación',
      align: 'center',
      render: (_, item) => (
        <span className={`text-gris-una-2 ${TYPOGRAPHY.table.cell}`}>
          {formatDate(item.fecha_asignacion as string | null)}
        </span>
      ),
    },
    {
      key: 'fecha_limite',
      header: 'Fecha Límite',
      align: 'center',
      render: (_, item) => (
        <span className={`text-gris-una-2 ${TYPOGRAPHY.table.cell}`}>
          {formatDate(item.fecha_limite as string | null)}
        </span>
      ),
    },
    {
      key: 'estado_asignacion',
      header: 'Estado',
      align: 'center',
      render: (_, item) => {
        const estado = item.estado_asignacion as AssignmentStatus | null;
        if (!estado) return <span className={`text-gris-una-2 ${TYPOGRAPHY.table.cell}`}>—</span>;
        return (
          <div className="flex items-center justify-center">
            <StatusBadge
              label={ASSIGNMENT_STATUS_BADGE[estado].label}
              colorClasses={ASSIGNMENT_STATUS_BADGE[estado].colorClasses}
            />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fileService.listFiles({ evidencia_id: evidenciaId }),
      evidenceAssignmentService.getAssignmentsByEvidence(evidenciaId).catch(() => []),
    ])
      .then(([files, assignments]) => {
        const assignmentMap = new Map(
          assignments.map(a => [a.usuario_id, {
            fecha_asignacion: a.fecha_asignacion,
            fecha_limite: a.fecha_limite ?? null,
            estado: a.estado,
          }])
        );
        const groupMap = new Map<number, FilesByUser>();
        files.forEach((f) => {
          if (!groupMap.has(f.usuario_id)) {
            const asig = assignmentMap.get(f.usuario_id);
            groupMap.set(f.usuario_id, {
              usuario_id: f.usuario_id,
              nombre: f.usuario?.nombre_completo ?? `Usuario ${f.usuario_id}`,
              email: f.usuario?.email ?? '',
              archivos: [],
              fecha_asignacion: asig?.fecha_asignacion ?? null,
              fecha_limite: asig?.fecha_limite ?? null,
              estado_asignacion: asig?.estado ?? null,
            });
          }
          groupMap.get(f.usuario_id)!.archivos.push(f);
        });
        assignments.forEach(a => {
          if (!groupMap.has(a.usuario_id)) {
            groupMap.set(a.usuario_id, {
              usuario_id: a.usuario_id,
              nombre: a.usuario?.nombre ?? `Usuario ${a.usuario_id}`,
              email: a.usuario?.email ?? '',
              archivos: [],
              fecha_asignacion: a.fecha_asignacion,
              fecha_limite: a.fecha_limite ?? null,
              estado_asignacion: a.estado,
            });
          }
        });
        setGroups(Array.from(groupMap.values()));
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [evidenciaId]);

  return (
    <DataTable<FilesByUser>
      title=""
      searchable={false}
      loading={loading}
      data={groups}
      columns={responsablesColumns}
      getRowKey={(item) => String(item.usuario_id)}
      emptyMessage="Sin responsables asignados"
      unstyled
      expandableRow={(group) => (
        <FileList
          files={group.archivos as FileModel[]}
          loading={false}
          showActions={true}
          emptyMessage="Sin archivos"
        />
      )}
    />
  );
};

export const EvidenceResourcesModal: React.FC<EvidenceResourcesModalProps> = ({
  isOpen,
  onClose,
  evidencias,
  criterioNomenclatura,
}) => {
  const firstColumn = useFirstColumnConfig();

  const evidenceColumns: DataTableColumn<EvidenceSearchResult>[] = [
    {
      key: 'evidencia',
      header: 'Evidencia',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <div className="flex flex-col pl-2">
          <span className={`font-bold text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {item.nomenclatura}
          </span>
          <span className={`text-gris-una-2 ${TYPOGRAPHY.table.cell}`}>
            {item.descripcion}
          </span>
        </div>
      ),
    },
    {
      key: 'recursos',
      header: 'Recursos',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2">
          {item.archivos_count > 0 && (
            <StatusBadge
              label={`${item.archivos_count} ${item.archivos_count === 1 ? 'archivo' : 'archivos'}`}
              colorClasses="bg-info-ring text-info-dark"
            />
          )}
          {item.enlaces_count > 0 && (
            <StatusBadge
              label={`${item.enlaces_count} ${item.enlaces_count === 1 ? 'enlace' : 'enlaces'}`}
              colorClasses="bg-morado-ring text-morado-dark"
            />
          )}
          {item.archivos_count === 0 && item.enlaces_count === 0 && (
            <StatusBadge label="Sin recursos" colorClasses="bg-gris-light text-gris-una" />
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <StatusBadge
            label={EVIDENCE_STATUS_BADGE[item.estado].label}
            colorClasses={EVIDENCE_STATUS_BADGE[item.estado].colorClasses}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recursos del criterio"
      subtitle={criterioNomenclatura}
      variant="neutral"
      heroIcon={<SystemIcons.actions.list className={`${ICON_SIZES.md} text-blanco-una`} />}
      size="xl"
      maxHeight="full"
      closable
      showCancel={false}
      showConfirm={false}
    >
      <div className="px-1 py-2">
        <DataTable
          title=""
          searchable={false}
          loading={false}
          data={evidencias as any}
          columns={evidenceColumns as any}
          getRowKey={(item: any) => String(item.evidencia_id)}
          emptyMessage="No hay evidencias para este criterio"
          unstyled
          expandableRow={(evidencia: any) => (
            <EvidenciaResponsablesPanel evidenciaId={evidencia.evidencia_id} />
          )}
        />
      </div>
    </Modal>
  );
};
