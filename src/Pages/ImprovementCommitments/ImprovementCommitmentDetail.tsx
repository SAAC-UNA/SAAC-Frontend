import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { Button } from '@/Components/Ui/Index';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type { CompromisoMejora, CompromisoEstado } from '@/Types/ImprovementCommitmentTypes';

const formatDate = (date?: string) => {
  if (!date) return 'Sin fecha';
  return new Date(date).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const ImprovementCommitmentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compromiso, setCompromiso] = useState<CompromisoMejora | null>(null);
  const [criterionDetail, setCriterionDetail] = useState<any | null>(null);
  const [showCriterionModal, setShowCriterionModal] = useState(false);
  const [evidenceDetails, setEvidenceDetails] = useState<Record<number, any>>({});

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setError('ID de compromiso no válido.');
          return;
        }
        const data = await improvementCommitmentService.obtenerCompromiso(Number(id));
        setCompromiso(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'No se pudo cargar el compromiso.');
      } finally {
        setLoading(false);
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
    setCriterionDetail(item);
    setShowCriterionModal(true);
  };

  const criterionId = criterionDetail?.criterio?.criterio_id;
  const criterionAssignments = criterionId ? getAssignmentsByCriterion(criterionId) : [];
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

  return (
    <ScreenContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/compromisos/listar')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SystemIcons.navigation.arrow.left size="md" className="text-gris-una" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-negro-una">Detalle del Compromiso</h1>
              <p className="text-sm text-gris-una">Visualice criterios, encargados y fechas</p>
            </div>
          </div>
          {compromiso?.estado && estadoBadge(compromiso.estado)}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
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
          <div className="space-y-6">
            {/* Informacion General */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-negro-una mb-4">Informacion general</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gris-una mb-1">Descripcion</p>
                  <p className="text-sm text-negro-una">{compromiso.descripcion || 'Sin descripcion'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gris-una mb-1">Fechas</p>
                  <p className="text-sm text-negro-una">
                    {formatDate(compromiso.fecha_inicio)} - {formatDate(compromiso.fecha_fin)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gris-una mb-1">Ciclo</p>
                  <p className="text-sm text-negro-una">
                    {compromiso.process?.accreditationCycle?.nombre ||
                      (compromiso.process as any)?.accreditation_cycle?.nombre ||
                      'Sin ciclo'}
                  </p>
                </div>
              </div>
            </div>

            {/* Criterios */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-negro-una">Criterios incluidos</h2>
                <span className="text-sm text-gris-una">
                  {selectedCriteria.length} {selectedCriteria.length === 1 ? 'criterio' : 'criterios'}
                </span>
              </div>
              {selectedCriteria.length === 0 ? (
                <p className="text-sm text-gris-una">No hay criterios vinculados.</p>
              ) : (
                <div className="grid gap-3">
                  {selectedCriteria.map((item: any, index: number) => (
                    <button
                      key={`${item.criterio?.criterio_id || index}`}
                      className="border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      onClick={() => handleOpenCriterion(item)}
                      type="button"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-negro-una">
                            {item.criterio?.nomenclatura || 'Criterio'}
                          </p>
                          <p className="text-sm text-gris-una">
                            {item.criterio?.descripcion || 'Sin descripcion'}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          {estadoBadge(getCriterionStatus(item.criterio?.criterio_id) as CompromisoEstado)}
                          <SystemIcons.interface.chevronRight size="md" className="text-gris-una" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
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
            setShowCriterionModal(false);
            setCriterionDetail(null);
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
                  Evidencias asignadas ({criterionAssignments.length})
                </p>
              </div>

              {criterionAssignments.length === 0 ? (
                <p className="text-sm text-gris-una">No hay asignaciones para este criterio.</p>
              ) : (
                <div className="grid gap-3">
                  {criterionAssignments.map((assignment: any) => (
                    <div key={assignment.evidencia_asignacion_id || assignment.evidencia_id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-negro-una">
                            {(assignment.evidence || evidenceDetails[assignment.evidencia_id])?.nomenclatura || `Evidencia ${assignment.evidencia_id}`}
                          </p>
                          <p className="text-sm text-gris-una">
                            {(assignment.evidence || evidenceDetails[assignment.evidencia_id])?.descripcion || 'Sin descripcion'}
                          </p>
                          <p className="text-xs text-gris-una">
                            Encargado: {assignment.user?.nombre || 'Sin usuario'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gris-una">Fecha limite</p>
                          <p className="text-sm text-negro-una">
                            {formatDate(assignment.fecha_limite)}
                          </p>
                          <p className="text-xs text-gris-una mt-2">Estado</p>
                          <p className="text-sm text-negro-una">{assignment.estado || 'Pendiente'}</p>
                        </div>
                      </div>
                      {assignment.comentario && (
                        <p className="text-xs text-gris-una mt-2">Comentario: {assignment.comentario}</p>
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

export default ImprovementCommitmentDetail;
