import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { useAuth } from '@/Context/AuthContext';
import { 
    getProcesses, 
    getAccreditationCycles,
    type Process,
    type AccreditationCycle 
} from '@/Services/AccreditationService';

const AccreditationProgress: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [processes, setProcesses] = useState<Process[]>([]);
    const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated) {
                setError('Debes iniciar sesión para ver esta información');
                setLoading(false);
                return;
            }

            try {
                setError(null);
                const [processesData, cyclesData] = await Promise.all([
                    getProcesses(),
                    getAccreditationCycles()
                ]);
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
    }, []);

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
                        <p className="text-gray-500">No se encontraron datos para mostrar.</p>
                        <p className="text-sm text-gray-400">Esto puede deberse a que no tienes procesos o ciclos asignados.</p>
                    </div>
                ) : (
                    <>
                        {/* Vista de procesos */}
                        {processes.map(process => (
                            <div key={process.proceso_id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {process.tipo_proceso}
                                    </h2>
                                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Carrera</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {process.accreditationCycle.careerCampus.career.nombre}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Ciclo</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {process.accreditationCycle.nombre}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Sede</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {process.accreditationCycle.careerCampus.campus.nombre}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Vista de ciclos */}
                        {cycles.map(cycle => (
                            <div key={cycle.ciclo_acreditacion_id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {cycle.nombre}
                                    </h2>
                                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Carrera</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {cycle.careerCampus.career.nombre}
                                            </p>
                                            <p className="text-sm text-gray-500">Sede: {cycle.careerCampus.campus.nombre}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </ScreenContainer>
    );
};

export default AccreditationProgress;