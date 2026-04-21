/**
 * StructureModelFormModal - Modal para crear o editar un modelo de acreditación flexible.
 *
 * Flujo: EntityFormModal → CreateConfirmationModal / EditConfirmationModal → SuccessModal
 */

import React, { useEffect, useMemo, useState } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { Button } from '@/Components/Ui/Buttons/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Index';
import { useToast } from '@/Context/ToastContext';
import { useStructureElements } from '@/Hooks/UseStructureElements';
import { buildHierarchyPath } from '@/Components/Ui/Cards/StructureModelCard';
import { Card as KanbanCard, CardContent as KanbanCardContent } from '@/Components/Ui/KanbanBoard/card';
import { Badge as KanbanBadge } from '@/Components/Ui/KanbanBoard/badge';
import type { StructureModel, CreateModelForm, EditModelForm, TipoJerarquia } from '@/Types/StructureModelTypes';
import { cn } from '@/Utils/ClassNames';

interface JerarquiaRow extends TipoJerarquia {}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  model?: StructureModel | null;
  onConfirm: (form: CreateModelForm | EditModelForm) => Promise<{ success: boolean; error?: string }>;
  hasAssociatedCycles?: boolean;
  isCycleCheckLoading?: boolean;
}

interface FormData {
  nombre: string;
  descripcion: string;
  version: string;
  tipos_jerarquia: JerarquiaRow[];
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  version?: string;
}

const EMPTY: FormData = { nombre: '', descripcion: '', version: '', tipos_jerarquia: [] };

const cloneRows = (rows: JerarquiaRow[]): JerarquiaRow[] => rows.map((row) => ({ ...row }));

const sanitizeHierarchyRows = (rows: JerarquiaRow[]): TipoJerarquia[] => {
  return rows
    .map((row) => ({
      tipo: row.tipo.trim(),
      padre_tipo: row.padre_tipo?.trim() || null,
    }))
    .filter((row) => row.tipo.length > 0);
};

const getInitialHierarchyRows = (
  hierarchy: TipoJerarquia[] | null | undefined,
): JerarquiaRow[] => {
  const normalized = sanitizeHierarchyRows((hierarchy ?? []).map((row) => ({
    tipo: row.tipo,
    padre_tipo: row.padre_tipo,
  })));

  if (normalized.length === 0) return [];

  return normalized.map((row) => ({ ...row }));
};

const serializeHierarchy = (rows: JerarquiaRow[]): string => {
  const normalized = sanitizeHierarchyRows(rows);
  const sorted = [...normalized].sort((a, b) => {
    const byTipo = a.tipo.localeCompare(b.tipo);
    if (byTipo !== 0) return byTipo;
    return (a.padre_tipo ?? '').localeCompare(b.padre_tipo ?? '');
  });
  return JSON.stringify(sorted);
};

const enforceLinearHierarchy = (rows: JerarquiaRow[]): JerarquiaRow[] => {
  return rows.map((row, index) => ({
    ...row,
    padre_tipo: index === 0 ? null : rows[index - 1]?.tipo.trim() || null,
  }));
};

const buildHierarchyBreadcrumbs = (rows: JerarquiaRow[]): string[] => {
  const normalized = sanitizeHierarchyRows(enforceLinearHierarchy(rows));
  const path = buildHierarchyPath(normalized);
  if (path === 'Jerarquia sin definir') return [];
  return path.split(' > ').flatMap((item) => {
    const trimmed = item.trim();
    return trimmed ? [trimmed] : [];
  });
};

