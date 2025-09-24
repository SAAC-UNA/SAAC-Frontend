import React from 'react';
import { SidebarProvider } from './Context/SidebarContext';
import { Sidebar } from './Components/Layout/Sidebar/Index';

const App: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-rojo-una flex">
        <Sidebar />
        <div className="flex-1">
          {/* Aquí iría el contenido principal */}
          <main className="p-8">
            <h1 className="text-3xl font-bold">Contenido Principal</h1>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default App;