/**
 * StructureElementsView - Vista de elementos de un modelo flexible.
 *
 * Muestra la lista de elementos con su jerarquía (padre/hijo) y permite
 * crear, editar, eliminar y activar/desactivar elementos.
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/Components/Ui/Buttons/Button';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { StructureElementFormModal } from './StructureElementFormModal';
import { useStructureElements } from '@/Hooks/UseStructureElements';
import { useToast } from '@/Context/ToastContext';
import type { FlexibleElement, CreateFlexibleElementForm, EditFlexibleElementForm } from '@/Types/StructureModelTypes';
import type { StructureModel } from '@/Types/StructureModelTypes';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface Props {
  model: StructureModel;
  onBack: () => void;
}

export const StructureElementsView: React.FC<Props> = ({ model, onBack }) => {
  const { showToast } = useToast();
  const {
    elements,
    isLoading,
    createElement,
    updateElement,
    deleteElement,
    toggleActive,
  } = useStructureElements(model.modelo_estructura_id);

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    defaultParentId: number | null;
  }>({ isOpen: false, element: null, defaultParentId: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    loading: boolean;
  }>({ isOpen: false, element: null, loading: false });

  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  // Build depth map for visual indentation (padre_id → depth)
  const depthMap = useMemo(() => {
    const map = new Map<number, number>();
    const visited = new Set<number>();

    const getDepth = (id: number): number => {
      if (map.has(id)) return map.get(id)!;
      if (visited.has(id)) return 0; // cycle guard
      visited.add(id);
      const el = elements.find(e => e.elemento_id === id);
      if (!el || el.padre_id === null) {
        map.set(id, 0);
        return 0;
      }
      const d = getDepth(el.padre_id) + 1;
      map.set(id, d);
      return d;
    };

    elements.forEach(e => getDepth(e.elemento_id));
    return map;
  }, [elements]);

  // Sort: parents before children (by depth then elemento_id)
  const sorted = useMemo(() =>
    [...elements].sort((a, b) => {
      const da = depthMap.get(a.elemento_id) ?? 0;
      const db = depthMap.get(b.elemento_id) ?? 0;
      if (da !== db) return da - db;
      return a.elemento_id - b.elemento_id;
    }),
    [elements, depthMap]
  );

  const parentName = (el: FlexibleElement) => {
    if (!el.padre_id) return null;
    const p = elements.find(e => e.elemento_id === el.padre_id);
    return p ? (p.nomenclatura ? `${p.nomenclatura} – ${p.tipo}` : p.tipo) : null;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFormConfirm = async (
    form: CreateFlexibleElementForm | EditFlexibleElementForm,
    id?: number
  ) => {
    if (id !== undefined) {
      return updateElement(id, form as EditFlexibleElementForm);
    }
    return createElement(form as CreateFlexibleElementForm);
  };

  const handleDelete = async () => {
    if (!deleteModal.element) return;
    setDeleteModal(p => ({ ...p, loading: true }));
    const result = await deleteElement(deleteModal.element.elemento_id);
    setDeleteModal({ isOpen: false, element: null, loading: false });
    if (result.success) {
      setSuccessModal({ isOpen: true, message: 'El elemento fue eliminado exitosamente.' });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al eliminar el elemento' });
    }
  };

  const handleToggleActive = async (el: FlexibleElement) => {
    const result = await toggleActive(el.elemento_id, !el.activo);
    if (!result.success) {
      showToast({ type: 'error', title: result.error ?? 'Error al cambiar el estado' });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-azul-una hover:underline w-fit"
        >
          ← Modelos de Acreditación
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className={cn(TYPOGRAPHY.pageSubtitle, 'font-bold text-negro-una')}>
              {model.nombre}
            </h2>
            {model.version && (
              <span className="text-xs text-gris-una">v{model.version}</span>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setFormModal({ isOpen: true, element: null, defaultParentId: null })}
          >
            + Agregar elemento raíz
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner variant="loader" />
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-gris-una">
          <p className="text-lg font-semibold mb-1">Sin elementos</p>
          <p className="text-sm">Crea el primer elemento raíz de este modelo.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-corner border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gris-una-2">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-gris-una-2">Nomenclatura</th>
                <th className="text-left px-4 py-3 font-semibold text-gris-una-2">Descripción</th>
                <th className="text-left px-4 py-3 font-semibold text-gris-una-2">Padre</th>
                <th className="text-left px-4 py-3 font-semibold text-gris-una-2">Cat.</th>
                <th className="text-left px-4 py-3 font-semibold text-gris-una-2">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gris-una-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(el => {
                const depth = depthMap.get(el.elemento_id) ?? 0;
                return (
                  <tr key={el.elemento_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className="font-medium text-negro-una"
                        style={{ paddingLeft: `${depth * 16}px` }}
                      >
                        {depth > 0 && <span className="text-gray-400 mr-1">└</span>}
                        {el.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gris-una font-mono text-xs">
                      {el.nomenclatura ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gris-una max-w-[200px] truncate">
                      {el.descripcion ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gris-una text-xs">
                      {parentName(el) ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {el.categoria ? (
                        <StatusBadge
                          label={el.categoria}
                          colorClasses="bg-azul-una/10 text-azul-una"
                        />
                      ) : (
                        <span className="text-gris-una">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={el.activo ? 'Activo' : 'Inactivo'}
                        colorClasses={
                          el.activo
                            ? 'bg-verde/10 text-verde'
                            : 'bg-gray-100 text-gris-una-2'
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <TableActionButton
                          action="add"
                          tooltip="Agregar hijo"
                          onClick={() =>
                            setFormModal({
                              isOpen: true,
                              element: null,
                              defaultParentId: el.elemento_id,
                            })
                          }
                        />
                        <TableActionButton
                          action="edit"
                          tooltip="Editar"
                          onClick={() =>
                            setFormModal({ isOpen: true, element: el, defaultParentId: null })
                          }
                        />
                        <TableActionButton
                          action="power"
                          isActive={el.activo}
                          tooltip={el.activo ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggleActive(el)}
                        />
                        <TableActionButton
                          action="delete"
                          tooltip="Eliminar"
                          onClick={() =>
                            setDeleteModal({ isOpen: true, element: el, loading: false })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      <StructureElementFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, element: null, defaultParentId: null })}
        modelId={model.modelo_estructura_id}
        element={formModal.element}
        defaultParentId={formModal.defaultParentId}
        allElements={elements}
        onConfirm={handleFormConfirm}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, element: null, loading: false })}
        onConfirm={handleDelete}
        itemName={deleteModal.element?.tipo}
        title="Eliminar elemento"
        description={
          deleteModal.element
            ? 'Solo se puede eliminar si no tiene elementos hijos.'
            : undefined
        }
        isLoading={deleteModal.loading}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        title="Operación exitosa"
        message={successModal.message}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
      />
    </div>
  );
};