export const StructureModelFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  model,
  onConfirm,
  hasAssociatedCycles = false,
  isCycleCheckLoading = false,
}) => {
  const isEditing = !!model;
  const { showToast } = useToast();
  const modelId = model?.modelo_estructura_id ?? null;
  const { elements, isLoading: isLoadingElements } = useStructureElements(
    isEditing ? modelId : null,
  );

  const [form, setForm] = useState<FormData>(EMPTY);
  const [initialForm, setInitialForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: '' });
  const [newHierarchyType, setNewHierarchyType] = useState('');
  const [draggedHierarchyIndex, setDraggedHierarchyIndex] = useState<number | null>(null);

  const hasAssociatedElements = isEditing && elements.length > 0;

  const hierarchyLockReason = useMemo(() => {
    if (!isEditing) return null;

    if (isCycleCheckLoading || isLoadingElements) {
      return 'Validando si el modelo tiene ciclos o elementos asociados...';
    }

    const reasons: string[] = [];
    if (hasAssociatedCycles) reasons.push('ciclos de acreditacion asociados');
    if (hasAssociatedElements) reasons.push('elementos asociados');

    if (reasons.length === 0) return null;

    return `No se puede editar la jerarquia porque este modelo tiene ${reasons.join(' y ')}.`;
  }, [
    hasAssociatedCycles,
    hasAssociatedElements,
    isCycleCheckLoading,
    isEditing,
    isLoadingElements,
  ]);

  const canEditHierarchy = !isEditing || hierarchyLockReason === null;

  const setLinearHierarchyRows = (rows: JerarquiaRow[]) => {
    setForm((prev) => ({
      ...prev,
      tipos_jerarquia: enforceLinearHierarchy(rows),
    }));
  };

  const handleAddLinearLevel = () => {
    const nextTipo = newHierarchyType.trim();
    if (!nextTipo) {
      showToast({ type: 'error', title: 'Escriba un nombre de tipo antes de agregarlo.' });
      return;
    }

    setLinearHierarchyRows([
      ...form.tipos_jerarquia,
      { tipo: nextTipo, padre_tipo: null },
    ]);
    setNewHierarchyType('');
  };

  const handleUpdateLinearLevel = (index: number, value: string) => {
    const nextRows = form.tipos_jerarquia.map((row, rowIndex) =>
      rowIndex === index ? { ...row, tipo: value } : row,
    );
    setLinearHierarchyRows(nextRows);
  };

  const handleRemoveLinearLevel = (index: number) => {
    const nextRows = form.tipos_jerarquia.filter((_, rowIndex) => rowIndex !== index);
    setLinearHierarchyRows(nextRows);
  };

  const handleDropLinearLevel = (targetIndex: number) => {
    if (draggedHierarchyIndex === null || draggedHierarchyIndex === targetIndex) {
      setDraggedHierarchyIndex(null);
      return;
    }

    const nextRows = [...form.tipos_jerarquia];
    const [draggedRow] = nextRows.splice(draggedHierarchyIndex, 1);
    nextRows.splice(targetIndex, 0, draggedRow);
    setLinearHierarchyRows(nextRows);
    setDraggedHierarchyIndex(null);
  };

  const hasChanges = useMemo(() => {
    if (!isEditing) return true;

    const metadataChanged =
      form.nombre.trim() !== initialForm.nombre.trim() ||
      form.descripcion.trim() !== initialForm.descripcion.trim() ||
      form.version.trim() !== initialForm.version.trim();

    if (metadataChanged) return true;

    if (!canEditHierarchy) return false;

    return serializeHierarchy(form.tipos_jerarquia) !== serializeHierarchy(initialForm.tipos_jerarquia);
  }, [canEditHierarchy, form, initialForm, isEditing]);

  const hierarchyBreadcrumbs = useMemo(
    () => buildHierarchyBreadcrumbs(form.tipos_jerarquia),
    [form.tipos_jerarquia],
  );

  useEffect(() => {
    if (isOpen) {
      const nextForm: FormData = model
        ? {
            nombre: model.nombre,
            descripcion: model.descripcion ?? '',
            version: model.version ?? '',
            tipos_jerarquia: getInitialHierarchyRows(model.tipos_jerarquia),
          }
        : {
            ...EMPTY,
            tipos_jerarquia: cloneRows(EMPTY.tipos_jerarquia),
          };

      setForm(
        nextForm
      );
      setInitialForm({
        ...nextForm,
        tipos_jerarquia: cloneRows(nextForm.tipos_jerarquia),
      });
      setErrors({});
      setConfirmOpen(false);
      setNewHierarchyType('');
      setDraggedHierarchyIndex(null);
    }
  }, [isOpen, model]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) {
      setErrors(next);
      showToast({
        type: 'error',
        title: 'Debe ingresar un nombre para el modelo.',
      });
      return false;
    }

    if (form.nombre.trim().length > 100) {
      next.nombre = 'Máximo 100 caracteres.';
    }
    if (form.descripcion.length > 500) {
      next.descripcion = 'Máximo 500 caracteres.';
    }
    if (form.version.length > 20) {
      next.version = 'Máximo 20 caracteres.';
    }

    const shouldValidateHierarchy = !isEditing || canEditHierarchy;
    if (shouldValidateHierarchy) {
      if (form.tipos_jerarquia.length === 0) {
        showToast({ type: 'error', title: 'Debe agregar al menos un nivel de jerarquia.' });
        setErrors(next);
        return false;
      }

      if (form.tipos_jerarquia.some(r => !r.tipo.trim())) {
        showToast({ type: 'error', title: 'Cada nivel de jerarquía debe tener un nombre.' });
        setErrors(next);
        return false;
      }

      const names = sanitizeHierarchyRows(form.tipos_jerarquia).map(r => r.tipo.toLowerCase());
      if (new Set(names).size !== names.length) {
        showToast({ type: 'error', title: 'Los nombres de los tipos de jerarquía deben ser únicos.' });
        setErrors(next);
        return false;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitRequest = () => {
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setOpLoading(true);
    const hierarchySource = canEditHierarchy
      ? enforceLinearHierarchy(form.tipos_jerarquia)
      : form.tipos_jerarquia;
    const normalizedHierarchy = sanitizeHierarchyRows(hierarchySource);

    const payload: CreateModelForm | EditModelForm = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      version: form.version.trim() || undefined,
      tipos_jerarquia:
        canEditHierarchy && normalizedHierarchy.length > 0
          ? normalizedHierarchy
          : undefined,
    };

    const result = await onConfirm(payload);
    setOpLoading(false);
    setConfirmOpen(false);

    if (result.success) {
      setSuccess({ isOpen: true, name: form.nombre.trim() });
    } else {
      showToast({
        type: 'error',
        title: isEditing ? 'No se pudo actualizar el modelo' : 'No se pudo crear el modelo',
        message: result.error ?? 'Verifique los datos ingresados e intente nuevamente.',
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ isOpen: false, name: '' });
    onClose();
  };

  return (
    <>
      <EntityFormModal
        isOpen={isOpen && !confirmOpen && !success.isOpen}
        onClose={onClose}
        onConfirm={handleSubmitRequest}
        title={isEditing ? 'Editar Modelo' : 'Crear Modelo de Acreditación'}
        subtitle={isEditing ? model?.nombre : undefined}
        confirmLabel={isEditing ? 'Guardar' : 'Crear'}
        isEditing={isEditing}
        confirmDisabled={isEditing ? !hasChanges : false}
        size="xl"
        maxHeight="xl"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input
                label="Nombre del modelo"
                required
                value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                error={errors.nombre}
                maxLength={100}
                characterCount
                placeholder="Ej: Modelo SINAES 2026"
              />

              <Input
                label="Versión"
                value={form.version}
                onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
                error={errors.version}
                maxLength={20}
                characterCount
                placeholder="Ej: 2026, 1.0"
              />
            </div>

            <Textarea
              label="Descripción"
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              error={errors.descripcion}
              maxLength={500}
              characterCount
              rows={5}
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-corner border border-gris-light bg-gris-light/15 p-4 space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-negro-una">
                      Jerarquía de tipos de elemento
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label="Información sobre jerarquía"
                          className="text-slate/70 hover:text-slate transition-colors"
                        >
                          {SystemIcons.interface.informationCircle({ size: 'sm' })}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        El orden define la jerarquía lineal, puede arrastrar las tarjetas para reordenar.
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {isEditing && !canEditHierarchy && (
                    <p className="text-xs text-gris-una-2">{hierarchyLockReason}</p>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gris-una-2">
                      Jerarquía actual
                    </p>

                    {hierarchyBreadcrumbs.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {hierarchyBreadcrumbs.map((item, idx) => (
                          <React.Fragment key={`${item}-${idx}`}>
                            <span className="px-2.5 py-1 rounded-full bg-gris-light/60 text-[11px] font-medium text-negro-una wrap-anywhere">
                              {item}
                            </span>
                            {idx < hierarchyBreadcrumbs.length - 1 && (
                              <SystemIcons.interface.chevronRight className="w-3.5 h-3.5 text-gris-una" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gris-una-2">Jerarquía sin definir</p>
                    )}
                  </div>
                </div>

                <div className="w-full xl:justify-self-start">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-start gap-2 w-full">
                    <div className="w-full sm:flex-1 sm:max-w-2xl min-w-0 min-h-18.5">
                    <Input
                      label="Nuevo tipo"
                      value={newHierarchyType}
                      maxLength={50}
                      characterCount
                      helperText="Máx. 50"
                      disabled={!canEditHierarchy}
                      placeholder="Ej: Dimension, Pauta, Fuente"
                      onChange={e => setNewHierarchyType(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLinearLevel();
                        }
                      }}
                    />
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddLinearLevel}
                      disabled={!canEditHierarchy}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-corner border border-gris-light bg-blanco-una-2/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gris-una-2">
                  Jerarquía definida
                </span>
                <KanbanBadge className="bg-azul-una/10 text-azul-una border-transparent">
                  {form.tipos_jerarquia.length} niveles
                </KanbanBadge>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="flex items-stretch gap-3 min-h-37.5">
                  {form.tipos_jerarquia.map((row, idx) => (
                    <div key={`kanban-level-${idx}`} className="flex items-center gap-3">
                      <KanbanCard
                        draggable={canEditHierarchy}
                        onDragStart={() => canEditHierarchy && setDraggedHierarchyIndex(idx)}
                        onDragEnd={() => setDraggedHierarchyIndex(null)}
                        onDragOver={(e) => canEditHierarchy && e.preventDefault()}
                        onDrop={() => canEditHierarchy && handleDropLinearLevel(idx)}
                        className={cn(
                          'min-w-65 border-gris-light bg-blanco-una',
                          canEditHierarchy && draggedHierarchyIndex === idx && 'opacity-70',
                        )}
                      >
                        <KanbanCardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <KanbanBadge className="bg-verde-ring text-verde-dark border-transparent">
                              Nivel {idx + 1}
                            </KanbanBadge>
                            <button
                              type="button"
                              title="Quitar nivel"
                              onClick={() => handleRemoveLinearLevel(idx)}
                              disabled={!canEditHierarchy}
                              className={cn(
                                'text-gris-una transition-colors',
                                !canEditHierarchy && 'opacity-40 cursor-not-allowed',
                              )}
                            >
                              <SystemIcons.interface.xCircle size="md" />
                            </button>
                          </div>

                          <Input
                            label="Tipo"
                            value={row.tipo}
                            maxLength={50}
                            characterCount
                            disabled={!canEditHierarchy}
                            placeholder="Nombre del nivel"
                            onChange={e => handleUpdateLinearLevel(idx, e.target.value)}
                          />

                          <div className="text-[11px] text-gris-una-2">
                            {idx === 0
                              ? 'Raíz del flujo'
                              : `Depende de: ${form.tipos_jerarquia[idx - 1]?.tipo || 'nivel anterior'}`}
                          </div>
                        </KanbanCardContent>
                      </KanbanCard>

                      {idx < form.tipos_jerarquia.length - 1 && (
                        <SystemIcons.interface.chevronRight className="w-4 h-4 text-gris-una" />
                      )}
                    </div>
                  ))}

                  {form.tipos_jerarquia.length === 0 && (
                    <div className="text-xs text-gris-una-2 flex items-center">
                      Agregue el primer tipo para iniciar la jerarquía.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </EntityFormModal>

      {isEditing ? (
        <EditConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.nombre}
          itemType="modelo"
          isLoading={opLoading}
        />
      ) : (
        <CreateConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.nombre}
          itemType="modelo"
          isLoading={opLoading}
        />
      )}

      <SuccessModal
        isOpen={success.isOpen}
        title={isEditing ? 'Modelo actualizado' : 'Modelo creado'}
        message={
          isEditing
            ? `El modelo "${success.name}" fue actualizado exitosamente.`
            : `El modelo "${success.name}" fue creado exitosamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
