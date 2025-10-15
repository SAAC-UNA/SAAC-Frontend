import React from 'react';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { useModuleInfo } from '@/Hooks/UseModuleInfo';

const HomePage: React.FC = () => {
  const { title, description } = useModuleInfo('home');
  
  return (
    <ScreenContainer>
    <PageHeader
      title={title}
      description={description}
    />
      {/* Cards de navegación rápida */}
      <div className="bg-blanco-una p-6 rounded-lg shadow-sm border text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Sistema de Acreditación y Autoevaluación de Carreras</h3>
        <p className="font-semibold text-negro-una">SAAC</p>
        <p className="text-gris-una">Sección Regional Central Occidente, Campus Alajuela</p>
        <p className="text-gris-una">Universidad Nacional de Costa Rica</p>
      </div>
    </ScreenContainer>
  );
};

export default HomePage;