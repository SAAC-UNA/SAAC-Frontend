import React from 'react';
import { ModernSidebar } from './Sidebar/Sidebar';
import { AppHeader } from './AppHeader';
import { Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <ModernSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-auto">
          <main className="container mx-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};