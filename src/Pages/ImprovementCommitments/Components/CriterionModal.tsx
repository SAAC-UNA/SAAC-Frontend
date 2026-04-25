/**
 * CriterionModal - Modal para configurar un criterio del compromiso
 * Permite seleccionar evidencias, encargados, fecha límite y comentario
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { LoadingSpinner, MultiSelect } from '@/Components/Ui/Index';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import { userService, type User } from '@/Services/UserService';
import { roleService, type Role } from '@/Services/RoleService';
import type { Criterio, Evidencia, CriterioSeleccionado, EncargadoInfo } from '@/Types/ImprovementCommitmentTypes';
import type { MultiSelectOption } from '@/Components/Ui/Forms/MultiSelect';

interface CriterionModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterio: Criterio;
  configuracionExistente?: CriterioSeleccionado;
  onGuardar: (config: CriterioSeleccionado) => void;
  modoEdicion: boolean;
}

export const CriterionModal: React.FC<CriterionModalProps> = ({
  isOpen,
  onClose,
  criterio,
  configuracionExistente,
  onGuardar,
  modoEdicion
}) => {
  const [catalogState, setCatalogState] = useState<{
    loading: boolean;
    evidencias: Evidencia[];
    usuarios: User[];
    roles: Role[];
    userCountByRole: Record<number, number>;
  }>({ loading: true, evidencias: [], usuarios: [], roles: [], userCountByRole: {} });
  const loading = catalogState.loading;
  const evidencias = catalogState.evidencias;
  const usuarios = catalogState.usuarios;
  const roles = catalogState.roles;
  const userCountByRole = catalogState.userCountByRole;
  
  // Form state
  const [formState, setFormState] = useState<{
    selectedEvidences: number[];
    assignedUsers: number[];
    assignedRoles: number[];
    fechaLimite: string;
    comentario: string;
  }>({
    selectedEvidences: configuracionExistente?.evidencias_seleccionadas || [],
    assignedUsers: configuracionExistente?.encargados_usuarios || [],
    assignedRoles: configuracionExistente?.encargados_roles || [],
    fechaLimite: configuracionExistente?.fecha_limite || '',
    comentario: configuracionExistente?.comentario || ''
  });
  const selectedEvidences = formState.selectedEvidences;
  const assignedUsers = formState.assignedUsers;
  const assignedRoles = formState.assignedRoles;
  const fechaLimite = formState.fechaLimite;
  const comentario = formState.comentario;

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [criterio.criterio_id]);

  const loadData = async () => {
    try {
      setCatalogState(prev => ({...prev, loading: true}));

      if (!criterio?.criterio_id) {
        setCatalogState(prev => ({...prev, evidencias: [], loading: false}));
        return;
      }

      const [evidenciasData, usuariosData, rolesData] = await Promise.all([
        improvementCommitmentService.obtenerEvidenciasPorCriterio(criterio.criterio_id),
        userService.listUsers(),
        roleService.listarRoles()
      ]);

      setCatalogState(prev => ({...prev, evidencias: evidenciasData}));
      
      const transformedUsers: User[] = usuariosData.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status === 'active' ? 'active' : 'inactive',
        role: user.roles?.[0]?.name
      }));

      const roleCountMap: Record<number, number> = {};
      usuariosData.forEach(user => {
        if (user.roles && user.roles.length > 0) {
          user.roles.forEach(role => {
            if (role.id) {
              roleCountMap[role.id] = (roleCountMap[role.id] || 0) + 1;
            }
          });
        }
      });

      setCatalogState(prev => ({
        ...prev,
        usuarios: transformedUsers,
        roles: rolesData.data || [],
        userCountByRole: roleCountMap
      }));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCatalogState(prev => ({...prev, loading: false}));
    }
  };

  // Opciones para MultiSelect de evidencias
  const evidenciaOptions = useMemo((): MultiSelectOption[] => {
    return evidencias.map(e => ({
      value: e.evidencia_id.toString(),
      label: `${e.nomenclatura} - ${e.descripcion}`,
      disabled: false
    }));
  }, [evidencias]);

  // Opciones para MultiSelect de usuarios
  const usuarioOptions = useMemo(() => {
    return usuarios
      .filter(u => u.status === 'active')
      .map(u => ({
        id: u.id,
        label: `${u.name} (${u.email})`,
        value: u.id.toString()
      }));
  }, [usuarios]);

  const roleOptions = useMemo(() => {
    return roles.map(role => ({
      id: role.id,
      label: role.name,
      value: role.id.toString(),
      metadata: `${userCountByRole[role.id] || 0} ${(userCountByRole[role.id] || 0) === 1 ? 'usuario' : 'usuarios'}`
    }));
  }, [roles, userCountByRole]);

  const handleSelectAllEvidences = () => {
    if (selectedEvidences.length === evidencias.length) {
      setFormState(prev => ({...prev, selectedEvidences: []}));
    } else {
      setFormState(prev => ({...prev, selectedEvidences: evidencias.map(e => e.evidencia_id)}));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedEvidences.length === 0) {
      newErrors.evidencias = 'Debe seleccionar al menos una evidencia';
    }

    if (assignedUsers.length === 0 && assignedRoles.length === 0) {
      newErrors.encargados = 'Debe seleccionar al menos un usuario o un rol';
    }

    if (!fechaLimite) {
      newErrors.fechaLimite = 'La fecha límite es obligatoria';
    }

    if (comentario && comentario.length > 500) {
      newErrors.comentario = 'El comentario no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = () => {
    if (!validate()) {
      return;
    }

    const config: CriterioSeleccionado = {
      criterio_id: criterio.criterio_id,
      criterio: criterio,
      evidencias_seleccionadas: selectedEvidences,
      encargados_usuarios: assignedUsers,
      encargados_roles: assignedRoles,
      encargados_usuarios_info: assignedUsers
        .map(id => { const u = usuarios.find(u => u.id === id); return u ? { id: u.id, name: u.name } : null; })
        .filter((x): x is EncargadoInfo => x !== null),
      encargados_roles_info: assignedRoles
        .map(id => { const r = roles.find(r => r.id === id); return r ? { id: r.id, name: r.name } : null; })
        .filter((x): x is EncargadoInfo => x !== null),
      fecha_limite: fechaLimite || undefined,
      comentario: comentario || undefined
    };

    console.log('Config a guardar:', config);
    console.log('Criterio verificación final:', criterio);
    onGuardar(config);
  };

  const allSelected = selectedEvidences.length === evidencias.length && evidencias.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modoEdicion ? `Editar Criterio: ${criterio.nomenclatura}` : `Configurar Criterio: ${criterio.nomenclatura}`}
      subtitle={criterio.descripcion || undefined}
      size="lg"
      variant={modoEdicion ? 'warning' : 'info'}
      heroIcon={modoEdicion
        ? <SystemIcons.actions.edit className={`${ICON_SIZES.md} text-blanco-una`} />
        : <SystemIcons.actions.add className={`${ICON_SIZES.md} text-blanco-una`} />
      }
      showConfirm
      confirmLabel={modoEdicion ? 'Actualizar' : 'Agregar'}
      onConfirm={handleGuardar}
      showCancel
      cancelLabel="Cancelar"
    >
      {loading ? (
        <div className="relative py-12 min-h-[300px]">
          <LoadingSpinner variant="loader" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selección de Evidencias */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="block text-sm font-medium text-negro-una">
                Evidencias a incluir <span className="text-red-500">*</span>
              </p>
              <button
                type="button"
                onClick={handleSelectAllEvidences}
                className="text-xs text-rojo-una-2 hover:underline flex items-center gap-1"
              >
                <SystemIcons.interface.checkCircle size="xs" />
                {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            
            <MultiSelect
              label=""
              options={evidenciaOptions}
              value={selectedEvidences.map(id => id.toString())}
              onChange={(values) => setFormState(prev => ({...prev, selectedEvidences: values.map(v => parseInt(v))}))}
              placeholder="Seleccione evidencias..."
              required
              showSelectAll={false}
            />
            
            {errors.evidencias && (
              <p className="mt-1 text-sm text-red-600">{errors.evidencias}</p>
            )}
            
            <p className="mt-1 text-xs text-gris-una">
              {selectedEvidences.length} de {evidencias.length} evidencias seleccionadas
            </p>
          </div>

          {/* Encargados */}
          <div>
            <p className="block text-sm font-medium text-negro-una mb-2">
              Encargados <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <MultiSelect
                  label="Usuarios"
                  options={usuarioOptions}
                  value={assignedUsers.map(id => id.toString())}
                  onChange={(values) => setFormState(prev => ({ ...prev, assignedUsers: values.map(v => Number(v)) }))}
                  placeholder="Seleccione usuarios..."
                  selectAllText="Seleccionar todos"
                  deselectAllText="Deseleccionar todos"
                  showSelectAll={true}
                />
                <p className="mt-1 text-xs text-gris-una">
                  {assignedUsers.length} usuario(s) seleccionado(s)
                </p>
              </div>

              <div>
                <MultiSelect
                  label="Roles"
                  options={roleOptions}
                  value={assignedRoles.map(id => id.toString())}
                  onChange={(values) => setFormState(prev => ({ ...prev, assignedRoles: values.map(v => Number(v)) }))}
                  placeholder="Seleccione roles..."
                  selectAllText="Seleccionar todos"
                  deselectAllText="Deseleccionar todos"
                  showSelectAll={true}
                />
                <p className="mt-1 text-xs text-gris-una">
                  {assignedRoles.length} rol(es) seleccionado(s)
                </p>
              </div>
            </div>

            {errors.encargados && (
              <p className="mt-1 text-sm text-red-600">{errors.encargados}</p>
            )}
          </div>

          {/* Fecha Límite */}
          <div>
            <DatePicker
              label="Fecha Límite"
              value={fechaLimite}
              onChange={(val) => setFormState(prev => ({...prev, fechaLimite: val}))}
              placeholder="Seleccione una fecha límite..."
              minDate={new Date().toISOString().split('T')[0]}
              required
              error={errors.fechaLimite}
              helperText={!fechaLimite ? "Fecha límite para completar este criterio" : undefined}
            />
          </div>

          {/* Comentario */}
          <div>
            <Textarea
              label="Comentario"
              value={comentario}
              onChange={(e) => setFormState(prev => ({...prev, comentario: e.target.value}))}
              placeholder="Instrucciones especiales o notas sobre este criterio..."
              rows={4}
              maxLength={500}
              characterCount={true}
              error={errors.comentario}
              helperText="Comentario opcional sobre este criterio"
            />
          </div>

        </div>
      )}
    </Modal>
  );
};
