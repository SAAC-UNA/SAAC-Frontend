import axios from 'axios';

// Configura la URL base - ajusta según tu configuración
axios.defaults.baseURL = 'http://localhost:8000';

export interface Process {
    proceso_id: number;
    tipo_proceso: string;
    accreditationCycle: {
        ciclo_id: number;
        careerCampus: {
            career: {
                nombre: string;
            }
        }
    }
}

export interface AccreditationCycle {
    ciclo_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    careerCampus: {
        career: {
            nombre: string;
        }
    }
}

/**
 * Obtiene los procesos de acreditación
 * El filtrado por rol/carrera lo hace el backend
 */
export const getProcesses = async (): Promise<Process[]> => {
    try {
        const response = await axios.get<Process[]>('/api/estructura/procesos');
        return response.data;
    } catch (error) {
        console.error('Error al obtener procesos:', error);
        return [];
    }
};

/**
 * Obtiene los ciclos de acreditación
 * El filtrado por rol/carrera lo hace el backend
 */
export const getAccreditationCycles = async (): Promise<AccreditationCycle[]> => {
    try {
        const response = await axios.get<AccreditationCycle[]>('/api/estructura/ciclos-acreditacion');
        return response.data;
    } catch (error) {
        console.error('Error al obtener ciclos:', error);
        return [];
    }
};