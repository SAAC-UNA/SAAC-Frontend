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
  Evidence,
  DuplicateAssignment
} from '@/Types/EvidenceAssignment';

interface ReviewStepProps {
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  updateFormData
}) => {
  const [loading, setLoading] = useState(true);
  const [validatingDuplicates, setValidatingDuplicates] = useState(false);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateAssignment[]>([]);
  const [excludedUsers, setExcludedUsers] = useState<Set<number>>(new Set());
  
  // Estados para secciones colapsables
  const [expandedEvidences, setExpandedEvidences] = useState(false);
  const [expandedDestinators, setExpandedDestinators] = useState(false);
  const [expandedDuplicates, setExpandedDuplicates] = useState(true); // Expandido por defecto

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

  // Validar duplicados cuando se seleccionan usuarios
  useEffect(() => {
    const validateDuplicates = async () => {
      // Solo validar si hay proceso, evidencia y usuarios seleccionados
      if (!formData.proceso_id || formData.selectedEvidences.length === 0 || formData.selectedUsers.length === 0) {
        setDuplicates([]);
        return;
      }

      try {
        setValidatingDuplicates(true);
        const allDuplicates: DuplicateAssignment[] = [];

        // Validar cada evidencia seleccionada
        for (const evidenciaId of formData.selectedEvidences) {
          const response = await evidenceAssignmentService.validateDuplicates({
            proceso_id: formData.proceso_id,
            evidencia_id: evidenciaId,
            usuarios: formData.selectedUsers
          });

          if (response.tiene_duplicados) {
            allDuplicates.push(...response.duplicados);
          }
        }

        setDuplicates(allDuplicates);
      } catch (error: any) {
        console.error('Error validating duplicates:', error);
        // No bloquear el flujo si el endpoint no está disponible
        // El backend rechazará duplicados al confirmar de todas formas
        setDuplicates([]);
      } finally {
        setValidatingDuplicates(false);
      }
    };

    validateDuplicates();
  }, [formData.proceso_id, formData.selectedEvidences, formData.selectedUsers]);

  // Obtener datos con nombres
  const selectedEvidencesData = useMemo(() => {
    return formData.selectedEvidences.map(id => 
      evidences.find(evidence => evidence.evidencia_id === id)
    ).filter(Boolean);
  }, [formData.selectedEvidences, evidences]);

  const selectedUsersData = useMemo(() => {
    return formData.selectedUsers
      .filter(id => !excludedUsers.has(id)) // Filtrar usuarios excluidos
      .map(id => users.find(user => user.id === id))
      .filter(Boolean);
  }, [formData.selectedUsers, users, excludedUsers]);

  const selectedRolesData = useMemo(() => {
    return formData.selectedRoles.map(id => 
      roles.find(role => role.id === id)
    ).filter(Boolean);
  }, [formData.selectedRoles, roles]);

  // Calcular totales y estadísticas
  const statistics = useMemo(() => {
    const totalEvidences = formData.selectedEvidences.length;
    const totalUsers = formData.selectedUsers.length - excludedUsers.size; // Restar usuarios excluidos
    const totalRoles = formData.selectedRoles.length;
    const hasDeadline = !!formData.fecha_limite;
    const hasComment = !!formData.comentario;
    const totalDuplicates = duplicates.length;

    return {
      totalEvidences,
      totalUsers,
      totalRoles,
      hasDeadline,
      hasComment,
      totalDestinations: totalUsers + totalRoles,
      totalDuplicates
    };
  }, [formData, excludedUsers, duplicates]);

  // Formatear fecha para mostrar sin conversión de zona horaria
  const formatDate = (dateString: string): string => {
    // Separar la fecha en partes para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    // Crear fecha en zona local especificando año, mes (0-indexed), día
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener el color del badge según el estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Obtener el texto del estado
  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_progreso':
        return 'En Progreso';
      case 'vencido':
        return 'Vencido';
      default:
        return 'Pendiente';
    }
  };

  // Manejar la exclusión/inclusión de usuarios con duplicados
  const handleToggleUser = (userId: number) => {
    const newExcluded = new Set(excludedUsers);
    if (newExcluded.has(userId)) {
      newExcluded.delete(userId);
    } else {
      newExcluded.add(userId);
    }
    setExcludedUsers(newExcluded);
    
    // Actualizar formData para excluir usuarios
    const filteredUsers = formData.selectedUsers.filter(id => !newExcluded.has(id));
    updateFormData({ selectedUsers: filteredUsers });
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

          {/* Alerta de duplicados si los hay */}
          {validatingDuplicates && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <p className="text-sm text-blue-800">Validando asignaciones existentes...</p>
              </div>
            </div>
          )}

          {!validatingDuplicates && duplicates.length > 0 && (
            <div className="relative overflow-hidden rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100">
              <button
                onClick={() => setExpandedDuplicates(!expandedDuplicates)}
                className="w-full relative z-10 p-6 text-left hover:bg-yellow-100/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-600 text-white font-bold">
                      {statistics.totalDuplicates}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900">
                        Asignaciones Duplicadas Detectadas
                      </h3>
                      <p className="text-sm text-yellow-800">
                        Algunos usuarios ya tienen estas evidencias asignadas. Puedes deseleccionarlos.
                      </p>
                    </div>
                  </div>
                  <SystemIcons.interface.chevronDown
                    className={cn(
                      'text-yellow-900 transition-transform duration-200',
                      expandedDuplicates && 'rotate-180'
                    )}
                    size="md"
                  />
                </div>
              </button>

              {expandedDuplicates && (
                <div className="relative z-10 border-t border-yellow-300 p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-yellow-300">
                          <th className="text-left py-3 px-4 font-semibold text-yellow-900">
                            <input
                              type="checkbox"
                              checked={excludedUsers.size === 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExcludedUsers(new Set());
                                  updateFormData({ selectedUsers: formData.selectedUsers });
                                } else {
                                  const allDuplicateUserIds = new Set(duplicates.map(d => d.usuario_id));
                                  setExcludedUsers(allDuplicateUserIds);
                                  updateFormData({ 
                                    selectedUsers: formData.selectedUsers.filter(id => !allDuplicateUserIds.has(id))
                                  });
                                }
                              }}
                              className="w-4 h-4 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-yellow-900">Usuario</th>
                          <th className="text-left py-3 px-4 font-semibold text-yellow-900">Estado</th>
                          <th className="text-left py-3 px-4 font-semibold text-yellow-900">Fecha Asignación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duplicates.map((duplicate, index) => (
                          <tr key={`${duplicate.usuario_id}-${index}`} className="border-b border-yellow-200 hover:bg-yellow-50">
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={!excludedUsers.has(duplicate.usuario_id)}
                                onChange={() => handleToggleUser(duplicate.usuario_id)}
                                className="w-4 h-4 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-yellow-900">{duplicate.usuario_nombre}</td>
                            <td className="py-3 px-4">
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                getStatusColor(duplicate.estado)
                              )}>
                                {getStatusText(duplicate.estado)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-yellow-900">
                              {new Date(duplicate.fecha_asignacion).toLocaleDateString('es-ES')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Nota:</strong> Los usuarios desmarcados no recibirán nuevas asignaciones. 
                      Las asignaciones existentes se mantendrán sin cambios.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

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

            {/* Configuración - Siempre visible */}
            <div className="relative overflow-hidden rounded-xl border-2 border-gris-una/30 bg-gradient-to-br from-gris-una/5 to-gris-una/10">
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gris-una text-white">
                    <SystemIcons.interface.calendar size="md" />
                  </div>
                  <h3 className="text-lg font-semibold text-gris-una">Configuración</h3>
                </div>

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
                      <p className="text-sm text-negro-una bg-white/60 rounded-lg p-3 max-h-32 overflow-y-auto whitespace-pre-wrap break-all overflow-x-hidden">
                        {formData.comentario}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};