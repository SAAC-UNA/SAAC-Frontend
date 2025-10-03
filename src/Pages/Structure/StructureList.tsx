import React, { useState, useEffect } from 'react';
import { cn } from '@/Utils/ClassNames';
import { Button } from '@/Components/Ui/Button';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { LoadingSpinner } from '@/Components/Ui/Loading';
import type { StructureElement, StructureTreeNode } from '@/Types/StructureTypes';
import { ElementType } from '@/Types/StructureTypes';
import { 
  ELEMENT_TYPE_LABELS, 
  HIERARCHY_RULES 
} from '@/Constants/StructureConstants';

// Mock data completo para el árbol jerárquico
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

// Interfaz para props del TreeNode
interface TreeNodeProps {
  node: StructureTreeNode;
  onToggle: (nodeId: string) => void;
}

// Componente TreeNode para mostrar cada elemento del árbol
const TreeNode: React.FC<TreeNodeProps> = ({ node, onToggle }) => {
  const { element, children, level, expanded } = node;
  const hasChildren = children.length > 0;

  const hierarchyInfo = HIERARCHY_RULES[element.type];
  
  // Colores por nivel jerárquico
  const levelColors = {
    1: 'bg-red-50 border-red-200 text-red-800',
    2: 'bg-blue-50 border-blue-200 text-blue-800',
    3: 'bg-green-50 border-green-200 text-green-800',
    4: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    5: 'bg-purple-50 border-purple-200 text-purple-800',
    6: 'bg-pink-50 border-pink-200 text-pink-800',
    7: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    8: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  const colorClass = levelColors[Math.min(hierarchyInfo.level, 8) as keyof typeof levelColors];

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex items-center p-3 rounded-lg border transition-all duration-200 hover:shadow-md',
          colorClass,
          'mb-2'
        )}
        style={{ marginLeft: `${level * 20}px` }}
      >
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

        {!hasChildren && <div className="w-7 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white bg-opacity-50">
                {ELEMENT_TYPE_LABELS[element.type]}
              </span>
              <code className="text-sm font-mono bg-white bg-opacity-30 px-2 py-1 rounded">
                {element.code}
              </code>
            </div>
          </div>

          <h3 className="font-semibold text-base mt-1 truncate">
            {element.name}
          </h3>

          {element.description && (
            <p className="text-sm opacity-75 mt-1 line-clamp-2">
              {element.description}
            </p>
          )}
        </div>

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

export const StructureRepository: React.FC = () => {
  const [structureData, setStructureData] = useState<StructureElement[]>([]);
  const [treeData, setTreeData] = useState<StructureTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4']));

  // Función para construir el árbol jerárquico
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

  // Manejar expansión/colapso de nodos
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

  // Expandir todos los nodos
  const handleExpandAll = () => {
    const allNodeIds = new Set(structureData.map(element => element.id));
    setExpandedNodes(allNodeIds);
  };

  // Colapsar todos los nodos
  const handleCollapseAll = () => {
    setExpandedNodes(new Set(['1']));
  };

  // Cargar datos mock
  useEffect(() => {
    const loadStructureData = async () => {
      setLoading(true);
      
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStructureData(mockStructureData);
      setLoading(false);
    };

    loadStructureData();
  }, []);

  // Actualizar árbol cuando cambian los datos o expansión
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
          <LoadingSpinner variant="bounce" size="lg" color="secondary" className="mx-auto mb-4 text-rojo-una" />
          <p className="text-rojo-una">Cargando estructura del repositorio...</p>
        </div>
      </div>
    );
  }

  return (
    <ScreenContainer
      title="Estructura del Repositorio"
      description="Visualiza la jerarquía completa del Sistema SAAC-UNA. Esta vista muestra todos los elementos organizados desde la Universidad hasta las Evidencias individuales."
      variant="full-width"
    >
      <div className="mb-6 flex gap-4">
        <Button
          onClick={handleExpandAll}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <SystemIcons.interface.expand size="sm" />
          Expandir Todo
        </Button>
        <Button
          onClick={handleCollapseAll}
          variant="tertiary"
          className="flex items-center gap-2"
        >
          <SystemIcons.interface.collapse size="sm" />
          Colapsar Todo
        </Button>
      </div>

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

      <div className="border-t border-gray-200 pt-6">
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
    </ScreenContainer>
  );
};

export default StructureRepository;
