import { axiosInstance } from '@/Config/axios';

// Endpoints de acreditación
const ACCREDITATION_ENDPOINTS = {
    PROCESSES: '/api/estructura/procesos',
    CYCLES: '/api/estructura/ciclos-acreditacion'
};

/**
 * Interfaces exactamente como están definidas en el backend (ProcessCycleSeeder)
 */
export interface Career {
    carrera_id: number;
    nombre: string;
}

export interface Campus {
    sede_id: number;
    nombre: string;
}

export interface CareerCampus {
    carrera_sede_id: number;
    carrera_id: number;
    sede_id: number;
    career: Career;
    campus: Campus;
}

export interface AccreditationCycle {
    ciclo_acreditacion_id: number;
    carrera_sede_id: number;
    nombre: string;
    careerCampus: CareerCampus;
}

export interface Process {
    proceso_id: number;
    ciclo_acreditacion_id: number;
    tipo_proceso: string;
    accreditationCycle: AccreditationCycle;
}

/**
 * Obtiene los procesos de acreditación filtrados por carrera
 * @param careerIds - IDs de las carreras del usuario (opcional para SuperUsuario)
 */
export async function getProcesses(careerIds?: number[]): Promise<Process[]> {
    try {
        // Construir query params
        const params = new URLSearchParams();
        
        // Si hay carreras específicas, enviar el primer ID
        // (el backend filtrará automáticamente según el usuario autenticado)
        if (careerIds && careerIds.length > 0) {
            params.append('career_id', careerIds[0].toString());
        }
        
        const url = `${ACCREDITATION_ENDPOINTS.PROCESSES}${params.toString() ? `?${params.toString()}` : ''}`;
        
        console.log('🔍 Llamando a:', url);
        
        const response = await axiosInstance.get<Process[]>(url);
        return response.data || [];
    } catch (error: any) {
        console.error('Error detallado al obtener procesos:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        
        if (error.response?.status === 401) {
            throw new Error('Sesión expirada o inválida');
        }
        
        if (error.response?.data?.message) {
            throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
        
        throw new Error(error.message || 'Error al cargar los procesos de acreditación');
    }
}

/**
 * Obtiene los ciclos de acreditación filtrados por carrera
 * @param careerIds - IDs de las carreras del usuario (opcional para SuperUsuario)
 */
export async function getAccreditationCycles(careerIds?: number[]): Promise<AccreditationCycle[]> {
    try {
        // Construir query params
        const params = new URLSearchParams();
        
        // Si hay carreras específicas, enviar el primer ID
        if (careerIds && careerIds.length > 0) {
            params.append('career_id', careerIds[0].toString());
        }
        
        const url = `${ACCREDITATION_ENDPOINTS.CYCLES}${params.toString() ? `?${params.toString()}` : ''}`;
        
        console.log('🔍 Llamando a:', url);
        
        const response = await axiosInstance.get<AccreditationCycle[]>(url);
        return response.data || [];
    } catch (error: any) {
        console.error('Error detallado al obtener ciclos:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        
        if (error.response?.status === 401) {
            throw new Error('Sesión expirada o inválida');
        }
        
        if (error.response?.data?.message) {
            throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
        
        throw new Error(error.message || 'Error al cargar los ciclos de acreditación');
    }
}