import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { Button } from '@/Components/Ui/Buttons/Button';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { useStructure } from '@/Hooks/UseStructure';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';

const StructureEditList: React.FC = () => {
  const navigate = useNavigate();
  
  // Hook de estructura
  const { treeData, loadTree, isLoading } = useStructure();
  
  // Estados del componente
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ElementType | 'all'>('all');
  const [filteredElements, setFilteredElements] = useState<StructureElement[]>([]);

  // Aplanar el árbol para obtener todos los elementos como lista
  const availableElements = React.useMemo(() => {
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

  // Cargar elementos disponibles al montar el componente
  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Filtrar elementos cuando cambian los filtros
  useEffect(() => {
    let filtered = availableElements;

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

    setFilteredElements(filtered);
  }, [searchTerm, typeFilter, availableElements]);

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

  // Navegar a la página de edición del elemento
  const handleEdit = (element: StructureElement) => {
    // Incluir tanto ID como tipo en la URL
    navigate(`/estructura/editar/formulario?id=${element.id}&type=${element.type}`);
  };

  // Actualizar lista (refrescar datos)
  const handleRefresh = () => {
    loadTree();
  };

  return (
    <ScreenContainer
      title="Editar Elementos"
      description="Selecciona y modifica elementos existentes en la estructura del repositorio. No es posible cambiar el tipo de elemento ni su posición en la jerarquía."
    >
      {/* Filtros de búsqueda */}
      <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Elemento a Editar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda por código o nombre */}
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
                  { value: 'career', label: 'Carrera' },
                  { value: 'dimension', label: 'Dimensión' },
                  { value: 'component', label: 'Componente' },
                  { value: 'criteria', label: 'Criterio' },
                  { value: 'standard', label: 'Estándar' },
                  { value: 'evidence', label: 'Evidencia' }
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
                <div className="mx-auto text-gray-400 mb-4 text-6xl">📄cambiar</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron elementos</h3>
                <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredElements.map((element) => (
                  <div
                    key={element.id}
                    className="border border-gray-200 rounded-corner p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header del elemento */}
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {getElementTypeLabel(element.type)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded font-mono">
                            {element.nomenclature}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            element.active 
                              ? 'badge-success' 
                              : 'badge-error'
                          }`}>
                            {element.active ? 'Activo' : 'Inactivo'}
                          </span>
                          {element.hasChildren && (
                            <span className="px-2 py-1 badge-warning text-xs font-medium rounded">
                              Tiene dependencias
                            </span>
                          )}
                        </div>

                        {/* Información del elemento */}
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {element.name}
                        </h4>
                        {element.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {element.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Creado el {element.createdAt.toLocaleDateString()}
                        </p>
                      </div>

                      {/* Botón de editar */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => handleEdit(element)}
                          variant="secondary"
                          size="sm"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScreenContainer>
  );
};

export default StructureEditList;