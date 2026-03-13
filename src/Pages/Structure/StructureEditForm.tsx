import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/Components/Ui/Forms/Input';
import { Button } from '@/Components/Ui/Buttons/Button';
import { Modal, useModal } from '@/Components/Ui/Modals/Modal';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { useStructure } from '@/Hooks/UseStructure';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';
import { FORM_CONFIG, VALIDATION_RULES, getDescriptionMaxLength} from '@/Constants/StructureConstants';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Textarea } from '@/Components/Ui/Forms/Textarea';

/**
 * Función auxiliar para truncar texto largo
 */
const truncateText = (text: string, maxLength: number = 25): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

interface EditableElement extends StructureElement {
  originalNomenclature: string;
  originalName: string;
  originalDescription: string;
  isModified: boolean;
}

const StructureEditForm: React.FC = () => {
  // Estados del componente
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Hook de estructura
  const { editElement, treeData, loadTree, isLoading } = useStructure();
  
  const [currentElement, setCurrentElement] = useState<EditableElement | null>(null);
  const [formData, setFormData] = useState({
    nomenclature: '',
    name: '',
    description: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{
    nomenclature?: string;
    name?: string;
    description?: string;
  }>({});

  // Modal para confirmaciones
  const confirmModal = useModal();
  const [pendingAction, setPendingAction] = useState<'save' | 'discard' | null>(null);

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    elementName: string;
  }>({
    isOpen: false,
    elementName: ''
  });

  /**
    Determinar si un campo debe mostrarse según el tipo de elemento
  */
const shouldShowField = (field: 'nomenclature' | 'name' | 'description'): boolean => {
  if (!currentElement) return false;
  const config = FORM_CONFIG[currentElement.type];
  return config.requiredFields.includes(field) || config.optionalFields.includes(field);
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
const validateField = (field: 'nomenclature' | 'name' | 'description', value: string): string | null => {
  if (!currentElement) return null;
  const config = FORM_CONFIG[currentElement.type];

  switch (field) {
    case 'nomenclature':
      if (config.requiredFields.includes('nomenclature') && !value.trim()) {
        return 'La nomenclatura es obligatoria';
      }
      if (value && value.length > VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH) {
        return `La nomenclatura no puede exceder ${VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH} caracteres`;
      }
      if (value && !VALIDATION_RULES.NOMENCLATURE_PATTERN.test(value)) {
        return 'La nomenclatura solo puede contener letras, números, guiones y guiones bajos';
      }

      // Validar duplicados (excepto el elemento actual)
      const duplicateNomenclature = allElements.find(el => 
        el.nomenclature?.toLowerCase() === value.toLowerCase() &&
        el.type === currentElement.type &&
        el.id !== currentElement.id
      );
      if (duplicateNomenclature) {
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

      // Validar duplicados (excepto el elemento actual)
      const duplicateName = allElements.find(el => 
        el.name?.toLowerCase() === value.toLowerCase() &&
        el.type === currentElement.type &&
        el.id !== currentElement.id  // ← Excluir el elemento actual
      );
      if (duplicateName) {
        return 'Ya existe otro elemento de este tipo con este nombre';
      }

      return null;

    case 'description':
      if (config.requiredFields.includes('description') && !value.trim()) {
        return 'La descripción es obligatoria';
      }
      const maxLength = getDescriptionMaxLength(currentElement.type);
      if (value && value.length > maxLength) {
        return `La descripción no puede exceder ${maxLength} caracteres`;
      }
      return null;

    default:
      return null;
  }
};

/**
 * Validar todo el formulario antes de guardar
 */
const validateForm = (): boolean => {
  if (!currentElement) return false;
  
  const newErrors: {
    nomenclature?: string;
    name?: string;
    description?: string;
  } = {};
  
  const config = FORM_CONFIG[currentElement.type];

  // Validar solo los campos que se muestran y son requeridos
  if (shouldShowField('nomenclature') && config.requiredFields.includes('nomenclature')) {
    const error = validateField('nomenclature', formData.nomenclature);
    if (error) newErrors.nomenclature = error;
  }

  if (shouldShowField('name') && config.requiredFields.includes('name')) {
    const error = validateField('name', formData.name);
    if (error) newErrors.name = error;
  }

  if (shouldShowField('description') && config.requiredFields.includes('description')) {
    const error = validateField('description', formData.description);
    if (error) newErrors.description = error;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};



  // Aplanar el árbol para obtener todos los elementos
  const allElements = React.useMemo(() => {
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

  // Cargar elementos al montar
  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Cargar elemento específico desde URL
  useEffect(() => {
    const elementId = searchParams.get('id');
    const elementType = searchParams.get('type') as ElementType | null;
    
    // Verificar si los parámetros existen
    if (!elementId || !elementType) {
      navigate('/estructura/listar');
      return;
    }
    
    // Solo intentar cargar si tenemos elementos
    if (allElements.length > 0) {
      loadElementForEditing(elementId, elementType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allElements.length]);

  // Cargar elemento para edición
  const loadElementForEditing = async (elementId: string, elementType: ElementType) => {
    const element = allElements.find(el => el.id === elementId && el.type === elementType);
    if (!element) {
      navigate('/estructura/listar');
      return;
    }

    const editableElement: EditableElement = {
      ...element,
      originalNomenclature: element.nomenclature || '',
      originalName: element.name || '',
      originalDescription: element.description || '',
      isModified: false
    };

    setCurrentElement(editableElement);
    setFormData({
      nomenclature: element.nomenclature || '',
      name: element.name || '',
      description: element.description || ''
    });
    setHasChanges(false);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));

  // Limpiar error del campo cuando el usuario empiece a escribir
  if (errors[field as keyof typeof errors]) {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  // Validar el campo en tiempo real
  const error = validateField(field as 'nomenclature' | 'name' | 'description', value);
  if (error) {
    setErrors(prev => ({ ...prev, [field]: error }));
  }

  // Verificar si hay cambios
  if (currentElement) {
    const newFormData = { ...formData, [field]: value };
    const hasFieldChanges = 
      newFormData.nomenclature !== currentElement.originalNomenclature ||
      newFormData.name !== currentElement.originalName ||
      newFormData.description !== currentElement.originalDescription;
    
    setHasChanges(hasFieldChanges);
  }
};

  // Obtener el label del tipo de elemento
  const getElementTypeLabel = (type: ElementType): string => {
    const labels = {
      'university': 'Universidad',
      'campus': 'Sede',
      'career': 'Carrera',
      'dimension': 'Dimensión',
      'component': 'Componente',
      'criteria': 'Criterio',
      'standard': 'Estándar',
      'evidence': 'Evidencia'
    };
    return labels[type] || type;
  };

  // Manejar acción (guardar o descartar)
  const handleAction = (action: 'save' | 'discard') => {
    setPendingAction(action);
    confirmModal.openModal();
  };

  // Confirmar acción
  const confirmAction = async () => {
    if (!pendingAction || !currentElement) return;

    try {
      if (pendingAction === 'save') {
        // Validar formulario antes de guardar
        if (!validateForm()) {
          confirmModal.closeModal();
          setPendingAction(null);
          return;
        }

        // Usar el hook para editar el elemento
        const result = await editElement(currentElement.type, currentElement.id, {
          nomenclature: formData.nomenclature,
          name: formData.name,
          description: formData.description,
          active: currentElement.active
        });

        if (result) {
          console.log('Cambios guardados:', formData);
          confirmModal.closeModal();
          setPendingAction(null);
          
          // Mostrar modal de éxito
          setSuccessModalState({
            isOpen: true,
            elementName: formData.name || formData.nomenclature || formData.description || 'elemento'
          });
        }
      } else {
        // Descartar cambios
        setFormData({
          nomenclature: currentElement.originalNomenclature || '',
          name: currentElement.originalName || '',
          description: currentElement.originalDescription || ''
        });
        setHasChanges(false);
        confirmModal.closeModal();
        setPendingAction(null);
      }
    } catch (error) {
      console.error('Error al procesar la acción:', error);
      confirmModal.closeModal();
      setPendingAction(null);
    }
  };

  // Obtener texto de confirmación
  const getConfirmationText = (): string => {
    if (!pendingAction) return '';
    
    if (pendingAction === 'save') {
      return '¿Está seguro de que desea guardar los cambios realizados?';
    } else {
      return '¿Está seguro de que desea descartar todos los cambios? Esta acción no se puede deshacer.';
    }
  };

  // Volver al listado
  const goBack = () => {
  if (hasChanges) {
    setPendingAction('discard');
    confirmModal.openModal();
  } else {
    navigate('/estructura/listar');
  }
};

  if (isLoading || !currentElement) {
    return (
      <div className="relative min-h-screen">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  return (
    <ScreenContainer
      title="Editar Elementos"
      description="Selecciona y modifica elementos existentes en la estructura del repositorio"
    >

      {/* Formulario de edición */}
      <div className="grid grid-cols-1 gap-6">
        {/* Formulario principal */}
        <div className="w-full">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Editando: {currentElement.originalName}
            </h3>

            {/* Información fija */}
            <div className="bg-gray-50 rounded-corner p-4 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Información Fija</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="ml-2">{getElementTypeLabel(currentElement.type)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Creado:</span>
                  <span className="ml-2">{currentElement.createdAt.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado:</span>
                  <span className={`ml-2 ${currentElement.active ? 'text-verde-dark' : 'text-error-dark'}`}>
                    {currentElement.active ? 'Activo' : 'Inactivo'}
                  </span>
              </div>
              </div>
            </div>

            {/* Campos editables */}
            <div className="space-y-6">

              {/* Nomenclatura */}
              {shouldShowField('nomenclature') && (
                <Input
                  label="Nomenclatura"
                  variant="floating"
                  type="text"
                  value={formData.nomenclature}
                  onChange={(e) => handleInputChange('nomenclature', e.target.value)}
                  placeholder="Nomenclatura única o identificativa del elemento"
                  error={errors.nomenclature}
                  maxLength={VALIDATION_RULES.NOMENCLATURE_MAX_LENGTH}
                  required={FORM_CONFIG[currentElement.type].requiredFields.includes('nomenclature')}
                  size="sm"
                />
              )}

              {/* Nombre */}
              {shouldShowField('name') && (
                <Input
                  label="Nombre"
                  variant="floating"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre completo y descriptivo"
                  error={errors.name}
                  maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
                  required={FORM_CONFIG[currentElement.type].requiredFields.includes('name')}
                  size="sm"
                />
              )}

              {/* Descripción */}
              {shouldShowField('description') && (
                <Textarea
                  label="Descripción"
                  variant="floating"
                  placeholder="Descripción detallada del elemento"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  rows={6}
                  resize="none"
                  size="sm"
                  required={currentElement && FORM_CONFIG[currentElement.type].requiredFields.includes('description')}
                  maxLength={getDescriptionMaxLength(currentElement.type)}
                />
              )}
              </div>
            {/* Botones de acción */}
              <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200">
                {/* Botones derechos */}
                <div className="flex space-x-3">
                  <Button
                    onClick={goBack}
                    variant="secondary"
                    disabled={isLoading}
                    standardWidth={true}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleAction('save')}
                    disabled={!hasChanges || isLoading}
                    variant="primary"
                    standardWidth={true}
                    size="sm"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        title={pendingAction === 'save' ? 'Confirmar Guardado' : 'Confirmar Descarte'}
        size="md"
        variant="warning"
        message={getConfirmationText()}
        showConfirm={true}
        confirmLabel="Confirmar"
        onConfirm={confirmAction}
        confirmLoading={isLoading}
        showCancel={true}
        cancelLabel="Cancelar"
      />
      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        title="Elemento editado"
        message={`El elemento "${truncateText(successModalState.elementName)}" ha sido modificado correctamente`}        onClose={handleSuccessModalClose}
        autoClose={true}
      />
    </ScreenContainer>
  );
};

export default StructureEditForm;