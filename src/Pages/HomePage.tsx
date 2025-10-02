import React from 'react';
import { PageHeader } from '@/components/Ui/Index';
import { useModuleInfo } from '@/hooks/UseModuleInfo';

const HomePage: React.FC = () => {
  const { title, description } = useModuleInfo('home');
  
  return (
    <div className="w-full">
      <PageHeader
        title={title}
        description={description}
      />
      <div className="p-6">
        {/* Cards de navegación rápida */}
        <div className="bg-blanco-una p-6 rounded-lg shadow-sm border text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Vacío</h3>
          <p className="text-gris-una">Agregar contenido de inicio, veremos qué poner, dijo el ciego</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;