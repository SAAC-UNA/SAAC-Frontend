/**
 * ReviewStep - Cuarto paso del wizard
 * Permite revisar toda la configuración antes de confirmar
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { LoadingSpinner } from '@/Components/Ui/Loading';
import { cn } from '@/Utils/ClassNames';
import { userService, type User } from '@/Services/UserService';
import { roleService, type Role } from '@/Services/RoleService';
import evidenceAssignmentService from '@/Services/EvidenceAssignmentService';
import type { 
  EvidenceAssignmentFormData, 
  ValidationErrors,
  Evidence 
} from '@/Types/EvidenceAssignment';

interface ReviewStepProps {
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData
}) => {
  const [loading, setLoading] = useState(true);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Estados para secciones colapsables
  const [expandedEvidences, setExpandedEvidences] = useState(false);
  const [expandedDestinators, setExpandedDestinators] = useState(false);
  const [expandedConfig, setExpandedConfig] = useState(false);

  // Cargar datos necesarios para mostrar nombres
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [evidencesData, usersData, rolesData] = await Promise.all([
          evidenceAssignmentService.getAllEvidences(),
          userService.listUsers(),
          roleService.listarRoles()
        ]);

        setEvidences(evidencesData);
        
        // Transformar users de backend format
        const transformedUsers: User[] = usersData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status === 'active' ? 'active' : 'inactive',
          role: user.roles?.[0]?.name
        }));
        setUsers(transformedUsers);
        
        setRoles(rolesData.data || []);
      } catch (error) {
        console.error('Error loading review data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Obtener datos con nombres
  const selectedEvidencesData = useMemo(() => {
    return formData.selectedEvidences.map(id => 
      evidences.find(evidence => evidence.evidencia_id === id)
    ).filter(Boolean);
  }, [formData.selectedEvidences, evidences]);

  const selectedUsersData = useMemo(() => {
    return formData.selectedUsers.map(id => 
      users.find(user => user.id === id)
    ).filter(Boolean);
  }, [formData.selectedUsers, users]);

  const selectedRolesData = useMemo(() => {
    return formData.selectedRoles.map(id => 
      roles.find(role => role.id === id)
    ).filter(Boolean);
  }, [formData.selectedRoles, roles]);

  // Calcular totales y estadísticas
  const statistics = useMemo(() => {
    const totalEvidences = formData.selectedEvidences.length;
    const totalUsers = formData.selectedUsers.length;
    const totalRoles = formData.selectedRoles.length;
    const hasDeadline = !!formData.fecha_limite;
    const hasComment = !!formData.comentario;

    return {
      totalEvidences,
      totalUsers,
      totalRoles,
      hasDeadline,
      hasComment,
      totalDestinations: totalUsers + totalRoles
    };
  }, [formData]);

  // Formatear fecha para mostrar
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-negro-una mb-3">
          Revisar Asignación
        </h2>
        <p className="text-gris-una">
          Revise todos los detalles antes de confirmar la asignación de evidencias
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
        </div>
      ) : (
        <>
          {/* Estadísticas Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blanco-una border border-blanco-una rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-rojo-una-2">{statistics.totalEvidences}</p>
                  <p className="text-sm text-negro-una/70">Evidencias</p>
                </div>
              </div>
            </div>

            <div className="bg-blanco-una border border-blanco-una rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-rojo-una-2">{statistics.totalUsers}</p>
                  <p className="text-sm text-negro-una/70">Usuarios</p>
                </div>
              </div>
            </div>

            <div className="bg-blanco-una border border-blanco-una rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-rojo-una-2">{statistics.totalRoles}</p>
                  <p className="text-sm text-negro-una/70">Roles</p>
                </div>
              </div>
            </div>

            <div className="bg-blanco-una border border-blanco-una rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-rojo-una-2">{statistics.totalDestinations}</p>
                  <p className="text-sm text-negro-una/70">Destinatarios</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de la Asignación */}
          <div className="space-y-6">
            {/* Evidencias Seleccionadas - Colapsable */}
            <div className="relative overflow-hidden rounded-xl border-2 border-gris-una/30 bg-gradient-to-br from-gris-una/5 to-gris-una/10">
              {/*<div className="absolute top-0 right-0 w-32 h-32 bg-negro-una/20 rounded-full -mr-16 -mt-16 opacity-20"></div>*/}
              <button
                onClick={() => setExpandedEvidences(!expandedEvidences)}
                className="w-full relative z-10 p-6 text-left hover:bg-gris-una/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gris-una text-white font-bold">
                      {statistics.totalEvidences}
                    </div>
                    <h3 className="text-lg font-semibold text-gris-una">Evidencias a Asignar</h3>
                  </div>
                  <SystemIcons.interface.chevronDown
                    className={cn(
                      'text-gris-una transition-transform duration-200',
                      expandedEvidences && 'rotate-180'
                    )}
                    size="md"
                  />
                </div>
              </button>

              {expandedEvidences && (
                <div className="relative z-10 border-t border-gris-una/20 p-6 max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {selectedEvidencesData.map((evidence) => (
                      <div key={evidence?.evidencia_id} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-negro-una text-sm">
                            {evidence?.nomenclatura} - {evidence?.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Destinatarios - Colapsable */}
            <div className="relative overflow-hidden rounded-xl border-2 border-gris-una/30 bg-gradient-to-br from-gris-una/5 to-gris-una/10">
              {/*<div className="absolute top-0 right-0 w-32 h-32 bg-azul-una/20 rounded-full -mr-16 -mt-16 opacity-20"></div>*/}
              <button
                onClick={() => setExpandedDestinators(!expandedDestinators)}
                className="w-full relative z-10 p-6 text-left hover:bg-gris-una/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gris-una text-white font-bold">
                      {statistics.totalDestinations}
                    </div>
                    <h3 className="text-lg font-semibold text-gris-una">Destinatarios</h3>
                  </div>
                  <SystemIcons.interface.chevronDown
                    className={cn(
                      'text-gris-una transition-transform duration-200',
                      expandedDestinators && 'rotate-180'
                    )}
                    size="md"
                  />
                </div>
              </button>

              {expandedDestinators && (
                <div className="relative z-10 border-t border-gris-una/20 p-6 max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {selectedUsersData.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gris-una mb-3 uppercase tracking-wide">
                          Usuarios ({selectedUsersData.length})
                        </p>
                        <div className="space-y-2">
                          {selectedUsersData.map(user => (
                            <div key={user?.id} className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-negro-una font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-gris-una truncate">{user?.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedRolesData.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gris-una mb-3 uppercase tracking-wide">
                          Roles ({selectedRolesData.length})
                        </p>
                        <div className="space-y-2">
                          {selectedRolesData.map(role => (
                            <div key={role?.id} className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                              <p className="text-sm text-negro-una font-medium">{role?.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Configuración - Colapsable */}
            <div className="relative overflow-hidden rounded-xl border-2 border-gris-una/30 bg-gradient-to-br from-gris-una/5 to-gris-una/10">
              {/*<div className="absolute top-0 right-0 w-32 h-32 bg-gris-una/5 rounded-full -mr-16 -mt-16 opacity-20"></div>*/}
              <button
                onClick={() => setExpandedConfig(!expandedConfig)}
                className="w-full relative z-10 p-6 text-left hover:bg-gris-una/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gris-una text-white">
                      <SystemIcons.interface.calendar size="md" />
                    </div>
                    <h3 className="text-lg font-semibold text-gris-una">Configuración</h3>
                  </div>
                  <SystemIcons.interface.chevronDown
                    className={cn(
                      'text-gris-una transition-transform duration-200',
                      expandedConfig && 'rotate-180'
                    )}
                    size="md"
                  />
                </div>
              </button>

              {expandedConfig && (
                <div className="relative z-10 border-t border-gris-una p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gris-una uppercase tracking-wide mb-2">
                        Fecha Límite de Entrega
                      </p>
                      <p className="text-sm font-medium text-negro-una bg-white/60 rounded-lg p-3">
                        {formData.fecha_limite ? formatDate(formData.fecha_limite) : '— No especificada'}
                      </p>
                      {formData.fecha_limite && (
                        <p className="text-xs text-gris-una mt-2">
                          Los destinatarios recibirán recordatorios antes de esta fecha
                        </p>
                      )}
                    </div>
                    
                    {formData.comentario && (
                      <div>
                        <p className="text-xs font-semibold text-gris-una uppercase tracking-wide mb-2">
                          Comentario
                        </p>
                        <p className="text-sm text-negro-una bg-white/60 rounded-lg p-3 max-h-24 overflow-y-auto whitespace-pre-wrap break-words">
                          {formData.comentario}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};