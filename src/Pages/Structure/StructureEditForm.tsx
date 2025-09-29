import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '../../Components/Ui/Input';
import { Button } from '../../Components/Ui/Button';
import { Modal, useModal } from '../../Components/Ui/Modal';
import type { StructureElement, ElementType } from '../../Types/StructureTypes';

interface EditableElement extends StructureElement {
  originalCode: string;
  originalName: string;
  originalDescription?: string;
  isModified: boolean;
  modificationHistory: ModificationRecord[];
}

interface ModificationRecord {
  id: string;
  date: Date;
  user: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason?: string;
}

const StructureEditForm: React.FC = () => {
  // Estados del componente
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentElement, setCurrentElement] = useState<EditableElement | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Modal para confirmaciones
  const confirmModal = useModal();
  const [pendingAction, setPendingAction] = useState<'save' | 'discard' | null>(null);

  // Datos de ejemplo (simula la API)
  const mockElements: StructureElement[] = [
    {
      id: '1',
      name: 'Plan de Estudios Vigente',
      code: 'EVD-01',
      type: 'evidence',
      description: 'Documento oficial del plan de estudios',
      parentElementId: '7',
      active: true,
      createdAt: new Date('2024-07-01'),
      createdBy: 'admin',
      hasChildren: false,
      canDelete: true
    }
  ];

  const mockModificationHistory: ModificationRecord[] = [
    {
      id: '1',
      date: new Date('2024-07-01'),
      user: 'admin',
      field: 'Nombre',
      oldValue: 'Plan de Estudios Anterior',
      newValue: 'Plan de Estudios Vigente',
      reason: 'Actualización de nomenclatura'
    }
  ];

  // Cargar elemento específico desde URL
  useEffect(() => {
    const elementId = searchParams.get('id');
    if (elementId) {
      loadElementForEditing(elementId);
    } else {
      // Si no hay ID, redirigir a la lista
      navigate('/estructura/editar');
    }
  }, [searchParams, navigate]);

  // Cargar elemento para edición
  const loadElementForEditing = (elementId: string) => {
    setLoading(true);
    
    // Simular carga de API
    setTimeout(() => {
      const element = mockElements.find(el => el.id === elementId);
      if (!element) {
        navigate('/estructura/editar');
        return;
      }

      const editableElement: EditableElement = {
        ...element,
        originalCode: element.code,
        originalName: element.name,
        originalDescription: element.description,
        isModified: false,
        modificationHistory: mockModificationHistory
      };

      setCurrentElement(editableElement);
      setFormData({
        code: element.code,
        name: element.name,
        description: element.description || ''
      });
      setHasChanges(false);
      setLoading(false);
    }, 500);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Verificar si hay cambios
    if (currentElement) {
      const hasFieldChanges = 
        (field === 'code' && value !== currentElement.originalCode) ||
        (field === 'name' && value !== currentElement.originalName) ||
        (field === 'description' && value !== (currentElement.originalDescription || '')) ||
        (field !== 'code' && formData.code !== currentElement.originalCode) ||
        (field !== 'name' && formData.name !== currentElement.originalName) ||
        (field !== 'description' && formData.description !== (currentElement.originalDescription || ''));
      
      setHasChanges(hasFieldChanges);
    }
  };

  // Obtener el label del tipo de elemento
  const getElementTypeLabel = (type: ElementType): string => {
    const labels = {
      'university': 'Universidad',
      'campus': 'Sede',
      'faculty': 'Facultad',
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

    setLoading(true);
    try {
      if (pendingAction === 'save') {
        // Simular guardado
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Changes saved:', formData);
        setHasChanges(false);
      } else {
        // Descartar cambios
        setFormData({
          code: currentElement.originalCode,
          name: currentElement.originalName,
          description: currentElement.originalDescription || ''
        });
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setLoading(false);
      confirmModal.closeModal();
      setPendingAction(null);
    }
  };

  // Get confirmation text
  const getConfirmationText = (): string => {
    if (!pendingAction) return '';
    
    if (pendingAction === 'save') {
      return '¿Estás seguro de que deseas guardar los cambios realizados?';
    } else {
      return '¿Estás seguro de que deseas descartar todos los cambios? Esta acción no se puede deshacer.';
    }
  };

  // Go back to list
  const goBack = () => {
    if (hasChanges) {
      if (confirm('Tienes cambios sin guardar. ¿Deseas salir sin guardar?')) {
        navigate('/estructura/editar');
      }
    } else {
      navigate('/estructura/editar');
    }
  };

  if (loading || !currentElement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando elemento para edición...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <span className="text-xl mr-2">←</span>
            <span>Volver al Listado</span>
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Editar Elementos
        </h1>
        <p className="text-gray-600">
          Selecciona y modifica elementos existentes en la estructura del repositorio. 
          No es posible cambiar el tipo de elemento ni su posición en la jerarquía.
        </p>
      </div>

      {/* Formulario de edición */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Editando: {currentElement.originalName}
            </h3>

            {/* Información fija */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
                  <span className={`ml-2 ${currentElement.active ? 'text-green-600' : 'text-red-600'}`}>
                    {currentElement.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                    {currentElement.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Campos editables */}
            <div className="space-y-6">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="Código único o identificativo del elemento"
                  className={formData.code !== currentElement.originalCode ? 'ring-2 ring-blue-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Código único o identificativo del elemento
                </p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre completo y descriptivo"
                  className={formData.name !== currentElement.originalName ? 'ring-2 ring-blue-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nombre completo y descriptivo
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.description !== (currentElement.originalDescription || '') ? 'ring-2 ring-blue-500' : ''
                  }`}
                  placeholder="Descripción detallada del elemento"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Descripción detallada del elemento
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.description.length}/500 caracteres
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => handleAction('discard')}
                variant="secondary"
                disabled={!hasChanges || loading}
              >
                Deshacer Cambios
              </Button>
              <Button
                onClick={() => handleAction('save')}
                disabled={!hasChanges || loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Consideraciones importantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="flex items-center text-sm font-medium text-yellow-800 mb-2">
              <span className="text-lg mr-2">⚠️</span>
              Consideraciones Importantes
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• No se puede cambiar el tipo de elemento</li>
              <li>• No se puede modificar su posición jerárquica</li>
              <li>• Los códigos deben mantener su unicidad</li>
            </ul>
          </div>

          {/* Historial de modificaciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Historial de Modificaciones
            </h4>
            
            {currentElement.modificationHistory.length === 0 ? (
              <p className="text-xs text-gray-500">Creación inicial</p>
            ) : (
              <div className="space-y-3">
                <div className="text-xs">
                  <div className="font-medium text-gray-900">Creación inicial</div>
                  <div className="text-gray-500">
                    {currentElement.createdAt.toLocaleDateString()} por {currentElement.createdBy}
                  </div>
                </div>
                
                {currentElement.modificationHistory.map((record) => (
                  <div key={record.id} className="text-xs border-l-2 border-gray-200 pl-3">
                    <div className="font-medium text-gray-900">
                      {record.field}: "{record.oldValue}" → "{record.newValue}"
                    </div>
                    <div className="text-gray-500">
                      {record.date.toLocaleDateString()} por {record.user}
                    </div>
                    {record.reason && (
                      <div className="text-gray-600 italic mt-1">
                        Razón: {record.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-3">
              Las modificaciones se registran automáticamente
            </p>
          </div>

          {/* Información del cambio actual */}
          {hasChanges && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Cambios Pendientes
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                {formData.code !== currentElement.originalCode && (
                  <div>• Código: "{currentElement.originalCode}" → "{formData.code}"</div>
                )}
                {formData.name !== currentElement.originalName && (
                  <div>• Nombre: "{currentElement.originalName}" → "{formData.name}"</div>
                )}
                {formData.description !== (currentElement.originalDescription || '') && (
                  <div>• Descripción modificada</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        title={pendingAction === 'save' ? 'Confirmar Guardado' : 'Confirmar Descarte'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {getConfirmationText()}
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={confirmModal.closeModal}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              disabled={loading}
              className={
                pendingAction === 'save' 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }
            >
              {loading ? 'Procesando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StructureEditForm;