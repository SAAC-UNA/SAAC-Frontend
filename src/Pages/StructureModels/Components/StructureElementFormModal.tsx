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
} from '@/Types/StructureModelTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  modelId: number;
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
  nomenclatura: string;
  descripcion: string;
  categoria: string;
  padre_id: string;
}

interface FormErrors {
  tipo?: string;
  nomenclatura?: string;
  descripcion?: string;
}

const EMPTY: FormData = { tipo: '', nomenclatura: '', descripcion: '', categoria: '', padre_id: '' };

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Sin categoría' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];

export const StructureElementFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  modelId,
  element,
  defaultParentId,
  allElements,
  isLoadingElements = false,
  onConfirm,
}) => {
  const isEditing = !!element;
  const { showToast } = useToast();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: '' });

  // Opciones de padre: todos los elementos activos excepto el actual
  const parentOptions = useMemo(() => {
    const base = [{ value: '', label: 'Ninguno (elemento raíz)' }];
    const available = allElements
      .filter(el => el.activo && el.elemento_id !== element?.elemento_id)
      .map(el => ({
        value: String(el.elemento_id),
        label: `${el.nomenclatura ? el.nomenclatura + ' – ' : ''}${el.tipo}${el.descripcion ? ': ' + el.descripcion.slice(0, 40) : ''}`,
      }));
    return [...base, ...available];
  }, [allElements, element]);

  useEffect(() => {
    if (isOpen) {
      if (element) {
        setForm({
          tipo: element.tipo,
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
    if (form.nomenclatura.length > 20) next.nomenclatura = 'Máximo 20 caracteres.';
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
          <Input
            label="Nomenclatura"
            value={form.nomenclatura}
            onChange={e => setForm(p => ({ ...p, nomenclatura: e.target.value }))}
            error={errors.nomenclatura}
            maxLength={20}
            placeholder="Ej: P1, C2.1"
          />
          <CustomSelect
            label="Categoría"
            value={form.categoria}
            onChange={val => setForm(p => ({ ...p, categoria: val }))}
            options={CATEGORIA_OPTIONS}
          />
          {!isEditing && (
            <CustomSelect
              label="Elemento padre"
              value={form.padre_id}
              onChange={val => setForm(p => ({ ...p, padre_id: val }))}
              options={isLoadingElements ? [] : parentOptions}
              disabled={isLoadingElements}
              placeholder={isLoadingElements ? 'Cargando elementos...' : 'Seleccionar...'}
            />
          )}
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            error={errors.descripcion}
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
        title={isEditing ? 'Elemento actualizado' : 'Elemento agregado'}
        message={
          isEditing
            ? `El elemento "${success.name}" fue actualizado exitosamente.`
            : `El elemento "${success.name}" fue agregado exitosamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
