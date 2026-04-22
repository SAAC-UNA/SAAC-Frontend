/**
 * StructureCreateModal - Modal de creación de elementos de estructura
 *
 * Sigue el mismo patrón que RoleFormModal:
 * EntityFormModal → CreateConfirmationModal → SuccessModal
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { useStructure } from '@/Hooks/UseStructure';
import { useToast } from '@/Context/ToastContext';
import type { StructureElement, CreateElementForm, SelectOption } from '@/Types/StructureTypes';
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

interface StructureCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const resolveErrorTitle = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
};

export const StructureCreateModal: React.FC<StructureCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createElement, treeData, loadTree, isLoading } = useStructure();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateElementForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState({ isOpen: false, elementName: '' });

  // Flatten tree for duplicate validation and parent options
  const allElements = useMemo(() => {
    const flatten = (nodes: StructureElement[]): StructureElement[] =>
      nodes.reduce((acc, node) => {
        acc.push(node);
        if (node.childElements?.length) acc.push(...flatten(node.childElements));
        return acc;
      }, [] as StructureElement[]);
    return flatten(treeData);
  }, [treeData]);

  // Load tree when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTree();
      setFormData(EMPTY_FORM);
      setErrors({});
      setConfirmOpen(false);
    }
  }, [isOpen]);

  const getAvailableParents = (elementType: ElementType): StructureElement[] => {
    const requiredParentType = getRequiredParentType(elementType);
    if (!requiredParentType) return [];
    return allElements.filter(el => el.type === requiredParentType && el.active);
  };

  const availableParents = useMemo(
    () => getAvailableParents(formData.type),
    [formData.type, allElements]
  );

  const typeOptions: SelectOption[] = Object.entries(ELEMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const parentOptions: SelectOption[] = availableParents.map(parent => ({
    value: parent.id,
    label: (() => {
      if (parent.type === 'criteria') {
        return parent.nomenclature
          ? `${parent.nomenclature} - ${parent.description || 'Sin descripción'}`
          : parent.description || 'Sin descripción';
      }
      return parent.nomenclature
        ? `${parent.nomenclature} - ${parent.name || 'Sin nombre'}`
        : parent.name || 'Sin nombre';
    })(),
  }));

  const config = FORM_CONFIG[formData.type];

  const shouldShow = (field: 'nomenclature' | 'name' | 'description') =>
    config.requiredFields.includes(field) || config.optionalFields.includes(field);

  // Whether the form has enough data to enable the confirm button
  const hasRequiredData = (): boolean => {
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
        if (!Object.values(ElementType).includes(value as ElementType))
          return 'Tipo de elemento inválido';
        return null;

      case 'nomenclature':
        if (!value.trim()) return 'El código es obligatorio';
        if (value.length > VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH)
          return `El código no puede exceder ${VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH} caracteres`;
        if (!VALIDATION_RULES.NOMENCLATURE_PATTERN.test(value))
          return 'El código solo puede contener letras, números, guiones y guiones bajos';
        if (
          allElements.some(
            el =>
              el.nomenclature?.toLowerCase() === value.toLowerCase() &&
              el.type === formData.type
          )
        )
          return 'Ya existe un elemento de este tipo con esta nomenclatura';
        return null;

      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.length > VALIDATION_RULES.NAME_MAX_LENGTH)
          return `El nombre no puede exceder ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres`;
        if (!VALIDATION_RULES.NAME_PATTERN.test(value))
          return 'El nombre contiene caracteres no permitidos';
        if (
          allElements.some(
            el => el.name?.toLowerCase() === value.toLowerCase() && el.type === formData.type
          )
        )
          return 'Ya existe un elemento de este tipo con este nombre';
        return null;

      case 'description': {
        if (config.requiredFields.includes('description') && !value.trim())
          return 'La descripción es obligatoria';
        const maxLen = getDescriptionMaxLength(formData.type);
        if (value && value.length > maxLen)
          return `La descripción no puede exceder ${maxLen} caracteres`;
        return null;
      }

      case 'parentElementId':
        if (config.showParentSelector && !value) return 'Debe seleccionar un elemento padre';
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    config.requiredFields.forEach(field => {
      const err = validateField(field, formData[field as keyof CreateElementForm] || '');
      if (err) newErrors[field as keyof FormErrors] = err;
    });

    config.optionalFields.forEach(field => {
      const val = formData[field as keyof CreateElementForm];
      if (val) {
        const err = validateField(field, val);
        if (err) newErrors[field as keyof FormErrors] = err;
      }
    });

    if (config.showParentSelector) {
      const err = validateField('parentElementId', formData.parentElementId || '');
      if (err) newErrors.parentElementId = err;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof CreateElementForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    const err = validateField(field, value);
    if (err) setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleTypeChange = (newType: ElementType) => {
    setFormData(prev => ({ ...prev, type: newType, parentElementId: '' }));
    setErrors({});
  };

  const handleMainConfirm = () => {
    if (validateForm()) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmOperation = async () => {
    try {
      const success = await createElement(formData);
      if (success) {
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

  return (
    <>
      <EntityFormModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleMainConfirm}
        title="Crear Elemento"
        isEditing={false}
        confirmLabel="Crear"
        confirmDisabled={!hasRequiredData()}
        confirmLoading={isLoading}
        size="md"
      >
        <div className="space-y-4">
          {/* Tipo de Elemento */}
          <CustomSelect
            label="Tipo de Elemento"
            options={typeOptions}
            value={formData.type}
            onChange={(value) => handleTypeChange(value as ElementType)}
            error={errors.type}
            placeholder="Selecciona el tipo de elemento"
          />

          {/* Elemento Padre (condicional) */}
          {config.showParentSelector && (
            <CustomSelect
              label={`Elemento Padre (${
                getRequiredParentType(formData.type)
                  ? ELEMENT_TYPE_LABELS[getRequiredParentType(formData.type)!]
                  : 'Ninguno'
              })`}
              options={parentOptions}
              value={formData.parentElementId}
              onChange={(value) => handleFieldChange('parentElementId', value)}
              error={errors.parentElementId}
              placeholder="Selecciona el elemento padre"
            />
          )}

          {/* Nomenclatura */}
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

          {/* Nombre */}
          {shouldShow('name') && (
            <Input
              label="Nombre"
              variant="floating"
              required={config.requiredFields.includes('name')}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={errors.name}
              placeholder="Ej: Gestión Institucional"
              maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
              characterCount
              size="sm"
            />
          )}

          {/* Descripción */}
          {shouldShow('description') && (
            <Textarea
              label="Descripción"
              variant="floating"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              error={errors.description}
              placeholder="Descripción detallada del elemento"
              maxLength={getDescriptionMaxLength(formData.type)}
              required={config.requiredFields.includes('description')}
              rows={4}
              resize="none"
              characterCount
              size="sm"
            />
          )}
        </div>
      </EntityFormModal>

      <CreateConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmOperation}
        title="Confirmar creación de elemento"
        itemName={truncateText(formData.name || formData.nomenclature || formData.description || '')}
        itemType="elemento"
        confirmLabel="Crear"
        isLoading={isLoading}
        variant="success"
      />

      <SuccessModal
        isOpen={successState.isOpen}
        title="Elemento creado"
        message={`El elemento "${truncateText(successState.elementName)}" fue creado exitosamente.`}
        onClose={handleSuccessClose}
      />
    </>
  );
};
