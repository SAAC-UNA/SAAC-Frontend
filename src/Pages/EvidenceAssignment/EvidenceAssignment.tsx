import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/Context/ToastContext";
import { getContextualInfo } from "@/Constants/ModuleInfo";
import type {
  EvidenceAssignmentFormData,
  ValidationErrors,
  Criterion,
  Evidence,
  Process,
  DuplicateAssignment,
} from "@/Types/EvidenceAssignment";
import type { FlexibleElement } from "@/Types/StructureModelTypes";
import { getElementPath } from "@/Utils/elementTreeUtils";
import { evidenceAssignmentService } from "@/Services/EvidenceAssignmentService";
import { userService, type User } from "@/Services/UserService";
import { roleService, type Role } from "@/Services/RoleService";
import type { MultiSelectOption } from "@/Components/Ui/Forms/MultiSelect";
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";
import type { UserAvatarsUser } from "@/Components/Ui/UserAvatars/UserAvatars";
import type { DataTableColumn } from "@/Components/Ui/Index";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { formatDateShort } from "@/Utils/DateUtils";

import { EvidenceAssignmentView } from "./Components/EvidenceAssignmentView";

// ---------------------------------------------------------------------------
// Tipos internos compartidos con la vista
// ---------------------------------------------------------------------------

export interface AssignmentTableRow extends Record<string, unknown> {
  id: string;
  evidencia_id: number;
  nomenclatura: string;
  descripcion: string;
  destinatarios: string;
  fecha_limite: string;
  comentario: string;
}

export interface DuplicateGroupRow extends Record<string, unknown> {
  id: number;
  usuario_nombre: string;
  evidences: DuplicateAssignment[];
}

export interface EvidenceAssignmentViewProps {
  // Info de módulo
  moduleInfo: { title: string; description: string };
  // Catálogos
  criteriaLoading: boolean;
  criterionOptions: MultiSelectOption[];
  evidenceOptions: MultiSelectOption[];
  userOptions: Array<{ id: number; value: string; label: string }>;
  roleOptions: Array<{ id: number; value: string; label: string; metadata: string }>;
  userError: string | null;
  roleError: string | null;
  onRetryUsers: () => void;
  onRetryRoles: () => void;
  availableEvidencesCount: number;
  // Formulario
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
  today: string;
  // Tabla resumen
  assignmentTableRows: AssignmentTableRow[];
  assignmentColumns: DataTableColumn<AssignmentTableRow>[];
  // Duplicados
  duplicatesValidating: boolean;
  activeDuplicates: DuplicateAssignment[];
  completedDuplicates: DuplicateAssignment[];
  activeDuplicateRows: DuplicateGroupRow[];
  completedDuplicateRows: DuplicateGroupRow[];
  evidenceById: Record<number, Evidence>;
  excludedCompletedPairs: Array<{ usuario_id: number; evidencia_id: number }>;
  toggleCompletedPair: (usuario_id: number, evidencia_id: number) => void;
  toggleAllCompletedPairsForUser: (evidences: DuplicateAssignment[]) => void;
  setExcludedCompletedPairs: React.Dispatch<React.SetStateAction<Array<{ usuario_id: number; evidencia_id: number }>>>;
  // Envío
  isSubmitting: boolean;
  showSuccessModal: boolean;
  showConfirmModal: boolean;
  assignedEvidencesCount: number;
  onFormSubmit: () => void;
  onConfirmedSubmit: () => void;
  onCloseConfirmModal: () => void;
  onCloseSuccessModal: () => void;
  // Criteria evidences para el onChange de criterios
  criteriaEvidences: Evidence[];
  selectedAvatars: UserAvatarsUser[];
  // Modo flexible
  isFlexible: boolean;
  elementOptions: MultiSelectOption[];
  flexElements: FlexibleElement[];
}

// ---------------------------------------------------------------------------
// EvidenceAssignment — contenedor de lógica
// ---------------------------------------------------------------------------

