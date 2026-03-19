import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/Components/Ui/Forms/Input';
import { Button } from '@/Components/Ui/Buttons/Button';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { PageHeader } from '@/Components/Ui/Index';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { useStructure } from '@/Hooks/UseStructure';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';
import { FORM_CONFIG, VALIDATION_RULES, getDescriptionMaxLength, ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { truncateText } from '@/Utils';

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
  const [validationState, setValidationState] = useState<{ hasChanges: boolean; errors: { nomenclature?: string; name?: string; description?: string } }>({ hasChanges: false, errors: {} });
  const hasChanges = validationState.hasChanges;
  const errors = validationState.errors;

  // Modales (save, discard, success)
  const [modalState, setModalState] = useState({ saveOpen: false, discardOpen: false, successOpen: false, successElementName: '' });
  const saveModalOpen = modalState.saveOpen;
  const discardModalOpen = modalState.discardOpen;
  const successModalState = { isOpen: modalState.successOpen, elementName: modalState.successElementName };

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
  setModalState(prev => ({...prev, successOpen: false, successElementName: ''}));
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

  setValidationState(prev => ({...prev, errors: newErrors}));
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
    setValidationState(prev => ({...prev, hasChanges: false}));
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));

  // Limpiar error del campo cuando el usuario empiece a escribir
  if (errors[field as keyof typeof errors]) {
    setValidationState(prev => ({...prev, errors: {...prev.errors, [field]: undefined}}));
  }

  // Validar el campo en tiempo real
  const error = validateField(field as 'nomenclature' | 'name' | 'description', value);
  if (error) {
    setValidationState(prev => ({...prev, errors: {...prev.errors, [field]: error}}));
  }

  // Verificar si hay cambios
  if (currentElement) {
    const newFormData = { ...formData, [field]: value };
    const hasFieldChanges = 
      newFormData.nomenclature !== currentElement.originalNomenclature ||
      newFormData.name !== currentElement.originalName ||
      newFormData.description !== currentElement.originalDescription;
    
    setValidationState(prev => ({...prev, hasChanges: hasFieldChanges}));
  }
};

  // Manejar acción (guardar o descartar)
  const handleAction = (action: 'save' | 'discard') => {
    if (action === 'save') setModalState(prev => ({ ...prev, saveOpen: true }));
    else setModalState(prev => ({ ...prev, discardOpen: true }));
  };

  // Confirmar guardado
  const confirmSave = async () => {
    if (!currentElement) return;

    if (!validateForm()) {
      setModalState(prev => ({ ...prev, saveOpen: false }));
      return;
    }

    try {
      const result = await editElement(currentElement.type, currentElement.id, {
        nomenclature: formData.nomenclature,
        name: formData.name,
        description: formData.description,
        active: currentElement.active
      });

      if (result) {
        setModalState(prev => ({ ...prev, saveOpen: false, successOpen: true, successElementName: formData.name || formData.nomenclature || formData.description || 'elemento' }));
      }
    } catch (error) {
      console.error('Error al guardar el elemento:', error);
      setModalState(prev => ({ ...prev, saveOpen: false }));
    }
  };

  // Confirmar descarte de cambios
  const confirmDiscard = () => {
    if (!currentElement) return;
    setFormData({
      nomenclature: currentElement.originalNomenclature || '',
      name: currentElement.originalName || '',
      description: currentElement.originalDescription || ''
    });
    setValidationState(prev => ({...prev, hasChanges: false}));
    setModalState(prev => ({ ...prev, discardOpen: false }));
  };

  // Volver al listado
  const goBack = () => {
  if (hasChanges) {
    setModalState(prev => ({ ...prev, discardOpen: true }));
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
    <ScreenContainer>
      <PageHeader
        title="Editar Elemento"
        description="Modifica los campos del elemento seleccionado"
      />

      {/* Formulario de edición */}
      <div className="grid grid-cols-1 gap-6">
        {/* Formulario principal */}
        <div className="w-full">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Editando: {currentElement.originalName}
            </h3>

            {/* Información fija */}
            <div className="bg-white border border-gray-200 rounded-corner p-4 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Información Fija</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="ml-2">{ELEMENT_TYPE_LABELS[currentElement.type]}</span>
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
                    isLoading={isLoading}
                    loadingText="Guardando"
                    disabled={!hasChanges || isLoading}
                    variant="primary"
                    standardWidth={true}
                    size="sm"
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      <EditConfirmationModal
        isOpen={saveModalOpen}
        onClose={() => setModalState(prev => ({ ...prev, saveOpen: false }))}
        onConfirm={confirmSave}
        title="Confirmar Guardado"
        message="¿Está seguro de que desea guardar los cambios realizados?"
        confirmLabel="Guardar"
        cancelLabel="Cancelar"
        isLoading={isLoading}
      />
      <DeleteConfirmationModal
        isOpen={discardModalOpen}
        onClose={() => setModalState(prev => ({ ...prev, discardOpen: false }))}
        onConfirm={confirmDiscard}
        title="Descartar cambios"
        itemName={truncateText(currentElement?.name || currentElement?.nomenclature || 'elemento')}
        confirmLabel="Descartar"
        cancelLabel="Cancelar"
        variant="warning"
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