import React, { useState, useEffect } from 'react';
import { cn } from '../../Utils/ClassNames';
import type { StructureElement, StructureTreeNode } from '../../Types/StructureTypes';
import { ElementType } from '../../Types/StructureTypes';
import { 
  ELEMENT_TYPE_LABELS, 
  HIERARCHY_RULES 
} from '../../Constants/StructureConstants';

/**
   Datos de ejemplo (mock) para la estructura del repositorio
   Al conectar el backend, estos datos vendrían de la API
 */

const mockStructureData: StructureElement[] = [
  {
    id: '1',
    code: 'UNA',
    name: 'Universidad Nacional',
    description: 'Universidad Nacional de Costa Rica',
    type: ElementType.UNIVERSITY,
    active: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '2',
    code: 'UNA-ALAJUELA',
    name: 'Sede Regional Central Occidente',
    description: 'Campus Alajuela',
    type: ElementType.CAMPUS,
    parentElementId: '1',
    active: true,
    createdAt: new Date('2024-01-02'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '3',
    code: 'FAC-ING',
    name: 'Facultad de Ciencias Exactas y Naturales',
    description: 'Facultad que incluye carreras de ingeniería',
    type: ElementType.FACULTY,
    parentElementId: '2',
    active: true,
    createdAt: new Date('2024-01-03'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '4',
    code: 'ING-SIS',
    name: 'Ingeniería en Sistemas de Información',
    description: 'Carrera de Ingeniería en Sistemas',
    type: ElementType.CAREER,
    parentElementId: '3',
    active: true,
    createdAt: new Date('2024-01-04'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '5',
    code: 'DIM-01',
    name: 'Gestión del Programa',
    description: 'Primera dimensión de evaluación',
    type: ElementType.DIMENSION,
    parentElementId: '4',
    active: true,
    createdAt: new Date('2024-01-05'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '6',
    code: 'COMP-01',
    name: 'Propósitos del Programa',
    description: 'Primer componente de gestión',
    type: ElementType.COMPONENT,
    parentElementId: '5',
    active: true,
    createdAt: new Date('2024-01-06'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '7',
    code: 'CRIT-01',
    name: 'Correspondencia con la Misión',
    description: 'Criterio sobre alineación con misión institucional',
    type: ElementType.CRITERIA,
    parentElementId: '6',
    active: true,
    createdAt: new Date('2024-01-07'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '8',
    code: 'EVD-01',
    name: 'Plan de Estudios Vigente',
    description: 'Documento oficial del plan de estudios',
    type: ElementType.EVIDENCE,
    parentElementId: '7',
    active: true,
    createdAt: new Date('2024-01-08'),
    createdBy: 'admin',
    hasChildren: false,
    canDelete: true
  }
];

/**
 * Componente para mostrar un elemento individual en el árbol
 * Representa un nodo de la estructura jerárquica
 */

interface TreeNodeProps {
  /** Nodo del árbol a renderizar */
  node: StructureTreeNode;
  /** Función para alternar expansión del nodo */
  onToggle: (nodeId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onToggle }) => {
  const { element, children, level, expanded } = node;
  const hasChildren = children.length > 0;

  // Obtener información de jerarquía para mostrar color y estilo
  const hierarchyInfo = HIERARCHY_RULES[element.type];
  
  // Clases CSS basadas en el nivel y tipo de elemento
  const levelColors = {
    1: 'bg-red-50 border-red-200 text-red-800', // Universidad
    2: 'bg-blue-50 border-blue-200 text-blue-800', // Sede
    3: 'bg-green-50 border-green-200 text-green-800', // Facultad
    4: 'bg-yellow-50 border-yellow-200 text-yellow-800', // Carrera
    5: 'bg-purple-50 border-purple-200 text-purple-800', // Dimensión
    6: 'bg-pink-50 border-pink-200 text-pink-800', // Componente
    7: 'bg-indigo-50 border-indigo-200 text-indigo-800', // Criterio
    8: 'bg-gray-50 border-gray-200 text-gray-800' // Estándar/Evidencia
  };

  const colorClass = levelColors[Math.min(hierarchyInfo.level, 8) as keyof typeof levelColors];

  return (
    <div className="w-full">
      {/* Elemento principal */}
      <div
        className={cn(
          'flex items-center p-3 rounded-lg border transition-all duration-200 hover:shadow-md',
          colorClass,
          'mb-2'
        )}
        style={{ marginLeft: `${level * 20}px` }}
      >
        {/* Botón para expandir/colapsar */}
        {hasChildren && (
          <button
            onClick={() => onToggle(element.id)}
            className="flex-shrink-0 mr-3 p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors"
            aria-label={expanded ? 'Colapsar' : 'Expandir'}
          >
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                expanded ? 'rotate-90' : 'rotate-0'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Espaciador si no tiene hijos */}
        {!hasChildren && <div className="w-7 flex-shrink-0" />}

        {/* Información del elemento */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* Tipo y código */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white bg-opacity-50">
                {ELEMENT_TYPE_LABELS[element.type]}
              </span>
              <code className="text-sm font-mono bg-white bg-opacity-30 px-2 py-1 rounded">
                {element.code}
              </code>
            </div>
          </div>

          {/* Nombre del elemento */}
          <h3 className="font-semibold text-base mt-1 truncate">
            {element.name}
          </h3>

          {/* Descripción (si existe) */}
          {element.description && (
            <p className="text-sm opacity-75 mt-1 line-clamp-2">
              {element.description}
            </p>
          )}
        </div>

        {/* Estado activo/inactivo */}
        <div className="flex-shrink-0 ml-3">
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              element.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            )}
          >
            {element.active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Elementos hijos (recursivo) */}
      {hasChildren && expanded && (
        <div className="ml-4">
          {children.map((child) => (
            <TreeNode
              key={child.element.id}
              node={child}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Página principal de Estructura del Repositorio
 * Muestra la jerarquía completa en vista de solo lectura
 */

export const StructureRepository: React.FC = () => {
  // Estado para los datos de la estructura
  const [structureData, setStructureData] = useState<StructureElement[]>([]);
  // Estado para el árbol jerárquico construido
  const [treeData, setTreeData] = useState<StructureTreeNode[]>([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);
  // Estado para nodos expandidos
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4']));

  /**
   * Función para construir el árbol jerárquico a partir de datos planos
   * Convierte la lista de elementos en estructura de árbol
   */

  const buildTree = (elements: StructureElement[], parentId?: string, level = 0): StructureTreeNode[] => {
    return elements
      .filter(element => element.parentElementId === parentId)
      .map(element => ({
        element,
        children: buildTree(elements, element.id, level + 1),
        level,
        expanded: expandedNodes.has(element.id),
        path: []
      }));
  };

  /**
   * Función para alternar la expansión de un nodo
   */

  const handleToggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  };

  /**
   * Función para expandir todos los nodos
   */

  const handleExpandAll = () => {
    const allNodeIds = new Set(structureData.map(element => element.id));
    setExpandedNodes(allNodeIds);
  };

  /**
   * Función para colapsar todos los nodos
   */

  const handleCollapseAll = () => {
    setExpandedNodes(new Set(['1'])); // Solo mantener la raíz expandida
  };

  // Efecto para cargar datos (simulación de API)
  useEffect(() => {
    const loadStructureData = async () => {
      setLoading(true);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStructureData(mockStructureData);
      setLoading(false);
    };

    loadStructureData();
  }, []);

  // Efecto para reconstruir árbol cuando cambian los datos o nodos expandidos
  
  useEffect(() => {
    if (structureData.length > 0) {
      const tree = buildTree(structureData);
      setTreeData(tree);
    }
  }, [structureData, expandedNodes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estructura del repositorio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Estructura del Repositorio
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Visualiza la jerarquía completa del Sistema SAAC-UNA. Esta vista muestra todos 
          los elementos organizados desde la Universidad hasta las Evidencias individuales.
        </p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleExpandAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Expandir Todo
        </button>
        <button
          onClick={handleCollapseAll}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Colapsar Todo
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(ELEMENT_TYPE_LABELS).map(([type, label]) => {
          const count = structureData.filter(element => element.type === type).length;
          return (
            <div key={type} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{count}</div>
              <div className="text-sm text-gray-600">{label}{count !== 1 ? 's' : ''}</div>
            </div>
          );
        })}
      </div>

      {/* Árbol de estructura */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Jerarquía de Elementos
          </h2>
          
          {treeData.length > 0 ? (
            <div className="space-y-2">
              {treeData.map((node) => (
                <TreeNode
                  key={node.element.id}
                  node={node}
                  onToggle={handleToggleNode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin estructura configurada
              </h3>
              <p className="text-gray-600">
                No hay elementos en la estructura del repositorio. 
                Utiliza la sección de Gestión para crear elementos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StructureRepository;