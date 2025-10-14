import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { 
    getProcesses, 
    getAccreditationCycles,
    type Process,
    type AccreditationCycle 
} from '@/Services/AccreditationService';

const AccreditationProgress: React.FC = () => {
    
    const [processes, setProcesses] = useState<Process[]>([]);
    const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const [processesData, cyclesData] = await Promise.all([
                    getProcesses(),
                    getAccreditationCycles()
                ]);
                setProcesses(processesData);
                setCycles(cyclesData);
            } catch (error) {
                console.error('Error al cargar datos:', error);
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
                    <div className="text-center">Cargando...</div>
                ) : (
                    <>
                        {/* Vista de procesos */}
                        {processes.map(process => (
                            <div key={process.proceso_id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {process.accreditationCycle.careerCampus.career.nombre}
                                    </h2>
                                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Proceso Actual</h3>
                                            <p className="mt-1 text-sm text-gray-600">{process.tipo_proceso}</p>
                                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Vista de ciclos */}
                        {cycles.map(cycle => (
                            <div key={cycle.ciclo_id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Ciclo de {cycle.careerCampus.career.nombre}
                                    </h2>
                                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Periodo</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {new Date(cycle.fecha_inicio).getFullYear()} - {new Date(cycle.fecha_fin).getFullYear()}
                                            </p>
                                            <p className="text-sm text-gray-500">Estado: {cycle.estado}</p>
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