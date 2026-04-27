/**
 * StructureElementFormModal - Modal para crear o editar un elemento flexible.
 *
 * Flujo: EntityFormModal → CreateConfirmationModal / EditConfirmationModal → SuccessModal
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { useToast } from '@/Context/ToastContext';
import type {
  FlexibleElement,
  CreateFlexibleElementForm,
  EditFlexibleElementForm,
  TipoJerarquia,
} from '@/Types/StructureModelTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  modelId: number;
  /** Jerarquía de tipos del modelo. Si es null/vacío, el tipo es libre (texto). */
  tiposJerarquia?: TipoJerarquia[] | null;
  /** Tipos asignables disponibles para el modelo (fallback si no hay jerarquía). */
  tiposAsignables?: string[] | null;
  /** Si se pasa, el modal está en modo edición */
  element?: FlexibleElement | null;
  /** Padre preseleccionado para creación de hijos */
  defaultParentId?: number | null;
  allElements: FlexibleElement[];
  /** Indica que la lista de elementos aún está cargando (bloquea el select de padre) */
  isLoadingElements?: boolean;
  onConfirm: (
    form: CreateFlexibleElementForm | EditFlexibleElementForm,
    id?: number
  ) => Promise<{ success: boolean; error?: string }>;
}

interface FormData {
  tipo: string;
  nombre: string;
  nomenclatura: string;
  descripcion: string;
  categoria: string;
  padre_id: string;
}

interface FormErrors {
  tipo?: string;
  nombre?: string;
  nomenclatura?: string;
  descripcion?: string;
  categoria?: string;
  padre_id?: string;
}

const EMPTY: FormData = { tipo: '', nombre: '', nomenclatura: '', descripcion: '', categoria: '', padre_id: '' };

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Sin categoría' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];

const buildParentOptionLabel = (entry: FlexibleElement): string => {
  const normalizedName = entry.nombre?.trim() || '';
  const normalizedDescription = entry.descripcion?.trim() || '';
  const mainLabel = normalizedName || normalizedDescription || entry.tipo;
  const typeSuffix = mainLabel !== entry.tipo ? ` (${entry.tipo})` : '';
  const nomenclaturePrefix = entry.nomenclatura?.trim()
    ? `${entry.nomenclatura.trim()} – `
    : '';

  return `${nomenclaturePrefix}${mainLabel}${typeSuffix}`;
};

