import { cn } from './ClassNames';

describe('cn', () => {
  it('une clases simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('omite valores falsy', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('elimina duplicados y combina tailwind', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4'); // tailwind-merge prioriza la última
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('acepta objetos y arrays', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c');
  });

  it('retorna string vacío si no hay clases', () => {
    expect(cn()).toBe('');
  });
});
