import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './UseDebounce';

// Usamos fake timers para controlar el tiempo sin esperar de verdad
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useDebounce', () => {
  it('retorna el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('inicial', 300));
    expect(result.current).toBe('inicial');
  });

  it('no actualiza el valor antes de que expire el delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'inicial', delay: 300 } },
    );

    rerender({ value: 'nuevo', delay: 300 });
    act(() => jest.advanceTimersByTime(200));

    expect(result.current).toBe('inicial');
  });

  it('actualiza el valor después de que expire el delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'inicial', delay: 300 } },
    );

    rerender({ value: 'nuevo', delay: 300 });
    act(() => jest.advanceTimersByTime(300));

    expect(result.current).toBe('nuevo');
  });

  it('reinicia el temporizador en cada cambio de valor', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    act(() => jest.advanceTimersByTime(200));

    rerender({ value: 'c' });
    act(() => jest.advanceTimersByTime(200));

    // Después de 400ms totales, ninguno debería haberse actualizado todavía
    expect(result.current).toBe('a');

    // Avanzamos los 100ms restantes del último cambio
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });

  it('usa delay de 300ms por defecto', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'inicial' } },
    );

    rerender({ value: 'actualizado' });
    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('inicial');

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('actualizado');
  });

  it('funciona con tipos distintos (número)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe(42);
  });
});
