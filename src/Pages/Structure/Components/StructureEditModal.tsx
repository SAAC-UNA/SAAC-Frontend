/**
 * StructureEditModal - Modal de edición de elementos de estructura
 *
 * Sigue el mismo patrón que RoleFormModal:
 * EntityFormModal → EditConfirmationModal → SuccessModal
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { useStructure } from '@/Hooks/UseStructure';
import { useToast } from '@/Context/ToastContext';
import type { StructureElement } from '@/Types/StructureTypes';
import {
  FORM_CONFIG,
  VALIDATION_RULES,
  getDescriptionMaxLength,
  ELEMENT_TYPE_LABELS,
} from '@/Constants/StructureConstants';
import { truncateText } from '@/Utils';

interface StructureEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: StructureElement | null;
  onSuccess?: () => void;
}

export const StructureEditModal: React.FC<StructureEditModalProps> = ({
  isOpen,
  onClose,
  element,
  onSuccess,
}) => {
  const { editElement, treeData, isLoading } = useStructure();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ nomenclature: '', name: '', description: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{ nomenclature?: string; name?: string; description?: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState({ isOpen: false, elementName: '' });

  // Aplanar árbol para validaciones de duplicados
  const allElements = useMemo(() => {
    const flatten = (nodes: StructureElement[]): StructureElement[] =>
      nodes.reduce((acc, node) => {
        acc.push(node);
        if (node.childElements?.length) acc.push(...flatten(node.childElements));
        return acc;
      }, [] as StructureElement[]);
    return flatten(treeData);
  }, [treeData]);

  // Inicializar formulario cuando cambia el elemento
  useEffect(() => {
    if (element) {
      setFormData({
        nomenclature: element.nomenclature || '',
        name: element.name || '',
        description: element.description || '',
      });
      setHasChanges(false);
      setErrors({});
      setConfirmOpen(false);
    }
  }, [element?.id]);

  if (!element) return null;

  const config = FORM_CONFIG[element.type];

  const shouldShow = (field: 'nomenclature' | 'name' | 'description') =>
    config.requiredFields.includes(field) || config.optionalFields.includes(field);

  const validateField = (field: 'nomenclature' | 'name' | 'description', value: string): string | null => {
    switch (field) {
      case 'nomenclature':
        if (config.requiredFields.includes('nomenclature') && !value.trim())
          return 'La nomenclatura es obligatoria';
        if (value && value.length > VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH)
          return `La nomenclatura no puede exceder ${VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH} caracteres`;
        if (value && !VALIDATION_RULES.NOMENCLATURE_PATTERN.test(value))
          return 'La nomenclatura solo puede contener letras, números, guiones y guiones bajos';
        if (
          allElements.some(
            el =>
              el.nomenclature?.toLowerCase() === value.toLowerCase() &&
              el.type === element.type &&
              el.id !== element.id
          )
        )
          return 'Ya existe otro elemento de este tipo con esta nomenclatura';
        return null;

      case 'name':
        if (config.requiredFields.includes('name') && !value.trim())
          return 'El nombre es obligatorio';
        if (value && value.length > VALIDATION_RULES.NAME_MAX_LENGTH)
          return `El nombre no puede exceder ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres`;
        if (value && !VALIDATION_RULES.NAME_PATTERN.test(value))
          return 'El nombre contiene caracteres no permitidos';
        if (
          allElements.some(
            el =>
              el.name?.toLowerCase() === value.toLowerCase() &&
              el.type === element.type &&
              el.id !== element.id
          )
        )
          return 'Ya existe otro elemento de este tipo con este nombre';
        return null;

      case 'description': {
        if (config.requiredFields.includes('description') && !value.trim())
          return 'La descripción es obligatoria';
        const maxLen = getDescriptionMaxLength(element.type);
        if (value && value.length > maxLen)
          return `La descripción no puede exceder ${maxLen} caracteres`;
        return null;
      }

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    (['nomenclature', 'name', 'description'] as const).forEach(field => {
      if (shouldShow(field) && config.requiredFields.includes(field)) {
        const err = validateField(field, formData[field]);
        if (err) newErrors[field] = err;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: 'nomenclature' | 'name' | 'description', value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Validar en tiempo real
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err ?? undefined }));

    // Detectar cambios respecto al original
    const changed =
      newFormData.nomenclature !== (element.nomenclature || '') ||
      newFormData.name !== (element.name || '') ||
      newFormData.description !== (element.description || '');
    setHasChanges(changed);
  };

  const handleMainConfirm = () => {
    if (validateForm()) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmOperation = async () => {
    try {
      const result = await editElement(element.type, element.id, {
        nomenclature: formData.nomenclature,
        name: formData.name,
        description: formData.description,
        active: element.active,
      });
      if (result) {
        setConfirmOpen(false);
        setSuccessState({
          isOpen: true,
          elementName: formData.name || formData.nomenclature || formData.description || 'elemento',
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error al editar elemento',
        message: error instanceof Error ? error.message : 'No se pudo editar el elemento'
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
        title="Editar Elemento"
        subtitle={`${ELEMENT_TYPE_LABELS[element.type]}: ${element.name || element.nomenclature || ''}`}
        isEditing={true}
        confirmDisabled={!hasChanges}
        confirmLoading={isLoading}
        size="md"
      >
        <div className="space-y-4">
          {/* Tipo - información fija (solo lectura) */}
          <div className="bg-gris-light rounded-corner px-4 py-3 text-sm text-gris-una-2">
            <span className="font-medium">Tipo:</span>{' '}
            <span>{ELEMENT_TYPE_LABELS[element.type]}</span>
          </div>

          {shouldShow('nomenclature') && (
            <Input
              label="Nomenclatura"
              variant="floating"
              type="text"
              value={formData.nomenclature}
              onChange={(e) => handleInputChange('nomenclature', e.target.value)}
              placeholder="Nomenclatura única o identificativa del elemento"
              error={errors.nomenclature}
              maxLength={VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH}
              required={config.requiredFields.includes('nomenclature')}
              size="sm"
            />
          )}

          {shouldShow('name') && (
            <Input
              label="Nombre"
              variant="floating"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre completo y descriptivo"
              error={errors.name}
              maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
              required={config.requiredFields.includes('name')}
              size="sm"
            />
          )}

          {shouldShow('description') && (
            <Textarea
              label="Descripción"
              variant="floating"
              placeholder="Descripción detallada del elemento"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              rows={4}
              resize="none"
              size="sm"
              required={config.requiredFields.includes('description')}
              maxLength={getDescriptionMaxLength(element.type)}
            />
          )}
        </div>
      </EntityFormModal>

      <EditConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmOperation}
        title="Confirmar edición"
        itemName={truncateText(formData.name || formData.nomenclature || 'elemento')}
        itemType="elemento"
        confirmLabel="Guardar"
        isLoading={isLoading}
        variant="warning"
      />

      <SuccessModal
        isOpen={successState.isOpen}
        title="¡Elemento editado exitosamente!"
        message={`El elemento "${truncateText(successState.elementName)}" ha sido modificado correctamente.`}
        onClose={handleSuccessClose}
        autoClose={true}
      />
    </>
  );
};
