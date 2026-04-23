/**
 * StructureFormModal - Modal unificado para crear/editar elementos tradicionales.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { useStructure } from '@/Hooks/UseStructure';
import { useToast } from '@/Context/ToastContext';
import type {
  StructureElement,
  CreateElementForm,
  EditElementForm,
  SelectOption,
} from '@/Types/StructureTypes';
import { ElementType } from '@/Types/StructureTypes';
import {
  ELEMENT_TYPE_LABELS,
  VALIDATION_RULES,
  FORM_CONFIG,
  getRequiredParentType,
  getDescriptionMaxLength,
} from '@/Constants/StructureConstants';
import { truncateText } from '@/Utils';

interface FormErrors {
  type?: string;
  nomenclature?: string;
  name?: string;
  description?: string;
  parentElementId?: string;
}

const EMPTY_FORM: CreateElementForm = {
  type: ElementType.UNIVERSITY,
  nomenclature: '',
  name: '',
  description: '',
  parentElementId: '',
};

type StructureFormMode = 'create' | 'edit';

interface StructureFormModalProps {
  mode: StructureFormMode;
  isOpen: boolean;
  onClose: () => void;
  element?: StructureElement | null;
  onSuccess?: () => void;
}

const resolveErrorTitle = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
};

export const StructureFormModal: React.FC<StructureFormModalProps> = ({
  mode,
  isOpen,
  onClose,
  element,
  onSuccess,
}) => {
  const isEditing = mode === 'edit';
  const editingElement = isEditing ? element ?? null : null;

  const { createElement, editElement, treeData, loadTree, isLoading } = useStructure();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateElementForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState({ isOpen: false, elementName: '' });

  const allElements = useMemo(() => {
    const flatten = (nodes: StructureElement[]): StructureElement[] =>
      nodes.reduce((acc, node) => {
        acc.push(node);
        if (node.childElements?.length) acc.push(...flatten(node.childElements));
        return acc;
      }, [] as StructureElement[]);

    return flatten(treeData);
  }, [treeData]);

  const selectedType = isEditing
    ? editingElement?.type ?? formData.type
    : formData.type;

  const config = FORM_CONFIG[selectedType];

  const shouldShow = (field: 'nomenclature' | 'name' | 'description') =>
    config.requiredFields.includes(field) || config.optionalFields.includes(field);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing) {
      if (!editingElement) return;

      setFormData({
        type: editingElement.type,
        nomenclature: editingElement.nomenclature || '',
        name: editingElement.name || '',
        description: editingElement.description || '',
        parentElementId: editingElement.parentElementId || '',
      });
      setHasChanges(false);
      setErrors({});
      setConfirmOpen(false);
      return;
    }

    loadTree();
    setFormData(EMPTY_FORM);
    setErrors({});
    setConfirmOpen(false);
  }, [isOpen, isEditing, editingElement, loadTree]);

  const getAvailableParents = (elementType: ElementType): StructureElement[] => {
    const requiredParentType = getRequiredParentType(elementType);
    if (!requiredParentType) return [];

    return allElements.filter((item) => item.type === requiredParentType && item.active);
  };

  const availableParents = useMemo(
    () => getAvailableParents(formData.type),
    [formData.type, allElements],
  );

  const typeOptions: SelectOption[] = Object.entries(ELEMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const parentOptions: SelectOption[] = availableParents.map((parent) => ({
    value: parent.id,
    label: (() => {
      if (parent.type === ElementType.CRITERIA) {
        return parent.nomenclature
          ? `${parent.nomenclature} - ${parent.description || 'Sin descripcion'}`
          : parent.description || 'Sin descripcion';
      }

      return parent.nomenclature
        ? `${parent.nomenclature} - ${parent.name || 'Sin nombre'}`
        : parent.name || 'Sin nombre';
    })(),
  }));

  const hasRequiredData = (): boolean => {
    if (isEditing) return hasChanges;

    if (config.showParentSelector && !formData.parentElementId) return false;

    for (const field of config.requiredFields) {
      if (!formData[field as keyof CreateElementForm]?.toString().trim()) return false;
    }

    return true;
  };

  const validateField = (field: keyof CreateElementForm, value: string): string | null => {
    switch (field) {
      case 'type':
        if (!value) return 'El tipo de elemento es obligatorio';
        if (!Object.values(ElementType).includes(value as ElementType)) {
          return 'Tipo de elemento invalido';
        }
        return null;

      case 'nomenclature':
        if (config.requiredFields.includes('nomenclature') && !value.trim()) {
          return 'La nomenclatura es obligatoria';
        }
        if (value && value.length > VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH) {
          return `La nomenclatura no puede exceder ${VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH} caracteres`;
        }
        if (value && !VALIDATION_RULES.NOMENCLATURE_PATTERN.test(value)) {
          return 'La nomenclatura solo puede contener letras, numeros, guiones y guiones bajos';
        }
        if (
          value
          && allElements.some((item) => (
            item.nomenclature?.toLowerCase() === value.toLowerCase()
            && item.type === selectedType
            && item.id !== editingElement?.id
          ))
        ) {
          return 'Ya existe otro elemento de este tipo con esta nomenclatura';
        }
        return null;

      case 'name':
        if (config.requiredFields.includes('name') && !value.trim()) {
          return 'El nombre es obligatorio';
        }
        if (value && value.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
          return `El nombre no puede exceder ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres`;
        }
        if (value && !VALIDATION_RULES.NAME_PATTERN.test(value)) {
          return 'El nombre contiene caracteres no permitidos';
        }
        if (
          value
          && allElements.some((item) => (
            item.name?.toLowerCase() === value.toLowerCase()
            && item.type === selectedType
            && item.id !== editingElement?.id
          ))
        ) {
          return 'Ya existe otro elemento de este tipo con este nombre';
        }
        return null;

      case 'description': {
        if (config.requiredFields.includes('description') && !value.trim()) {
          return 'La descripcion es obligatoria';
        }
        const maxLen = getDescriptionMaxLength(selectedType);
        if (value && value.length > maxLen) {
          return `La descripcion no puede exceder ${maxLen} caracteres`;
        }
        return null;
      }

      case 'parentElementId':
        if (!isEditing && config.showParentSelector && !value) {
          return 'Debe seleccionar un elemento padre';
        }
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!isEditing) {
      const typeError = validateField('type', formData.type);
      if (typeError) nextErrors.type = typeError;
    }

    (['nomenclature', 'name', 'description'] as const).forEach((field) => {
      if (!shouldShow(field)) return;

      const value = formData[field] ?? '';
      const isRequired = config.requiredFields.includes(field);
      const shouldValidate = isRequired || value.trim().length > 0;

      if (!shouldValidate) return;

      const err = validateField(field, value);
      if (err) nextErrors[field] = err;
    });

    if (!isEditing && config.showParentSelector) {
      const parentError = validateField('parentElementId', formData.parentElementId || '');
      if (parentError) nextErrors.parentElementId = parentError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const evaluateHasChanges = (nextFormData: CreateElementForm): boolean => {
    if (!editingElement) return false;

    return (
      nextFormData.nomenclature !== (editingElement.nomenclature || '')
      || nextFormData.name !== (editingElement.name || '')
      || nextFormData.description !== (editingElement.description || '')
    );
  };

  const handleFieldChange = (field: keyof CreateElementForm, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (isEditing) {
        setHasChanges(evaluateHasChanges(next));
      }
      return next;
    });

    const err = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: err ?? undefined,
    }));
  };

  const handleTypeChange = (newType: ElementType) => {
    setFormData((prev) => ({ ...prev, type: newType, parentElementId: '' }));
    setErrors({});
  };

  const handleMainConfirm = () => {
    if (validateForm()) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmOperation = async () => {
    try {
      let result: StructureElement | null = null;

      if (isEditing) {
        if (!editingElement) return;

        const payload: EditElementForm = {
          nomenclature: formData.nomenclature,
          name: formData.name,
          description: formData.description,
          active: editingElement.active,
        };

        result = await editElement(editingElement.type, editingElement.id, payload);
      } else {
        result = await createElement(formData);
      }

      if (result) {
        setConfirmOpen(false);
        setSuccessState({
          isOpen: true,
          elementName:
            formData.name || formData.nomenclature || formData.description || 'elemento',
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: resolveErrorTitle(error, 'Error al guardar el elemento'),
      });
      setConfirmOpen(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessState({ isOpen: false, elementName: '' });
    onSuccess?.();
    onClose();
  };

  const modalSubtitle = isEditing && editingElement
    ? `${ELEMENT_TYPE_LABELS[selectedType]}: ${editingElement.name || editingElement.nomenclature || ''}`
    : undefined;

  const confirmItemName = truncateText(
    formData.name || formData.nomenclature || formData.description || 'elemento',
  );

  return (
    <>
      <EntityFormModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleMainConfirm}
        title={isEditing ? 'Editar Elemento' : 'Crear Elemento'}
        subtitle={modalSubtitle}
        isEditing={isEditing}
        confirmLabel={isEditing ? 'Guardar' : 'Crear'}
        confirmDisabled={!hasRequiredData()}
        confirmLoading={isLoading}
        size="md"
      >
        <div className="space-y-4">
          {isEditing ? (
            <div className="bg-gris-light rounded-corner px-4 py-3 text-sm text-gris-una-2">
              <span className="font-medium">Tipo:</span>{' '}
              <span>{ELEMENT_TYPE_LABELS[selectedType]}</span>
            </div>
          ) : (
            <>
              <CustomSelect
                label="Tipo de Elemento"
                options={typeOptions}
                value={formData.type}
                onChange={(value) => handleTypeChange(value as ElementType)}
                error={errors.type}
                placeholder="Selecciona el tipo de elemento"
              />

              {config.showParentSelector && (
                <CustomSelect
                  label={`Elemento Padre (${getRequiredParentType(formData.type)
                    ? ELEMENT_TYPE_LABELS[getRequiredParentType(formData.type)!]
                    : 'Ninguno'})`}
                  options={parentOptions}
                  value={formData.parentElementId}
                  onChange={(value) => handleFieldChange('parentElementId', value)}
                  error={errors.parentElementId}
                  placeholder="Selecciona el elemento padre"
                />
              )}
            </>
          )}

          {shouldShow('nomenclature') && (
            <Input
              label="Nomenclatura"
              variant="floating"
              required={config.requiredFields.includes('nomenclature')}
              value={formData.nomenclature}
              onChange={(e) => handleFieldChange('nomenclature', e.target.value)}
              error={errors.nomenclature}
              placeholder="Ej: P1, C2.1, FAC-ING"
              maxLength={VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH}
              characterCount
              size="sm"
            />
          )}

          {shouldShow('name') && (
            <Input
              label="Nombre"
              variant="floating"
              required={config.requiredFields.includes('name')}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={errors.name}
              placeholder="Ej: Gestion Institucional"
              maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
              characterCount
              size="sm"
            />
          )}

          {shouldShow('description') && (
            <Textarea
              label="Descripcion"
              variant="floating"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              error={errors.description}
              placeholder="Descripcion detallada del elemento"
              maxLength={getDescriptionMaxLength(selectedType)}
              required={config.requiredFields.includes('description')}
              rows={4}
              resize="none"
              characterCount
              size="sm"
            />
          )}
        </div>
      </EntityFormModal>

      {isEditing ? (
        <EditConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmOperation}
          title="Confirmar edicion"
          itemName={confirmItemName}
          itemType="elemento"
          confirmLabel="Guardar"
          isLoading={isLoading}
          variant="warning"
        />
      ) : (
        <CreateConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmOperation}
          title="Confirmar creacion de elemento"
          itemName={confirmItemName}
          itemType="elemento"
          confirmLabel="Crear"
          isLoading={isLoading}
          variant="success"
        />
      )}

      <SuccessModal
        isOpen={successState.isOpen}
        title={isEditing ? 'Elemento actualizado' : 'Elemento creado'}
        message={`El elemento "${truncateText(successState.elementName)}" fue ${isEditing ? 'actualizado' : 'creado'} exitosamente.`}
        onClose={handleSuccessClose}
      />
    </>
  );
};
