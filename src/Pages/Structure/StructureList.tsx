/**
 * StructureList - Página principal de listado de elementos de estructura
 * 
 * Esta página coordina el componente StructureTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState } from 'react';
import { StructureTable } from './Components/StructureTable';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Modal } from '@/Components/Ui/Modal';
import { MODULE_INFO } from '@/Constants/ModuleInfo';
import type { StructureElement } from '@/Types/StructureTypes';

// Datos mock temporales para visualización (eliminar cuando se conecte al backend)
const mockStructureElements: StructureElement[] = [
  {
    id: '1',
    nomenclature: 'UNA',
    name: 'Universidad Nacional',
    type: 'university',
    active: true,
    createdAt: new Date('2024-01-01'),
    hasChildren: true,
    canDelete: false
  },
  {
    id: '2',
    name: 'Sede Regional Central Occidente',
    type: 'campus',
    parentElementId: '1',
    active: true,
    createdAt: new Date('2024-01-02'),
    hasChildren: true,
    canDelete: false
  },
  {
    id: '3',
    name: 'Facultad de Ciencias Exactas y Naturales',
    type: 'faculty',
    parentElementId: '2',
    active: true,
    createdAt: new Date('2024-01-03'),
    hasChildren: true,
    canDelete: false
  },
  {
    id: '4',
    name: 'Ingeniería en Sistemas de Información',
    type: 'career',
    parentElementId: '3',
    active: true,
    createdAt: new Date('2024-01-04'),
    hasChildren: true,
    canDelete: false
  },
  {
    id: '5',
    nomenclature: 'DIM-01',
    name: 'Gestión del Programa',
    type: 'dimension',
    active: true,
    createdAt: new Date('2024-01-05'),
    hasChildren: true,
    canDelete: false
  },
  {
    id: '6',
    nomenclature: 'COMP-01',
    name: 'Propósitos del Programa',
    type: 'component',
    parentElementId: '5',
    active: true,
    createdAt: new Date('2024-01-06'),
    hasChildren: true,
    canDelete: false
  },
  {
    id: '7',
    nomenclature: 'CRIT-01',
    description: 'Criterio sobre alineación con misión institucional',
    type: 'criteria',
    parentElementId: '6',
    active: true,
    createdAt: new Date('2024-01-07'),
    hasChildren: false,
    canDelete: true
  },
  {
    id: '8',
    nomenclature: 'EST-01',
    description: 'El programa debe estar alineado con la misión de la universidad',
    type: 'standard',
    parentElementId: '7',
    active: true,
    createdAt: new Date('2024-01-08'),
    hasChildren: false,
    canDelete: true
  },
  {
    id: '9',
    nomenclature: 'EVD-01',
    description: 'Documento oficial del plan de estudios vigente',
    type: 'evidence',
    parentElementId: '8',
    active: false,
    createdAt: new Date('2024-01-09'),
    hasChildren: false,
    canDelete: true
  }
];

const StructureList: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.structure;
  
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el modal de confirmación de eliminación
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({
    isOpen: false,
    element: null
  });

  const handleEditElement = (element: StructureElement) => {
    // Navegar directamente a la página de edición con el ID del elemento
    window.location.href = `/estructura/editar/formulario?id=${element.id}`;
  };

  const handleDeleteElement = (element: StructureElement) => {
    setDeleteModalState({
      isOpen: true,
      element
    });
  };

  const confirmDeleteElement = async () => {
  if (deleteModalState.element) {
    setIsLoading(true);
    try {
      // Simular eliminación (mock)
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Elemento eliminado (mock):', deleteModalState.element.id);
      setDeleteModalState({ isOpen: false, element: null });
      // TODO: Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al eliminar elemento:', error);
    } finally {
      setIsLoading(false);
    }
  }
};

  const cancelDeleteElement = () => {
    setDeleteModalState({ isOpen: false, element: null });
  };

  const handleCreateElement = () => {
    window.location.href = '/estructura/crear';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
      >
        <StructureTable
          onEdit={handleEditElement}
          onDelete={handleDeleteElement}
          onCreate={handleCreateElement}
        />
      </ScreenContainer>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={cancelDeleteElement}
        title="Confirmar Eliminación"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro de que desea eliminar el elemento <strong>"{deleteModalState.element?.name || deleteModalState.element?.nomenclature}"</strong>?
          </p>
          <p className="text-sm text-[var(--text-error)]">
            Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={cancelDeleteElement}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteElement}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StructureList;