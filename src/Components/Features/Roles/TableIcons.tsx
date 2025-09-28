/**
 * TableIcons - Íconos específicos para acciones de tabla
 * 
 * SVGs inline con control total de colores usando currentColor.
 * Separado del componente principal para mantener limpieza.
 */

interface IconProps {
  className?: string;
}

export const TableIcons = {
  view: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
      <path fillRule="evenodd" d="M12 5.5c-2.618 0-4.972 1.051-6.668 2.353-.85.652-1.547 1.376-2.036 2.08-.48.692-.796 1.418-.796 2.067 0 .649.317 1.375.796 2.066.49.705 1.186 1.429 2.036 2.08C7.028 17.45 9.382 18.5 12 18.5c2.618 0 4.972-1.051 6.668-2.353.85-.652 1.547-1.376 2.035-2.08.48-.692.797-1.418.797-2.067 0-.649-.317-1.375-.797-2.066-.488-.705-1.185-1.429-2.035-2.08C16.972 6.55 14.618 5.5 12 5.5ZM8.25 12a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" clipRule="evenodd" />
    </svg>
  ),

  edit: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.607 3.5a.5.5 0 0 1 .353.146l2.829 2.829a.5.5 0 0 1 0 .707l-9.193 9.192a.5.5 0 0 1-.227.13l-3.828 1a.5.5 0 0 1-.61-.61l1-3.828a.5.5 0 0 1 .13-.227l9.192-9.193a.5.5 0 0 1 .354-.146Z" />
      <path d="M4 19.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5H4Z" />
    </svg>
  ),

  delete: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.25 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.75H19a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5h4.25V3Z" />
      <path fillRule="evenodd" d="M6.24 7.945a.5.5 0 0 1 .497-.445h10.526a.5.5 0 0 1 .497.445l.2 1.801a44.213 44.213 0 0 1 0 9.771l-.02.177a2.603 2.603 0 0 1-2.226 2.29 26.788 26.788 0 0 1-7.428 0 2.603 2.603 0 0 1-2.227-2.29l-.02-.177a44.239 44.239 0 0 1 0-9.77l.2-1.802Zm4.51 3.455a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Zm4 0a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Z" clipRule="evenodd" />
    </svg>
  ),

  add: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  )
};