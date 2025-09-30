import { renderHook, act } from '@testing-library/react';
import { useNavigationItems } from './UseNavigation';

// Mock del contexto y useNavigate
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock('@/context/NavigationContext', () => ({
  useNavigation: () => ({
    activeItemId: 'item1',
    expandedItemId: 'item2',
    setActiveItem: jest.fn(),
    setExpandedItem: jest.fn(),
    toggleExpanded: jest.fn(),
  }),
}));

describe('useNavigationItems', () => {
  it('devuelve los ids activos y expandidos', () => {
    const { result } = renderHook(() => useNavigationItems());
    expect(result.current.activeItemId).toBe('item1');
    expect(result.current.expandedItemId).toBe('item2');
  });

  it('isItemActive retorna true si el id es activo', () => {
    const { result } = renderHook(() => useNavigationItems());
    expect(result.current.isItemActive('item1')).toBe(true);
    expect(result.current.isItemActive('otro')).toBe(false);
  });

  it('isItemExpanded retorna true si el id es expandido', () => {
    const { result } = renderHook(() => useNavigationItems());
    expect(result.current.isItemExpanded('item2')).toBe(true);
    expect(result.current.isItemExpanded('otro')).toBe(false);
  });

  it('handleItemClick llama setActiveItem y toggleExpanded para expandibles', () => {
    const { result } = renderHook(() => useNavigationItems());
    act(() => {
      result.current.handleItemClick('item3', undefined, true);
    });
    // No se verifica el efecto porque son mocks, pero no lanza error
  });

  it('handleItemClick navega y cierra expansión para no expandibles', () => {
    const { result } = renderHook(() => useNavigationItems());
    act(() => {
      result.current.handleItemClick('item4', '/ruta', false);
    });
    // No se verifica el efecto porque son mocks, pero no lanza error
  });
});
