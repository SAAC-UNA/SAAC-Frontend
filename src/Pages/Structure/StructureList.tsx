/**
 * StructureList - Página principal de elementos de estructura tradicional.
 *
 * Esta página maneja exclusivamente el dominio tradicional.
 * Si llega una query de modelo flexible (?modelo=<id>), redirige a
 * la página de modelos de estructura.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/Constants/ROUTES";
import { StructureTable } from "./Components/StructureTable";
import { StructureFormModal } from "./Components/StructureFormModal";
import { ScreenContainer } from "@/Components/Ui/Layout/ScreenContainer";
import { PageHeader } from "@/Components/Ui/Index";
import { LoadingSpinner } from "@/Components/Ui/Feedback/Loading";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import type { StructureElement } from "@/Types/StructureTypes";
import { useStructure } from "@/Hooks/UseStructure";
import { useStructureModels } from "@/Hooks/UseStructureModels";
import { DeleteConfirmationModal } from "@/Components/Ui/Modals/DeleteConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { Button } from "@/Components/Ui/Buttons/Button";
import { truncateText } from "@/Utils";
import { useToast } from "@/Context/ToastContext";

interface StructureListProps {
  title?: string;
  description?: string;
}

const getFlexibleModelIdFromSearchParams = (
  params: URLSearchParams,
): number | null => {
  const raw = params.get("modelo");
  if (raw === null || raw === "0") return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const resolveErrorTitle = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
};

const StructureList: React.FC<StructureListProps> = ({
  title,
  description,
}) => {
  const moduleInfo = getModuleInfo("structure_list");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flexibleModelId = getFlexibleModelIdFromSearchParams(searchParams);

  const { showToast } = useToast();

  const {
    isLoading,
    deleteElement,
    activateElement,
    deactivateElement,
    loadTree,
    treeData,
  } = useStructure();

  const { models } = useStructureModels();

  const traditionalModelDescription = useMemo(() => {
    const traditionalModel = models.find(
      (model) => model.tipo === "tradicional",
    );

    if (!traditionalModel) {
      return "Modelo tradicional";
    }

    return traditionalModel.version
      ? `${traditionalModel.nombre} · v${traditionalModel.version}`
      : traditionalModel.nombre;
  }, [models]);

  const headerTitle = title ?? moduleInfo.title;
  const headerDescription = description ?? traditionalModelDescription;

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    if (flexibleModelId !== null) {
      navigate(`${ROUTES.STRUCTURE_MODELS}?modelo=${flexibleModelId}`, {
        replace: true,
      });
    }
  }, [flexibleModelId, navigate]);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({
    isOpen: false,
    element: null,
  });

  const [toggleActiveModalState, setToggleActiveModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({
    isOpen: false,
    element: null,
  });

  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    elementName: string;
    action: "activate" | "deactivate" | "delete";
  }>({
    isOpen: false,
    elementName: "",
    action: "activate",
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({ isOpen: false, element: null });

  const [searchQuery, setSearchQuery] = useState("");

  const handleEditElement = (element: StructureElement) => {
    setEditModalState({ isOpen: true, element });
  };

  const handleDeleteElement = (element: StructureElement) => {
    setDeleteModalState({
      isOpen: true,
      element,
    });
  };

  const handleToggleActive = async (element: StructureElement) => {
    if (treeData.length === 0) {
      await loadTree();
    }

    setToggleActiveModalState({
      isOpen: true,
      element,
    });
  };

  const hasChildren = (element: StructureElement): boolean => {
    const flattenTree = (nodes: StructureElement[]): StructureElement[] => {
      return nodes.reduce((acc, node) => {
        acc.push(node);
        if (node.childElements && node.childElements.length > 0) {
          acc.push(...flattenTree(node.childElements));
        }
        return acc;
      }, [] as StructureElement[]);
    };

    const allElements = flattenTree(treeData);
    return allElements.some((el) => el.parentElementId === element.id);
  };

  const confirmDeleteElement = async () => {
    if (!deleteModalState.element) return;

    try {
      const result = await deleteElement(
        deleteModalState.element.type,
        deleteModalState.element.id,
      );

      if (!result) return;

      const elementName =
        deleteModalState.element.name ||
        deleteModalState.element.nomenclature ||
        "Elemento";

      setDeleteModalState({ isOpen: false, element: null });

      setSuccessModalState({
        isOpen: true,
        elementName,
        action: "delete",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: resolveErrorTitle(error, "Error al eliminar el elemento"),
      });
      setDeleteModalState({ isOpen: false, element: null });
    }
  };

  const cancelDeleteElement = () => {
    setDeleteModalState({ isOpen: false, element: null });
  };

  const confirmToggleActive = async () => {
    if (!toggleActiveModalState.element) return;

    const element = toggleActiveModalState.element;
    const action = element.active ? "deactivate" : "activate";

    try {
      let changed = false;

      if (element.active) {
        changed = await deactivateElement(element.type, element.id);
      } else {
        changed = await activateElement(element.type, element.id);
      }

      if (!changed) {
        setToggleActiveModalState({ isOpen: false, element: null });
        return;
      }

      const elementName = element.name || element.nomenclature || "Elemento";

      setToggleActiveModalState({ isOpen: false, element: null });

      setSuccessModalState({
        isOpen: true,
        elementName,
        action,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: resolveErrorTitle(error, "Error al cambiar el estado"),
      });
      setToggleActiveModalState({ isOpen: false, element: null });
    }
  };

  const cancelToggleActive = () => {
    setToggleActiveModalState({ isOpen: false, element: null });
  };

  const closeSuccessModal = () => {
    setSuccessModalState({
      isOpen: false,
      elementName: "",
      action: "activate",
    });
  };

  if (flexibleModelId !== null) {
    return (
      <ScreenContainer>
        <LoadingSpinner variant="loader" />
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer>
        <PageHeader
          title={headerTitle}
          description={headerDescription}
          breadcrumbMode="none"
          headerExtra={
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto items-end">
              <SearchInput
                placeholder="Buscar elementos..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full sm:w-72"
              />
              <Button
                onClick={() => setCreateModalOpen(true)}
                variant="secondary"
              >
                Crear
              </Button>
            </div>
          }
        />

        <StructureTable
          treeData={treeData}
          isLoading={isLoading}
          onEdit={handleEditElement}
          onDelete={handleDeleteElement}
          onToggleActive={handleToggleActive}
          searchQuery={searchQuery}
        />
      </ScreenContainer>

      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={cancelDeleteElement}
        onConfirm={confirmDeleteElement}
        title="Confirmar Eliminación"
        itemName={truncateText(
          deleteModalState.element?.name ||
            deleteModalState.element?.nomenclature ||
            "",
        )}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isLoading}
      />

      {toggleActiveModalState.element &&
        !toggleActiveModalState.element.active && (
          <Modal
            isOpen={toggleActiveModalState.isOpen}
            onClose={cancelToggleActive}
            onConfirm={confirmToggleActive}
            variant="success"
            title="Confirmar activación"
            confirmLabel="Sí, activar"
            cancelLabel="Cancelar"
            confirmLoading={isLoading}
            showCancel
            showConfirm
          >
            <p className="text-sm text-gris-una-2 leading-relaxed">
              ¿Está seguro de que desea activar "
              <strong>
                {truncateText(
                  toggleActiveModalState.element.name ||
                    toggleActiveModalState.element.nomenclature ||
                    "",
                )}
              </strong>
              "?
            </p>
            <p className="mt-2 text-sm text-gris-una-2">
              Al activar este elemento, volverá a estar disponible para su uso
              en el sistema
              {hasChildren(toggleActiveModalState.element) &&
                " y se activarán los elementos conectados a este"}
              .
            </p>
          </Modal>
        )}

      {toggleActiveModalState.element &&
        toggleActiveModalState.element.active && (
          <Modal
            isOpen={toggleActiveModalState.isOpen}
            onClose={cancelToggleActive}
            onConfirm={confirmToggleActive}
            variant="info"
            title="Confirmar inactivación"
            confirmLabel="Sí, inactivar"
            cancelLabel="Cancelar"
            confirmLoading={isLoading}
            showCancel
            showConfirm
            footerMeta="Esta acción puede ser revertida en el futuro"
          >
            <p className="text-sm text-gris-una-2 leading-relaxed">
              ¿Está seguro de que desea inactivar "
              <strong>
                {truncateText(
                  toggleActiveModalState.element.name ||
                    toggleActiveModalState.element.nomenclature ||
                    "",
                )}
              </strong>
              "?
            </p>
            <p className="mt-2 text-sm text-gris-una-2">
              Al inactivar este elemento, dejará de estar disponible en el
              sistema
              {hasChildren(toggleActiveModalState.element) &&
                " y se inactivarán los elementos conectados a este"}
              .
            </p>
          </Modal>
        )}

      <StructureFormModal
        mode="create"
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadTree();
          setCreateModalOpen(false);
        }}
      />

      <StructureFormModal
        mode="edit"
        isOpen={editModalState.isOpen}
        onClose={() => setEditModalState({ isOpen: false, element: null })}
        element={editModalState.element}
        onSuccess={() => {
          loadTree();
          setEditModalState({ isOpen: false, element: null });
        }}
      />

      <SuccessModal
        isOpen={successModalState.isOpen}
        onClose={closeSuccessModal}
        title={
          successModalState.action === "activate"
            ? "Elemento activado"
            : successModalState.action === "deactivate"
              ? "Elemento inactivado"
              : "Elemento eliminado"
        }
        message={`El elemento "${truncateText(successModalState.elementName)}" fue ${
          successModalState.action === "activate"
            ? "activado"
            : successModalState.action === "deactivate"
              ? "inactivado"
              : "eliminado"
        } exitosamente.`}
      />
    </>
  );
};

export default StructureList;
