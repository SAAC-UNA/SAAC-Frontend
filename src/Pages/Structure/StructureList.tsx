/**
 * StructureList - Página principal de elementos de estructura tradicional.
 *
 * Esta página maneja exclusivamente el dominio tradicional.
 * Si llega una query de modelo flexible (?modelo=<id>), redirige a
 * la página de modelos de estructura.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import { CustomSelect } from "@/Components/Ui/Forms/SingleSelect";
import { Card } from "@/Components/Ui/Layout/Card";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/Components/Ui/Feedback/Breadcrumb";

type StructureLocationState = {
  modelId?: number | null;
  modelName?: string;
  lockModelSelection?: boolean;
  from?: string;
};

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
  const location = useLocation();
  const navigationState =
    (location.state as StructureLocationState | null) ?? null;
  const lockModelSelection = navigationState?.lockModelSelection === true;
  const lockedModelId =
    typeof navigationState?.modelId === "number" && navigationState.modelId > 0
      ? navigationState.modelId
      : null;

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

  const SESSION_KEY = "saac.structure.lastModel";

  const initialModelId = (): number | null => {
    // Prioridad 1: estado de navegación (viene de la tarjeta de un modelo)
    if (lockModelSelection) {
      return lockedModelId;
    }
    // Prioridad 2: último modelo usado en esta sesión
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored && stored !== "0") {
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    // Por defecto: Modelo Tradicional
    return null;
  };

  const [selectedModelId, setSelectedModelId] = useState<number | null>(
    initialModelId,
  );

  // Sincronizar selección con sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      SESSION_KEY,
      selectedModelId !== null ? String(selectedModelId) : "0",
    );
  }, [selectedModelId]);

  const selectedModel = useMemo(
    () =>
      models.find((m) => m.modelo_estructura_id === selectedModelId) ?? null,
    [models, selectedModelId],
  );

  const currentStructureLabel = useMemo(() => {
    if (lockModelSelection && navigationState?.modelName) {
      return navigationState.modelName;
    }

    return selectedModel?.nombre ?? "Modelo Tradicional";
  }, [lockModelSelection, navigationState?.modelName, selectedModel?.nombre]);

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];

    if (
      lockModelSelection ||
      navigationState?.from === ROUTES.STRUCTURE_MODELS
    ) {
      items.push({
        label: "Modelos de Acreditación",
        href: ROUTES.STRUCTURE_MODELS,
      });
    }

    items.push({
      label: currentStructureLabel,
      current: true,
    });

    return items;
  }, [currentStructureLabel, lockModelSelection, navigationState?.from]);

  const modelOptions = useMemo(
    () => [
      { value: "0", label: "Modelo Tradicional" },
      ...models
        .filter((m) => m.tipo !== "tradicional")
        .map((m) => ({
          value: String(m.modelo_estructura_id),
          label: m.nombre,
        })),
    ],
    [models],
  );

  const handleModelChange = (val: string) => {
    const newId = val === "0" ? null : Number(val);
    setSelectedModelId(newId);
    setSearchQuery("");
  };

  useEffect(() => {
    if (!lockModelSelection) {
      return;
    }

    setSelectedModelId(lockedModelId);
    setSearchQuery("");
  }, [lockModelSelection, lockedModelId]);

  const headerTitle = title ?? moduleInfo.title;
  const headerDescription = description ?? currentStructureLabel;

  // Cargar árbol al montar la página
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
        <Breadcrumb items={breadcrumbItems} className="mb-3" />
        <PageHeader
          title={headerTitle}
          description={headerDescription}
          breadcrumbMode="none"
          headerExtra={
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto items-end">
              {!lockModelSelection && (
                <Card className="w-80">
                  <CustomSelect
                    label="Modelo"
                    value={
                      selectedModelId === null ? "0" : String(selectedModelId)
                    }
                    onChange={handleModelChange}
                    options={modelOptions}
                  />
                </Card>
              )}
              <SearchInput
                placeholder="Buscar elementos..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full sm:w-72"
              />
              <Button
                onClick={() => navigate(ROUTES.STRUCTURE_MODELS)}
                variant="outline"
              >
                Regresar
              </Button>
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
