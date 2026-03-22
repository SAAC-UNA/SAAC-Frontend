/**
 * ReviewStep - Cuarto paso del wizard
 * Permite revisar toda la configuración antes de confirmar
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { cn } from '@/Utils/ClassNames';
import { userService, type User } from '@/Services/UserService';
import { roleService, type Role } from '@/Services/RoleService';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
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
  const [dataState, setDataState] = useState<{ loading: boolean; validatingDuplicates: boolean; evidences: Evidence[]; users: User[]; roles: Role[]; duplicates: DuplicateAssignment[] }>({ loading: true, validatingDuplicates: false, evidences: [], users: [], roles: [], duplicates: [] });
  const loading = dataState.loading;
  const validatingDuplicates = dataState.validatingDuplicates;
  const evidences = dataState.evidences;
  const users = dataState.users;
  const roles = dataState.roles;
  const duplicates = dataState.duplicates;
  
  // Convertir excludedUsers de array a Set para operaciones más rápidas
  const excludedUsersSet = useMemo(() => new Set(formData.excludedUsers || []), [formData.excludedUsers]);
  
  // Estados para secciones colapsables
  const [expanded, setExpanded] = useState({ evidences: false, destinators: false, activeDuplicates: true, completedDuplicates: true });
  const expandedEvidences = expanded.evidences;
  const expandedDestinators = expanded.destinators;
  const expandedActiveDuplicates = expanded.activeDuplicates;
  const expandedCompletedDuplicates = expanded.completedDuplicates;

  // Cargar datos necesarios para mostrar nombres
  useEffect(() => {
    const loadData = async () => {
      try {
        const [evidencesData, usersData, rolesData] = await Promise.all([
          evidenceAssignmentService.getAllEvidences(),
          userService.listUsers(),
          roleService.listarRoles()
        ]);

        const transformedUsers: User[] = usersData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status === 'active' ? 'active' : 'inactive',
          role: user.roles?.[0]?.name
        }));

        setDataState(prev => ({ ...prev, loading: false, evidences: evidencesData, users: transformedUsers, roles: rolesData.data || [] }));
      } catch (error) {
        console.error('Error loading review data:', error);
        setDataState(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  // Validar duplicados cuando se seleccionan usuarios
  useEffect(() => {
    const validateDuplicates = async () => {
      setDataState(prev => ({ ...prev, validatingDuplicates: true, duplicates: [] }));

      let newDuplicates: DuplicateAssignment[] = [];

      if (formData.proceso_id && formData.selectedEvidences.length > 0 && formData.selectedUsers.length > 0) {
        try {
          for (const evidenciaId of formData.selectedEvidences) {
            const response = await evidenceAssignmentService.validateDuplicates({
              proceso_id: formData.proceso_id,
              evidencia_id: evidenciaId,
              usuarios: formData.selectedUsers
            });
            if (response.tiene_duplicados) {
              newDuplicates.push(...response.duplicados);
            }
          }
        } catch (error: any) {
          console.error('Error validating duplicates:', error);
          newDuplicates = [];
        }
      }

      setDataState(prev => ({ ...prev, duplicates: newDuplicates, validatingDuplicates: false }));
      updateFormData({ excludedUsers: newDuplicates.map(d => d.usuario_id) });
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
      .filter(id => !excludedUsersSet.has(id)) // Filtrar usuarios excluidos
      .map(id => users.find(user => user.id === id))
      .filter(Boolean);
  }, [formData.selectedUsers, users, excludedUsersSet]);

  const selectedRolesData = useMemo(() => {
    return formData.selectedRoles.map(id => 
      roles.find(role => role.id === id)
    ).filter(Boolean);
  }, [formData.selectedRoles, roles]);

  // Calcular totales y estadísticas
  const statistics = useMemo(() => {
    const totalEvidences = formData.selectedEvidences.length;
    const totalUsers = formData.selectedUsers.length - excludedUsersSet.size; // Restar usuarios excluidos
    const totalRoles = formData.selectedRoles.length;
    const hasDeadline = !!formData.fecha_limite;
    const hasComment = !!formData.comentario;
    
    // Segregar duplicados por estado
    const activeDuplicates = duplicates.filter(d => d.estado !== 'completado');
    const completedDuplicates = duplicates.filter(d => d.estado === 'completado');

    return {
      totalEvidences,
      totalUsers,
      totalRoles,
      hasDeadline,
      hasComment,
      totalDestinations: totalUsers + totalRoles,
      totalDuplicates: duplicates.length,
      activeDuplicates: activeDuplicates.length,
      completedDuplicates: completedDuplicates.length
    };
  }, [formData, excludedUsersSet, duplicates]);

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
    const currentExcluded = formData.excludedUsers || [];
    const isCurrentlyExcluded = currentExcluded.includes(userId);
    
    if (isCurrentlyExcluded) {
      // Quitar de excluidos (incluir usuario)
      updateFormData({ 
        excludedUsers: currentExcluded.filter(id => id !== userId)
      });
    } else {
      // Agregar a excluidos
      updateFormData({ 
        excludedUsers: [...currentExcluded, userId]
      });
    }
  };

  return (
    <div className="space-y-6">

      {loading ? (
        <div className="relative py-12 min-h-[400px]">
          <LoadingSpinner variant="loader" />
        </div>
      ) : (
        <>
          {/* Estadísticas Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blanco-una border border-blanco-una rounded-corner p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-rojo-una-2">{statistics.totalEvidences}</p>
                  <p className="text-sm text-negro-una/70">Evidencias</p>
                </div>
              </div>
            </div>

            <div className="bg-blanco-una border border-blanco-una rounded-corner p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-rojo-una-2">{statistics.totalUsers}</p>
                  <p className="text-sm text-negro-una/70">Usuarios</p>
                </div>
              </div>
            </div>

            <div className="bg-blanco-una border border-blanco-una rounded-corner p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-rojo-una-2">{statistics.totalRoles}</p>
                  <p className="text-sm text-negro-una/70">Roles</p>
                </div>
              </div>
            </div>

            <div className="bg-blanco-una border border-blanco-una rounded-corner p-4 shadow-md">
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
            <div className="bg-blue-50 border border-blue-200 rounded-corner p-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-azul-una border-t-transparent rounded-full animate-spin flex-shrink-0" role="status" aria-label="Cargando..." />
                <p className="text-sm text-info">Validando asignaciones existentes...</p>
              </div>
            </div>
          )}

          {/* Asignaciones duplicadas segregadas por estado */}
          {!validatingDuplicates && duplicates.length > 0 && (
            <div className="space-y-4">
              {/* Duplicados activos (bloqueados) - NO se pueden reasignar */}
              {duplicates.filter(d => d.estado !== 'completado').length > 0 && (
                <div className="relative overflow-hidden rounded-corner border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <button
                    onClick={() => setExpanded(prev => ({...prev, activeDuplicates: !prev.activeDuplicates}))}
                    className="w-full relative z-10 p-6 text-left hover:bg-yellow-100/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-600 text-white font-bold">
                          {statistics.activeDuplicates}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-yellow-900">
                            Asignaciones Duplicadas
                          </h3>
                          <p className="text-sm text-yellow-800">
                            Estos usuarios ya tienen asignaciones pendientes en progreso. No se pueden reasignar.
                          </p>
                        </div>
                      </div>
                      <SystemIcons.interface.chevronDown
                        className={cn(
                          'text-yellow-900 transition-transform duration-200',
                          expandedActiveDuplicates && 'rotate-180'
                        )}
                        size="md"
                      />
                    </div>
                  </button>

                  {expandedActiveDuplicates && (
                    <div className="relative z-10 border-t border-yellow-300 p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-yellow-300">
                              <th className="text-left py-3 px-4 font-semibold text-yellow-900">Usuario</th>
                              <th className="text-left py-3 px-4 font-semibold text-yellow-900">Estado</th>
                              <th className="text-left py-3 px-4 font-semibold text-yellow-900">Fecha Asignación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {duplicates
                              .filter(d => d.estado !== 'completado')
                              .map((duplicate) => (
                                <tr key={`active-${duplicate.usuario_id}`} className="border-b border-yellow-200 bg-yellow-50/50">
                                  <td className="py-3 px-4 text-yellow-900 font-medium">{duplicate.usuario_nombre}</td>
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
                      <div className="mt-4 p-3 bg-yellow-50 rounded-corner border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <strong>Bloqueado automáticamente:</strong> Estos usuarios fueron excluidos; ya tienen 
                          esta evidencia asignada en estado activo. No se pueden crear asignaciones duplicadas mientras 
                          no esté completada o cancelada.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Duplicados completados (informativos) - SÍ se pueden reasignar */}
              {duplicates.filter(d => d.estado === 'completado').length > 0 && (
                <div className="relative overflow-hidden rounded-corner border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
                  <button
                    onClick={() => setExpanded(prev => ({...prev, completedDuplicates: !prev.completedDuplicates}))}
                    className="w-full relative z-10 p-6 text-left hover:bg-blue-100/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
                          {statistics.completedDuplicates}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">
                            Evidencias Ya Completadas
                          </h3>
                          <p className="text-sm text-blue-800">
                            Estos usuarios ya completaron estas evidencias. Puede reasignarlas si es necesario.
                          </p>
                        </div>
                      </div>
                      <SystemIcons.interface.chevronDown
                        className={cn(
                          'text-blue-900 transition-transform duration-200',
                          expandedCompletedDuplicates && 'rotate-180'
                        )}
                        size="md"
                      />
                    </div>
                  </button>

{/**Podríamos crear un componente para esta tabla o dejarlo como HTML que es más sencillo,
  * pero no sé si crear un componente que literal solo se va a usar aquí */}
                  {expandedCompletedDuplicates && (
                    <div className="relative z-10 border-t border-blue-300 p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-blue-300">
                              <th className="text-left py-3 px-4 font-semibold text-blue-900">
                                <input
                                  type="checkbox"
                                  checked={duplicates
                                    .filter(d => d.estado === 'completado')
                                    .every(d => !excludedUsersSet.has(d.usuario_id))
                                  }
                                  onChange={(e) => {
                                    const completedUserIds = duplicates
                                      .filter(d => d.estado === 'completado')
                                      .map(d => d.usuario_id);
                                    
                                    const currentExcluded = formData.excludedUsers || [];
                                    
                                    if (e.target.checked) {
                                      // Incluir todos los completados (quitarlos de excludedUsers)
                                      updateFormData({ 
                                        excludedUsers: currentExcluded.filter(id => !completedUserIds.includes(id))
                                      });
                                    } else {
                                      // Excluir todos los completados
                                      const newExcluded = [...currentExcluded];
                                      completedUserIds.forEach(id => {
                                        if (!newExcluded.includes(id)) {
                                          newExcluded.push(id);
                                        }
                                      });
                                      updateFormData({ excludedUsers: newExcluded });
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
                                />
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-blue-900">Usuario</th>
                              <th className="text-left py-3 px-4 font-semibold text-blue-900">Fecha Completado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {duplicates
                              .filter(d => d.estado === 'completado')
                              .map((duplicate) => (
                                <tr key={`completed-${duplicate.usuario_id}`} className="border-b border-blue-200 hover:bg-blue-50">
                                  <td className="py-3 px-4">
                                    <input
                                      type="checkbox"
                                      checked={!excludedUsersSet.has(duplicate.usuario_id)}
                                      onChange={() => handleToggleUser(duplicate.usuario_id)}
                                      className="w-4 h-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="py-3 px-4 text-blue-900 font-medium">{duplicate.usuario_nombre}</td>
                                  <td className="py-3 px-4 text-blue-900">
                                    {new Date(duplicate.fecha_asignacion).toLocaleDateString('es-ES')}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-corner border border-blue-200">
                        <p className="text-xs text-blue-800">
                          <strong>Reasignación permitida:</strong> Estos usuarios ya completaron estas evidencias. 
                          Márquelos si desea reasignarlas para crear una nueva asignación.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Detalles de la Asignación */}
          <div className="space-y-6">
            {/* Evidencias Seleccionadas - Colapsable */}
            <div className="relative overflow-hidden rounded-corner border-2 border-gris-una/30 bg-gradient-to-br from-gris-una/5 to-gris-una/10">
              {/*<div className="absolute top-0 right-0 w-32 h-32 bg-negro-una/20 rounded-full -mr-16 -mt-16 opacity-20"></div>*/}
              <button
                onClick={() => setExpanded(prev => ({...prev, evidences: !prev.evidences}))}
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
                      <div key={evidence?.evidencia_id} className="flex items-start gap-3 bg-white/60 rounded-corner p-3">
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
            <div className="relative overflow-hidden rounded-corner border-2 border-gris-una/30 bg-gradient-to-br from-gris-una/5 to-gris-una/10">
              {/*<div className="absolute top-0 right-0 w-32 h-32 bg-azul-una/20 rounded-full -mr-16 -mt-16 opacity-20"></div>*/}
              <button
                onClick={() => setExpanded(prev => ({...prev, destinators: !prev.destinators}))}
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
                            <div key={user?.id} className="flex items-center gap-3 bg-white/60 rounded-corner p-2.5">
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
                            <div key={role?.id} className="flex items-center gap-3 bg-white/60 rounded-corner p-2.5">
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
            <div className="relative overflow-hidden rounded-corner border-2 border-gris-una/30 bg-gradient-to-br from-gris-una/5 to-gris-una/10">
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
                    <p className="text-sm font-medium text-negro-una bg-white/60 rounded-corner p-3">
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
                      <p className="text-sm text-negro-una bg-white/60 rounded-corner p-3 max-h-32 overflow-y-auto whitespace-pre-wrap break-all overflow-x-hidden">
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