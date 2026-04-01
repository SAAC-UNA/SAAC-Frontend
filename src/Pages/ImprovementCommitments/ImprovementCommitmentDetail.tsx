import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { Button, PageHeader, Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Index';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type { CompromisoMejora, CompromisoEstado } from '@/Types/ImprovementCommitmentTypes';
import { DataTable } from '@/components/index';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';

const formatDate = (date?: string) => {
  if (!date) return 'Sin fecha';
  return new Date(date).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const ImprovementCommitmentDetail: React.FC = () => {
  const moduleInfo = getModuleInfo('improvement_commitments');
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetchState, setFetchState] = useState<{ loading: boolean; error: string | null; compromiso: CompromisoMejora | null }>({ loading: true, error: null, compromiso: null });
  const loading = fetchState.loading;
  const error = fetchState.error;
  const compromiso = fetchState.compromiso;
  const [criterionModal, setCriterionModal] = useState<{ criterionDetail: any | null; showCriterionModal: boolean }>({ criterionDetail: null, showCriterionModal: false });
  const criterionDetail = criterionModal.criterionDetail;
  const showCriterionModal = criterionModal.showCriterionModal;
  const [evidenceDetails, setEvidenceDetails] = useState<Record<number, any>>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        if (!id) throw new Error('ID de compromiso no válido.');
        const data = await improvementCommitmentService.obtenerCompromiso(Number(id));
        setFetchState({ loading: false, error: null, compromiso: data });
      } catch (err: any) {
        setFetchState({ loading: false, error: err?.response?.data?.message || err?.message || 'No se pudo cargar el compromiso.', compromiso: null });
      }
    };

    fetchDetalle();
  }, [id]);

  const assignedEvidences = useMemo(() => {
    const anyCompromiso = compromiso as any;
    return anyCompromiso?.assigned_evidences || compromiso?.assignedEvidences || [];
  }, [compromiso]);

  useEffect(() => {
    const loadEvidenceDetails = async () => {
      const ids = Array.from(
        new Set(
          assignedEvidences
            .map((a: any) => a.evidencia_id)
            .filter((id: unknown): id is number => typeof id === 'number')
        )
      ) as number[];

      if (ids.length === 0) {
        setEvidenceDetails({});
        return;
      }

      const results = await Promise.all(
        ids.map(id => improvementCommitmentService.obtenerEvidencia(id).catch(() => null))
      );

      const map: Record<number, any> = {};
      results.forEach((e) => {
        if (e?.evidencia_id) {
          map[e.evidencia_id] = e;
        }
      });

      setEvidenceDetails(map);
    };

    loadEvidenceDetails();
  }, [assignedEvidences]);

  const selectedCriteria = useMemo(() => {
    return (compromiso?.selecciones || []).filter((s: any) => s.criterio);
  }, [compromiso]);

  const getAssignmentsByCriterion = (criterionId?: number) => {
    if (!criterionId) return [];
    return assignedEvidences.filter((assignment: any) => {
      const evidence = evidenceDetails[assignment.evidencia_id] || assignment.evidence;
      return evidence?.criterio_id === criterionId;
    });
  };

  const getCriterionStatus = (criterionId?: number) => {
    const asignaciones = getAssignmentsByCriterion(criterionId);
    if (asignaciones.length === 0) return 'Pendiente';

    const estados = asignaciones.map((a: any) => a.estado);
    if (estados.some((e: string) => e === 'Vencido')) return 'Vencido';
    if (estados.every((e: string) => e === 'Completado')) return 'Completado';
    if (estados.some((e: string) => e === 'En Progreso')) return 'En Progreso';
    return 'Pendiente';
  };

  const handleOpenCriterion = (item: any) => {
    setCriterionModal({ criterionDetail: item, showCriterionModal: true });
  };

  const criterionId = criterionDetail?.criterio?.criterio_id;
  const criterionAssignments = criterionId ? getAssignmentsByCriterion(criterionId) : [];
  const groupedByEvidence = useMemo(() => {
    const groups = new Map<number, {
      evidenciaId: number;
      nomenclatura: string;
      descripcion: string;
      fechaLimite: string | undefined;
      estado: string;
      comentario: string | undefined;
      usuarios: string[];
      roles: string[];
      totalAsignaciones: number;
    }>();

    for (const assignment of criterionAssignments as any[]) {
      const evidenciaId = assignment.evidencia_id;
      const evidence = assignment.evidence || evidenceDetails[evidenciaId];
      const userName = assignment.user?.nombre;
      const roleNamesFromUser = Array.isArray(assignment.user?.roles)
        ? assignment.user.roles
            .map((role: any) => role?.name)
            .filter((name: unknown): name is string => typeof name === 'string' && name.trim().length > 0)
        : [];
      const roleNameFromAssignment = typeof assignment.role?.name === 'string' && assignment.role.name.trim().length > 0
        ? assignment.role.name
        : null;

      if (!groups.has(evidenciaId)) {
        groups.set(evidenciaId, {
          evidenciaId,
          nomenclatura: evidence?.nomenclatura || `Evidencia ${evidenciaId}`,
          descripcion: evidence?.descripcion || 'Sin descripcion',
          fechaLimite: assignment.fecha_limite,
          estado: assignment.estado || 'Pendiente',
          comentario: assignment.comentario,
          usuarios: userName ? [userName] : [],
          roles: [
            ...roleNamesFromUser,
            ...(roleNameFromAssignment ? [roleNameFromAssignment] : []),
          ],
          totalAsignaciones: 1,
        });
      } else {
        const current = groups.get(evidenciaId)!;
        if (userName && !current.usuarios.includes(userName)) {
          current.usuarios.push(userName);
        }
        for (const roleName of roleNamesFromUser) {
          if (!current.roles.includes(roleName)) {
            current.roles.push(roleName);
          }
        }
        if (roleNameFromAssignment && !current.roles.includes(roleNameFromAssignment)) {
          current.roles.push(roleNameFromAssignment);
        }
        current.totalAsignaciones += 1;
        if (!current.fechaLimite && assignment.fecha_limite) {
          current.fechaLimite = assignment.fecha_limite;
        }
      }
    }

    return Array.from(groups.values());
  }, [criterionAssignments, evidenceDetails]);
  const criterionStatus = criterionId ? getCriterionStatus(criterionId) : 'Pendiente';

  const estadoBadge = (estado?: CompromisoEstado) => {
    if (!estado) return null;
    const badges: Record<CompromisoEstado, { bg: string; text: string; icon: any }> = {
      'Pendiente': {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-800',
        icon: SystemIcons.interface.clock
      },
      'En Progreso': {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        icon: SystemIcons.interface.refresh
      },
      'Completado': {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-800',
        icon: SystemIcons.interface.checkCircle
      },
      'Vencido': {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        icon: SystemIcons.interface.alert
      }
    };

    const badge = badges[estado] || badges.Pendiente;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text}`}>
        <Icon size="xs" className="w-3 h-3" />
        {estado}
      </span>
    );
  };

  // Paginación para criterios
  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const totalPages = Math.ceil(selectedCriteria.length / itemsPerPage);
  const paginatedCriteria = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return selectedCriteria.slice(start, end);
  }, [selectedCriteria, currentPage]);

  // Columnas del DataTable de criterios
  const criteriaColumns: DataTableColumn<any>[] = [
    {
      key: 'nomenclatura',
      header: 'Nomenclatura',
      align: 'center',
      width: '150px',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-medium leading-normal text-negro-una ${TYPOGRAPHY.table.cell}`}>
          {item.criterio?.nomenclatura || 'Criterio'}
        </p>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      align: 'left',
      render: (_, item) => (
        <p 
          className={`block font-sans antialiased font-normal leading-normal text-gris-una max-w-2xl truncate ${TYPOGRAPHY.table.cell}`}
          title={item.criterio?.descripcion || 'Sin descripción'}
        >
          {item.criterio?.descripcion || 'Sin descripción'}
        </p>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      width: '150px',
      render: (_, item) => (
        <div className="w-max mx-auto">
          {estadoBadge(getCriterionStatus(item.criterio?.criterio_id) as CompromisoEstado)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: '100px',
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip="Ver detalles"
            onClick={() => handleOpenCriterion(item)}
            className={TABLE_ACTION_BUTTON.button}
          >
            <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
          </ButtonWithTooltip>
        </div>
      )
    }
  ];

  return (
    <ScreenContainer>
      <div className="space-y-4">
        {/* Header con botón volver integrado */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/compromisos/listar')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 -mt-1"
              >
                <SystemIcons.navigation.arrow.left size="md" className="text-gris-una" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Volver a la lista</TooltipContent>
          </Tooltip>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <PageHeader
                  title={`Detalle del ${moduleInfo.title.replace('Compromisos de Mejora', 'Compromiso')}`}
                  description="Visualice criterios, encargados y fechas"
                />
              </div>
              <div className="flex items-center gap-4 pt-1">
                {/* Info general compacta en el header */}
                {compromiso && (
                  <div className="flex items-center gap-4 text-xs text-gris-una bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <SystemIcons.interface.calendar size="xs" className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">
                        {formatDate(compromiso.fecha_inicio)} - {formatDate(compromiso.fecha_fin)}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1.5">
                      <SystemIcons.modal.document size="xs" className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">
                        {compromiso.process?.accreditationCycle?.nombre ||
                          (compromiso.process as any)?.accreditation_cycle?.nombre ||
                          'Sin ciclo'}
                      </span>
                    </div>
                  </div>
                )}
                {compromiso?.estado && estadoBadge(compromiso.estado)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="relative py-12 min-h-[400px]">
            <LoadingSpinner variant="loader" />
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-rojo-una-2">{error}</p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => navigate('/compromisos/listar')}>
                Volver
              </Button>
            </div>
          </div>
        ) : compromiso ? (
          <div className="space-y-4">
            {/* Descripción del compromiso - sin card */}
            {compromiso.descripcion && (
              <div className="px-1">
                <p className="text-sm text-gris-una mb-1 font-medium">Descripción</p>
                <p className="text-sm text-negro-una">{compromiso.descripcion}</p>
              </div>
            )}

            {/* Criterios - tabla directa sin card */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold text-negro-una">Criterios incluidos</h2>
                <span className="text-xs text-gris-una">
                  {selectedCriteria.length} {selectedCriteria.length === 1 ? 'criterio' : 'criterios'}
                </span>
              </div>
              {selectedCriteria.length === 0 ? (
                <p className="text-sm text-gris-una px-1">No hay criterios vinculados.</p>
              ) : (
                <DataTable
                  data={paginatedCriteria as any}
                  columns={criteriaColumns as any}
                  title=""
                  searchable={false}
                  pagination={totalPages > 1 ? {
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage
                  } : undefined}
                  loading={false}
                  emptyMessage="No hay criterios vinculados."
                />
              )}
            </div>

          </div>
        ) : null}
      </div>

      {/* Modal detalle de criterio (solo lectura) */}
      {showCriterionModal && criterionDetail && (
        <Modal
          isOpen={showCriterionModal}
          onClose={() => {
            setCriterionModal({ criterionDetail: null, showCriterionModal: false });
          }}
          title={`Detalle: ${criterionDetail?.criterio?.nomenclatura || 'Criterio'}`}
          size="lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.4fr] gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gris-una mb-1">Descripcion</p>
                <p className="text-sm text-negro-una">
                  {criterionDetail?.criterio?.descripcion || 'Sin descripcion'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gris-una mb-1">Estado</p>
                {estadoBadge(criterionStatus as CompromisoEstado)}
              </div>

              <div>
                <p className="text-xs font-medium text-gris-una mb-1">Fecha limite</p>
                <p className="text-sm text-negro-una">
                  {(() => {
                    const fechas = Array.from(
                      new Set(
                        criterionAssignments
                          .map((a: any) => a.fecha_limite)
                          .filter((date: unknown): date is string => typeof date === 'string')
                      )
                    ) as string[];
                    if (fechas.length === 0) return 'Sin fecha';
                    if (fechas.length === 1) return formatDate(fechas[0]);
                    return 'Varias fechas';
                  })()}
                </p>
              </div>

              {(() => {
                const comentarios = Array.from(
                  new Set(
                    criterionAssignments
                      .map((a: any) => a.comentario)
                      .filter((comment: unknown): comment is string => typeof comment === 'string')
                  )
                ) as string[];
                if (comentarios.length === 0) return null;
                return (
                  <div>
                    <p className="text-xs font-medium text-gris-una mb-1">Comentario</p>
                    <p className="text-sm text-negro-una">
                      {comentarios.length === 1 ? comentarios[0] : 'Varios comentarios'}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gris-una">
                  Evidencias asignadas ({groupedByEvidence.length})
                </p>
              </div>

              {groupedByEvidence.length === 0 ? (
                <p className="text-sm text-gris-una">No hay asignaciones para este criterio.</p>
              ) : (
                <div className="grid gap-3">
                  {groupedByEvidence.map((item) => (
                    <div key={item.evidenciaId} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-negro-una">
                            {item.nomenclatura}
                          </p>
                          <p className="text-sm text-gris-una">
                            {item.descripcion}
                          </p>
                          <p className="text-xs text-gris-una">
                            {item.usuarios.length} usuario(s)
                          </p>
                          <p className="text-xs text-gris-una">
                            {item.roles.length} rol(es)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gris-una">Fecha limite</p>
                          <p className="text-sm text-negro-una">
                            {formatDate(item.fechaLimite)}
                          </p>
                          <p className="text-xs text-gris-una mt-2">Estado</p>
                          <p className="text-sm text-negro-una">{item.estado}</p>
                        </div>
                      </div>
                      {item.comentario && (
                        <p className="text-xs text-gris-una mt-2">Comentario: {item.comentario}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </ScreenContainer>
  );
};

