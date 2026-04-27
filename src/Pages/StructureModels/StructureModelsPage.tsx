/**
 * StructureModelsPage - PÃ¡gina de gestiÃ³n de modelos de acreditaciÃ³n.
 *
 * Vista "modelos": tarjetas de cada modelo (tradicional + flexibles).
 * Vista "estructura": elementos del modelo seleccionado (?modelo=0 tradicional, ?modelo=<id> flexible).
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ScreenContainer } from "@/Components/Ui/Layout/ScreenContainer";
import {
  PageHeader,
  Button,
  LoadingSpinner,
  StructureModelCard,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/Ui/Index";
import { DeleteConfirmationModal } from "@/Components/Ui/Modals/DeleteConfirmationModal";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { StructureElementsView } from "../Structure/Components/StructureElementView";
import StructureList from "../Structure/StructureList";
import { StructureModelFormModal } from "./Components/StructureModelFormModal";
import { StructureModelDeleteModal } from "./Components/StructureModelDeleteModal";
import { useStructureModels } from "@/Hooks/UseStructureModels";
import { useAccreditationCycles } from "@/Hooks/UseAccreditationCycles";
import { useStructureElements } from "@/Hooks/UseStructureElements";
import { useToast } from "@/Context/ToastContext";
import type {
  StructureModel,
  FlexibleElement,
  CreateModelForm,
  EditModelForm,
} from "@/Types/StructureModelTypes";
import { cn } from "@/Utils/ClassNames";
import { truncateText } from "@/Utils";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { ROUTES } from "@/Constants/ROUTES";

const getModelIdFromSearchParams = (params: URLSearchParams): number | null => {
  const raw = params.get("modelo");
  if (raw === null) return null;

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const notifiedInvalidModelIds = new Set<number>();

type StructureModelsPageProps = {
  embedded?: boolean;
  onHeaderExtraChange?: (headerExtra: React.ReactNode) => void;
};

const StructureModelsPage: React.FC<StructureModelsPageProps> = ({
  embedded = false,
  onHeaderExtraChange,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const {
    models,
    isLoading,
    hasLoaded,
    createModel,
    updateModel,
    toggleActive,
    deleteModel,
  } = useStructureModels();
  const { cycles, isLoading: isLoadingCycles } = useAccreditationCycles();

  const selectedModelId = useMemo(
    () => getModelIdFromSearchParams(searchParams),
    [searchParams],
  );

  const selectedModel = useMemo(
    () =>
      selectedModelId === null
        ? null
        : models.find((m) => m.modelo_estructura_id === selectedModelId) ?? null,
    [models, selectedModelId],
  );

  const flexibleModelId =
    selectedModel?.tipo === "elemento_flexible"
      ? selectedModel.modelo_estructura_id
      : null;

  const {
    elements: flexibleElements,
    isLoading: isLoadingFlexibleElements,
    createElement: createFlexibleElement,
    updateElement: updateFlexibleElement,
    deleteElement: deleteFlexibleElement,
    toggleActive: toggleFlexibleElement,
  } = useStructureElements(flexibleModelId);

  useEffect(() => {
    if (!hasLoaded || selectedModelId === null || selectedModelId === 0) return;

    if (!selectedModel || selectedModel.tipo !== "elemento_flexible") {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete("modelo");
      setSearchParams(nextSearchParams, { replace: true });

      if (!selectedModel && !notifiedInvalidModelIds.has(selectedModelId)) {
        notifiedInvalidModelIds.add(selectedModelId);
        showToast({
          type: "error",
          title: "El modelo seleccionado no existe o no estÃ¡ disponible.",
        });
      }
    }
  }, [
    hasLoaded,
    searchParams,
    selectedModel,
    selectedModelId,
    setSearchParams,
    showToast,
  ]);

  const modelIdsWithCycles = useMemo(() => {
    return new Set(cycles.map((cycle) => cycle.modelo_estructura_id));
  }, [cycles]);

  const hasAssociatedCycles = (modelId: number): boolean => {
    return modelIdsWithCycles.has(modelId);
  };

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    model: StructureModel | null;
  }>({ isOpen: false, model: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    model: StructureModel | null;
    loading: boolean;
    hasCiclos: boolean;
  }>({ isOpen: false, model: null, loading: false, hasCiclos: false });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [toggleModal, setToggleModal] = useState<{
    isOpen: boolean;
    model: StructureModel | null;
    loading: boolean;
  }>({ isOpen: false, model: null, loading: false });

  const [flexDeleteModal, setFlexDeleteModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    loading: boolean;
  }>({ isOpen: false, element: null, loading: false });

  const moduleInfo = getModuleInfo("accreditation_models");
  const structureModuleInfo = getModuleInfo("structure_list");

  const headerExtra = useMemo(
    () => (
      <div className="flex items-center gap-2">
        {!embedded && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.ACCREDITATION_CYCLES)}
              >
                Ir a Ciclos
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Ir a ciclos de acreditaciÃƒÂ³n
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFormModal({ isOpen: true, model: null })}
            >
              Crear
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Crear nuevo modelo</TooltipContent>
        </Tooltip>
      </div>
    ),
    [embedded, navigate],
  );

  useEffect(() => {
    if (!embedded) return undefined;

    onHeaderExtraChange?.(headerExtra);
    return () => onHeaderExtraChange?.(null);
  }, [embedded, headerExtra, onHeaderExtraChange]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleCreateConfirm = async (form: CreateModelForm | EditModelForm) => {
    return createModel(form as CreateModelForm);
  };

  const handleEditConfirm = async (form: CreateModelForm | EditModelForm) => {
    if (!formModal.model)
      return { success: false, error: "Sin modelo seleccionado" };
    return updateModel(
      formModal.model.modelo_estructura_id,
      form as EditModelForm,
    );
  };

  const handleFormConfirm = async (form: CreateModelForm | EditModelForm) => {
    if (formModal.model) {
      return handleEditConfirm(form);
    }
    return handleCreateConfirm(form);
  };

  const handleToggleActive = (model: StructureModel) => {
    setToggleModal({ isOpen: true, model, loading: false });
  };

  const confirmToggleActive = async () => {
    if (!toggleModal.model) return;
    setToggleModal((p) => ({ ...p, loading: true }));
    const m = toggleModal.model;
    const result = await toggleActive(m.modelo_estructura_id, !m.activo);
    setToggleModal({ isOpen: false, model: null, loading: false });
    if (result.success) {
      const action = m.activo ? "inactivado" : "activado";
      setSuccessModal({
        isOpen: true,
        title: m.activo ? "Modelo inactivado" : "Modelo activado",
        message: `El modelo "${m.nombre}" ha sido ${action} correctamente.`,
      });
    } else {
      showToast({
        type: "error",
        title: result.error ?? "Error al cambiar el estado",
      });
    }
  };

  const handleDeleteConfirm = async (confirmacion: string) => {
    if (!deleteModal.model) return;
    setDeleteModal((p) => ({ ...p, loading: true }));
    const result = await deleteModel(
      deleteModal.model!.modelo_estructura_id,
      confirmacion,
    );
    setDeleteModal({
      isOpen: false,
      model: null,
      loading: false,
      hasCiclos: false,
    });
    if (result.success) {
      setSuccessModal({
        isOpen: true,
        title: "Modelo eliminado",
        message: "El modelo fue eliminado exitosamente.",
      });
    } else {
      showToast({
        type: "error",
        title: result.error ?? "Error al eliminar el modelo",
      });
    }
  };

  const handleFlexibleDeleteConfirm = async () => {
    if (!flexDeleteModal.element) return;

    const element = flexDeleteModal.element;
    setFlexDeleteModal((prev) => ({ ...prev, loading: true }));
    const result = await deleteFlexibleElement(element.elemento_id);
    setFlexDeleteModal({ isOpen: false, element: null, loading: false });

    if (result.success) {
      setSuccessModal({
        isOpen: true,
        title: "Elemento eliminado",
        message: `El elemento "${truncateText(element.tipo)}" fue eliminado exitosamente.`,
      });
      return;
    }

    showToast({
      type: "error",
      title: result.error ?? "Error al eliminar el elemento",
    });
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (selectedModelId === 0) {
    return (
      <StructureList
        title={structureModuleInfo.title}
        description={structureModuleInfo.description}
        showModelsBreadcrumb
      />
    );
  }

  if (selectedModel && selectedModel.tipo === "elemento_flexible") {
    return (
      <ScreenContainer>
        <StructureElementsView
          model={selectedModel}
          title={structureModuleInfo.title}
          description={structureModuleInfo.description}
          elements={flexibleElements}
          isLoadingElements={isLoadingFlexibleElements}
          onCreateElement={createFlexibleElement}
          onUpdateElement={updateFlexibleElement}
          onToggleElement={toggleFlexibleElement}
          onDeleteRequest={(element) =>
            setFlexDeleteModal({ isOpen: true, element, loading: false })
          }
        />

        <DeleteConfirmationModal
          isOpen={flexDeleteModal.isOpen}
          onClose={() =>
            setFlexDeleteModal({ isOpen: false, element: null, loading: false })
          }
          onConfirm={handleFlexibleDeleteConfirm}
          itemName={flexDeleteModal.element?.tipo}
          title="Eliminar elemento"
          description={
            flexDeleteModal.element
              ? "Solo se puede eliminar si no tiene elementos hijos."
              : undefined
          }
          confirmLabel="SÃ­, eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={flexDeleteModal.loading}
        />

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
  }

  const content = (
    <>
      {!embedded && (
        <PageHeader
          title={moduleInfo.title}
          description={moduleInfo.description}
          breadcrumbMode="simple"
          headerExtra={headerExtra}
        />
      )}
      {isLoading ? (
        <LoadingSpinner variant="loader" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.map((model) => {
            const modelHasCycles = hasAssociatedCycles(
              model.modelo_estructura_id,
            );

            return (
              <StructureModelCard
                key={model.modelo_estructura_id}
                model={model}
                hasCiclos={modelHasCycles}
                onEdit={() => setFormModal({ isOpen: true, model })}
                onToggleActive={() => handleToggleActive(model)}
                onDelete={() =>
                  setDeleteModal({
                    isOpen: true,
                    model,
                    loading: false,
                    hasCiclos: modelHasCycles,
                  })
                }
              />
            );
          })}

          {models.length === 0 && (
            <p
              className={cn(
                TYPOGRAPHY.body,
                "text-gris-una col-span-full text-center py-12",
              )}
            >
              No hay modelos configurados.
            </p>
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      <StructureModelFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, model: null })}
        model={formModal.model}
        onConfirm={handleFormConfirm}
        hasAssociatedCycles={
          formModal.model
            ? hasAssociatedCycles(formModal.model.modelo_estructura_id)
            : false
        }
        isCycleCheckLoading={isLoadingCycles}
      />

      {/* Modal eliminar */}
      <StructureModelDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            model: null,
            loading: false,
            hasCiclos: false,
          })
        }
        model={deleteModal.model}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.loading}
        hasCiclos={deleteModal.hasCiclos}
      />

      {/* Modal confirmar activar/desactivar */}
      {toggleModal.model && (
        <Modal
          isOpen={toggleModal.isOpen}
          onClose={() =>
            setToggleModal({ isOpen: false, model: null, loading: false })
          }
          onConfirm={confirmToggleActive}
          variant={toggleModal.model.activo ? "info" : "success"}
          title={
            toggleModal.model.activo
              ? "Confirmar inactivaciÃ³n"
              : "Confirmar activaciÃ³n"
          }
          confirmLabel={
            toggleModal.model.activo ? "SÃ­, inactivar" : "SÃ­, activar"
          }
          cancelLabel="Cancelar"
          confirmLoading={toggleModal.loading}
          showCancel
          showConfirm
          footerMeta={
            toggleModal.model.activo
              ? "Esta acciÃ³n puede ser revertida"
              : undefined
          }
        >
          <p
            className={cn(
              TYPOGRAPHY.modal.body,
              "text-gris-una-2 leading-relaxed wrap-anywhere",
            )}
          >
            Â¿EstÃ¡ seguro de que desea{" "}
            {toggleModal.model.activo ? "inactivar" : "activar"} el modelo{" "}
            <strong className="text-negro-una">
              "{toggleModal.model.nombre}"
            </strong>
            ?
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
    </>
  );

  if (embedded) return content;

  return <ScreenContainer>{content}</ScreenContainer>;
};

export default StructureModelsPage;
