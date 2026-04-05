import React from "react";
import {
  ScreenContainer,
  PageHeader,
  Button,
  LoadingSpinner,
  MultiSelect,
  DataTable,
} from "@/Components/Ui/Index";
import { DateRangePicker } from "@/Components/Ui/Calendar/DateRangePicker";
import { Card } from "@/Components/Ui/Layout/Card";
import { ScrollReveal } from "@/Components/Ui/Layout/ScrollReveal";
import { UserAvatars } from "@/Components/Ui/UserAvatars/UserAvatars";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal.tsx";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal.tsx";
import { Textarea } from "@/Components/Ui/Forms/Textarea";
import { BackendErrorAlert } from "@/Components/Ui/Feedback/BackendErrorAlert";
import { TreeSelect } from "@/Components/Ui/Forms/TreeSelect";
import { TYPOGRAPHY } from "@/Constants/Typography";
import type { DuplicateAssignment } from "@/Types/EvidenceAssignment";
import type { EvidenceAssignmentViewProps, DuplicateGroupRow } from "../EvidenceAssignment";
import { formatDateShort } from "@/Utils/DateUtils";
import type { ExpandableChildItem } from "@/Components/Ui/Table/DataTable";

// ---------------------------------------------------------------------------
// EvidenceAssignmentView — componente de presentación puro
// ---------------------------------------------------------------------------

