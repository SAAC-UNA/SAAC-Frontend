/**
 * AccreditationCyclesPage - Gestión de Ciclos de Acreditación (HU-030)
 *
 * Tabla paginada con CRUD completo:
 *  - Crear ciclo (Administrador / Superusuario)
 *  - Editar ciclo (solo si estado === 'activo'; Administrador / Superusuario)
 *  - Eliminar ciclo con confirmación por nombre (Administrador / Superusuario)
 *  - Reactivar ciclo (solo Superusuario)
 */

import React, { useState, useRef, useMemo } from "react";
import { ScreenContainer } from "@/Components/Ui/Layout/ScreenContainer";
import {
  PageHeader,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/Ui/Index";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { AccreditationCycleFormModal } from "./Components/AccreditationCycleFormModal";
import { AccreditationCycleDeleteModal } from "./Components/AccreditationCycleDeleteModal";
import { AccreditationCycleDetailModal } from "./Components/AccreditationCycleDetailModal";
import { AccreditationCyclesTable } from "./Components/AccreditationCyclesTable";
import { useAccreditationCycles } from "@/Hooks/UseAccreditationCycles";
import { useAuth } from "@/Context/AuthContext";
import { useToast } from "@/Context/ToastContext";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { cn } from "@/Utils/ClassNames";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import type {
  AccreditationCycle,
  CreateAccreditationCycleForm,
  EditAccreditationCycleForm,
} from "@/Types/AccreditationCycleTypes";

const AccreditationCyclesPage: React.FC = () => {
  const { canAccess } = useAuth();
  const { showToast } = useToast();

  const {
    cycles,
    isLoading,
    createCycle,
    updateCycle,
    deleteCycle,
    reactivateCycle,
  } = useAccreditationCycles();

  const [currentPage, setCurrentPage] = useState(1);
  const prevCyclesLength = useRef(cycles.length);

  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const totalPages = Math.max(1, Math.ceil(cycles.length / itemsPerPage));
  const boundedCurrentPage = Math.min(currentPage, totalPages);
  if (boundedCurrentPage !== currentPage) {
    setCurrentPage(boundedCurrentPage);
  }

  // When cycles are added, go to page 1 to show the new item at the top
  if (cycles.length > prevCyclesLength.current) {
    prevCyclesLength.current = cycles.length;
    setCurrentPage(1);
  } else {
    prevCyclesLength.current = cycles.length;
  }

  const paginatedCycles = useMemo(() => {
    const start = (boundedCurrentPage - 1) * itemsPerPage;
    return cycles.slice(start, start + itemsPerPage);
  }, [cycles, boundedCurrentPage, itemsPerPage]);

  const canCreate = canAccess({ requireAnyPermissions: ["ciclos.create"] });
  const canEdit = canAccess({ requireAnyPermissions: ["ciclos.edit"] });
  const canDelete = canAccess({ requireAnyPermissions: ["ciclos.delete"] });
  const canReactivate = canAccess({
    requireAnyPermissions: ["ciclos.reactivar"],
  });

  // ── Modal state ───────────────────────────────────────────────────────────

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
  }>({ isOpen: false, cycle: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
    loading: boolean;
  }>({ isOpen: false, cycle: null, loading: false });

  const [reactivateModal, setReactivateModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
    loading: boolean;
  }>({ isOpen: false, cycle: null, loading: false });

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
  }>({ isOpen: false, cycle: null });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateConfirm = async (
    form: CreateAccreditationCycleForm | EditAccreditationCycleForm,
  ) => await createCycle(form as CreateAccreditationCycleForm);

  const handleEditConfirm = async (
    form: CreateAccreditationCycleForm | EditAccreditationCycleForm,
  ) => {
    if (!formModal.cycle)
      return { success: false, error: "Sin ciclo seleccionado" };
    return updateCycle(
      formModal.cycle.ciclo_acreditacion_id,
      form as EditAccreditationCycleForm,
    );
  };

  const handleDeleteConfirm = async (confirmacion: string) => {
    if (!deleteModal.cycle) return;
    setDeleteModal((p) => ({ ...p, loading: true }));
    const result = await deleteCycle(
      deleteModal.cycle.ciclo_acreditacion_id,
      confirmacion,
    );
    setDeleteModal({ isOpen: false, cycle: null, loading: false });
    if (result.success) {
      setSuccessModal({
        isOpen: true,
        title: "Ciclo eliminado",
        message: "El ciclo fue eliminado exitosamente.",
      });
    } else {
      showToast({
        type: "error",
        title: result.error ?? "Error al eliminar el ciclo",
      });
    }
  };

  const confirmReactivate = async () => {
    if (!reactivateModal.cycle) return;
    setReactivateModal((p) => ({ ...p, loading: true }));
    const cycle = reactivateModal.cycle;
    const result = await reactivateCycle(cycle.ciclo_acreditacion_id);
    setReactivateModal({ isOpen: false, cycle: null, loading: false });
    if (result.success) {
      setSuccessModal({
        isOpen: true,
        title: "Ciclo reactivado",
        message: `El ciclo "${cycle.nombre}" fue reactivado correctamente.`,
      });
    } else {
      showToast({
        type: "error",
        title: result.error ?? "Error al reactivar el ciclo",
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer>
      <PageHeader
        title="Ciclos de Acreditación"
        description="Gestiona los ciclos de acreditación por carrera y sede."
        breadcrumbMode="none"
        headerExtra={
          canCreate ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFormModal({ isOpen: true, cycle: null })}
                >
                  Crear
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Crear nuevo ciclo de acreditación
              </TooltipContent>
            </Tooltip>
          ) : undefined
        }
      />

      <AccreditationCyclesTable
        cycles={paginatedCycles}
        isLoading={isLoading}
        currentPage={boundedCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={(cycle) => setViewModal({ isOpen: true, cycle })}
        onEdit={(cycle) => setFormModal({ isOpen: true, cycle })}
        onDelete={(cycle) =>
          setDeleteModal({ isOpen: true, cycle, loading: false })
        }
        onReactivate={(cycle) =>
          setReactivateModal({ isOpen: true, cycle, loading: false })
        }
        canEdit={canEdit}
        canDelete={canDelete}
        canReactivate={canReactivate}
      />

      {/* Modal detalles */}
      <AccreditationCycleDetailModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, cycle: null })}
        cycle={viewModal.cycle}
      />

      {/* Modal crear */}
      <AccreditationCycleFormModal
        isOpen={formModal.isOpen && !formModal.cycle}
        onClose={() => setFormModal({ isOpen: false, cycle: null })}
        onConfirm={handleCreateConfirm}
      />

      {/* Modal editar */}
      <AccreditationCycleFormModal
        isOpen={formModal.isOpen && !!formModal.cycle}
        onClose={() => setFormModal({ isOpen: false, cycle: null })}
        cycle={formModal.cycle}
        onConfirm={handleEditConfirm}
      />

      {/* Modal eliminar */}
      <AccreditationCycleDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, cycle: null, loading: false })
        }
        cycle={deleteModal.cycle}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.loading}
      />

      {/* Modal reactivar */}
      {reactivateModal.cycle && (
        <Modal
          isOpen={reactivateModal.isOpen}
          onClose={() =>
            setReactivateModal({ isOpen: false, cycle: null, loading: false })
          }
          onConfirm={confirmReactivate}
          variant="success"
          title="Confirmar reactivación"
          confirmLabel="Sí, reactivar"
          cancelLabel="Cancelar"
          confirmLoading={reactivateModal.loading}
          showCancel
          showConfirm
          footerMeta="Solo usuarios con permiso de reactivación pueden continuar"
        >
          <p
            className={cn(
              TYPOGRAPHY.modal.body,
              "text-gris-una-2 leading-relaxed",
            )}
          >
            ¿Está seguro de reactivar el ciclo{" "}
            <strong className="text-negro-una">
              "{reactivateModal.cycle.nombre}"
            </strong>
            ? Se establecerá como el ciclo activo para su carrera-sede.
          </p>
        </Modal>
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() =>
          setSuccessModal({ isOpen: false, title: "", message: "" })
        }
      />
    </ScreenContainer>
  );
};

export default AccreditationCyclesPage;
