import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';

/**
 * Trunca un texto si supera el límite dado.
 * Utilizar con las constantes de TABLE_TRUNCATE para mantener consistencia.
 *
 * @example
 *   truncateText(value, TABLE_TRUNCATE.name)
 *   truncateText(value, TABLE_TRUNCATE.email)
 */
export const truncateText = (
    text: string | null | undefined,
    maxLength: number = TABLE_TRUNCATE.name
): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};
