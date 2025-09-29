import React, { useState, useEffect } from 'react';
import { Select } from '../../Components/Ui/Select';
import { Input } from '../../Components/Ui/Input';
import { Button } from '../../Components/Ui/Button';
import { Modal, useModal } from '../../Components/Ui/Modal';
import type { StructureElement, ElementType } from '../../Types/StructureTypes';

interface ElementListItem extends StructureElement {
  hasDependencies: boolean;
  isActive: boolean;
  dependenciesCount?: number;
  parentId?: string | null;
}

// Estados posibles de un elemento
type ElementStatus = 'active' | 'inactive' | 'has-dependencies';

// Tipos de acción disponibles
type ActionType = 'activate' | 'deactivate' | 'delete';

const StructureDeletion: React.FC = () => {
  // Estados del componente
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ElementType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ElementStatus | 'all'>('all');
  const [elements, setElements] = useState<ElementListItem[]>([]);
  const [filteredElements, setFilteredElements] = useState<ElementListItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal para confirmaciones
  const confirmModal = useModal();
  const [pendingAction, setPendingAction] = useState<{
    element: ElementListItem;
    action: ActionType;
  } | null>(null);

  // Datos de ejemplo (simula la API)
  const mockElements: ElementListItem[] = [
    {
      id: '1',
      name: 'Universidad Nacional',
      code: 'UNA',
      type: 'university',
      description: 'Universidad Nacional de Costa Rica',
      parentElementId: undefined,
      active: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin',
      hasChildren: true,
      canDelete: false,
      parentId: null,
      isActive: true,
      hasDependencies: true,
      dependenciesCount: 5
    },
    {
      id: '2',
      name: 'Sede Regional Central Occidente',
      code: 'UNA_ALAJUELA',
      type: 'campus',
      description: 'Campus Alajuela',
      parentElementId: '1',
      active: true,
      createdAt: new Date('2024-01-02'),
      createdBy: 'admin',
      hasChildren: true,
      canDelete: false,
      parentId: '1',
      isActive: true,
      hasDependencies: true,
      dependenciesCount: 3
    },
    {
      id: '3',
      name: 'Plan de Estudios Vigente',
      code: 'EVD_02',
      type: 'evidence',
      description: 'Documento oficial del plan de estudios',
      parentElementId: '2',
      active: true,
      createdAt: new Date('2024-01-03'),
      createdBy: 'admin',
      hasChildren: false,
      canDelete: true,
      parentId: '2',
      isActive: true,
      hasDependencies: false
    },
    {
      id: '4',
      name: 'Evidencia Inactiva',
      code: 'EVT_02',
      type: 'evidence',
      description: 'Evidencia que fue desactivada',
      parentElementId: '2',
      active: false,
      createdAt: new Date('2024-01-04'),
      createdBy: 'admin',
      hasChildren: false,
      canDelete: true,
      parentId: '2',
      isActive: false,
      hasDependencies: false
    }
  ];

  // Load elements on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API loading
    setTimeout(() => {
      setElements(mockElements);
      setFilteredElements(mockElements);
      setLoading(false);
    }, 500);
  }, []);

  // Filter elements when filters change
  useEffect(() => {
    let filtered = elements;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(element => 
        element.name.toLowerCase().includes(term) ||
        element.code.toLowerCase().includes(term)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(element => element.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(element => {
        switch (statusFilter) {
          case 'active':
            return element.isActive && !element.hasDependencies;
          case 'inactive':
            return !element.isActive;
          case 'has-dependencies':
            return element.isActive && element.hasDependencies;
          default:
            return true;
        }
      });
    }

    setFilteredElements(filtered);
  }, [searchTerm, typeFilter, statusFilter, elements]);

  // Obtener el estado de un elemento
  const getElementStatus = (element: ElementListItem): ElementStatus => {
    if (!element.isActive) return 'inactive';
    if (element.hasDependencies) return 'has-dependencies';
    return 'active';
  };

  // Obtener las clases CSS para el badge de estado
  const getStatusBadgeClasses = (status: ElementStatus): string => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'has-dependencies':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Obtener el texto del estado
  const getStatusText = (status: ElementStatus): string => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'has-dependencies':
        return 'Tiene dependencias';
      default:
        return 'Desconocido';
    }
  };

  // Obtener las acciones disponibles para un elemento
  const getAvailableActions = (element: ElementListItem): ActionType[] => {
    const status = getElementStatus(element);
    
    switch (status) {
      case 'inactive':
        return ['activate'];
      case 'has-dependencies':
        return ['deactivate'];
      case 'active':
        return ['deactivate', 'delete'];
      default:
        return [];
    }
  };

  // Handle element action
  const handleAction = (element: ElementListItem, action: ActionType) => {
    setPendingAction({ element, action });
    confirmModal.openModal();
  };

  // Confirm the action
  const confirmAction = async () => {
    if (!pendingAction) return;

    const { element, action } = pendingAction;
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update element status locally
      setElements(prev => prev.map(el => {
        if (el.id === element.id) {
          switch (action) {
            case 'activate':
              return { ...el, isActive: true };
            case 'deactivate':
              return { ...el, isActive: false };
            case 'delete':
              // In a real case, this would remove the element from the list
              return el;
          }
        }
        return el;
      }));

      console.log(`${action} realizada en elemento:`, element.name);
    } catch (error) {
      console.error('Error al realizar la acción:', error);
    } finally {
      setLoading(false);
      confirmModal.closeModal();
      setPendingAction(null);
    }
  };

  // Obtener el texto de confirmación
  const getConfirmationText = (): string => {
    if (!pendingAction) return '';

    const { element, action } = pendingAction;
    
    switch (action) {
      case 'activate':
        return `¿Estás seguro de que deseas activar el elemento "${element.name}"?`;
      case 'deactivate':
        return `¿Estás seguro de que deseas desactivar el elemento "${element.name}"? ${
          element.hasDependencies ? 'Esto también desactivará sus dependencias.' : ''
        }`;
      case 'delete':
        return `¿Estás seguro de que deseas eliminar permanentemente el elemento "${element.name}"? Esta acción no se puede deshacer.`;
      default:
        return '';
    }
  };

  // Actualizar lista (simula refetch)
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setElements([...mockElements]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Eliminación o Desactivación
        </h1>
        <p className="text-gray-600">
          Gestiona el estado de elementos en la estructura. Puedes activar elementos inactivos, 
          desactivar elementos con dependencias o eliminar permanentemente elementos sin dependencias.
        </p>
      </div>

      {/* Filtros de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Elementos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por código o nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por código o nombre
            </label>
            <Input
              type="text"
              placeholder="Escriba para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtrar por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por tipo
            </label>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ElementType | 'all')}
              options={[
                { value: 'all', label: 'Todos los tipos' },
                { value: 'university', label: 'Universidad' },
                { value: 'campus', label: 'Sede' },
                { value: 'faculty', label: 'Facultad' },
                { value: 'career', label: 'Carrera' },
                { value: 'dimension', label: 'Dimensión' },
                { value: 'component', label: 'Componente' },
                { value: 'criteria', label: 'Criterio' },
                { value: 'standard', label: 'Estándar' },
                { value: 'evidence', label: 'Evidencia' }
              ]}
            />
          </div>

          {/* Filtrar por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ElementStatus | 'all')}
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
                { value: 'has-dependencies', label: 'Tiene dependencias' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Lista de elementos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header de la lista */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Elementos Disponibles ({filteredElements.length})
          </h3>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>Actualizar Lista</span>
          </Button>
        </div>

        {/* Contenido de la lista */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : filteredElements.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto text-gray-400 mb-4 text-6xl">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron elementos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredElements.map((element) => {
                const status = getElementStatus(element);
                const actions = getAvailableActions(element);

                return (
                  <div
                    key={element.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header del elemento */}
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {element.code}
                            </span>
                            <span className={getStatusBadgeClasses(status)}>
                              {getStatusText(status)}
                            </span>
                            {element.hasDependencies && element.dependenciesCount && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                {element.dependenciesCount} dependencias
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Información del elemento */}
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {element.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          {element.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Creado el {new Date().toLocaleDateString()} por admin
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2 ml-4">
                        {actions.includes('activate' as ActionType) && (
                          <Button
                            onClick={() => handleAction(element, 'activate')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            Activar
                          </Button>
                        )}
                        {actions.includes('deactivate' as ActionType) && (
                          <Button
                            onClick={() => handleAction(element, 'deactivate')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            size="sm"
                          >
                            Desactivar
                          </Button>
                        )}
                        {actions.includes('delete' as ActionType) && (
                          <Button
                            onClick={() => handleAction(element, 'delete')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        title="Confirmar Acción"
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
                pendingAction?.action === 'delete' 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
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

export default StructureDeletion;