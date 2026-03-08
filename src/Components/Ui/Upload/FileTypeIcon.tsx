/**
 * FileTypeIcon - Ícono de tipo de archivo basado en su extensión
 * Componente compartido entre FileList y FileUploadProgress
 */

import React from 'react';
import { getFileCategory } from '@/Types/FileTypes';
import type { FileCategory } from '@/Types/FileTypes';

interface FileTypeIconProps {
  /** Nombre del archivo (se usa la extensión para determinar el tipo) */
  filename: string;
  /** Fuerza tratarlo como enlace/URL en lugar de deducirlo por extensión */
  isLink?: boolean;
  className?: string;
}

const ICON_PATHS: Record<FileCategory, React.ReactNode> = {
  document: (
    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  ),
  spreadsheet: (
    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v4H6V4zm0 6h3v6H6v-6zm5 0h3v6h-3v-6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  presentation: (
    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
        clipRule="evenodd"
      />
    </svg>
  ),
  image: (
    <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  video: (
    <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  ),
  archive: (
    <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
      <path
        fillRule="evenodd"
        d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  link: (
    <svg className="w-8 h-8 text-azul-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  ),
  other: (
    <svg className="w-8 h-8 text-gris-una" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ filename, isLink = false, className }) => {
  const category: FileCategory = isLink ? 'link' : getFileCategory(filename);
  const icon = ICON_PATHS[category] ?? ICON_PATHS.other;

  if (!className) return <>{icon}</>;

  // Si se pasa una className personalizada, clonar el elemento sobreescribiendo la clase SVG
  const element = icon as React.ReactElement<{ className?: string }>;
  return React.cloneElement(element, {
    className: `${className} ${element.props.className ?? ''}`.trim(),
  });
};
