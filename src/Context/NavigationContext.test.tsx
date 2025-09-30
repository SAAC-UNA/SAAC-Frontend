import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NavigationProvider, useNavigation } from './NavigationContext';
import { MemoryRouter } from 'react-router-dom';

describe('NavigationContext', () => {
  function TestComponent() {
    const { activeItemId, expandedItemId, setActiveItem, setExpandedItem, toggleExpanded } = useNavigation();
    return (
      <div>
        <span data-testid="active">{activeItemId}</span>
        <span data-testid="expanded">{expandedItemId}</span>
        <button onClick={() => setActiveItem('test')}>Set Active</button>
        <button onClick={() => setExpandedItem('expand')}>Set Expanded</button>
        <button onClick={() => toggleExpanded('expand')}>Toggle Expanded</button>
      </div>
    );
  }

  it('proporciona valores iniciales y permite cambiar el activo', () => {
    render(
      <MemoryRouter initialEntries={["/inicio"]}>
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('active').textContent).toBe('inicio');
    expect(screen.getByTestId('expanded').textContent).toBe('');
    act(() => {
      screen.getByText('Set Active').click();
    });
    expect(screen.getByTestId('active').textContent).toBe('test');
  });

  it('permite cambiar el expandido y alternar', () => {
    render(
      <MemoryRouter initialEntries={["/inicio"]}>
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      </MemoryRouter>
    );
    act(() => {
      screen.getByText('Set Expanded').click();
    });
    expect(screen.getByTestId('expanded').textContent).toBe('expand');
    act(() => {
      screen.getByText('Toggle Expanded').click();
    });
    expect(screen.getByTestId('expanded').textContent).toBe('');
    act(() => {
      screen.getByText('Toggle Expanded').click();
    });
    expect(screen.getByTestId('expanded').textContent).toBe('expand');
  });
});
