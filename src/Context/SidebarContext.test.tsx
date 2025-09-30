import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SidebarProvider, useSidebar } from './SidebarContext';

describe('SidebarContext', () => {
  function TestComponent() {
    const { open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar, isCollapsed, collapseSidebar, expandSidebar } = useSidebar();
    return (
      <div>
        <span data-testid="open">{open ? 'expanded' : 'collapsed'}</span>
        <span data-testid="openMobile">{openMobile ? 'true' : 'false'}</span>
        <span data-testid="isMobile">{isMobile ? 'true' : 'false'}</span>
        <span data-testid="isCollapsed">{isCollapsed ? 'true' : 'false'}</span>
        <button onClick={() => setOpen(true)}>Expand</button>
        <button onClick={() => setOpen(false)}>Collapse</button>
        <button onClick={() => setOpenMobile(true)}>OpenMobile</button>
        <button onClick={() => setOpenMobile(false)}>CloseMobile</button>
        <button onClick={toggleSidebar}>Toggle</button>
        <button onClick={collapseSidebar}>CollapseAPI</button>
        <button onClick={expandSidebar}>ExpandAPI</button>
      </div>
    );
  }

  it('proporciona valores iniciales y permite expandir/colapsar', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );
    expect(screen.getByTestId('open').textContent).toBe('expanded');
    act(() => {
      screen.getByText('Collapse').click();
    });
    expect(screen.getByTestId('open').textContent).toBe('collapsed');
    act(() => {
      screen.getByText('Expand').click();
    });
    expect(screen.getByTestId('open').textContent).toBe('expanded');
  });

  it('permite abrir/cerrar en mobile y alternar', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );
    act(() => {
      screen.getByText('OpenMobile').click();
    });
    expect(screen.getByTestId('openMobile').textContent).toBe('true');
    act(() => {
      screen.getByText('CloseMobile').click();
    });
    expect(screen.getByTestId('openMobile').textContent).toBe('false');
  });

  it('permite alternar y usar API de compatibilidad', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );
    act(() => {
      screen.getByText('CollapseAPI').click();
    });
    expect(screen.getByTestId('isCollapsed').textContent).toBe('true');
    act(() => {
      screen.getByText('ExpandAPI').click();
    });
    expect(screen.getByTestId('isCollapsed').textContent).toBe('false');
  });
});
