import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScreenContainer,
  PageHeader,
  Button,
  LoadingSpinner,
  MultiSelect,
  DataTable,
} from "@/Components/Ui/Index";
import type { DataTableColumn } from "@/Components/Ui/Index";
import { DateRangePicker } from "@/Components/Ui/Calendar/DateRangePicker";
import { Card } from "@/Components/Ui/Layout/Card";
import { UserAvatars } from "@/Components/Ui/UserAvatars/UserAvatars";
import type { UserAvatarsUser } from "@/Components/Ui/UserAvatars/UserAvatars";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal.tsx";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal.tsx";
import { Textarea } from "@/Components/Ui/Forms/Textarea";
import { BackendErrorAlert } from "@/Components/Ui/Feedback/BackendErrorAlert";
import { useToast } from "@/Context/ToastContext";
import { getContextualInfo } from "@/Constants/ModuleInfo";
import { TYPOGRAPHY } from "@/Constants/Typography";
import type {
  EvidenceAssignmentFormData,
  ValidationErrors,
  Criterion,
  Evidence,
  DuplicateAssignment,
} from "@/Types/EvidenceAssignment";
import { evidenceAssignmentService } from "@/Services/EvidenceAssignmentService";
import { userService, type User } from "@/Services/UserService";
import { roleService, type Role } from "@/Services/RoleService";
import type { MultiSelectOption } from "@/Components/Ui/Forms/MultiSelect";
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

// ---------------------------------------------------------------------------
// Tipo para las filas de la tabla de asignaciones
// ---------------------------------------------------------------------------

interface AssignmentTableRow extends Record<string, unknown> {
  id: string;
  evidencia_id: number;
  nomenclatura: string;
  descripcion: string;
  destinatarios: string;
  fecha_limite: string;
  comentario: string;
}

// ---------------------------------------------------------------------------
// EvidenceAssignmentSinglePage — página principal
// ---------------------------------------------------------------------------

