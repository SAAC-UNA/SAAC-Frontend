import { truncateText } from './TextUtils';

describe('truncateText', () => {
  it('retorna string vacío para null', () => {
    expect(truncateText(null)).toBe('');
  });

  it('retorna string vacío para undefined', () => {
    expect(truncateText(undefined)).toBe('');
  });

  it('retorna string vacío para string vacío', () => {
    expect(truncateText('')).toBe('');
  });

  it('no trunca cuando el texto tiene exactamente el maxLength', () => {
    const text = 'a'.repeat(20);
    expect(truncateText(text, 20)).toBe(text);
  });

  it('no trunca cuando el texto es más corto que maxLength', () => {
    expect(truncateText('Hola', 20)).toBe('Hola');
  });

  it('trunca y agrega "..." cuando el texto supera el maxLength', () => {
    const result = truncateText('Administrador General', 20);
    expect(result).toHaveLength(23); // 20 chars + '...'
    expect(result).toMatch(/\.\.\.$/)
  });

  it('usa maxLength de 20 por defecto (TABLE_TRUNCATE.name)', () => {
    const texto = 'a'.repeat(25);
    const result = truncateText(texto);
    expect(result).toMatch(/\.\.\.$$/);
    expect(result.length).toBeLessThanOrEqual(23);
  });

  it('trunca usando maxLength personalizado', () => {
    const result = truncateText('texto largo de prueba', 5);
    expect(result).toBe('texto...');
  });
});
