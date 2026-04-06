/**
 * StructureModelFormModal - Modal para crear o editar un modelo de acreditación flexible.
 *
 * Flujo: EntityFormModal → CreateConfirmationModal / EditConfirmationModal → SuccessModal
 */

import React, { useState, useEffect } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { Button } from '@/Components/Ui/Buttons/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { useToast } from '@/Context/ToastContext';
import type { StructureModel, CreateModelForm, EditModelForm, TipoJerarquia } from '@/Types/StructureModelTypes';

interface JerarquiaRow extends TipoJerarquia {
  acepta_archivos: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  model?: StructureModel | null;
  onConfirm: (form: CreateModelForm | EditModelForm) => Promise<{ success: boolean; error?: string }>;
}

interface FormData {
  nombre: string;
  descripcion: string;
  version: string;
  tipos_jerarquia: JerarquiaRow[];
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  version?: string;
}

const EMPTY: FormData = { nombre: '', descripcion: '', version: '', tipos_jerarquia: [{ tipo: '', padre_tipo: null, acepta_archivos: false }] };

export const StructureModelFormModal: React.FC<Props> = ({ isOpen, onClose, model, onConfirm }) => {
  const isEditing = !!model;
  const { showToast } = useToast();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: '' });

  useEffect(() => {
    if (isOpen) {
      setForm(
        model
          ? {
              nombre: model.nombre,
              descripcion: model.descripcion ?? '',
              version: model.version ?? '',
              tipos_jerarquia: (model.tipos_jerarquia ?? []).map(t => ({ ...t, acepta_archivos: false })),
            }
          : EMPTY
      );
      setErrors({});
      setConfirmOpen(false);
    }
  }, [isOpen, model]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) {
      next.nombre = 'El nombre es obligatorio.';
    } else if (form.nombre.trim().length > 100) {
      next.nombre = 'Máximo 100 caracteres.';
    }
    if (form.descripcion.length > 500) {
      next.descripcion = 'Máximo 500 caracteres.';
    }
    if (form.version.length > 20) {
      next.version = 'Máximo 20 caracteres.';
    }
    if (!isEditing) {
      if (form.tipos_jerarquia.some(r => !r.tipo.trim())) {
        showToast({ type: 'error', title: 'Cada nivel de jerarquía debe tener un nombre.' });
        setErrors(next);
        return false;
      }
      const names = form.tipos_jerarquia.map(r => r.tipo.trim().toLowerCase());
      if (new Set(names).size !== names.length) {
        showToast({ type: 'error', title: 'Los nombres de los tipos de jerarquía deben ser únicos.' });
        setErrors(next);
        return false;
      }
      if (!form.tipos_jerarquia.some(r => r.acepta_archivos)) {
        showToast({ type: 'error', title: 'Debe marcar qué tipo de elemento recibirá los archivos.' });
        setErrors(next);
        return false;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitRequest = () => {
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setOpLoading(true);
    const payload: CreateModelForm | EditModelForm = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      version: form.version.trim() || undefined,
      tipos_jerarquia: form.tipos_jerarquia.length > 0 ? form.tipos_jerarquia.map(({ acepta_archivos: _, ...r }) => r) : undefined,
      tipos_asignables: (() => {
        const list = form.tipos_jerarquia.filter(r => r.acepta_archivos && r.tipo.trim()).map(r => r.tipo.trim());
        return list.length > 0 ? list : undefined;
      })(),
    };
    const result = await onConfirm(payload);
    setOpLoading(false);
    setConfirmOpen(false);
    if (result.success) {
      setSuccess({ isOpen: true, name: form.nombre.trim() });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al guardar el modelo' });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ isOpen: false, name: '' });
    onClose();
  };

  return (
    <>
      <EntityFormModal
        isOpen={isOpen && !confirmOpen && !success.isOpen}
        onClose={onClose}
        onConfirm={handleSubmitRequest}
        title={isEditing ? 'Editar Modelo' : 'Crear Modelo de Acreditación'}
        subtitle={isEditing ? model?.nombre : undefined}
        confirmLabel={isEditing ? 'Guardar' : 'Crear modelo'}
        isEditing={isEditing}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre del modelo"
            required
            value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            error={errors.nombre}
            maxLength={100}
            characterCount
            placeholder="Ej: Modelo SINAES 2026"
          />
          <Input
            label="Versión"
            value={form.version}
            onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
            error={errors.version}
            maxLength={20}
            placeholder="Ej: 2026, 1.0"
          />
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            error={errors.descripcion}
            maxLength={500}
            characterCount
            rows={3}
          />

          {/* ── Jerarquía de tipos (solo creación) ────────────────── */}
          {!isEditing && (
            <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-negro-una">
                  Jerarquía de tipos de elemento
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
                onClick={() =>
                  setForm(p => ({
                    ...p,
                    tipos_jerarquia: [...p.tipos_jerarquia, { tipo: '', padre_tipo: null, acepta_archivos: false }],
                  }))
                }
              >
                Agregar nivel
              </Button>
            </div>
            <p className="text-xs text-gris-una mb-2">
              Marque el tipo que recibirá los archivos.
            </p>

            <div className="flex flex-col gap-3">
              {form.tipos_jerarquia.map((row, idx) => {
                const otherTipos = form.tipos_jerarquia
                  .filter((_, i) => i !== idx)
                  .map(r => r.tipo)
                  .filter(t => t.trim() !== '');

                const parentOptions = [
                  { value: '', label: 'Sin padre (nivel raíz)' },
                  ...otherTipos.map(t => ({ value: t, label: t })),
                ];

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <label
                      title="Este tipo recibirá archivos"
                      className="flex items-center cursor-pointer select-none shrink-0"
                    >
                      <input
                        type="checkbox"
                        checked={row.acepta_archivos}
                        onChange={e => {
                          const val = e.target.checked;
                          setForm(p => ({
                            ...p,
                            // Radio-like: desmarcar los demás al marcar uno
                            tipos_jerarquia: p.tipos_jerarquia.map((r, i) =>
                              i === idx ? { ...r, acepta_archivos: val } : { ...r, acepta_archivos: false }
                            ),
                          }));
                        }}
                        className="w-4 h-4 cursor-pointer accent-dorado-una"
                      />
                    </label>
                    <div className="flex-1">
                      <Input
                        label="Nombre del tipo"
                        value={row.tipo}
                        maxLength={50}
                        placeholder="Ej: pauta"
                        onChange={e => {
                          const val = e.target.value;
                          setForm(p => ({
                            ...p,
                            tipos_jerarquia: p.tipos_jerarquia.map((r, i) =>
                              i === idx ? { ...r, tipo: val } : r
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="w-[40%]">
                      <CustomSelect
                        label="Depende de (tipo padre)"
                        value={row.padre_tipo ?? ''}
                        options={parentOptions}
                        onChange={val => {
                          setForm(p => ({
                            ...p,
                            tipos_jerarquia: p.tipos_jerarquia.map((r, i) =>
                              i === idx ? { ...r, padre_tipo: val || null } : r
                            ),
                          }));
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      title="Quitar"
                      onClick={() =>
                        setForm(p => ({
                          ...p,
                          tipos_jerarquia: p.tipos_jerarquia.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-gris-una transition-colors"
                    >
                      <SystemIcons.interface.xCircle size="md" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </EntityFormModal>

      {isEditing ? (
        <EditConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.nombre}
          itemType="modelo"
          isLoading={opLoading}
        />
      ) : (
        <CreateConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.nombre}
          itemType="modelo"
          isLoading={opLoading}
        />
      )}

      <SuccessModal
        isOpen={success.isOpen}
        title={isEditing ? 'Modelo actualizado' : 'Modelo creado'}
        message={
          isEditing
            ? `El modelo "${success.name}" fue actualizado exitosamente.`
            : `El modelo "${success.name}" fue creado exitosamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