export const StructureElementFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  modelId,
  tiposJerarquia,
  tiposAsignables,
  element,
  defaultParentId,
  allElements,
  isLoadingElements = false,
  onConfirm,
}) => {
  const isEditing = !!element;
  const { showToast } = useToast();

  const effectiveHierarchy = useMemo<TipoJerarquia[]>(() => {
    const normalized = (tiposJerarquia ?? [])
      .map((entry) => ({
        tipo: entry.tipo.trim(),
        padre_tipo: entry.padre_tipo?.trim() || null,
      }))
      .filter((entry) => entry.tipo.length > 0);

    if (normalized.length <= 1) return normalized;

    const hasDefinedParents = normalized.some((entry) => entry.padre_tipo !== null);
    if (hasDefinedParents) return normalized;

    // Fallback defensivo: si backend devuelve todos los padre_tipo en null,
    // se asume jerarquía lineal según el orden recibido.
    return normalized.map((entry, index) => ({
      ...entry,
      padre_tipo: index === 0 ? null : normalized[index - 1]?.tipo ?? null,
    }));
  }, [tiposJerarquia]);

  // Prioridad de selector de tipo: jerarquía del modelo -> tipos asignables -> texto libre.
  const tipoOptions = useMemo(() => {
    if (effectiveHierarchy.length) {
      return effectiveHierarchy.map((t) => ({ value: t.tipo, label: t.tipo }));
    }

    const normalizedAssignableTypes = Array.from(new Set(
      (tiposAsignables ?? [])
        .map((tipo) => tipo.trim())
        .filter((tipo) => tipo.length > 0),
    ));

    if (normalizedAssignableTypes.length > 0) {
      return normalizedAssignableTypes.map((tipo) => ({ value: tipo, label: tipo }));
    }

    return null;
  }, [effectiveHierarchy, tiposAsignables]);

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: '' });

  const selectedHierarchyEntry = useMemo(() => {
    if (!form.tipo.trim()) return null;
    return effectiveHierarchy.find((entry) => entry.tipo === form.tipo) ?? null;
  }, [effectiveHierarchy, form.tipo]);

  const isRootTypeSelected = selectedHierarchyEntry
    ? selectedHierarchyEntry.padre_tipo === null
    : false;

  const requiredParentType = selectedHierarchyEntry?.padre_tipo ?? null;

  const matchingActiveParents = useMemo(() => {
    if (!requiredParentType) return [];
    return allElements.filter(
      (entry) => entry.activo && entry.tipo === requiredParentType && entry.elemento_id !== element?.elemento_id,
    );
  }, [allElements, requiredParentType, element]);

  const parentIsRequired = !isEditing && selectedHierarchyEntry !== null && !isRootTypeSelected;

  // Opciones de padre: filtradas por jerarquía si está definida
  const parentOptions = useMemo(() => {
    let available = allElements.filter(
      el => el.activo && el.elemento_id !== element?.elemento_id
    );

    // Con jerarquía: solo mostrar elementos del tipo-padre correcto
    if (selectedHierarchyEntry) {
      if (!selectedHierarchyEntry.padre_tipo) {
          // Tipo raíz → no puede tener padre
        return [{ value: '', label: 'Elemento raíz (sin padre)' }];
      }

      // Filtrar solo elementos del tipo-padre correcto
      available = available.filter((entry) => entry.tipo === selectedHierarchyEntry.padre_tipo);

      return available.map((entry) => ({
        value: String(entry.elemento_id),
        label: buildParentOptionLabel(entry),
      }));
    }

    const base = [{ value: '', label: 'Ninguno (elemento raíz)' }];
    const mapped = available.map(el => ({
      value: String(el.elemento_id),
      label: buildParentOptionLabel(el),
    }));
    return [...base, ...mapped];
  }, [allElements, element, selectedHierarchyEntry]);

  useEffect(() => {
    if (isOpen) {
      if (element) {
        setForm({
          tipo: element.tipo,
          nombre: element.nombre ?? '',
          nomenclatura: element.nomenclatura ?? '',
          descripcion: element.descripcion ?? '',
          categoria: element.categoria ?? '',
          padre_id: element.padre_id ? String(element.padre_id) : '',
        });
      } else {
        setForm({
          ...EMPTY,
          padre_id: defaultParentId ? String(defaultParentId) : '',
        });
      }
      setErrors({});
      setConfirmOpen(false);
    }
  }, [isOpen, element, defaultParentId]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.tipo.trim()) next.tipo = 'El tipo es obligatorio.';
    else if (form.tipo.trim().length > 30) next.tipo = 'Máximo 30 caracteres.';
    if (!form.nombre.trim()) next.nombre = 'El nombre es obligatorio.';
    else if (form.nombre.length > 100) next.nombre = 'Máximo 100 caracteres.';
    if (!form.nomenclatura.trim()) next.nomenclatura = 'La nomenclatura es obligatoria.';
    else if (form.nomenclatura.length > 20) next.nomenclatura = 'Máximo 20 caracteres.';
    if (!form.categoria) next.categoria = 'La categoría es obligatoria.';
    if (!isEditing && parentIsRequired) {
      if (matchingActiveParents.length === 0) {
        next.padre_id = requiredParentType
          ? `No hay elementos activos de tipo "${requiredParentType}" para asignar como padre.`
          : 'No hay elementos disponibles para asignar como padre.';
      } else if (!form.padre_id) {
        next.padre_id = 'Debe seleccionar un elemento padre para este tipo.';
      }
    }
    if (form.descripcion.length > 500) next.descripcion = 'Máximo 500 caracteres.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitRequest = () => {
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setOpLoading(true);
    let result: { success: boolean; error?: string };
    if (isEditing) {
      const payload: EditFlexibleElementForm = {
        tipo: form.tipo.trim(),
        nombre: form.nombre.trim() || undefined,
        nomenclatura: form.nomenclatura.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        categoria: (form.categoria as 'A' | 'B' | 'C' | 'D') || null,
      };
      result = await onConfirm(payload, element!.elemento_id);
    } else {
      const payload: CreateFlexibleElementForm = {
        modelo_estructura_id: modelId,
        padre_id: form.padre_id ? Number(form.padre_id) : null,
        tipo: form.tipo.trim(),
        nombre: form.nombre.trim() || undefined,
        nomenclatura: form.nomenclatura.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        categoria: (form.categoria as 'A' | 'B' | 'C' | 'D') || null,
      };
      result = await onConfirm(payload);
    }
    setOpLoading(false);
    setConfirmOpen(false);
    if (result.success) {
      setSuccess({ isOpen: true, name: form.tipo.trim() });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al guardar el elemento' });
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
        title={isEditing ? 'Editar Elemento' : 'Crear Elemento'}
        subtitle={isEditing ? element?.tipo : undefined}
        confirmLabel={isEditing ? 'Guardar' : 'Crear'}
        isEditing={isEditing}
        size="md"
      >
        <div className="flex flex-col gap-4">
          {tipoOptions ? (
            <CustomSelect
              label="Tipo"
              required
              value={form.tipo}
              onChange={val => setForm(p => ({ ...p, tipo: val, padre_id: '' }))}
              options={tipoOptions}
              error={errors.tipo}
              placeholder="Seleccionar tipo…"
            />
          ) : (
            <Input
              label="Tipo"
              required
              value={form.tipo}
              onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
              error={errors.tipo}
              maxLength={30}
              characterCount
              placeholder="Ej: Pauta, Componente, Criterio…"
            />
          )}
          <Input
            label="Nombre"
            required
            value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            error={errors.nombre}
            maxLength={100}
            characterCount
            placeholder="Ej: Gestión Institucional"
          />
          <Input
            label="Nomenclatura"
            required
            value={form.nomenclatura}
            onChange={e => setForm(p => ({ ...p, nomenclatura: e.target.value }))}
            error={errors.nomenclatura}
            maxLength={20}
            characterCount
            placeholder="Ej: P1, C2.1"
          />
          <CustomSelect
            label="Categoría"
            required
            value={form.categoria}
            onChange={val => setForm(p => ({ ...p, categoria: val }))}
            options={CATEGORIA_OPTIONS}
            error={errors.categoria}
          />
          {!isEditing && (
            <CustomSelect
              label={isRootTypeSelected ? 'Elemento padre (raíz)' : 'Elemento padre'}
              required={parentIsRequired}
              value={form.padre_id}
              onChange={val => setForm(p => ({ ...p, padre_id: val }))}
              options={isLoadingElements ? [] : parentOptions}
              disabled={isLoadingElements || isRootTypeSelected}
              placeholder={
                isLoadingElements
                  ? 'Cargando elementos...'
                  : isRootTypeSelected
                    ? 'Elemento raíz (sin padre)'
                    : form.tipo
                      ? 'Seleccionar...'
                      : 'Seleccione primero un tipo'
              }
              error={errors.padre_id}
            />
          )}
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            error={errors.descripcion}
            placeholder="Descripción detallada del elemento"
            maxLength={500}
            characterCount
            rows={3}
          />
        </div>
      </EntityFormModal>

      {isEditing ? (
        <EditConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.tipo}
          itemType="elemento"
          isLoading={opLoading}
        />
      ) : (
        <CreateConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.tipo}
          itemType="elemento"
          isLoading={opLoading}
        />
      )}

      <SuccessModal
        isOpen={success.isOpen}
        title={isEditing ? 'Elemento actualizado' : 'Elemento creado'}
        message={
          isEditing
            ? `El elemento "${success.name}" fue actualizado exitosamente.`
            : `El elemento "${success.name}" fue creado exitosamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
