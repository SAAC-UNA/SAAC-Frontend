/**
 * ElementoModal - Modal para configurar un elemento del compromiso (modelo flexible)
 * Permite seleccionar encargados, fecha límite y comentario
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { LoadingSpinner, MultiSelect } from '@/Components/Ui/Index';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { userService, type User } from '@/Services/UserService';
import { roleService, type Role } from '@/Services/RoleService';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import type { ElementoSeleccionado, EncargadoInfo } from '@/Types/ImprovementCommitmentTypes';
import type { MultiSelectOption } from '@/Components/Ui/Forms/MultiSelect';

interface ElementoModalProps {
  isOpen: boolean;
  onClose: () => void;
  elemento: FlexibleElement;
  hijos?: FlexibleElement[];
  configuracionExistente?: ElementoSeleccionado;
  onGuardar: (config: ElementoSeleccionado) => void;
  modoEdicion: boolean;
}

export const ElementoModal: React.FC<ElementoModalProps> = ({
  isOpen,
  onClose,
  elemento,
  hijos = [],
  configuracionExistente,
  onGuardar,
  modoEdicion,
}) => {
  const [catalogState, setCatalogState] = useState<{
    loading: boolean;
    usuarios: User[];
    roles: Role[];
    userCountByRole: Record<number, number>;
  }>({ loading: true, usuarios: [], roles: [], userCountByRole: {} });
  const loading = catalogState.loading;
  const usuarios = catalogState.usuarios;
  const roles = catalogState.roles;
  const userCountByRole = catalogState.userCountByRole;

  const [formState, setFormState] = useState<{
    hijosSeleccionados: number[];
    assignedUsers: number[];
    assignedRoles: number[];
    fechaLimite: string;
    comentario: string;
  }>({
    hijosSeleccionados: configuracionExistente?.hijos_seleccionados || [],
    assignedUsers: configuracionExistente?.encargados_usuarios || [],
    assignedRoles: configuracionExistente?.encargados_roles || [],
    fechaLimite: configuracionExistente?.fecha_limite || '',
    comentario: configuracionExistente?.comentario || '',
  });
  const hijosSeleccionados = formState.hijosSeleccionados;
  const assignedUsers = formState.assignedUsers;
  const assignedRoles = formState.assignedRoles;
  const fechaLimite = formState.fechaLimite;
  const comentario = formState.comentario;

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [elemento.elemento_id]);

  // Reset form when elemento changes
  useEffect(() => {
    setFormState({
      hijosSeleccionados: configuracionExistente?.hijos_seleccionados || [],
      assignedUsers: configuracionExistente?.encargados_usuarios || [],
      assignedRoles: configuracionExistente?.encargados_roles || [],
      fechaLimite: configuracionExistente?.fecha_limite || '',
      comentario: configuracionExistente?.comentario || '',
    });
    setErrors({});
  }, [elemento.elemento_id, configuracionExistente]);

  const loadData = async () => {
    try {
      setCatalogState(prev => ({ ...prev, loading: true }));

      const [usuariosData, rolesData] = await Promise.all([
        userService.listUsers(),
        roleService.listarRoles(),
      ]);

      const transformedUsers: User[] = usuariosData.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status === 'active' ? 'active' : 'inactive',
        role: user.roles?.[0]?.name,
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

      setCatalogState({
        loading: false,
        usuarios: transformedUsers,
        roles: rolesData.data || [],
        userCountByRole: roleCountMap,
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      setCatalogState(prev => ({ ...prev, loading: false }));
    }
  };

  const usuarioOptions = useMemo((): MultiSelectOption[] => {
    return usuarios
      .filter(u => u.status === 'active')
      .map(u => ({
        value: u.id.toString(),
        label: `${u.name} (${u.email})`,
      }));
  }, [usuarios]);

  const roleOptions = useMemo((): MultiSelectOption[] => {
    return roles.map(role => ({
      value: role.id.toString(),
      label: role.name,
      metadata: `${userCountByRole[role.id] || 0} ${(userCountByRole[role.id] || 0) === 1 ? 'usuario' : 'usuarios'}`,
    }));
  }, [roles, userCountByRole]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (hijos.length > 0 && hijosSeleccionados.length === 0) {
      newErrors.hijos = 'Debe seleccionar al menos una fuente';
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
    if (!validate()) return;

    const config: ElementoSeleccionado = {
      elemento_id: elemento.elemento_id,
      elemento,
      hijos_seleccionados: hijos.length > 0 ? hijosSeleccionados : undefined,
      encargados_usuarios: assignedUsers,
      encargados_roles: assignedRoles,
      encargados_usuarios_info: assignedUsers
        .map(id => { const u = usuarios.find(u => u.id === id); return u ? { id: u.id, name: u.name } : null; })
        .filter((x): x is EncargadoInfo => x !== null),
      encargados_roles_info: assignedRoles
        .map(id => { const r = roles.find(r => r.id === id); return r ? { id: r.id, name: r.name } : null; })
        .filter((x): x is EncargadoInfo => x !== null),
      fecha_limite: fechaLimite || undefined,
      comentario: comentario || undefined,
    };

    onGuardar(config);
  };

  const allHijosSelected = hijos.length > 0 && hijosSeleccionados.length === hijos.length;

  const elementoTitle = elemento.nombre
    ? `${elemento.tipo}: ${elemento.nombre}`
    : elemento.nomenclatura
    ? `${elemento.tipo} ${elemento.nomenclatura}`
    : elemento.tipo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modoEdicion ? `Editar Elemento: ${elementoTitle}` : `Configurar Elemento: ${elementoTitle}`}
      size="lg"
      variant={modoEdicion ? 'warning' : 'info'}
      heroIcon={
        modoEdicion
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
          {/* Descripción del elemento */}
          {elemento.descripcion && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gris-una">{elemento.descripcion}</p>
            </div>
          )}

          {/* Fuentes a incluir */}
          {hijos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="block text-sm font-medium text-negro-una">
                  Fuentes a incluir <span className="text-red-500">*</span>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFormState(prev => ({
                      ...prev,
                      hijosSeleccionados: allHijosSelected ? [] : hijos.map(h => h.elemento_id),
                    }))
                  }
                  className="text-xs text-rojo-una-2 hover:underline flex items-center gap-1"
                >
                  <SystemIcons.interface.checkCircle size="xs" />
                  {allHijosSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>
              <MultiSelect
                label=""
                options={hijos.map(h => ({
                  value: h.elemento_id.toString(),
                  label: h.nomenclatura ? `${h.nomenclatura} - ${h.nombre ?? h.tipo}` : (h.nombre ?? h.tipo),
                }))}
                value={hijosSeleccionados.map(id => id.toString())}
                onChange={(values) =>
                  setFormState(prev => ({ ...prev, hijosSeleccionados: values.map(v => parseInt(v)) }))
                }
                placeholder="Seleccione fuentes..."
                required
                showSelectAll={false}
              />
              {errors.hijos && (
                <p className="mt-1 text-sm text-red-600">{errors.hijos}</p>
              )}
              <p className="mt-1 text-xs text-gris-una">
                {hijosSeleccionados.length} de {hijos.length} fuentes seleccionadas
              </p>
            </div>
          )}

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
                  onChange={(values) =>
                    setFormState(prev => ({ ...prev, assignedUsers: values.map(v => Number(v)) }))
                  }
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
                  onChange={(values) =>
                    setFormState(prev => ({ ...prev, assignedRoles: values.map(v => Number(v)) }))
                  }
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
              onChange={(val) => setFormState(prev => ({ ...prev, fechaLimite: val }))}
              placeholder="Seleccione una fecha límite..."
              minDate={new Date().toISOString().split('T')[0]}
              required
              error={errors.fechaLimite}
              helperText={!fechaLimite ? 'Fecha límite para completar este elemento' : undefined}
            />
          </div>

          {/* Comentario */}
          <div>
            <Textarea
              label="Comentario"
              value={comentario}
              onChange={(e) => setFormState(prev => ({ ...prev, comentario: e.target.value }))}
              placeholder="Instrucciones especiales o notas sobre este elemento..."
              rows={4}
              maxLength={500}
              characterCount={true}
              error={errors.comentario}
              helperText="Comentario opcional sobre este elemento"
            />
          </div>
        </div>
      )}
    </Modal>
  );
};