const EvidenceAssignment: React.FC = () => {
  const { showToast } = useToast();
  const moduleInfo = getContextualInfo("evidence_assignment", "wizard");

  // ── Formulario ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<EvidenceAssignmentFormData>({
    proceso_id: null,
    criterio_id: null,
    selectedCriteria: [],
    selectedEvidences: [],
    selectedElements: [],
    selectedUsers: [],
    selectedRoles: [],
    fecha_limite: "",
    comentario: "",
    excludedUsers: [],
  });

  // ── Tipo de modelo del proceso seleccionado ──────────────────────────────
  const [processes, setProcesses] = useState<Process[]>([]);
  const [flexElements, setFlexElements] = useState<FlexibleElement[]>([]);

  const selectedProcess = useMemo(
    () => processes.find((p) => p.proceso_id === formData.proceso_id) ?? null,
    [processes, formData.proceso_id],
  );

  const isFlexible = selectedProcess?.modelo_estructura_tipo === 'elemento_flexible';

  const updateFormData = useCallback((updates: Partial<EvidenceAssignmentFormData>) => {
    // Al cambiar de proceso, limpiar selecciones que dependen del modelo
    if ('proceso_id' in updates && updates.proceso_id !== formData.proceso_id) {
      setFormData((prev) => ({
        ...prev,
        ...updates,
        criterio_id: null,
        selectedCriteria: [],
        selectedEvidences: [],
        selectedElements: [],
        excludedUsers: [],
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  }, [formData.proceso_id]);

  // ── Catálogos ────────────────────────────────────────────────────────────
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
      setCatalogState((prev) => ({ ...prev, userError: "Error al cargar la lista de usuarios" }));
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const response = await roleService.listarRoles();
      setCatalogState((prev) => ({ ...prev, availableRoles: response.data || [], roleError: null }));
    } catch {
      setCatalogState((prev) => ({ ...prev, roleError: "Error al cargar la lista de roles" }));
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
        setProcesses(processesData);
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

  // Cargar elementos cuando cambia el proceso a uno de tipo flexible
  useEffect(() => {
    if (!isFlexible || !selectedProcess?.modelo_estructura_id) {
      setFlexElements([]);
      return;
    }
    evidenceAssignmentService
      .getElementsByModel(selectedProcess.modelo_estructura_id)
      .then(setFlexElements)
      .catch(() => setFlexElements([]));
  }, [isFlexible, selectedProcess?.modelo_estructura_id]);

  // ── Duplicados ───────────────────────────────────────────────────────────
  const [duplicatesState, setDuplicatesState] = useState<{
    duplicates: DuplicateAssignment[];
    validating: boolean;
  }>({ duplicates: [], validating: false });

  const [excludedCompletedPairs, setExcludedCompletedPairs] = useState<
    Array<{ usuario_id: number; evidencia_id: number }>
  >([]);

  useEffect(() => {
    const validate = async () => {
      if (
        !formData.proceso_id ||
        formData.selectedEvidences.length === 0 ||
        formData.selectedUsers.length === 0
      ) {
        setDuplicatesState({ duplicates: [], validating: false });
        updateFormData({ excludedUsers: [] });
        setExcludedCompletedPairs([]);
        return;
      }
      setDuplicatesState((prev) => ({ ...prev, validating: true, duplicates: [] }));
      setExcludedCompletedPairs([]);
      const found: DuplicateAssignment[] = [];
      try {
        for (const evidenciaId of formData.selectedEvidences) {
          const res = await evidenceAssignmentService.validateDuplicates({
            proceso_id: formData.proceso_id!,
            evidencia_id: evidenciaId,
            usuarios: formData.selectedUsers,
          });
          if (res.tiene_duplicados) {
            found.push(...res.duplicados.map((d) => ({ ...d, evidencia_id: evidenciaId })));
          }
        }
      } catch {
        // silenciar error de validación
      }
      setDuplicatesState({ duplicates: found, validating: false });
      updateFormData({ excludedUsers: found.filter((d) => d.estado !== "completado").map((d) => d.usuario_id) });
    };
    validate();
  }, [formData.proceso_id, JSON.stringify(formData.selectedEvidences), JSON.stringify(formData.selectedUsers)]);

  // ── Modales y envío ──────────────────────────────────────────────────────
  const [submitState, setSubmitState] = useState<{
    isSubmitting: boolean;
    errors: ValidationErrors;
  }>({ isSubmitting: false, errors: {} });

  const [modalState, setModalState] = useState({
    showSuccessModal: false,
    showConfirmModal: false,
    assignedEvidencesCount: 0,
  });

  // ── Opciones derivadas ───────────────────────────────────────────────────
  const criterionOptions = useMemo<MultiSelectOption[]>(() =>
    criteriaState.criteria.map((c) => ({
      value: c.criterio_id.toString(),
      label: `${c.nomenclatura} — ${c.descripcion.substring(0, 100)}${c.descripcion.length > 100 ? '...' : ''}`,
    })), [criteriaState.criteria]
  );

  // Elementos del modelo flexible: solo hojas (sin hijos) para poder asignarlos
  const elementOptions = useMemo<MultiSelectOption[]>(() => {
    const parentIds = new Set(
      flexElements.filter((e) => e.padre_id !== null).map((e) => e.padre_id as number)
    );
    return flexElements
      .filter((e) => !parentIds.has(e.elemento_id) && e.activo)
      .map((e) => ({
        value: e.elemento_id.toString(),
        label: e.nomenclatura
          ? `${e.nomenclatura} — ${e.descripcion ?? e.tipo}`
          : e.descripcion ?? e.tipo,
      }));
  }, [flexElements]);

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
      metadata: `${catalogState.userCountByRole[r.id] ?? 0} ${
        (catalogState.userCountByRole[r.id] ?? 0) === 1 ? "usuario" : "usuarios"
      }`,
    })), [catalogState.availableRoles, catalogState.userCountByRole]
  );

  const evidenceById = useMemo(() =>
    criteriaState.evidences.reduce<Record<number, Evidence>>((acc, e) => {
      acc[e.evidencia_id] = e;
      return acc;
    }, {}), [criteriaState.evidences]
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

  const assignmentTableRows = useMemo<AssignmentTableRow[]>(() => {
    if (isFlexible) {
      return formData.selectedElements.map((id) => {
        const el = flexElements.find((e) => e.elemento_id === id);
        const path = getElementPath(id, flexElements);
        return {
          id: `el-${id}`,
          evidencia_id: id,
          nomenclatura: el?.nomenclatura ?? "—",
          descripcion: path || (el?.descripcion ?? el?.tipo ?? "—"),
          destinatarios: "—",
          fecha_limite: formData.fecha_limite ?? "",
          comentario: formData.comentario ?? "",
        };
      });
    }
    return formData.selectedEvidences.map((id) => {
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
    });
  }, [isFlexible, formData.selectedElements, formData.selectedEvidences, flexElements, evidenceById, formData.fecha_limite, formData.comentario]);

  const assignmentColumns = useMemo<DataTableColumn<AssignmentTableRow>[]>(() => [
    {
      key: "evidencia",
      header: "Evidencia",
      width: firstColumn.width,
      render: (_val: unknown, row: AssignmentTableRow) => (
        <div className={`${TYPOGRAPHY.table.cell} text-negro-una`}>
          <span className="font-semibold">{row.nomenclatura as string}</span>
          <span className="text-gris-una mx-1.5">—</span>
          <span className="text-negro-una font-semibold">{row.descripcion as string}</span>
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
            {/* UserAvatars se renderiza en la vista */}
            <span data-avatars={JSON.stringify(selectedAvatars)} />
          </div>
        ) : (
          <span className={`${TYPOGRAPHY.table.cell} text-gris-una/50`}>Sin destinatarios</span>
        ),
    },
    {
      key: "fecha",
      header: "Fecha límite",
      align: "center" as const,
      render: (_val: unknown, row: AssignmentTableRow) => {
        const fecha = row.fecha_limite as string;
        return fecha
          ? <p className={`${TYPOGRAPHY.table.cell} text-gris-una`}>{formatDateShort(fecha)}</p>
          : <span className={`${TYPOGRAPHY.table.cell} text-gris-una/50`}>—</span>;
      },
    },
    {
      key: "comentario",
      header: "Comentario",
      align: "center" as const,
      render: (_val: unknown, row: AssignmentTableRow) => {
        const comentario = row.comentario as string;
        return comentario
          ? <p className={`${TYPOGRAPHY.table.cell} text-gris-una truncate max-w-xs`} title={comentario}>{comentario}</p>
          : <span className={`${TYPOGRAPHY.table.cell} text-gris-una/50`}>—</span>;
      },
    },
  ], [selectedAvatars, firstColumn.width, TYPOGRAPHY]);

  // ── Duplicados agrupados ─────────────────────────────────────────────────
  const activeDuplicates = duplicatesState.duplicates.filter((d) => d.estado !== "completado");
  const completedDuplicates = duplicatesState.duplicates.filter((d) => d.estado === "completado");

  const duplicatesByUser = (dups: DuplicateAssignment[]) =>
    dups.reduce<Record<string, DuplicateAssignment[]>>((acc, dup) => {
      const key = dup.usuario_id.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(dup);
      return acc;
    }, {});

  const activeDuplicateRows = useMemo<DuplicateGroupRow[]>(() =>
    Object.values(duplicatesByUser(activeDuplicates)).map((userDups) => ({
      id: userDups[0].usuario_id,
      usuario_nombre: userDups[0].usuario_nombre,
      evidences: userDups,
    } as DuplicateGroupRow)),
    [activeDuplicates]
  );

  const completedDuplicateRows = useMemo<DuplicateGroupRow[]>(() =>
    Object.values(duplicatesByUser(completedDuplicates)).map((userDups) => ({
      id: userDups[0].usuario_id,
      usuario_nombre: userDups[0].usuario_nombre,
      evidences: userDups,
    } as DuplicateGroupRow)),
    [completedDuplicates]
  );

  // ── Handlers de pares completados ────────────────────────────────────────
  const toggleCompletedPair = useCallback((usuario_id: number, evidencia_id: number) => {
    setExcludedCompletedPairs((prev) => {
      const exists = prev.some((p) => p.usuario_id === usuario_id && p.evidencia_id === evidencia_id);
      if (exists) return prev.filter((p) => !(p.usuario_id === usuario_id && p.evidencia_id === evidencia_id));
      return [...prev, { usuario_id, evidencia_id }];
    });
  }, []);

  const toggleAllCompletedPairsForUser = useCallback((evidences: DuplicateAssignment[]) => {
    setExcludedCompletedPairs((prev) => {
      const allExcluded = evidences.every((d) =>
        prev.some((p) => p.usuario_id === d.usuario_id && p.evidencia_id === d.evidencia_id)
      );
      if (allExcluded) {
        return prev.filter((p) => !evidences.some((d) => d.usuario_id === p.usuario_id && d.evidencia_id === p.evidencia_id));
      }
      const newPairs = evidences
        .filter((d) => !prev.some((p) => p.usuario_id === d.usuario_id && p.evidencia_id === d.evidencia_id))
        .map((d) => ({ usuario_id: d.usuario_id, evidencia_id: d.evidencia_id }));
      return [...prev, ...newPairs];
    });
  }, []);

  // ── Validación y envío ───────────────────────────────────────────────────
  const excludedUsersSet = useMemo(
    () => new Set(formData.excludedUsers ?? []),
    [formData.excludedUsers]
  );

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.proceso_id) newErrors.proceso = "Debe seleccionar un proceso";
    if (isFlexible) {
      if (formData.selectedElements.length === 0)
        newErrors.evidences = "Debe seleccionar al menos un elemento";
    } else {
      if (formData.selectedEvidences.length === 0)
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
      if (selected <= today) newErrors.fecha_limite = "La fecha límite debe ser posterior a hoy";
    }
    setSubmitState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validate()) {
      showToast({ type: "error", title: "Error de validación", message: "Por favor, revise los datos ingresados" });
      return;
    }
    setModalState((prev) => ({ ...prev, showConfirmModal: true }));
  };

  const handleConfirmedSubmit = async () => {
    if (submitState.isSubmitting) return;
    setSubmitState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      if (isFlexible) {
        // Modelo flexible: un POST por cada elemento seleccionado
        for (const elementoId of formData.selectedElements) {
          await evidenceAssignmentService.createElementAssignment({
            proceso_id: formData.proceso_id!,
            elemento_id: elementoId,
            usuarios: formData.selectedUsers.length > 0 ? formData.selectedUsers : undefined,
            roles: formData.selectedRoles.length > 0 ? formData.selectedRoles : undefined,
            fecha_limite: formData.fecha_limite || undefined,
            comentario: formData.comentario || undefined,
          });
        }
        setModalState({
          showSuccessModal: true,
          showConfirmModal: false,
          assignedEvidencesCount: formData.selectedElements.length,
        });
        setFormData((prev) => ({
          ...prev,
          selectedElements: [],
          selectedUsers: [],
          selectedRoles: [],
          fecha_limite: "",
          comentario: "",
          excludedUsers: [],
        }));
      } else {
        // Modelo tradicional: un POST por cada evidencia seleccionada
        for (const evidenciaId of formData.selectedEvidences) {
          const finalUsers = formData.selectedUsers.filter(
            (id) =>
              !excludedUsersSet.has(id) &&
              !excludedCompletedPairs.some((p) => p.usuario_id === id && p.evidencia_id === evidenciaId)
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
          selectedElements: [],
          selectedUsers: [],
          selectedRoles: [],
          fecha_limite: "",
          comentario: "",
          excludedUsers: [],
        });
      }
      setSubmitState({ isSubmitting: false, errors: {} });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error al asignar",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
      setSubmitState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // ── Props para la vista ──────────────────────────────────────────────────
  const viewProps: EvidenceAssignmentViewProps = {
    moduleInfo,
    criteriaLoading: criteriaState.loading || catalogState.loading,
    criterionOptions,
    evidenceOptions,
    userOptions,
    roleOptions,
    userError: catalogState.userError,
    roleError: catalogState.roleError,
    onRetryUsers: () => { setCatalogState((prev) => ({ ...prev, userError: null })); loadUsers(); },
    onRetryRoles: () => { setCatalogState((prev) => ({ ...prev, roleError: null })); loadRoles(); },
    availableEvidencesCount: availableEvidences.length,
    formData,
    updateFormData,
    errors: submitState.errors,
    today,
    assignmentTableRows,
    assignmentColumns,
    duplicatesValidating: duplicatesState.validating,
    activeDuplicates,
    completedDuplicates,
    activeDuplicateRows,
    completedDuplicateRows,
    evidenceById,
    excludedCompletedPairs,
    toggleCompletedPair,
    toggleAllCompletedPairsForUser,
    setExcludedCompletedPairs,
    isSubmitting: submitState.isSubmitting,
    showSuccessModal: modalState.showSuccessModal,
    showConfirmModal: modalState.showConfirmModal,
    assignedEvidencesCount: modalState.assignedEvidencesCount,
    onFormSubmit: handleFormSubmit,
    onConfirmedSubmit: handleConfirmedSubmit,
    onCloseConfirmModal: () => setModalState((prev) => ({ ...prev, showConfirmModal: false })),
    onCloseSuccessModal: () => setModalState((prev) => ({ ...prev, showSuccessModal: false })),
    criteriaEvidences: criteriaState.evidences,
    selectedAvatars,
    isFlexible,
    elementOptions,
    flexElements,
  };

  return <EvidenceAssignmentView {...viewProps} />;
};

export default EvidenceAssignment;
