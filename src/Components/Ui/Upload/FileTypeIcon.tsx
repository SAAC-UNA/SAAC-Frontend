/**
 * FileTypeIcon - Ícono de tipo de archivo basado en su extensión
 * Componente compartido entre FileList y FileUploadProgress
 */

import React from 'react';
import { getFileCategory } from '@/Types/FileTypes';
import type { FileCategory } from '@/Types/FileTypes';
import { SystemIcons, type IconProps } from '@/Components/Ui/Icons/SystemIcons';

interface FileTypeIconProps {
  /** Nombre del archivo (se usa la extensión para determinar el tipo) */
  filename: string;
  /** Fuerza tratarlo como enlace/URL en lugar de deducirlo por extensión */
  isLink?: boolean;
  /** Tamaño del ícono — mismas opciones que IconProps['size'] (por defecto 'lg') */
  size?: IconProps['size'];
  className?: string;
}

const ICON_MAP: Record<FileCategory, (props: IconProps) => React.ReactElement> = {
  document:     SystemIcons.fileTypes.document,
  spreadsheet:  SystemIcons.fileTypes.spreadsheet,
  presentation: SystemIcons.fileTypes.presentation,
  image:        SystemIcons.fileTypes.image,
  video:        SystemIcons.fileTypes.video,
  archive:      SystemIcons.fileTypes.archive,
  link:         SystemIcons.fileTypes.link,
  other:        SystemIcons.fileTypes.other,
};

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ filename, isLink = false, size = 'lg', className }) => {
  const category: FileCategory = isLink ? 'link' : getFileCategory(filename);
  const renderIcon = ICON_MAP[category] ?? ICON_MAP.other;
  return renderIcon({ size, className });
};
