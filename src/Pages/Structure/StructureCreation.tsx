import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/Components/Ui/Buttons/Button';
import { Input } from '@/Components/Ui/Forms/Input';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { PageHeader } from '@/Components/Ui/Index';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { useStructure } from '@/Hooks/UseStructure';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import type { 
  StructureElement, 
  CreateElementForm, 
  SelectOption 
} from '@/Types/StructureTypes';
import { ElementType } from '@/Types/StructureTypes';
import {
  ELEMENT_TYPE_LABELS,
  VALIDATION_RULES,
  FORM_CONFIG,
  getRequiredParentType,
  getDescriptionMaxLength
} from '@/Constants/StructureConstants';

/**
 * Función auxiliar para truncar texto largo
 */
const truncateText = (text: string, maxLength: number = 25): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Interface para errores de validación del formulario
 */
interface FormErrors {
  type?: string;
  nomenclature?: string;
  name?: string;
  description?: string;
  parentElementId?: string;
}

/**
 * Página de creación de nuevos elementos en la estructura
 * Permite crear cualquier tipo de elemento respetando la jerarquía
 */
export const StructureCreation: React.FC = () => {
   const moduleInfo = getModuleInfo('structure_creation');
   const navigate = useNavigate();
  // Hook de estructura para obtener elementos existentes
  const { 
    treeData,
    createElement, 
    loadTree
  } = useStructure();

  // Aplanar el árbol para obtener todos los elementos como lista
  const elements = React.useMemo(() => {
    const flattenTree = (nodes: StructureElement[]): StructureElement[] => {
      return nodes.reduce((acc, node) => {
        acc.push(node);
        if (node.childElements && node.childElements.length > 0) {
          acc.push(...flattenTree(node.childElements));
        }
        return acc;
      }, [] as StructureElement[]);
    };
    return flattenTree(treeData);
  }, [treeData]);

  // Estado del formulario
  const [formData, setFormData] = useState<CreateElementForm>({
    type: ElementType.UNIVERSITY,
    nomenclature: '',
    name: '',
    description: '',
    parentElementId: ''
  });

  // Estados de UI
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableParents, setAvailableParents] = useState<StructureElement[]>([]);

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    elementName: string;
  }>({
    isOpen: false,
    elementName: ''
  });

  /**
   * Obtener elementos padre disponibles según el tipo seleccionado
   */
  const getAvailableParents = (elementType: ElementType): StructureElement[] => {
    const requiredParentType = getRequiredParentType(elementType);
    
    if (!requiredParentType) {
      return []; // Universidad no necesita padre
    }

    return elements.filter(element => 
      element.type === requiredParentType && element.active
    );
  };

  /**
 * Manejar el cierre del modal de éxito y redireccionar
 */
  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, elementName: '' });
    navigate('/estructura/listar');
  };

  /**
   * Validar un campo específico del formulario
   */
  const validateField = (field: keyof CreateElementForm, value: string): string | null => {
    const config = FORM_CONFIG[formData.type];
    switch (field) {
      case 'type':
        if (!value) return 'El tipo de elemento es obligatorio';
        if (!Object.values(ElementType).includes(value as ElementType)) {
          return 'Tipo de elemento inválido';
        }
        return null;

      case 'nomenclature':
        if (!value.trim()) return 'El código es obligatorio';
        if (value.length > VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH) {
          return `El código no puede exceder ${VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH} caracteres`;
        }
        if (!VALIDATION_RULES.NOMENCLATURE_PATTERN.test(value)) {
          return 'El código solo puede contener letras, números, guiones y guiones bajos';
        }

        // Validar duplicados
      const duplicateNomenclature = elements.find(el => 
        el.nomenclature?.toLowerCase() === value.toLowerCase() &&
        el.type === formData.type
      );
      if (duplicateNomenclature) {
        return 'Ya existe un elemento de este tipo con esta nomenclatura';
      }
  
      return null;

      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
          return `El nombre no puede exceder ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres`;
        }
        if (!VALIDATION_RULES.NAME_PATTERN.test(value)) {
          return 'El nombre contiene caracteres no permitidos';
        }

        // Validar duplicados
        const duplicateName = elements.find(el => 
          el.name?.toLowerCase() === value.toLowerCase() &&
          el.type === formData.type
        );
        if (duplicateName) {
          return 'Ya existe un elemento de este tipo con este nombre';
        }
        return null;

      case 'description':
      // Validar si es obligatoria
      if (config.requiredFields.includes('description') && !value.trim()) {
        return 'La descripción es obligatoria';
      }
      // Validar longitud máxima
      const maxLength = getDescriptionMaxLength(formData.type);
      if (value && value.length > maxLength) {
        return `La descripción no puede exceder ${maxLength} caracteres`;
      }
  
      return null;

      case 'parentElementId':
        if (config.showParentSelector && !value) {
          return 'Debe seleccionar un elemento padre';
        }
        return null;

      default:
        return null;
    }
  };

  /**
   * Validar todo el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const config = FORM_CONFIG[formData.type];

    // Validar campos obligatorios
    config.requiredFields.forEach(field => {
      const error = validateField(field, formData[field] || '');
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validar campos opcionales si tienen valor
    config.optionalFields.forEach(field => {
      if (formData[field]) {
        const error = validateField(field, formData[field] || '');
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleFieldChange = (field: keyof CreateElementForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Validar el campo en tiempo real
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  /**
   * Manejar cambio de tipo de elemento
   */
  const handleTypeChange = (newType: ElementType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      parentElementId: '' // Limpiar padre seleccionado
    }));

    // Actualizar padres disponibles
    setAvailableParents(getAvailableParents(newType));
  };

 /**
 * Enviar formulario
 */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);
  
  try {
    const success = await createElement(formData);
    console.log('🔍 Success:', success);
    
    if (success) {
      // Mostrar modal de éxito
      setSuccessModalState({
        isOpen: true,
        elementName: formData.name || formData.nomenclature || formData.description || 'elemento'
      });
    }
    
  } catch (error) {
    console.error('Error creating element:', error);
  } finally {
    setIsSubmitting(false);
  }
};



  // Efecto para cargar elementos al montar el componente
  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Efecto para actualizar padres disponibles cuando cambia el tipo
  useEffect(() => {
    setAvailableParents(getAvailableParents(formData.type));
  }, [formData.type, elements]);

  // Opciones para el select de tipo
  const typeOptions: SelectOption[] = Object.entries(ELEMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  // Opciones para el select de padre
  const parentOptions: SelectOption[] = availableParents.map(parent => ({
  value: parent.id,
  label: (() => {
    // Para criterios, usar description en lugar de name
    if (parent.type === 'criteria') {
      return parent.nomenclature 
        ? `${parent.nomenclature} - ${parent.description || 'Sin descripción'}` 
        : parent.description || 'Sin descripción';
    }
    // Para otros tipos, usar name normalmente
    return parent.nomenclature 
      ? `${parent.nomenclature} - ${parent.name || 'Sin nombre'}` 
      : parent.name || 'Sin nombre';
  })()
}));

  const config = FORM_CONFIG[formData.type];

  /**
  * Determinar si un campo debe mostrarse según el tipo de elemento
  */
  const shouldShowField = (field: 'nomenclature' | 'name' | 'description'): boolean => {
    const config = FORM_CONFIG[formData.type];
    return config.requiredFields.includes(field) || config.optionalFields.includes(field);
  };
  
  return (
    <>
      {/* Formulario */}
      <ScreenContainer>
        <PageHeader 
          title={moduleInfo.title} 
          description={moduleInfo.description} 
        />
        <form onSubmit={handleSubmit} className="space-y-6">
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
              label={`Elemento Padre (${getRequiredParentType(formData.type) ? ELEMENT_TYPE_LABELS[getRequiredParentType(formData.type)!] : 'Ninguno'})`}
              options={parentOptions}
              value={formData.parentElementId}
              onChange={(value) => handleFieldChange('parentElementId', value)}
              error={errors.parentElementId}
              placeholder="Selecciona el elemento padre"
            />
          )}

          {/* Nomenclatura */}
          {shouldShowField('nomenclature') && (
            <Input
              label="Nomenclatura"
              variant="floating"
              required={FORM_CONFIG[formData.type].requiredFields.includes('nomenclature')}
              value={formData.nomenclature}
              onChange={(e) => handleFieldChange('nomenclature', e.target.value)}
              error={errors.nomenclature}
              placeholder="Ej: UNA, SEDE-01, FAC-ING"
              maxLength={VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH}
              size="sm"
            />
          )}
          {/* Nombre */}
          {shouldShowField('name') && (
            <Input
              label="Nombre"
              variant="floating"
              required={FORM_CONFIG[formData.type].requiredFields.includes('name')}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={errors.name}
              placeholder="Nombre descriptivo del elemento"
              maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
              size="sm"
            />
          )}
          {/* Descripción */}
          {shouldShowField('description') && (
            <Textarea
              label="Descripción"
              variant="floating"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              error={errors.description}
              placeholder="Descripción detallada del elemento"
              maxLength={getDescriptionMaxLength(formData.type)}
              required={FORM_CONFIG[formData.type].requiredFields.includes('description')}
              rows={6}
              resize="none"
              size="sm"
            />
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/estructura/listar')}
              standardWidth={true}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              standardWidth={true}
              size="sm"
            >
              {isSubmitting ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </ScreenContainer>
      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        title="Elemento creado"
        message={`El elemento "${truncateText(successModalState.elementName)}" ha sido agregado correctamente`}        onClose={handleSuccessModalClose}
        autoClose={true}
      />
    </>
  );
};

export default StructureCreation;