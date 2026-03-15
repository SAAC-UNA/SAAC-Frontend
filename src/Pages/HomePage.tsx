import React from 'react';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { useModuleInfo } from '@/Hooks/UseModuleInfo';
import { TYPOGRAPHY } from '@/Constants/Typography';

const HomePage: React.FC = () => {
  const { title, description } = useModuleInfo('home');
  
  return (
    <ScreenContainer>
    <PageHeader
      title={title}
      description={description}
    />
      {/* Cards de navegación rápida */}
      <div className="text-center py-12">
        <h3 className={` ${TYPOGRAPHY.pageTitle} font-semibold mb-2`}>Sistema de Acreditación y Autoevaluación de Carreras</h3>
        <p className={`font-semibold ${TYPOGRAPHY.body} mb-2`}>SAAC</p>
        <p className={`text-gris-una ${TYPOGRAPHY.body}`}>Sección Regional Central Occidente, Campus Alajuela</p>
        <p className={`text-gris-una ${TYPOGRAPHY.body}`}>Universidad Nacional de Costa Rica</p>
        <p className={`font-semibold ${TYPOGRAPHY.pageSubtitle} mb-2`}>Equipo de Desarrollo SAAC-UNA</p>
        <p className={`text-gris-una ${TYPOGRAPHY.body}`}>Ian Villegas Jiménez</p>
        <p className={`text-gris-una ${TYPOGRAPHY.body}`}>Marisol Hidalgo Murillo</p>
        <p className={`text-gris-una ${TYPOGRAPHY.body}`}>José Jara Arias</p>
        <p className={`text-gris-una ${TYPOGRAPHY.body}`}>Cristina Zúñiga Cárdenas</p>
        <p className={`text-gris-una ${TYPOGRAPHY.body}`}>Naydelin Jirón Castellón</p>
      </div>
    </ScreenContainer>
  );
};

export default HomePage;