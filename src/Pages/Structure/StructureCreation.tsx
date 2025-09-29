import React, { useState, useEffect } from 'react';
import { cn } from '@/Utils/ClassNames';
import { Button } from '@/Components/Ui/Button';
import { Input } from '@/Components/Ui/Input';
import Select from '@/Components/Ui/Select';
import type { 
  StructureElement, 
  CreateElementForm, 
  SelectOption 
} from '@/Types/StructureTypes';
import { ElementType } from '@/Types/StructureTypes';
import {
  ELEMENT_TYPE_LABELS,
  VALIDATION_RULES,
  USER_MESSAGES,
  FORM_CONFIG,
  getRequiredParentType
} from '@/Constants/StructureConstants';

/**
 * Datos mock para elementos existentes (padres potenciales)
 * En producción vendrían de la API
 */
const mockParentElements: StructureElement[] = [
  {
    id: '1',
    code: 'UNA',
    name: 'Universidad Nacional',
    type: ElementType.UNIVERSITY,
    active: true,
    createdAt: new Date(),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '2',
    code: 'UNA-ALAJUELA',
    name: 'Sede Regional Central Occidente',
    type: ElementType.CAMPUS,
    parentElementId: '1',
    active: true,
    createdAt: new Date(),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '3',
    code: 'FAC-ING',
    name: 'Facultad de Ciencias Exactas y Naturales',
    type: ElementType.FACULTY,
    parentElementId: '2',
    active: true,
    createdAt: new Date(),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  }
];

/**
 * Interface para errores de validación del formulario
 */
interface FormErrors {
  type?: string;
  code?: string;
  name?: string;
  description?: string;
  parentElementId?: string;
}

/**
 * Página de creación de nuevos elementos en la estructura
 * Permite crear cualquier tipo de elemento respetando la jerarquía
 */
export const StructureCreation: React.FC = () => {
  // Estado del formulario
  const [formData, setFormData] = useState<CreateElementForm>({
    type: ElementType.UNIVERSITY,
    code: '',
    name: '',
    description: '',
    parentElementId: ''
  });

  // Estados de UI
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableParents, setAvailableParents] = useState<StructureElement[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');


  /**
   * Obtener elementos padre disponibles según el tipo seleccionado
   */
  const getAvailableParents = (elementType: ElementType): StructureElement[] => {
    const requiredParentType = getRequiredParentType(elementType);
    
    if (!requiredParentType) {
      return []; // Universidad no necesita padre
    }

    return mockParentElements.filter(element => 
      element.type === requiredParentType && element.active
    );
  };

  /**
   * Validar un campo específico del formulario
   */
  const validateField = (field: keyof CreateElementForm, value: string): string | null => {
    switch (field) {
      case 'type':
        if (!value) return 'El tipo de elemento es obligatorio';
        if (!Object.values(ElementType).includes(value as ElementType)) {
          return 'Tipo de elemento inválido';
        }
        return null;

      case 'code':
        if (!value.trim()) return 'El código es obligatorio';
        if (value.length > VALIDATION_RULES.CODE_MAX_LENGTH) {
          return `El código no puede exceder ${VALIDATION_RULES.CODE_MAX_LENGTH} caracteres`;
        }
        if (!VALIDATION_RULES.CODE_PATTERN.test(value)) {
          return 'El código solo puede contener letras, números, guiones y guiones bajos';
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
        return null;

      case 'description':
        if (value && value.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
          return `La descripción no puede exceder ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} caracteres`;
        }
        return null;

      case 'parentElementId':
        const config = FORM_CONFIG[formData.type];
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
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage(USER_MESSAGES.SUCCESS.CREATE);
      
      // Limpiar formulario después del éxito
      setTimeout(() => {
        setFormData({
          type: ElementType.UNIVERSITY,
          code: '',
          name: '',
          description: '',
          parentElementId: ''
        });
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error creating element:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Efecto para actualizar padres disponibles cuando cambia el tipo
  useEffect(() => {
    setAvailableParents(getAvailableParents(formData.type));
  }, [formData.type]);

  // Opciones para el select de tipo
  const typeOptions: SelectOption[] = Object.entries(ELEMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  // Opciones para el select de padre
  const parentOptions: SelectOption[] = availableParents.map(parent => ({
    value: parent.id,
    label: `${parent.code} - ${parent.name}`
  }));

  const config = FORM_CONFIG[formData.type];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Elemento de Estructura
        </h1>
        <p className="text-gray-600">
          Agrega un nuevo elemento a la jerarquía del Sistema SAAC-UNA respetando las reglas de estructura.
        </p>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Elemento */}
          <Select
            label="Tipo de Elemento"
            required
            options={typeOptions}
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as ElementType)}
            error={errors.type}
            placeholder="Selecciona el tipo de elemento"
          />

          {/* Elemento Padre (condicional) */}
          {config.showParentSelector && (
            <Select
              label="Elemento Padre"
              required
              options={parentOptions}
              value={formData.parentElementId}
              onChange={(e) => handleFieldChange('parentElementId', e.target.value)}
              error={errors.parentElementId}
              placeholder="Selecciona el elemento padre"
              helperText={`Este ${ELEMENT_TYPE_LABELS[formData.type]} debe pertenecer a un ${ELEMENT_TYPE_LABELS[getRequiredParentType(formData.type)!]}`}
            />
          )}

          {/* Código */}
          <Input
            label="Código"
            required
            value={formData.code}
            onChange={(e) => handleFieldChange('code', e.target.value)}
            error={errors.code}
            placeholder="Ej: UNA, SEDE-01, FAC-ING"
            helperText={`Máximo ${VALIDATION_RULES.CODE_MAX_LENGTH} caracteres. Solo letras, números, guiones y guiones bajos.`}
          />

          {/* Nombre */}
          <Input
            label="Nombre"
            required
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={errors.name}
            placeholder="Nombre descriptivo del elemento"
            helperText={`Máximo ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres.`}
          />

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className={cn(
                'w-full border rounded-lg p-3 transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
                'placeholder-gray-400',
                errors.description
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              rows={3}
              placeholder="Descripción detallada del elemento (opcional)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Máximo {VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} caracteres.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Elemento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StructureCreation;