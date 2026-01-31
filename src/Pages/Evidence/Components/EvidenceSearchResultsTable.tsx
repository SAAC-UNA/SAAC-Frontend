/**
 * EvidenceSearchResultsTable - Tabla de resultados de búsqueda de evidencias
 * Componente para mostrar los resultados filtrados con acciones
 */

import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { 
  EVIDENCE_STATUS_LABELS, 
  EVIDENCE_STATUS_COLORS,
  type EvidenceSearchResult 
} from '@/Types/EvidenceSearchTypes';

export interface EvidenceSearchResultsTableProps {
  results: EvidenceSearchResult[];
  loading?: boolean;
  onViewDetails: (evidenceId: number) => void;
}

export const EvidenceSearchResultsTable: React.FC<EvidenceSearchResultsTableProps> = ({
  results,
  loading = false,
  onViewDetails
}) => {
  // Función para formatear fecha
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-una mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
        <SystemIcons.interface.search className="mx-auto text-gray-400 mb-4" size="3xl" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron evidencias
        </h3>
        <p className="text-gray-600">
          No existen evidencias que cumplan con los filtros aplicados.
          <br />
          Intenta ajustar los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Criterio
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Descripción
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Responsable
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Fecha Publicación
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Estado
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Recursos
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((evidence) => {
            const statusColors = EVIDENCE_STATUS_COLORS[evidence.estado];
            
            return (
              <tr 
                key={evidence.evidencia_id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Criterio */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {evidence.criterio_nomenclatura}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      {evidence.criterio_descripcion}
                    </div>
                  </div>
                </td>

                {/* Descripción */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md">
                    {evidence.descripcion}
                  </div>
                </td>

                {/* Responsable */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {evidence.responsable.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      {evidence.responsable.email}
                    </div>
                  </div>
                </td>

                {/* Fecha de publicación */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(evidence.fecha_publicacion)}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    statusColors.bg,
                    statusColors.text
                  )}>
                    {EVIDENCE_STATUS_LABELS[evidence.estado]}
                  </span>
                </td>

                {/* Recursos (archivos y enlaces) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {evidence.archivos_count > 0 && (
                      <div className="flex items-center gap-1" title="Archivos adjuntos">
                        <SystemIcons.modal.document className="text-gray-400" size="sm" />
                        <span>{evidence.archivos_count}</span>
                      </div>
                    )}
                    {evidence.enlaces_count > 0 && (
                      <div className="flex items-center gap-1" title="Enlaces">
                        <SystemIcons.interface.link className="text-gray-400" size="sm" />
                        <span>{evidence.enlaces_count}</span>
                      </div>
                    )}
                    {evidence.archivos_count === 0 && evidence.enlaces_count === 0 && (
                      <span className="text-gray-400">Sin recursos</span>
                    )}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onViewDetails(evidence.evidencia_id)}
                    className="inline-flex items-center gap-1 text-azul-una hover:text-azul-una/80 transition-colors"
                    title="Ver detalles"
                  >
                    <SystemIcons.actions.view size="sm" />
                    <span className="text-sm font-medium">Ver</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EvidenceSearchResultsTable;
