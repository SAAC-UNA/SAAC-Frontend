/**
 * StructureElementDetail - Modal de detalles de un elemento de estructura
 *
 * Muestra información completa de un elemento: tipo, nomenclatura, nombre,
 * estado, descripción, jerarquía y fecha de creación.
 */

import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { StructureElement } from '@/Types/StructureTypes';

interface StructureElementDetailProps {
  isOpen: boolean;
  onClose: () => void;
  element: StructureElement | null;
  parentName: string;
}

export const StructureElementDetail: React.FC<StructureElementDetailProps> = ({
  isOpen,
  onClose,
  element,
  parentName,
}) => {
  if (!element) return null;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Elemento"
      size="md"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <SystemIcons.interface.informationCircle className="w-5 h-5" />
            <h3 className="font-medium text-gray-800">Información básica</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-corner p-4 space-y-3">
            <div>
              <span className={`font-medium text-gray-500 ${TYPOGRAPHY.badge}`}>Tipo de Elemento</span>
              <p className={`text-negro-una-2 mt-1 ${TYPOGRAPHY.table.cell}`}>
                {ELEMENT_TYPE_LABELS[element.type]}
              </p>
            </div>
            {element.nomenclature && (
              <div>
                <span className={`font-medium text-gray-500 ${TYPOGRAPHY.badge}`}>Nomenclatura</span>
                <p className={`text-negro-una-2 mt-1 ${TYPOGRAPHY.table.cell}`}>
                  {element.nomenclature}
                </p>
              </div>
            )}
            <div>
              <span className={`font-medium text-gray-500 ${TYPOGRAPHY.badge}`}>Nombre</span>
              <p className={`text-negro-una-2 mt-1 ${TYPOGRAPHY.table.cell}`}>
                {element.name || '-'}
              </p>
            </div>
            <div>
              <span className={`font-medium text-gray-500 ${TYPOGRAPHY.badge}`}>Estado</span>
              <div className="mt-1">
                <div className={`inline-flex items-center px-2 py-1 font-sans font-bold rounded-corner ${TYPOGRAPHY.badge} ${
                  element.active
                    ? 'text-green-900 bg-green-500/20'
                    : 'text-red-900 bg-red-500/20'
                }`}>
                  {element.active ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {element.description && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <SystemIcons.work.myEvidences className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-800">Descripción</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-corner p-4">
              <p className={`text-gray-700 leading-relaxed ${TYPOGRAPHY.table.cell}`}>
                {element.description}
              </p>
            </div>
          </div>
        )}

        {/* Jerarquía */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <SystemIcons.structure.nut className="w-5 h-5 text-gris-una" />
            <h3 className="font-medium text-gray-800">Ubicación en la jerarquía</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-corner p-4 space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-azul-una rounded-full mt-2 flex-shrink-0" />
              <div>
                <span className={`font-medium text-gray-500 ${TYPOGRAPHY.badge}`}>Elemento padre:</span>
                <p className={`text-gray-700 ${TYPOGRAPHY.table.cell}`}>
                  {parentName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <SystemIcons.interface.calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-800">Información adicional</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-corner p-4">
            <div className={`text-gray-500 ${TYPOGRAPHY.badge}`}>
              Creado el:{' '}
              {new Date(element.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>
    </DetailsModal>
  );
};
