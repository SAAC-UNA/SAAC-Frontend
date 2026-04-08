import {
  formatDate,
  formatDateShort,
  formatDateShortWithTime,
  formatDateLong,
  formatDateFull,
  formatDateWithTime,
  formatDateCompact,
} from './DateUtils';

// Fecha fija para todas las pruebas: martes 1 de abril de 2025, 14:30:00
const ISO_DATE = '2025-04-01T14:30:00';
const INVALID_DATE = 'no-es-fecha';
const PLACEHOLDER = '—';

describe('formatDate', () => {
  it('retorna "—" para valor null', () => {
    expect(formatDate(null)).toBe(PLACEHOLDER);
  });

  it('retorna "—" para valor undefined', () => {
    expect(formatDate(undefined)).toBe(PLACEHOLDER);
  });

  it('retorna "—" para fecha inválida', () => {
    expect(formatDate(INVALID_DATE)).toBe(PLACEHOLDER);
  });

  it('formatea una fecha ISO correctamente en formato numérico', () => {
    const result = formatDate(ISO_DATE);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('acepta un objeto Date', () => {
    const result = formatDate(new Date(ISO_DATE));
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('formatDateShort', () => {
  it('retorna "—" para valor null', () => {
    expect(formatDateShort(null)).toBe(PLACEHOLDER);
  });

  it('retorna "—" para fecha inválida', () => {
    expect(formatDateShort(INVALID_DATE)).toBe(PLACEHOLDER);
  });

  it('formatea sin hora por defecto', () => {
    const result = formatDateShort(ISO_DATE);
    // Debe contener el año y no contener dos puntos (sin hora)
    expect(result).toContain('2025');
    expect(result).not.toMatch(/\d{2}:\d{2}/);
  });

  it('incluye hora cuando includeTime es true', () => {
    const result = formatDateShort(ISO_DATE, true);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatDateShortWithTime', () => {
  it('incluye hora en el resultado', () => {
    const result = formatDateShortWithTime(ISO_DATE);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('retorna "—" para valor null', () => {
    expect(formatDateShortWithTime(null)).toBe(PLACEHOLDER);
  });
});

describe('formatDateLong', () => {
  it('retorna "—" para fecha inválida', () => {
    expect(formatDateLong(INVALID_DATE)).toBe(PLACEHOLDER);
  });

  it('incluye el año con 4 dígitos', () => {
    expect(formatDateLong(ISO_DATE)).toContain('2025');
  });

  it('incluye hora cuando includeTime es true', () => {
    const result = formatDateLong(ISO_DATE, true);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatDateFull', () => {
  it('retorna "—" para fecha inválida', () => {
    expect(formatDateFull(INVALID_DATE)).toBe(PLACEHOLDER);
  });

  it('incluye día de la semana, mes largo, año y hora', () => {
    const result = formatDateFull(ISO_DATE);
    expect(result).toContain('2025');
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});

describe('formatDateWithTime', () => {
  it('retorna "—" para fecha inválida', () => {
    expect(formatDateWithTime(INVALID_DATE)).toBe(PLACEHOLDER);
  });

  it('incluye hora, minutos y segundos', () => {
    const result = formatDateWithTime(ISO_DATE);
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('formatDateCompact', () => {
  it('retorna "—" para fecha inválida', () => {
    expect(formatDateCompact(INVALID_DATE)).toBe(PLACEHOLDER);
  });

  it('no incluye el año', () => {
    const result = formatDateCompact(ISO_DATE);
    expect(result).not.toContain('2025');
  });

  it('incluye el día del mes', () => {
    const result = formatDateCompact(ISO_DATE);
    // La fecha es 1 de abril — puede aparecer como "1" o "01"
    expect(result).toMatch(/1/);
  });
});
