import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../Components/Ui/Input';
import { Select } from '../../Components/Ui/Select';
import { Button } from '../../Components/Ui/Button';
import type { StructureElement, ElementType } from '../../Types/StructureTypes';

const StructureEditList: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados del componente
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ElementType | 'all'>('all');
  const [availableElements, setAvailableElements] = useState<StructureElement[]>([]);
  const [filteredElements, setFilteredElements] = useState<StructureElement[]>([]);
  const [loading, setLoading] = useState(false);

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
    },
    {
      id: '2',
      name: 'Ingeniería en Sistemas de Información',
      code: 'ING-SIS',
      type: 'career',
      description: 'Carrera de Ingeniería en Sistemas',
      parentElementId: '3',
      active: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin',
      hasChildren: true,
      canDelete: false
    },
    {
      id: '3',
      name: 'Sede Regional Central Occidente',
      code: 'UNA_ALAJUELA',
      type: 'campus',
      description: 'Campus Alajuela',
      parentElementId: '1',
      active: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin',
      hasChildren: true,
      canDelete: false
    }
  ];

  // Cargar elementos disponibles
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAvailableElements(mockElements);
      setFilteredElements(mockElements);
      setLoading(false);
    }, 500);
  }, []);

  // Filtrar elementos cuando cambian los filtros
  useEffect(() => {
    let filtered = availableElements;

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(element => 
        element.name.toLowerCase().includes(term) ||
        element.code.toLowerCase().includes(term)
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

  // Navegar a la página de edición del elemento
  const handleEdit = (elementId: string) => {
    navigate(`/estructura/editar/formulario?id=${elementId}`);
  };

  // Actualizar lista (simula refetch)
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setAvailableElements([...mockElements]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Editar Elementos
        </h1>
        <p className="text-gray-600">
          Selecciona y modifica elementos existentes en la estructura del repositorio. 
          No es posible cambiar el tipo de elemento ni su posición en la jerarquía.
        </p>
      </div>

      {/* Filtros de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Elemento a Editar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {filteredElements.map((element) => (
                <div
                  key={element.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header del elemento */}
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {getElementTypeLabel(element.type)}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded font-mono">
                          {element.code}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          element.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {element.active ? 'Activo' : 'Inactivo'}
                        </span>
                        {element.hasChildren && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
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
                        Creado el {element.createdAt.toLocaleDateString()} por {element.createdBy}
                      </p>
                    </div>

                    {/* Botón de editar */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => handleEdit(element.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
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
    </div>
  );
};

export default StructureEditList;