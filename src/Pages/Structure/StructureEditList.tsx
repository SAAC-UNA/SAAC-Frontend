import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { Button } from '@/Components/Ui/Buttons/Button';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { PageHeader } from '@/Components/Ui/Index';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { useStructure } from '@/Hooks/UseStructure';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import { TYPOGRAPHY } from '@/Constants/Typography';

const StructureEditList: React.FC = () => {
  const navigate = useNavigate();
  
  // Hook de estructura
  const { treeData, loadTree, isLoading } = useStructure();
  
  // Estados del componente
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ElementType | 'all'>('all');

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

  // Filtrar elementos - MEMOIZADO
  const filteredElements = useMemo(() => {
    let filtered = availableElements;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(element =>
        element.name?.toLowerCase().includes(term) ||
        element.nomenclature?.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(element => element.type === typeFilter);
    }

    return filtered;
  }, [searchTerm, typeFilter, availableElements]);

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
    <ScreenContainer>
      <PageHeader
        title="Editar Elementos"
        description="Selecciona y modifica elementos existentes en la estructura del repositorio. No es posible cambiar el tipo de elemento ni su posición en la jerarquía."
        headerExtra={
          <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
            <SearchInput
              placeholder="Buscar por código o nombre"
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
            />
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
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="secondary"
              className="gap-2"
            >
              <SystemIcons.interface.refresh className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        }
      />

        {/* Lista de elementos */}
        <div>
          {/* Header de la lista */}
          <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-200 pt-4">
            <p className={`text-gris-una ${TYPOGRAPHY.table.cell}`}>
              {filteredElements.length} elemento{filteredElements.length !== 1 ? 's' : ''} encontrado{filteredElements.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Contenido de la lista */}
          <div>
            {isLoading ? (
              <div className="relative py-12 min-h-[400px]">
                <LoadingSpinner variant="loader" />
              </div>
            ) : filteredElements.length === 0 ? (
              <div className="text-center py-12">
                <SystemIcons.interface.informationCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
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
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-corner font-sans font-bold select-none whitespace-nowrap badge-info ${TYPOGRAPHY.badge}`}>
                            {ELEMENT_TYPE_LABELS[element.type]}
                          </span>
                          {element.nomenclature && (
                            <span className={`px-2 py-1 rounded-corner font-mono badge-info ${TYPOGRAPHY.badge}`}>
                              {element.nomenclature}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-corner font-sans font-bold select-none whitespace-nowrap ${TYPOGRAPHY.badge} ${
                            element.active ? 'text-green-900 bg-green-500/20' : 'text-red-900 bg-red-500/20'
                          }`}>
                            {element.active ? 'Activo' : 'Inactivo'}
                          </span>
                          {element.hasChildren && (
                            <span className={`px-2 py-1 rounded-corner font-sans font-bold select-none whitespace-nowrap badge-warning ${TYPOGRAPHY.badge}`}>
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