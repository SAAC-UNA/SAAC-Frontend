/**
 * NotificationCard - Tarjeta de notificación individual
 * HU-018 - Notificaciones automáticas
 * 
 * Muestra una notificación con:
 * - Icono según tipo
 * - Color según criticidad
 * - Botones de acción (marcar leída, eliminar)
 * - Enlace al recurso relacionado
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { Notification } from '@/Types/NotificationTypes';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Marcar como leída si no lo está
    if (!notification.leida && onMarkAsRead) {
      onMarkAsRead(notification.notificacion_id);
    }

    // Navegar al enlace si existe
    if (notification.enlace) {
      navigate(notification.enlace);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.notificacion_id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.notificacion_id);
    }
  };

  const getIconComponent = () => {
    switch (notification.icono) {
      case 'assignment':
        return SystemIcons.modal.document;
      case 'upload':
        return SystemIcons.interface.upload;
      case 'alarm':
      case 'schedule':
        return SystemIcons.interface.clock;
      case 'undo':
      case 'reply':
        return SystemIcons.interface.refresh;
      case 'check_circle':
        return SystemIcons.interface.checkCircle;
      case 'cancel':
        return SystemIcons.interface.xCircle;
      case 'comment':
        return SystemIcons.interface.informationCircle;
      case 'notifications':
      default:
        return SystemIcons.interface.bell;
    }
  };

  // Clases de color según el tipo (borde de color, fondo neutro)
  const borderColorClasses = {
    blue: 'border-blue-300 ring-blue-200/40',
    green: 'border-green-300 ring-green-200/40',
    red: 'border-red-300 ring-red-200/40',
    orange: 'border-orange-300 ring-orange-200/40',
    purple: 'border-purple-300 ring-purple-200/40',
    teal: 'border-teal-300 ring-teal-200/40',
    gray: 'border-gray-300 ring-gray-200/40',
  };

  const bgClass = 'bg-gray-50 hover:bg-gray-100';

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    teal: 'text-teal-600',
    gray: 'text-gray-600',
  };

  const iconColor = iconColorClasses[notification.color as keyof typeof iconColorClasses] || iconColorClasses.gray;

  // Timestamp relativo
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es,
  });

  const IconComponent = getIconComponent();
  const isCritical = notification.es_critica;
  const borderClass = isCritical
    ? 'border-red-400 ring-red-200/50'
    : borderColorClasses[notification.color as keyof typeof borderColorClasses] || borderColorClasses.gray;

  return (
    <div
      className={`
        border-2 rounded-lg transition-all duration-200 ring-1
        ${bgClass}
        ${borderClass}
        ${notification.enlace ? 'cursor-pointer' : ''}
        ${!notification.leida ? 'shadow-md' : 'opacity-75'}
        ${compact ? 'p-2.5' : 'p-3'}
      `}
      onClick={handleClick}
      role={notification.enlace ? 'button' : 'article'}
      tabIndex={notification.enlace ? 0 : undefined}
    >
      <div className="flex gap-3">
        {/* Icono */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <IconComponent className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Header: Título + Badge crítico */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-semibold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>
              {notification.titulo}
            </h4>
            {notification.es_critica && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                Crítico
              </span>
            )}
          </div>

          {/* Mensaje */}
          <p className={`text-gray-700 ${compact ? 'text-[11px] line-clamp-2' : 'text-xs'} mb-1.5`}>
            {notification.mensaje}
          </p>

          {/* Footer: Tiempo + Acciones */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-500">{timeAgo}</span>

            {notification.enlace && (
              <span className="text-xs text-azul-una font-medium">
                Ver detalle
              </span>
            )}

            {/* Botones de acción */}
            {!compact && (
              <div className="flex items-center gap-2">
                {!notification.leida && onMarkAsRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    aria-label="Marcar como leída"
                  >
                    Marcar leída
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                    aria-label="Eliminar notificación"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Indicador de no leída (compacto) */}
          {compact && !notification.leida && (
            <div className="mt-2">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
