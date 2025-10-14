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
 * Obtiene los procesos de acreditación
 * El filtrado por rol/carrera lo hace el backend según el usuario autenticado
 */
export async function getProcesses(): Promise<Process[]> {
    try {
        const response = await axiosInstance.get<Process[]>(ACCREDITATION_ENDPOINTS.PROCESSES);
        return response.data || [];
    } catch (error: any) {
        console.error('Error detallado al obtener procesos:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
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
 * Obtiene los ciclos de acreditación
 * El filtrado por rol/carrera lo hace el backend según el usuario autenticado
 */
export async function getAccreditationCycles(): Promise<AccreditationCycle[]> {
    try {
        const response = await axiosInstance.get<AccreditationCycle[]>(ACCREDITATION_ENDPOINTS.CYCLES);
        return response.data || [];
    } catch (error: any) {
        console.error('Error detallado al obtener ciclos:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
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