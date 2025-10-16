import React from 'react';
import { useContext } from 'react';
import { AuthContext } from '@/Context/AuthContext';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';

import type { MockCareer } from '@/Mocks/Users';

const CareerDashboard: React.FC = () => {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('AuthContext no disponible');
    
    const userCareers = auth.user?.careers || [];
    const isSuperUser = auth.isSuperUser();

    const renderCareerCard = (career: MockCareer) => (
        <div key={career.carrera_id} className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    {career.nombre}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Proceso de acreditación activo
                </p>
            </div>
            <div className="px-6 py-4">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium text-gray-900">Proceso actual</h3>
                        <p className="text-sm text-gray-600">Evaluación con SINAES</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Estado</h3>
                        <p className="text-sm text-gray-600">En proceso de recolección de evidencias</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Próxima actividad</h3>
                        <p className="text-sm text-gray-600">Revisión de documentación</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ScreenContainer
            title={isSuperUser ? "Vista General de Carreras" : "Mi Carrera"}
            description={isSuperUser ? "Procesos de acreditación de todas las carreras" : "Estado actual del proceso de acreditación"}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isSuperUser ? (
                    // Vista para SuperUsuario - Todas las carreras
                    <>
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Ingeniería en Sistemas
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Proceso de evaluación en curso
                                </p>
                            </div>
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Proceso actual</h3>
                                        <p className="text-sm text-gray-600">Evaluación con SINAES</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Estado</h3>
                                        <p className="text-sm text-gray-600">En proceso de recolección de evidencias</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Educación
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Proceso de evaluación en curso
                                </p>
                            </div>
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Proceso actual</h3>
                                        <p className="text-sm text-gray-600">Autoevaluación inicial</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Estado</h3>
                                        <p className="text-sm text-gray-600">Preparación de documentación</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Vista para Administrador - Solo su carrera
                    userCareers.map(career => renderCareerCard(career))
                )}
            </div>
        </ScreenContainer>
    );
};

export default CareerDashboard;