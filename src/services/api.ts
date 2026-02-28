import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;

// ============================================================
// TIPOS
// ============================================================

export interface ModerationRequest {
    id: number;          // razon_id en la vista SQL
    razon: string;       // descripcion en la vista SQL
    status: 'pendiente' | 'aprobado' | 'rechazado';
    persona_id: number;
    nombre: string;      // persona_nombre en la vista SQL
    carrera: string;     // persona_carrera en la vista SQL
    genero: string;      // persona_genero en la vista SQL
    total_votos?: number;
    posicion?: number;
    created_at?: string;
}

export interface Parche {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    emoji: string;
    autor: string;
    carrera?: string;
    lugar: string;
    fecha: string;
    hora: string;
    cupo?: number;
    requisitos?: string;
    contacto?: string;
    status: 'pendiente' | 'aprobado' | 'rechazado';
    mod_nota?: string;
    mod_at?: string;
    mod_alias?: string;
    created_at: string;
    total_interesados?: number;
}

export interface Persona {
    id: number;
    nombre: string;
    carrera: string;
    genero: string;
    total_votos?: number;
    posicion?: number;
    total_razones?: number;
}

// ============================================================
// NORMALIZACIÓN
// ============================================================

function normalizarRazon(raw: any): ModerationRequest {
    return {
        id:          raw.razon_id   ?? raw.id,
        razon:       raw.descripcion ?? raw.razon ?? '',
        status:      raw.status,
        persona_id:  raw.persona_id,
        nombre:      raw.persona_nombre ?? raw.nombre ?? '',
        carrera:     raw.persona_carrera ?? raw.carrera ?? '',
        genero:      raw.persona_genero  ?? raw.genero  ?? '',
        total_votos: raw.total_votos,
        posicion:    raw.posicion,
        created_at:  raw.created_at,
    };
}

// ============================================================
// RAZONES — ranking_infieles
// ============================================================

export const ModeracionAPI = {
    getPendientes: async (): Promise<ModerationRequest[]> => {
        const res = await axios.get(`${BASE}/api/personas/moderacion/pendientes`);
        const raw: any[] = res.data?.data ?? res.data ?? [];
        return raw.map(normalizarRazon);
    },

    updateStatus: async (razonId: number, status: 'aprobado' | 'rechazado' | 'pendiente'): Promise<void> => {
        await axios.put(`${BASE}/api/personas/moderacion/${razonId}`, { status });
    },
};

// ============================================================
// PERSONAS
// ============================================================

export const PersonasAPI = {
    /** Lista todas las personas con sus votos */
    getAll: async (): Promise<Persona[]> => {
        const res = await axios.get(`${BASE}/api/personas`);
        const raw: any[] = res.data?.data ?? res.data ?? [];
        return raw.map((p: any) => ({
            id:           p.id,
            nombre:       p.nombre,
            carrera:      p.carrera,
            genero:       p.genero,
            total_votos:  p.total_votos,
            posicion:     p.posicion,
            total_razones: p.total_razones,
        }));
    },

    /** Actualiza nombre (y/o carrera) de una persona */
    update: async (id: number, data: { nombre?: string; carrera?: string }): Promise<void> => {
        await axios.put(`${BASE}/api/personas/${id}`, data);
    },

    /** Elimina una persona — contraseña admin enviada automáticamente */
    delete: async (id: number, password = 'admin123'): Promise<void> => {
        await axios.delete(`${BASE}/api/personas/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            data: { password },
        });
    },
};

// ============================================================
// PARCHES — parches_uts
// ============================================================

export const ParchesAPI = {
    getPanel: async (): Promise<Parche[]> => {
        const res = await axios.get(`${BASE}/api/parches/moderacion`);
        return res.data?.data ?? res.data ?? [];
    },

    updateStatus: async (parcheId: number, status: 'aprobado' | 'rechazado' | 'pendiente', nota?: string): Promise<void> => {
        await axios.put(`${BASE}/api/parches/moderacion/${parcheId}`, { status, nota });
    },
};