const EvidenceAssignmentSinglePage: React.FC = () => {
  const { showToast } = useToast();
  const moduleInfo = getContextualInfo("evidence_assignment", "wizard");

  // ── Datos del formulario ─────────────────────────────────────────────────
  const [formData, setFormData] = useState<EvidenceAssignmentFormData>({
    proceso_id: null,
    criterio_id: null,
    selectedCriteria: [],
    selectedEvidences: [],
    selectedUsers: [],
    selectedRoles: [],
    fecha_limite: "",
    comentario: "",
    excludedUsers: [],
  });

  const updateFormData = useCallback((updates: Partial<EvidenceAssignmentFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Catálogos: criterios, evidencias, usuarios, roles ────────────────────
  const [criteriaState, setCriteriaState] = useState<{
    criteria: Criterion[];
    evidences: Evidence[];
    loading: boolean;
  }>({ criteria: [], evidences: [], loading: true });

  const [catalogState, setCatalogState] = useState<{
    availableUsers: User[];
    availableRoles: Role[];
    loading: boolean;
    userError: string | null;
    roleError: string | null;
    userCountByRole: Record<number, number>;
  }>({
    availableUsers: [],
    availableRoles: [],
    loading: true,
    userError: null,
    roleError: null,
    userCountByRole: {},
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const users = await userService.listUsers();
      const transformed: User[] = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status === "active" ? "active" : "inactive",
        role: u.roles?.[0]?.name,
      }));
      const countMap: Record<number, number> = {};
      users.forEach((u) => {
        u.roles?.forEach((r: any) => {
          if (r.id) countMap[r.id] = (countMap[r.id] || 0) + 1;
        });
      });
      setCatalogState((prev) => ({
        ...prev,
        availableUsers: transformed,
        userCountByRole: countMap,
        userError: null,
      }));
    } catch {
      setCatalogState((prev) => ({
        ...prev,
        userError: "Error al cargar la lista de usuarios",
      }));
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const response = await roleService.listarRoles();
      setCatalogState((prev) => ({
        ...prev,
        availableRoles: response.data || [],
        roleError: null,
      }));
    } catch {
      setCatalogState((prev) => ({
        ...prev,
        roleError: "Error al cargar la lista de roles",
      }));
    }
  }, []);

  useEffect(() => {
    if (dataLoaded) return;
    const load = async () => {
      try {
        const [criteriaData, evidencesData, processesData] = await Promise.all([
          evidenceAssignmentService.getAllCriteria(),
          evidenceAssignmentService.getAllEvidences(),
          evidenceAssignmentService.getAllProcesses(),
        ]);
        setCriteriaState({ criteria: criteriaData, evidences: evidencesData, loading: false });
        if (processesData.length > 0 && !formData.proceso_id) {
          updateFormData({ proceso_id: processesData[0].proceso_id });
        }
        await Promise.all([loadUsers(), loadRoles()]);
        setCatalogState((prev) => ({ ...prev, loading: false }));
        setDataLoaded(true);
      } catch {
        setCriteriaState((prev) => ({ ...prev, loading: false }));
        setCatalogState((prev) => ({ ...prev, loading: false }));
      }
    };
    load();
  }, [dataLoaded]);

  // ── Validación de duplicados ─────────────────────────────────────────────
  const [duplicatesState, setDuplicatesState] = useState<{
    duplicates: DuplicateAssignment[];
    validating: boolean;
  }>({ duplicates: [], validating: false });

  const [expandedDuplicates, setExpandedDuplicates] = useState({
    active: true,
    completed: true,
  });

  useEffect(() => {
    const validate = async () => {
      if (
        !formData.proceso_id ||
        formData.selectedEvidences.length === 0 ||
        formData.selectedUsers.length === 0
      ) {
        setDuplicatesState({ duplicates: [], validating: false });
        updateFormData({ excludedUsers: [] });
        return;
      }
      setDuplicatesState((prev) => ({ ...prev, validating: true, duplicates: [] }));
      const found: DuplicateAssignment[] = [];
      try {
        for (const evidenciaId of formData.selectedEvidences) {
          const res = await evidenceAssignmentService.validateDuplicates({
            proceso_id: formData.proceso_id!,
            evidencia_id: evidenciaId,
            usuarios: formData.selectedUsers,
          });
          if (res.tiene_duplicados) {
            found.push(...res.duplicados);
          }
        }
      } catch {
        // silenciar error de validación de duplicados
      }
      setDuplicatesState({ duplicates: found, validating: false });
      updateFormData({ excludedUsers: found.filter((d) => d.estado !== "completado").map((d) => d.usuario_id) });
    };
    validate();
  }, [formData.proceso_id, JSON.stringify(formData.selectedEvidences), JSON.stringify(formData.selectedUsers)]);

  // ── Estado de envío y modales ────────────────────────────────────────────
  const [submitState, setSubmitState] = useState<{
    isSubmitting: boolean;
    errors: ValidationErrors;
  }>({ isSubmitting: false, errors: {} });

  const [modalState, setModalState] = useState({
    showSuccessModal: false,
    showConfirmModal: false,
    assignedEvidencesCount: 0,
  });

  // ── Opciones de MultiSelect ──────────────────────────────────────────────
  const criterionOptions = useMemo<MultiSelectOption[]>(() =>
    criteriaState.criteria.map((c) => ({
      value: c.criterio_id.toString(),
      label: `${c.nomenclatura} — ${c.descripcion.substring(0, 100)}${c.descripcion.length > 100 ? '...' : ''}`,
    })), [criteriaState.criteria]
  );

  const criterionById = useMemo(() =>
    criteriaState.criteria.reduce<Record<number, Criterion>>((acc, c) => {
      acc[c.criterio_id] = c;
      return acc;
    }, {}), [criteriaState.criteria]
  );

  const availableEvidences = useMemo(() => {
    if (!formData.selectedCriteria.length) return [];
    const set = new Set(formData.selectedCriteria);
    return criteriaState.evidences.filter((e) => set.has(e.criterio_id));
  }, [criteriaState.evidences, formData.selectedCriteria]);

  const evidenceOptions = useMemo<MultiSelectOption[]>(() =>
    availableEvidences.map((e) => ({
      value: e.evidencia_id.toString(),
      label: `${e.nomenclatura} — ${e.descripcion}`,
      metadata: criterionById[e.criterio_id]?.nomenclatura ?? `Criterio ${e.criterio_id}`,
    })), [availableEvidences, criterionById]
  );

  const userOptions = useMemo(() =>
    catalogState.availableUsers.map((u) => ({
      id: u.id,
      value: u.id.toString(),
      label: `${u.name} (${u.email})`,
    })), [catalogState.availableUsers]
  );

  const roleOptions = useMemo(() =>
    catalogState.availableRoles.map((r) => ({
      id: r.id,
      value: r.id.toString(),
      label: r.name,
      metadata: `${catalogState.userCountByRole[r.id] ?? 0} ${(catalogState.userCountByRole[r.id] ?? 0) === 1 ? "usuario" : "usuarios"}`,
    })), [catalogState.availableRoles, catalogState.userCountByRole]
  );

  // ── Tabla de resumen de asignaciones ────────────────────────────────────
  const evidenceById = useMemo(() =>
    criteriaState.evidences.reduce<Record<number, Evidence>>((acc, e) => {
      acc[e.evidencia_id] = e;
      return acc;
    }, {}), [criteriaState.evidences]
  );

  const assignmentTableRows = useMemo<AssignmentTableRow[]>(() =>
    formData.selectedEvidences.map((id) => {
      const ev = evidenceById[id];
      return {
        id: id.toString(),
        evidencia_id: id,
        nomenclatura: ev?.nomenclatura ?? "—",
        descripcion: ev?.descripcion ?? "—",
        destinatarios: "—",
        fecha_limite: formData.fecha_limite ?? "",
        comentario: formData.comentario ?? "",
      };
    }), [formData.selectedEvidences, evidenceById, formData.fecha_limite, formData.comentario]
  );

  const selectedAvatars = useMemo<UserAvatarsUser[]>(() => {
    const userAvatars: UserAvatarsUser[] = formData.selectedUsers.flatMap((id) => {
      const u = catalogState.availableUsers.find((u) => u.id === id);
      return u ? [{ id: u.id, name: u.name }] : [];
    });

    const roleAvatars: UserAvatarsUser[] = formData.selectedRoles.flatMap((id) => {
      const r = catalogState.availableRoles.find((r) => r.id === id);
      return r ? [{ id: `role-${r.id}`, name: r.name }] : [];
    });

    return [...userAvatars, ...roleAvatars];
  }, [formData.selectedUsers, formData.selectedRoles, catalogState.availableUsers, catalogState.availableRoles]);

  const firstColumn = useFirstColumnConfig();

  const assignmentColumns: DataTableColumn<AssignmentTableRow>[] = useMemo(() => [
    {
    key: "evidencia",
    header: "Evidencia",
    width: firstColumn.width,
      render: (_val, row) => (
        <div>
          <p className="font-semibold text-negro-una text-sm">{row.nomenclatura as string}</p>
          <p className="text-xs text-gris-una mt-0.5">{row.descripcion as string}</p>
        </div>
      ),
    },
    {
      key: "destinatarios",
      header: "Destinatarios",
      align: "center" as const,
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
    },
    {
      key: "fecha",
      header: "Fecha límite",
      align: "center" as const,
      render: (_val, row) => {
        const fecha = row.fecha_limite as string;
        return fecha
          ? <p className={`${TYPOGRAPHY.table.cell} text-gris-una`}>{formatDisplayDate(fecha)}</p>
          : <span className={`${TYPOGRAPHY.table.cell} text-gris-una/50`}>—</span>;
      },
    },
    {
      key: "comentario",
      header: "Comentario",
      align: "center" as const,
      render: (_val, row) => {
        const comentario = row.comentario as string;
        return comentario
          ? <p className={`${TYPOGRAPHY.table.cell} text-gris-una truncate max-w-xs`} title={comentario}>{comentario}</p>
          : <span className={`${TYPOGRAPHY.table.cell} text-gris-una/50`}>—</span>;
      },
    },
  ], [selectedAvatars, firstColumn.width]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const excludedUsersSet = useMemo(
    () => new Set(formData.excludedUsers ?? []),
    [formData.excludedUsers]
  );

  const handleToggleUser = (userId: number) => {
    const current = formData.excludedUsers ?? [];
    const isExcluded = current.includes(userId);
    updateFormData({
      excludedUsers: isExcluded
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    });
  };

  const activeDuplicates = duplicatesState.duplicates.filter((d) => d.estado !== "completado");
  const completedDuplicates = duplicatesState.duplicates.filter((d) => d.estado === "completado");

  // ── Validación y envío ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.proceso_id) {
      newErrors.proceso = "Debe seleccionar un proceso";
    }
    if (formData.selectedEvidences.length === 0) {
      newErrors.evidences = "Debe seleccionar al menos una evidencia";
    }
    if (formData.selectedUsers.length === 0 && formData.selectedRoles.length === 0) {
      newErrors.destinatarios = "Debe seleccionar al menos un usuario o rol";
    }
    if (formData.fecha_limite) {
      const [y, m, d] = formData.fecha_limite.split("-").map(Number);
      const selected = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        newErrors.fecha_limite = "La fecha límite debe ser posterior a hoy";
      }
    }

    setSubmitState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validate()) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "Por favor, revise los datos ingresados",
      });
      return;
    }
    setModalState((prev) => ({ ...prev, showConfirmModal: true }));
  };

  const handleConfirmedSubmit = async () => {
    if (submitState.isSubmitting) return;
    setSubmitState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      for (const evidenciaId of formData.selectedEvidences) {
        const finalUsers = formData.selectedUsers.filter(
          (id) => !excludedUsersSet.has(id)
        );
        await evidenceAssignmentService.createAssignment({
          proceso_id: formData.proceso_id!,
          evidencia_id: evidenciaId,
          usuarios: finalUsers.length > 0 ? finalUsers : undefined,
          roles: formData.selectedRoles.length > 0 ? formData.selectedRoles : undefined,
          fecha_limite: formData.fecha_limite || undefined,
          comentario: formData.comentario || undefined,
        });
      }

      setModalState({
        showSuccessModal: true,
        showConfirmModal: false,
        assignedEvidencesCount: formData.selectedEvidences.length,
      });

      setFormData({
        proceso_id: formData.proceso_id,
        criterio_id: null,
        selectedCriteria: [],
        selectedEvidences: [],
        selectedUsers: [],
        selectedRoles: [],
        fecha_limite: "",
        comentario: "",
        excludedUsers: [],
      });
      setSubmitState({ isSubmitting: false, errors: {} });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error al asignar evidencias",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
      setSubmitState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const { errors } = submitState;
  const isLoading = criteriaState.loading || catalogState.loading;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
      />

      {isLoading ? (
        <div className="relative py-16 min-h-[400px]">
          <LoadingSpinner variant="loader" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Sección 1: Asignaciones + Destinatarios ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2.2fr] gap-6 items-start">

            {/* Card: Criterios y Evidencias */}
            <Card className="p-6 space-y-6">

              {/* Contadores rápidos */}
              <div className="flex items-center justify-between">
                <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>
                  Asignaciones
                </h2>
                <div className="flex items-center gap-3">
                  <div className="rounded-corner bg-blanco-una px-3 py-1.5 border border-gris-una/15 text-center">
                    <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Criterios</p>
                    <p className={`${TYPOGRAPHY.form.helper} font-semibold text-gris-una`}>{formData.selectedCriteria.length}</p>
                  </div>
                  <div className="rounded-corner bg-blanco-una px-3 py-1.5 border border-gris-una/15 text-center">
                    <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Evidencias</p>
                    <p className={`${TYPOGRAPHY.form.helper} font-semibold text-gris-una`}>{formData.selectedEvidences.length}</p>
                  </div>
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
                      const ev = criteriaState.evidences.find((e) => e.evidencia_id === id);
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
                  Mostrando {availableEvidences.length} evidencias de{" "}
                  {formData.selectedCriteria.length}{" "}
                  {formData.selectedCriteria.length === 1 ? "criterio" : "criterios"} seleccionados.
                </p>
              </div>
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
                {catalogState.userError ? (
                  <BackendErrorAlert
                    error={catalogState.userError}
                    onRetry={() => {
                      setCatalogState((prev) => ({ ...prev, userError: null }));
                      loadUsers();
                    }}
                  />
                ) : (
                  <MultiSelect
                    label="Usuarios"
                    options={userOptions}
                    value={formData.selectedUsers.map(String)}
                    onChange={(vals) =>
                      updateFormData({ selectedUsers: vals.map(Number) })
                    }
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
                {catalogState.roleError ? (
                  <BackendErrorAlert
                    error={catalogState.roleError}
                    onRetry={() => {
                      setCatalogState((prev) => ({ ...prev, roleError: null }));
                      loadRoles();
                    }}
                  />
                ) : (
                  <MultiSelect
                    label="Roles"
                    options={roleOptions}
                    value={formData.selectedRoles.map(String)}
                    onChange={(vals) =>
                      updateFormData({ selectedRoles: vals.map(Number) })
                    }
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

          {/* ── Sección 2: Fecha y comentario ── */}
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

          {/* ── Sección 3: Tabla de asignaciones (preview dinámico) ── */}
          <Card className="p-4">
            <h2 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una mb-4 px-2 pt-2`}>
              Resumen de asignaciones
            </h2>
            <DataTable<AssignmentTableRow>
            data={assignmentTableRows}
            columns={assignmentColumns}
            searchable={false}
            loading={false}
            getRowKey={(row) => row.id}
            emptyMessage={
              <p className={`${TYPOGRAPHY.emptyState.descriptionCompact} text-gris-una py-6 text-center`}>
                Selecciona criterios y evidencias para ver el resumen
              </p>
            }
            />
          </Card>

          {/* ── Sección 4: Tablas de duplicados ── */}
          {duplicatesState.validating && (
            <div className="rounded-corner border border-info/20 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 border-2 border-azul-una border-t-transparent rounded-full animate-spin flex-shrink-0"
                  role="status"
                  aria-label="Cargando..."
                />
                <p className="text-sm text-info">Validando asignaciones existentes...</p>
              </div>
            </div>
          )}

          {!duplicatesState.validating && duplicatesState.duplicates.length > 0 && (
            <div className="space-y-4">

              {/* Tabla amarilla — duplicados activos (bloqueados) */}
              {activeDuplicates.length > 0 && (
                <div className="relative overflow-hidden rounded-corner border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDuplicates((prev) => ({ ...prev, active: !prev.active }))
                    }
                    className="w-full p-6 text-left hover:bg-yellow-100/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-600 text-white font-bold text-sm">
                          {activeDuplicates.length}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-yellow-900">
                            Asignaciones Duplicadas
                          </h3>
                          <p className="text-sm text-yellow-800">
                            Usuarios con asignaciones pendientes en progreso. No se pueden reasignar.
                          </p>
                        </div>
                      </div>
                      <span className="text-yellow-900 text-sm">
                        {expandedDuplicates.active ? "▴" : "▾"}
                      </span>
                    </div>
                  </button>

                  {expandedDuplicates.active && (
                    <div className="border-t border-yellow-300 p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-yellow-300">
                              <th className="text-left py-3 px-4 font-semibold text-yellow-900">Usuario</th>
                              <th className="text-left py-3 px-4 font-semibold text-yellow-900">Fecha Asignación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeDuplicates.map((dup) => (
                              <tr key={`act-${dup.usuario_id}`} className="border-b border-yellow-200 bg-yellow-50/50">
                                <td className="py-3 px-4 text-yellow-900 font-medium">{dup.usuario_nombre}</td>
                                <td className="py-3 px-4 text-yellow-900">
                                  {new Date(dup.fecha_asignacion).toLocaleDateString("es-ES")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 p-3 bg-yellow-50 rounded-corner border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <strong>Bloqueado automáticamente:</strong> Estos usuarios fueron excluidos; ya tienen
                          esta evidencia asignada en estado activo. No se pueden crear asignaciones duplicadas
                          mientras no esté completada o cancelada.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tabla azul — completados (se pueden reasignar) */}
              {completedDuplicates.length > 0 && (
                <div className="relative overflow-hidden rounded-corner border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDuplicates((prev) => ({ ...prev, completed: !prev.completed }))
                    }
                    className="w-full p-6 text-left hover:bg-blue-100/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm">
                          {completedDuplicates.length}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-blue-900">
                            Evidencias Ya Completadas
                          </h3>
                          <p className="text-sm text-blue-800">
                            Usuarios que ya completaron estas evidencias. Puede reasignarlas si es necesario.
                          </p>
                        </div>
                      </div>
                      <span className="text-blue-900 text-sm">
                        {expandedDuplicates.completed ? "▴" : "▾"}
                      </span>
                    </div>
                  </button>

                  {expandedDuplicates.completed && (
                    <div className="border-t border-blue-300 p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-blue-300">
                              <th className="py-3 px-4">
                                <input
                                  type="checkbox"
                                  checked={completedDuplicates.every(
                                    (d) => !excludedUsersSet.has(d.usuario_id)
                                  )}
                                  onChange={(e) => {
                                    const ids = completedDuplicates.map((d) => d.usuario_id);
                                    const current = formData.excludedUsers ?? [];
                                    updateFormData({
                                      excludedUsers: e.target.checked
                                        ? current.filter((id) => !ids.includes(id))
                                        : [
                                            ...current,
                                            ...ids.filter((id) => !current.includes(id)),
                                          ],
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  aria-label="Seleccionar todos los completados"
                                />
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-blue-900">Usuario</th>
                              <th className="text-left py-3 px-4 font-semibold text-blue-900">Fecha Completado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {completedDuplicates.map((dup) => (
                              <tr
                                key={`comp-${dup.usuario_id}`}
                                className="border-b border-blue-200 hover:bg-blue-50"
                              >
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={!excludedUsersSet.has(dup.usuario_id)}
                                    onChange={() => handleToggleUser(dup.usuario_id)}
                                    className="w-4 h-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    aria-label={`Reasignar a ${dup.usuario_nombre}`}
                                  />
                                </td>
                                <td className="py-3 px-4 text-blue-900 font-medium">{dup.usuario_nombre}</td>
                                <td className="py-3 px-4 text-blue-900">
                                  {new Date(dup.fecha_asignacion).toLocaleDateString("es-ES")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-corner border border-blue-200">
                        <p className="text-xs text-blue-800">
                          <strong>Reasignación permitida:</strong> Estos usuarios ya completaron estas evidencias.
                          Márquelos si desea reasignarlas para crear una nueva asignación.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Botón de confirmación ── */}
          <div className="flex justify-end pt-2 pb-6">
            <Button
              variant="primary"
              size="lg"
              onClick={handleFormSubmit}
              disabled={submitState.isSubmitting}
            >
              {submitState.isSubmitting ? "Asignando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Modales ── */}
      <EditConfirmationModal
        isOpen={modalState.showConfirmModal}
        onClose={() => setModalState((prev) => ({ ...prev, showConfirmModal: false }))}
        onConfirm={handleConfirmedSubmit}
        title="Confirmar asignación de evidencias"
        message={`¿Desea asignar ${formData.selectedEvidences.length} ${formData.selectedEvidences.length === 1 ? "evidencia" : "evidencias"} a los destinatarios seleccionados?`}
        isLoading={submitState.isSubmitting}
      />

      <SuccessModal
        isOpen={modalState.showSuccessModal}
        onClose={() => setModalState((prev) => ({ ...prev, showSuccessModal: false }))}
        title="¡Asignación completada!"
        message={`Se ${modalState.assignedEvidencesCount === 1 ? "asignó" : "asignaron"} ${modalState.assignedEvidencesCount} ${modalState.assignedEvidencesCount === 1 ? "evidencia" : "evidencias"} correctamente.`}
      />
    </ScreenContainer>
  );
};

export default EvidenceAssignmentSinglePage;
