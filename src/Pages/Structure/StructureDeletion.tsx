import React, { useState, useEffect } from 'react';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { Button } from '@/Components/Ui/Button';
import { Modal, useModal } from '@/Components/Ui/Modal';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { LoadingSpinner } from '@/Components/Ui/Loading';
import { useStructure } from '@/Hooks/UseStructure';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';

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
  // Hook de estructura
  const { 
    treeData, 
    loadTree, 
    deleteElement, 
    activateElement, 
    deactivateElement, 
    isLoading 
  } = useStructure();

  // Estados del componente
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ElementType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ElementStatus | 'all'>('all');
  const [filteredElements, setFilteredElements] = useState<ElementListItem[]>([]);
  
  // Modal para confirmaciones
  const confirmModal = useModal();
  const [pendingAction, setPendingAction] = useState<{
    element: ElementListItem;
    action: ActionType;
  } | null>(null);
  const [activateChildren, setActivateChildren] = useState<boolean>(false);

  // Convertir elementos del árbol a lista con información adicional
  const elements = React.useMemo(() => {
    const flattenTree = (nodes: StructureElement[]): ElementListItem[] => {
      return nodes.reduce((acc, node) => {
        const element: ElementListItem = {
          ...node,
          isActive: node.active,
          hasDependencies: (node.childElements && node.childElements.length > 0) || !node.canDelete,
          dependenciesCount: node.childElements ? node.childElements.length : 0,
          parentId: node.parentElementId || null
        };
        acc.push(element);
        if (node.childElements && node.childElements.length > 0) {
          acc.push(...flattenTree(node.childElements));
        }
        return acc;
      }, [] as ElementListItem[]);
    };
    return flattenTree(treeData);
  }, [treeData]);

  // Cargar elementos al montar el componente
  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Filtrar elementos cuando cambian los filtros
  useEffect(() => {
    let filtered = elements;

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(element => 
        element.name?.toLowerCase().includes(term) ||
        element.nomenclature?.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(element => element.type === typeFilter);
    }

    // Filtro por estado
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
  const getStatusBadgeClasses = (status: ElementStatus, isElementActive: boolean = true): string => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium transition-all duration-300';
    
    if (!isElementActive) {
      return `${baseClasses} bg-gray-100 text-gray-500`;
    }
    
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

  /**
 * Encuentra todos los elementos descendientes de un elemento dado (recursivamente)
 * @param elementId - ID del elemento padre
 * @param elements - Lista completa de elementos
 * @returns Array con todos los descendientes (hijos, nietos, bisnietos, etc.)
 */
const findAllDescendants = (elementId: string, elements: ElementListItem[]): ElementListItem[] => {
  const descendants: ElementListItem[] = [];
  
  // Encontrar hijos directos
  const directChildren = elements.filter(el => el.parentElementId === elementId);
  
  // Para cada hijo directo, agregarlo y buscar sus descendientes
  directChildren.forEach(child => {
    descendants.push(child);
    // Recursivamente encontrar descendientes del hijo
    const childDescendants = findAllDescendants(child.id, elements);
    descendants.push(...childDescendants);
  });
  
  return descendants;
};

/**
 * Verifica si un elemento puede ser activado (su padre debe estar activo)
 * @param element - Elemento que se quiere activar
 * @param elements - Lista completa de elementos
 * @returns {valid: boolean, parentName?: string} - Si es válido y nombre del padre inactivo si aplica
 */
const canActivateElement = (element: ElementListItem, elements: ElementListItem[]): { valid: boolean; parentName?: string } => {
  // Si no tiene padre (es elemento raíz), siempre se puede activar
  if (!element.parentElementId) {
    return { valid: true };
  }
  
  // Buscar el elemento padre
  const parent = elements.find(el => el.id === element.parentElementId);
  
  // Si no se encuentra el padre, permitir activación (caso edge)
  if (!parent) {
    return { valid: true };
  }
  
  // Si el padre está inactivo, no permitir activación
  if (!parent.active) {
    return { valid: false, parentName: parent.name || parent.description };
  }
  
  // Si el padre está activo, se puede activar
  return { valid: true };
};

/**
 * Verifica si un elemento tiene hijos inactivos que podrían activarse junto con él
 * @param element - Elemento que se quiere activar
 * @param elements - Lista completa de elementos
 * @returns Array de elementos hijos inactivos
 */
const getInactiveChildren = (element: ElementListItem, elements: ElementListItem[]): ElementListItem[] => {
  // Encontrar todos los descendientes del elemento
  const descendants = findAllDescendants(element.id, elements);
  
  // Filtrar solo los que están inactivos
  const inactiveDescendants = descendants.filter(desc => !desc.active);
  
  return inactiveDescendants;
};

  // Manejar acción de elemento
  const handleAction = (element: ElementListItem, action: ActionType) => {
  // Validar si el elemento puede ser activado (si la acción es activar)
  if (action === 'activate') {
    const activationCheck = canActivateElement(element, elements);
    if (!activationCheck.valid) {
      // Mostrar advertencia pero aún abrir el modal
      setPendingAction({ element, action });
      confirmModal.openModal();
      return;
    }
  }
  
  setPendingAction({ element, action });
  confirmModal.openModal();
};

  // Confirmar la acción
const confirmAction = async () => {
  if (!pendingAction) return;

  const { element, action } = pendingAction;

  try {
    let success = false;
    
    switch (action) {
      case 'activate':
        // Validar nuevamente antes de activar
        const activationCheck = canActivateElement(element, elements);
        if (!activationCheck.valid) {
          console.error('No se puede activar: padre inactivo');
          confirmModal.closeModal();
          setPendingAction(null);
          setActivateChildren(false);
          return;
        }
        
        success = await activateElement(element.type, element.id);
        
        // Si se marcó activar hijos, activarlos también
        if (success && activateChildren) {
          const inactiveChildren = getInactiveChildren(element, elements);
          for (const child of inactiveChildren) {
            await activateElement(child.type, child.id);
          }
        }
        break;
        
      case 'deactivate':
        success = await deactivateElement(element.type, element.id);
        
        // Desactivar todos los descendientes activos
        if (success) {
          const descendants = findAllDescendants(element.id, elements);
          const activeDescendants = descendants.filter(d => d.active);
          for (const descendant of activeDescendants) {
            await deactivateElement(descendant.type, descendant.id);
          }
        }
        break;
        
      case 'delete':
        success = await deleteElement(element.type, element.id);
        break;
    }

    if (success) {
      console.log(`${action} realizada en elemento:`, element.name);
    }
  } catch (error) {
    console.error('Error al realizar la acción:', error);
  } finally {
    confirmModal.closeModal();
    setPendingAction(null);
    setActivateChildren(false);
  }
};

  // Obtener el texto de confirmación
  const getConfirmationText = (): { message: string; warning?: string; consequences: string[] } => {
  if (!pendingAction) return { message: '', consequences: [] };

  const { element, action } = pendingAction;
  let message = '';
  let warning: string | undefined;
  const consequences: string[] = [];
  
  switch (action) {
    case 'activate':
      const activationCheck = canActivateElement(element, elements);
      
      if (!activationCheck.valid) {
        message = `¿Estás seguro de que deseas activar el elemento "${element.name || element.description}"?`;
        warning = `No se puede activar este elemento porque su elemento padre "${activationCheck.parentName}" está inactivo. Activa primero el elemento padre.`;
        consequences.push('Para activar este elemento, primero debe activarse su elemento padre');
        if (!element.hasChildren) {
          consequences.push('Alternativamente, puedes eliminar este elemento si ya no es necesario');
        }
      } else {
        message = `¿Estás seguro de que deseas activar el elemento "${element.name || element.description}"?`;
        consequences.push('El elemento volverá a estar disponible para su uso');
        consequences.push('Se restaurará en reportes y listados');
        
        const inactiveChildren = getInactiveChildren(element, elements);
        if (inactiveChildren.length > 0) {
          consequences.push(`Tienes ${inactiveChildren.length} elemento(s) dependiente(s) inactivo(s) que puedes activar opcionalmente`);
        }
      }
      break;
      
    case 'deactivate':
      message = `¿Estás seguro de que deseas inactivar el elemento "${element.name || element.description}"?`;
      if (element.hasDependencies) {
        warning = 'Este elemento tiene dependencias';
      }
      consequences.push('El elemento dejará de aparecer en nuevas asignaciones');
      
      const descendants = findAllDescendants(element.id, elements);
      const activeDescendants = descendants.filter(d => d.active);
      if (activeDescendants.length > 0) {
        consequences.push(`Se inactivarán automáticamente ${activeDescendants.length} elemento(s) dependiente(s)`);
      }
      break;
      
    case 'delete':
      message = `¿Estás seguro de que deseas eliminar permanentemente el elemento "${element.name || element.description}"?`;
      consequences.push('El elemento se eliminará permanentemente');
      consequences.push('Esta acción no se puede deshacer');
      break;
  }
  
  return { message, warning, consequences };
};

  // Actualizar lista (refrescar datos)
  const handleRefresh = () => {
    loadTree();
  };

  return (
    <ScreenContainer
      title="Eliminación o Desactivación"
      description="Gestiona el estado de elementos en la estructura. Puedes activar elementos inactivos, inactivar elementos con dependencias o eliminar permanentemente elementos sin dependencias."
    >
      {/* Filtros de búsqueda */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Elementos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nomenclatura o nombre */}
          <div>
            <SearchInput
              placeholder="Buscar por código o nombre"
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
            />
          </div>

          {/* Filtrar por tipo */}
          <div>
            <CustomSelect
              label=""
              value={typeFilter}
              placeholder="Filtrar por tipo"
              size="sm"
              onChange={(value) => setTypeFilter(value as ElementType | 'all')}
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
            <CustomSelect
              label=""
              value={statusFilter}
              placeholder="Filtrar por estado"
              size="sm"
              onChange={(value) => setStatusFilter(value as ElementStatus | 'all')}
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
      <div>
        {/* Header de la lista */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Elementos Disponibles ({filteredElements.length})
          </h3>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Actualizar Lista</span>
          </Button>
        </div>

        {/* Contenido de la lista */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
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
                    className={`border rounded-lg p-4 transition-all duration-300 ${
                      !element.isActive 
                        ? 'border-gray-300 bg-gray-50/50 opacity-75' 
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header del elemento */}
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded transition-all duration-300 ${
                              !element.isActive 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {element.nomenclature}
                            </span>
                            <span className={getStatusBadgeClasses(status, element.isActive)}>
                              {getStatusText(status)}
                            </span>
                            {element.hasDependencies && element.dependenciesCount && (
                              <span className={`px-2 py-1 text-xs font-medium rounded transition-all duration-300 ${
                                !element.isActive 
                                  ? 'bg-gray-100 text-gray-500' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {element.dependenciesCount} dependencias
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Información del elemento */}
                        <h4 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                          !element.isActive ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {element.name}
                        </h4>
                        <p className={`text-sm mb-2 transition-colors duration-300 ${
                          !element.isActive ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {element.description}
                        </p>
                        <p className={`text-xs transition-colors duration-300 ${
                          !element.isActive ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Creado el {new Date().toLocaleDateString()} por admin
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2 ml-4">
                        {actions.includes('activate' as ActionType) && (
                          <Button
                            onClick={() => handleAction(element, 'activate')}
                            variant="success"
                            size="sm"
                            // Sombra verde para resaltar el botón de activar, pero no sé
                            //className={!element.isActive ? 'shadow-lg shadow-green-200 ring-2 ring-green-200' : ''}
                          >
                            Activar
                          </Button>
                        )}
                        {actions.includes('deactivate' as ActionType) && (
                          <Button
                            onClick={() => handleAction(element, 'deactivate')}
                            variant="tertiary"
                            size="sm"
                          >
                            Inactivar
                          </Button>
                        )}
                        {actions.includes('delete' as ActionType) && (
                          <Button
                            onClick={() => handleAction(element, 'delete')}
                            variant="secondary"
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
      {(() => {
        const confirmInfo = getConfirmationText();
        const canProceed = pendingAction?.action !== 'activate' || canActivateElement(pendingAction.element, elements).valid;
    
      return (
      <>
        {/* Advertencia si existe */}
        {confirmInfo.warning && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Advertencia</h4>
                <p className="text-yellow-800 text-sm">{confirmInfo.warning}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-700">{confirmInfo.message}</p>

        {/* Consecuencias */}
        {confirmInfo.consequences.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Consecuencias de esta acción:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {confirmInfo.consequences.map((consequence, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  {consequence}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checkbox para activar hijos */}
        {pendingAction?.action === 'activate' && canProceed && (() => {
          const inactiveChildren = getInactiveChildren(pendingAction.element, elements);
          return inactiveChildren.length > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="activateChildren"
                  checked={activateChildren}
                  onChange={(e) => setActivateChildren(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="activateChildren" className="text-sm font-medium text-blue-900 cursor-pointer">
                    Activar también todos los elementos dependientes inactivos ({inactiveChildren.length})
                  </label>
                  <p className="text-xs text-blue-700 mt-1">
                    Al marcar esta opción, se activarán automáticamente todos los elementos que dependen de este elemento y que actualmente están inactivos.
                  </p>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Advertencia de eliminación */}
        {pendingAction?.action === 'delete' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ Esta acción es irreversible. El elemento se eliminará permanentemente.
            </p>
          </div>
        )}
      </>
    );
  })()}
  
  <div className="flex justify-end space-x-3">
    <Button
      onClick={() => {
        confirmModal.closeModal();
        setPendingAction(null);
        setActivateChildren(false);
      }}
      variant="secondary"
    >
      Cancelar
    </Button>
    <Button
      onClick={confirmAction}
      disabled={isLoading || (pendingAction?.action === 'activate' && !canActivateElement(pendingAction.element, elements).valid)}
      variant={
        pendingAction?.action === 'activate' ? 'success' :
        pendingAction?.action === 'delete' ? 'secondary' :
        'tertiary'
      }
    >
      {isLoading ? 'Procesando...' : 'Confirmar'}
    </Button>
  </div>
</div>
      </Modal>
    </ScreenContainer>
  );
};

export default StructureDeletion;