/**
 * EvidenceDetailsModal - Modal para mostrar los detalles completos de una evidencia
 * 
 * Muestra información detallada de la evidencia incluyendo:
 * - Información básica (criterio, descripción, estado)
 * - Lista completa de responsables con nombres y correos
 * - Recursos disponibles (archivos y enlaces) agrupados por responsable
 * - Roles con acceso
 */

import React, { useState, useEffect } from 'react';
import { DetailsModal } from '@/Components/Ui/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { FileList } from '@/Pages/EvidenceUpload/Components/FileList';
import { fileService } from '@/Services/FileService';
import type { FileModel } from '@/Types/FileTypes';
import { 
  EVIDENCE_STATUS_LABELS, 
  EVIDENCE_STATUS_BADGE,
  type EvidenceSearchResult 
} from '@/Types/EvidenceSearchTypes';
import { cn } from '@/Utils/ClassNames';

interface EvidenceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceSearchResult | null;
}

interface FilesByUser {
  usuario_id: number;
  nombre: string;
  email: string;
  archivos: FileModel[];
}

export const EvidenceDetailsModal: React.FC<EvidenceDetailsModalProps> = ({
  isOpen,
  onClose,
  evidence
}) => {
  const [filesByUser, setFilesByUser] = useState<FilesByUser[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  // Cargar archivos cuando se abra el modal
  useEffect(() => {
    if (isOpen && evidence) {
      loadFiles();
    } else {
      // Limpiar al cerrar
      setFilesByUser([]);
      setExpandedUsers(new Set());
    }
  }, [isOpen, evidence?.evidencia_id]);

  const loadFiles = async () => {
    if (!evidence) return;

    setLoadingFiles(true);
    try {
      const files = await fileService.listFiles({ evidencia_id: evidence.evidencia_id });
      
      // Agrupar archivos por usuario
      const grouped = evidence.responsables.map(responsable => {
        const userFiles = files.filter((f: FileModel) => f.usuario_id === responsable.usuario_id);
        return {
          usuario_id: responsable.usuario_id,
          nombre: responsable.nombre,
          email: responsable.email,
          archivos: userFiles
        };
      }).filter(group => group.archivos.length > 0); // Solo mostrar usuarios con archivos

      setFilesByUser(grouped);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
      setFilesByUser([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const toggleUser = (usuarioId: number) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(usuarioId)) {
        newSet.delete(usuarioId);
      } else {
        newSet.add(usuarioId);
      }
      return newSet;
    });
  };

  if (!evidence) return null;

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderBasicInfo = () => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <SystemIcons.modal.document className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Información General</h3>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-corner p-4 space-y-3">
        <div>
          <span className="text-sm font-semibold text-gray-800">Criterio:</span>
          <p className="text-sm text-gray-700 mt-1">
            {evidence.criterio_nomenclatura} - {evidence.criterio_descripcion}
          </p>
        </div>
        
        <div>
          <span className="text-sm font-semibold text-gray-800">Descripción:</span>
          <p className="text-sm text-gray-700 mt-1">{evidence.descripcion}</p>
        </div>

        <div>
          <span className="text-sm font-semibold text-gray-800">Estado:</span>
          <div className="mt-1">
            <span className={cn(
              'inline-flex px-2 py-1 text-xs font-bold uppercase rounded-corner',
              EVIDENCE_STATUS_BADGE[evidence.estado]
            )}>
              {EVIDENCE_STATUS_LABELS[evidence.estado]}
            </span>
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-gray-800">Fecha de creación:</span>
          <p className="text-sm text-gray-700 mt-1">{formatDate(evidence.fecha_publicacion)}</p>
        </div>

        {evidence.updated_at && (
          <div>
            <span className="text-sm font-semibold text-gray-800">Última actualización:</span>
            <p className="text-sm text-gray-700 mt-1">{formatDate(evidence.updated_at)}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderResponsables = () => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <SystemIcons.users.user className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Responsables</h3>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-corner p-4 max-h-60 overflow-y-auto">
        {evidence.responsables && evidence.responsables.length > 0 ? (
          <div className="space-y-3">
            {evidence.responsables.map((responsable, index) => (
              <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 bg-azul-una/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <SystemIcons.users.user className="w-4 h-4 text-azul-una" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{responsable.nombre}</p>
                  <p className="text-xs text-gray-600">{responsable.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay responsables asignados a esta evidencia
          </p>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Total: {evidence.responsables?.length || 0} responsable{(evidence.responsables?.length || 0) !== 1 ? 's' : ''}
      </div>
    </div>
  );

  const renderRecursos = () => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <SystemIcons.interface.link className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Recursos</h3>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-corner p-4">
        {/* Resumen de recursos */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <SystemIcons.modal.document className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Archivos</p>
              <p className="text-lg font-semibold text-gray-800">{evidence.archivos_count}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <SystemIcons.interface.link className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Enlaces</p>
              <p className="text-lg font-semibold text-gray-800">{evidence.enlaces_count}</p>
            </div>
          </div>
        </div>

        {/* Archivos agrupados por responsable */}
        {loadingFiles ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Cargando archivos...</p>
          </div>
        ) : filesByUser.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Archivos por responsable:</p>
            {filesByUser.map((userGroup) => {
              const isExpanded = expandedUsers.has(userGroup.usuario_id);
              const filesCount = userGroup.archivos.filter(f => f.tipo === 'archivo').length;
              const linksCount = userGroup.archivos.filter(f => f.tipo === 'enlace').length;
              
              return (
                <div key={userGroup.usuario_id} className="border border-gray-200 rounded-corner overflow-hidden">
                  {/* Header del acordeón */}
                  <button
                    onClick={() => toggleUser(userGroup.usuario_id)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-azul-una/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <SystemIcons.users.user className="w-4 h-4 text-azul-una" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{userGroup.nombre}</p>
                        <p className="text-xs text-gray-600">
                          {filesCount > 0 && `${filesCount} archivo${filesCount !== 1 ? 's' : ''}`}
                          {filesCount > 0 && linksCount > 0 && ' • '}
                          {linksCount > 0 && `${linksCount} enlace${linksCount !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <SystemIcons.interface.chevronDown 
                      className={cn(
                        "w-5 h-5 text-gray-400 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  
                  {/* Contenido del acordeón */}
                  {isExpanded && (
                    <div className="p-4 bg-white">
                      <FileList
                        files={userGroup.archivos}
                        loading={false}
                        showActions={false}
                        emptyMessage="Este responsable no ha subido archivos aún"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">
            No hay recursos adjuntos
          </p>
        )}
      </div>
    </div>
  );
/*TODO revisar esta sección, si realmente se usa */
  const renderRolesAcceso = () => {
    if (!evidence.roles_acceso || evidence.roles_acceso.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <SystemIcons.users.roles className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Roles con Acceso</h3>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-corner p-4">
          <div className="flex flex-wrap gap-2">
            {evidence.roles_acceso.map((rol, index) => (
              <span
                key={index}
                className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-azul-una/10 text-azul-una"
              >
                {rol}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Evidencia"
      itemName={evidence.criterio_nomenclatura}
      itemType="evidencia"
      cancelLabel="Cerrar"
      size="lg"
    >
      {renderBasicInfo()}
      {renderResponsables()}
      {renderRecursos()}
      {renderRolesAcceso()}
    </DetailsModal>
  );
};