export const EvidenceAssignmentView: React.FC<EvidenceAssignmentViewProps> = ({
  moduleInfo,
  criteriaLoading,
  criterionOptions,
  evidenceOptions,
  userOptions,
  roleOptions,
  userError,
  roleError,
  onRetryUsers,
  onRetryRoles,
  availableEvidencesCount,
  formData,
  updateFormData,
  errors,
  today,
  assignmentTableRows,
  assignmentColumns,
  duplicatesValidating,
  activeDuplicates,
  completedDuplicates,
  activeDuplicateRows,
  completedDuplicateRows,
  evidenceById,
  excludedCompletedPairs,
  toggleCompletedPair,
  toggleAllCompletedPairsForUser,
  setExcludedCompletedPairs,
  isSubmitting,
  showSuccessModal,
  showConfirmModal,
  assignedEvidencesCount,
  onFormSubmit,
  onConfirmedSubmit,
  onCloseConfirmModal,
  onCloseSuccessModal,
  criteriaEvidences,
  selectedAvatars,
  isFlexible,
  flexElements,
}) => {
  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
      />

      {criteriaLoading ? (
        <Card className="relative py-16 min-h-100">
          <LoadingSpinner variant="loader" />
        </Card>
      ) : (
        <div className="space-y-6">

          {/* ── Sección 1: Asignaciones + Destinatarios ── */}
          <ScrollReveal delay={0}>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2.2fr] gap-6 items-start">

            {/* Card: Criterios y Evidencias */}
            <Card className="p-6 space-y-6">

              {/* Contadores rápidos */}
              <div className="flex items-center justify-between">
                <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>
                  Asignaciones
                </h2>
                <div className="flex items-center gap-3">
                  {isFlexible ? (
                    <div className="rounded-corner bg-blanco-una px-3 py-1.5 border border-gris-una/15 text-center">
                      <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Elementos</p>
                      <p className={`${TYPOGRAPHY.form.helper} font-semibold text-gris-una`}>{formData.selectedElements.length}</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-corner bg-blanco-una px-3 py-1.5 border border-gris-una/15 text-center">
                        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Criterios</p>
                        <p className={`${TYPOGRAPHY.form.helper} font-semibold text-gris-una`}>{formData.selectedCriteria.length}</p>
                      </div>
                      <div className="rounded-corner bg-blanco-una px-3 py-1.5 border border-gris-una/15 text-center">
                        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Evidencias</p>
                        <p className={`${TYPOGRAPHY.form.helper} font-semibold text-gris-una`}>{formData.selectedEvidences.length}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Errores de validación */}
              {(errors.proceso || errors.evidences || errors.destinatarios) && (
                <div className="space-y-2">
                  {errors.proceso && (
                    <div className={`${TYPOGRAPHY.form.helper} text-rojo-una-2 bg-rojo-una-2/5 border border-rojo-una-2/20 rounded-corner px-3 py-2`}>
                      {errors.proceso}
                    </div>
                  )}
                  {errors.evidences && (
                    <div className={`${TYPOGRAPHY.form.helper} text-rojo-una-2 bg-rojo-una-2/5 border border-rojo-una-2/20 rounded-corner px-3 py-2`}>
                      {errors.evidences}
                    </div>
                  )}
                  {errors.destinatarios && (
                    <div className={`${TYPOGRAPHY.form.helper} text-rojo-una-2 bg-rojo-una-2/5 border border-rojo-una-2/20 rounded-corner px-3 py-2`}>
                      {errors.destinatarios}
                    </div>
                  )}
                </div>
              )}

              {/* Selectores: modo flexible vs tradicional */}
              {isFlexible ? (
                <div>
                  <TreeSelect
                    label="Elementos a asignar"
                    elements={flexElements}
                    value={formData.selectedElements}
                    onChange={(ids) => updateFormData({ selectedElements: ids })}
                    mode="select"
                    multiple
                    showPath
                    placeholder="Seleccione elementos..."
                    required
                  />
                  <p className={`mt-1.5 ${TYPOGRAPHY.form.helper} text-gris-una`}>
                    Navegue la jerarquía del modelo para seleccionar elementos a asignar.
                  </p>
                </div>
              ) : (
                <>
                  {/* Criterios de Evaluación */}
                  <div>
                    <MultiSelect
                      label="Criterios de Evaluación"
                      options={criterionOptions}
                      value={formData.selectedCriteria.map(String)}
                      onChange={(vals) => {
                        const ids = vals.map((v) => parseInt(v, 10));
                        const set = new Set(ids);
                        const filtered = formData.selectedEvidences.filter((id) => {
                          const ev = criteriaEvidences.find((e) => e.evidencia_id === id);
                          return ev ? set.has(ev.criterio_id) : false;
                        });
                        updateFormData({
                          criterio_id: ids.length > 0 ? ids[0] : null,
                          selectedCriteria: ids,
                          selectedEvidences: filtered,
                        });
                      }}
                      placeholder="Seleccione uno o varios criterios..."
                      required
                      selectAllText="Seleccionar todos"
                      deselectAllText="Deseleccionar todos"
                      showSelectAll
                    />
                    <p className={`mt-1.5 ${TYPOGRAPHY.form.helper} text-gris-una`}>
                      Defina las evidencias disponibles para asignar.
                    </p>
                  </div>

                  {/* Evidencias a asignar */}
                  <div>
                    <MultiSelect
                      label="Evidencias a asignar"
                      options={evidenceOptions}
                      value={formData.selectedEvidences.map(String)}
                      onChange={(vals) =>
                        updateFormData({ selectedEvidences: vals.map((v) => parseInt(v, 10)) })
                      }
                      placeholder={
                        formData.selectedCriteria.length > 0
                          ? "Seleccione evidencias..."
                          : "Primero seleccione al menos un criterio"
                      }
                      required
                      selectAllText="Seleccionar todas"
                      deselectAllText="Deseleccionar todas"
                      showSelectAll
                      disabled={formData.selectedCriteria.length === 0}
                    />
                    <p className={`mt-1.5 ${TYPOGRAPHY.form.helper} text-gris-una`}>
                      Mostrando {availableEvidencesCount} evidencias de{" "}
                      {formData.selectedCriteria.length}{" "}
                      {formData.selectedCriteria.length === 1 ? "criterio" : "criterios"} seleccionados.
                    </p>
                  </div>
                </>
              )}
            </Card>

            {/* Card: Destinatarios */}
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>
                  Destinatarios
                </h2>
                <div className="rounded-corner bg-blanco-una px-3 py-1.5 border border-gris-una/15 text-center">
                  <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Seleccionados</p>
                  <p className={`${TYPOGRAPHY.form.helper} font-semibold text-gris-una`}>
                    {formData.selectedUsers.length + formData.selectedRoles.length}
                  </p>
                </div>
              </div>

              {/* Usuarios */}
              <div>
                {userError ? (
                  <BackendErrorAlert error={userError} onRetry={onRetryUsers} />
                ) : (
                  <MultiSelect
                    label="Usuarios"
                    options={userOptions}
                    value={formData.selectedUsers.map(String)}
                    onChange={(vals) => updateFormData({ selectedUsers: vals.map(Number) })}
                    placeholder="Seleccione usuarios..."
                    selectAllText="Seleccionar todos"
                    deselectAllText="Deseleccionar todos"
                    showSelectAll
                  />
                )}
                <p className={`mt-1.5 ${TYPOGRAPHY.form.helper} text-gris-una`}>
                  Usuarios que recibirán acceso a las evidencias asignadas.
                </p>
              </div>

              {/* Roles */}
              <div>
                {roleError ? (
                  <BackendErrorAlert error={roleError} onRetry={onRetryRoles} />
                ) : (
                  <MultiSelect
                    label="Roles"
                    options={roleOptions}
                    value={formData.selectedRoles.map(String)}
                    onChange={(vals) => updateFormData({ selectedRoles: vals.map(Number) })}
                    placeholder="Seleccione roles..."
                    selectAllText="Seleccionar todos"
                    deselectAllText="Deseleccionar todos"
                    showSelectAll
                  />
                )}
                <p className={`mt-1.5 ${TYPOGRAPHY.form.helper} text-gris-una`}>
                  Todos los usuarios del rol recibirán las evidencias asignadas.
                </p>
              </div>
            </Card>

          </div>
          </ScrollReveal>

          {/* ── Sección 2: Fecha y comentario ── */}
          <ScrollReveal delay={0.08}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            {/* Card: Fecha límite */}
            <Card className="p-6 space-y-4 h-full">
              <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>
                Fecha límite
                <span className={`ml-2 ${TYPOGRAPHY.form.helper} font-normal text-gris-una`}>(opcional)</span>
              </h2>
              <DateRangePicker
                inline
                compact
                value={{ to: formData.fecha_limite || undefined }}
                onChange={(range) => updateFormData({ fecha_limite: range.to ?? "" })}
                minDate={today}
                placeholder="Selecciona la fecha límite..."
                error={errors.fecha_limite}
              />
            </Card>

            {/* Card: Comentario */}
            <Card className="p-6 space-y-4 h-full">
              <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>
                Comentario
                <span className={`ml-2 ${TYPOGRAPHY.form.helper} font-normal text-gris-una`}>(opcional)</span>
              </h2>
              <Textarea
                label="Comentario sobre la Asignación"
                value={formData.comentario ?? ""}
                onChange={(e) => updateFormData({ comentario: e.target.value })}
                placeholder="Añada instrucciones especiales, contexto o notas sobre esta asignación..."
                rows={8}
                maxLength={500}
                characterCount
                error={errors.comentario}
                helperText="Instrucciones opcionales para los destinatarios"
              />
            </Card>

          </div>
          </ScrollReveal>

          {/* ── Sección 3: Tabla de resumen ── */}
          <ScrollReveal delay={0.14}>
          <DataTable
              title="Resumen de asignaciones"
              data={assignmentTableRows}
              columns={assignmentColumns.map((col) =>
                col.key === "destinatarios"
                  ? {
                      ...col,
                      render: () =>
                        selectedAvatars.length > 0 ? (
                          <div className="flex justify-center">
                            <UserAvatars
                              users={selectedAvatars}
                              size={32}
                              maxVisible={5}
                              tooltipPlacement="top"
                            />
                          </div>
                        ) : (
                          <span className={`${TYPOGRAPHY.table.cell} text-gris-una/50`}>Sin destinatarios</span>
                        ),
                    }
                  : col
              )}
              searchable={false}
              loading={false}
              getRowKey={(row) => row.id as string}
              emptyMessage={
                <p className={`${TYPOGRAPHY.emptyState.descriptionCompact} text-gris-una py-6 text-center`}>
                  {isFlexible
                    ? "Selecciona elementos para ver el resumen"
                    : "Selecciona criterios y evidencias para ver el resumen"}
                </p>
              }
            />
          </ScrollReveal>

          {/* ── Sección 4: Tablas de duplicados ── */}
          {duplicatesValidating && (
            <div className="rounded-corner border border-info-ring bg-info-light p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 border-2 border-azul-una border-t-transparent rounded-full animate-spin shrink-0"
                  role="status"
                  aria-label="Cargando..."
                />
                <p className="text-sm text-info">Validando asignaciones existentes...</p>
              </div>
            </div>
          )}

          {!duplicatesValidating && (activeDuplicates.length > 0 || completedDuplicates.length > 0) && (
            <div className="space-y-4">

              {/* Tabla amarilla — duplicados activos */}
              {activeDuplicates.length > 0 && (
                <Card className="overflow-hidden border-2 border-warning-ring bg-warning-light">
                  <div className="px-6 pt-6 pb-2">
                    <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>Asignaciones Duplicadas</h2>
                    <p className={`mt-1 ${TYPOGRAPHY.table.helper} text-gris-una`}>Usuarios con asignaciones pendientes en progreso. No se pueden reasignar.</p>
                  </div>
                  <DataTable<DuplicateGroupRow>
                    unstyled
                    data={activeDuplicateRows}
                    columns={[
                      {
                        key: 'usuario',
                        header: 'Usuario',
                        align: 'left',
                        render: (_, row) => (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning text-white font-bold text-xs shrink-0">
                              {row.evidences.length}
                            </div>
                            <p className={`${TYPOGRAPHY.table.cell} font-semibold text-warning-dark`}>{row.usuario_nombre}</p>
                          </div>
                        ),
                      },
                    ]}
                    getRowKey={(row) => row.id.toString()}
                    searchable={false}
                    expandableRow={(item): ExpandableChildItem[] =>
                      item.evidences.map((dup) => ({
                        key: `act-sub-${dup.asignacion_id ?? dup.evidencia_id}`,
                        content: (
                          <div className={`flex items-center gap-2 flex-1 min-w-0 ${TYPOGRAPHY.table.cell}`}>
                            <span className="font-semibold text-negro-una">{evidenceById[dup.evidencia_id]?.nomenclatura ?? 'N/A'}</span>
                            <span className="text-gris-una">—</span>
                            <span className="text-negro-una truncate">{evidenceById[dup.evidencia_id]?.descripcion ?? ''}</span>
                          </div>
                        ),
                        action: (
                            <span className={`text-gris-una shrink-0 ${TYPOGRAPHY.table.cell}`}>{formatDateShort(dup.fecha_asignacion)}</span>
                        ),
                      }))
                    }
                  />
                  <div className="px-6 pb-6">
                    <div className={`p-3 bg-warning-light rounded-corner border border-warning-ring ${TYPOGRAPHY.table.helper} text-warning-dark`}>
                      <strong>Bloqueado automáticamente:</strong> Estos usuarios fueron excluidos; ya tienen
                      evidencias asignadas en estado activo. No se pueden crear asignaciones duplicadas
                      mientras no estén completadas o canceladas.
                    </div>
                  </div>
                </Card>
              )}

              {/* Tabla azul — completados */}
              {completedDuplicates.length > 0 && (
                <Card className="overflow-hidden border-2 border-info-ring bg-info-light">
                  <div className="px-6 pt-6 pb-2">
                    <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>Evidencias Ya Completadas</h2>
                    <div className="flex items-center justify-between gap-4 mt-1">
                      <p className={`${TYPOGRAPHY.table.helper} text-gris-una`}>Usuarios que ya completaron estas evidencias. Puede reasignarlas si es necesario.</p>
                      <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                        <input
                          type="checkbox"
                          checked={completedDuplicates.every((d: DuplicateAssignment) =>
                            !excludedCompletedPairs.some((p) => p.usuario_id === d.usuario_id && p.evidencia_id === d.evidencia_id)
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExcludedCompletedPairs([]);
                            } else {
                              setExcludedCompletedPairs(
                                completedDuplicates.map((d: DuplicateAssignment) => ({ usuario_id: d.usuario_id, evidencia_id: d.evidencia_id }))
                              );
                            }
                          }}
                          className="w-3 h-3 rounded border-info-ring text-info focus:ring-info cursor-pointer"
                        />
                        <span className={`${TYPOGRAPHY.form.helper} text-info-dark`}>Seleccionar todos</span>
                      </label>
                    </div>
                  </div>
                  <DataTable<DuplicateGroupRow>
                    unstyled
                    data={completedDuplicateRows}
                    columns={[
                      {
                        key: 'seleccion',
                        header: 'Reasignar',
                        align: 'center',
                        width: '90px',
                        render: (_, row) => (
                          <input
                            type="checkbox"
                            checked={row.evidences.every((e: DuplicateAssignment) =>
                              !excludedCompletedPairs.some((p) => p.usuario_id === e.usuario_id && p.evidencia_id === e.evidencia_id)
                            )}
                            onChange={(e) => { e.stopPropagation(); toggleAllCompletedPairsForUser(row.evidences); }}
                            className="w-3 h-3 rounded border-info-ring text-info focus:ring-info cursor-pointer"
                            aria-label={`Reasignar a ${row.usuario_nombre}`}
                          />
                        ),
                      },
                      {
                        key: 'usuario',
                        header: 'Usuario',
                        align: 'left',
                        render: (_, row) => (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-info text-white font-bold text-xs shrink-0">
                              {row.evidences.length}
                            </div>
                            <p className={`${TYPOGRAPHY.table.cell} font-semibold text-info-dark`}>{row.usuario_nombre}</p>
                          </div>
                        ),
                      },
                    ]}
                    getRowKey={(row) => row.id.toString()}
                    searchable={false}
                    expandableRow={(item): ExpandableChildItem[] =>
                      item.evidences.map((dup: DuplicateAssignment) => {
                        const isExcluded = excludedCompletedPairs.some(
                          (p) => p.usuario_id === dup.usuario_id && p.evidencia_id === dup.evidencia_id
                        );
                        return {
                          key: `comp-sub-${dup.asignacion_id ?? dup.evidencia_id}`,
                          content: (
                            <div className={`flex items-center gap-2 flex-1 min-w-0 ${TYPOGRAPHY.table.cell}`}>
                              <input
                                type="checkbox"
                                checked={!isExcluded}
                                onChange={() => toggleCompletedPair(dup.usuario_id, dup.evidencia_id)}
                                className="w-4 h-4 rounded border-info-ring text-info focus:ring-info cursor-pointer shrink-0"
                                aria-label={`Reasignar ${evidenceById[dup.evidencia_id]?.nomenclatura}`}
                              />
                              <span className="font-semibold text-negro-una">{evidenceById[dup.evidencia_id]?.nomenclatura ?? 'N/A'}</span>
                              <span className="text-gris-una">—</span>
                              <span className="text-negro-una truncate">{evidenceById[dup.evidencia_id]?.descripcion ?? ''}</span>
                            </div>
                          ),
                          action: (
                            <span className={`text-negro-una shrink-0 ${TYPOGRAPHY.table.cell}`}>{formatDateShort(dup.fecha_asignacion)}</span>
                          ),
                        };
                      })
                    }
                  />
                  <div className="px-6 pb-6">
                    <div className={`p-3 bg-info-light rounded-corner border border-info-ring ${TYPOGRAPHY.table.helper} text-info-dark`}>
                      <strong>Reasignación permitida:</strong> Estos usuarios ya completaron estas evidencias.
                      Márquelos si desea reasignarlas para crear una nueva asignación.
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── Botón de confirmación ── */}
          <div className="flex justify-end pt-2 pb-6">
            <Button
              variant="primary"
              size="lg"
              onClick={onFormSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Asignando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      )}

      {/* â”€â”€ Modales â”€â”€ */}
      <EditConfirmationModal
        isOpen={showConfirmModal}
        onClose={onCloseConfirmModal}
        onConfirm={onConfirmedSubmit}
        title="Confirmar asignación de evidencias"
        message={`¿Desea asignar ${formData.selectedEvidences.length} ${formData.selectedEvidences.length === 1 ? "evidencia" : "evidencias"} a los destinatarios seleccionados?`}
        isLoading={isSubmitting}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={onCloseSuccessModal}
        title="¡Asignación completada!"
        message={`Se ${assignedEvidencesCount === 1 ? "asignó" : "asignaron"} ${assignedEvidencesCount} ${assignedEvidencesCount === 1 ? "evidencia" : "evidencias"} correctamente.`}
      />
    </ScreenContainer>
  );
};

export default EvidenceAssignmentView;
