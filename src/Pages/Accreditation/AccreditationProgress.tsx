import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { useAuth } from '@/Context/AuthContext';
import { 
    getProcesses, 
    getAccreditationCycles,
    type Process,
    type AccreditationCycle 
} from '@/Services/AccreditationService';

const AccreditationProgress: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [processes, setProcesses] = useState<Process[]>([]);
    const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated || !user) {
                setError('Debes iniciar sesión para ver esta información');
                setLoading(false);
                return;
            }

            try {
                setError(null);
                
                // Obtener los career_ids del usuario
                const careerCampusIds = user.careers?.map(c => c.carrera_sede_id) || [];
                
                console.log('👤 Usuario:', user.nombre);
                console.log('🎓 Carreras del usuario:', careerCampusIds);
                
                // Llamar al backend con los career_ids
                const [processesData, cyclesData] = await Promise.all([
                    getProcesses(careerCampusIds.length > 0 ? careerCampusIds : undefined),
                    getAccreditationCycles(careerCampusIds.length > 0 ? careerCampusIds : undefined)
                ]);
                
                console.log('📦 Procesos recibidos:', processesData);
                console.log('🔄 Ciclos recibidos:', cyclesData);
                
                setProcesses(processesData);
                setCycles(cyclesData);
            } catch (err: any) {
                console.error('Error al cargar datos:', err);
                setError(err.message || 'Error al cargar los datos');
                setProcesses([]);
                setCycles([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [isAuthenticated, user]);

    return (
        <ScreenContainer
            title="Avance de Acreditación"
            description="Estado de los procesos de acreditación activos"
        >
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="mt-2 text-gray-600">Cargando datos...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <p className="font-bold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : processes.length === 0 && cycles.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No se encontraron datos para mostrar.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Esto puede deberse a que no tienes procesos o ciclos asignados.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Columna de Procesos */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Procesos Activos</h2>
                            <div className="space-y-4">
                                {processes.map(process => (
                                    <div key={process.proceso_id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{process.tipo_proceso}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {process.accreditation_cycle.nombre}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {process.accreditation_cycle.career_campus.career.nombre}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Columna de Ciclos */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Ciclos de Acreditación</h2>
                            <div className="space-y-4">
                                {cycles.map(cycle => (
                                    <div key={cycle.ciclo_acreditacion_id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <h3 className="font-medium text-gray-900">{cycle.nombre}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {cycle.career_campus.career.nombre}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {cycle.career_campus.campus.nombre}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ScreenContainer>
    );
};

export default AccreditationProgress;