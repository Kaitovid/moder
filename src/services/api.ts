import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;

// Token de moderador definido en el servidor
const ADMIN_TOKEN = 'uts_admin_2026';

// ============================================================
// AXIOS INTERCEPTOR — inyecta el token en cada request
// ============================================================

// Instancia con token para rutas protegidas
export const apiAdmin = axios.create({ baseURL: BASE });
apiAdmin.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
    return config;
});

// Instancia pública (sin token)
export const apiPublic = axios.create({ baseURL: BASE });

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
// AUTH — login moderador
// ============================================================

export const AuthAPI = {
    /**
     * Autentica al moderador con el token.
     * POST /api/parches/auth/login { token }
     */
    login: async (token: string): Promise<{ ok: boolean; message?: string }> => {
        const res = await apiPublic.post('/api/parches/auth/login', { token });
        return res.data;
    },
};

// ============================================================
// RAZONES — ranking_infieles
// ============================================================

export const ModeracionAPI = {
    getPendientes: async (): Promise<ModerationRequest[]> => {
        const res = await apiAdmin.get('/api/personas/moderacion/pendientes');
        const raw: any[] = res.data?.data ?? res.data ?? [];
        return raw.map(normalizarRazon);
    },

    updateStatus: async (razonId: number, status: 'aprobado' | 'rechazado' | 'pendiente'): Promise<void> => {
        await apiAdmin.put(`/api/personas/moderacion/${razonId}`, { status });
    },
};

// ============================================================
// PERSONAS
// ============================================================

export const PersonasAPI = {
    /** Lista todas las personas con sus votos */
    getAll: async (): Promise<Persona[]> => {
        const res = await apiAdmin.get('/api/personas');
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
        await apiAdmin.put(`/api/personas/${id}`, data);
    },

    /** Elimina una persona — usa token admin en header */
    delete: async (id: number): Promise<void> => {
        await apiAdmin.delete(`/api/personas/${id}`);
    },
};

// ============================================================
// PARCHES — parches_uts
// ============================================================

export const ParchesAPI = {
    /**
     * Panel de moderación: todos los parches (pendientes, aprobados, rechazados).
     * GET /api/parches/moderacion/todos  — requiere token admin
     */
    getPanel: async (): Promise<Parche[]> => {
        const res = await apiAdmin.get('/api/parches/moderacion/todos');
        const raw: any[] = res.data?.data ?? res.data ?? [];
        return raw.map((p: any): Parche => ({
            id:               p.id,
            titulo:           p.titulo,
            descripcion:      p.descripcion,
            categoria:        p.categoria,
            emoji:            p.emoji,
            autor:            p.autor,
            carrera:          p.carrera,
            lugar:            p.lugar,
            fecha:            p.fecha,
            hora:             p.hora,
            cupo:             p.cupo,
            requisitos:       p.requisitos,
            contacto:         p.contacto,
            status:           p.status,
            mod_nota:         p.mod_nota,
            mod_at:           p.mod_at,
            mod_alias:        p.mod_alias,
            created_at:       p.created_at,
            total_interesados: p.total_interesados,
        }));
    },

    /**
     * Aprobar o rechazar un parche.
     * PUT /api/parches/moderacion/:id  { status, mod_id }
     * mod_id = 1 es el moderador admin principal
     */
    updateStatus: async (
        parcheId: number,
        status: 'aprobado' | 'rechazado' | 'pendiente',
        mod_id = 1,
        nota?: string,
    ): Promise<void> => {
        await apiAdmin.put(`/api/parches/moderacion/${parcheId}`, { status, mod_id, nota });
    },

    /**
     * Elimina un parche permanentemente.
     * DELETE /api/parches/:id  — requiere token admin en header
     */
    delete: async (parcheId: number): Promise<void> => {
        await apiAdmin.delete(`/api/parches/${parcheId}`);
    },

    // ── Endpoints públicos (uso opcional desde el panel) ────────

    /**
     * Tablón público: solo parches aprobados.
     * GET /api/parches
     */
    getPublicos: async (): Promise<Parche[]> => {
        const res = await apiPublic.get('/api/parches');
        return res.data?.data ?? res.data ?? [];
    },

    /**
     * Detalle de un parche aprobado.
     * GET /api/parches/:id
     */
    getById: async (id: number): Promise<Parche> => {
        const res = await apiPublic.get(`/api/parches/${id}`);
        return res.data?.data ?? res.data;
    },

    /**
     * Toggle "Me interesa" (fingerprint automático del servidor).
     * POST /api/parches/:id/interesado
     */
    toggleInteresado: async (id: number): Promise<{ interesado: boolean; total: number }> => {
        const res = await apiPublic.post(`/api/parches/${id}/interesado`);
        return res.data?.data ?? res.data;
    },

    /**
     * Publicar un nuevo parche (queda pendiente de aprobación).
     * POST /api/parches
     */
    publicar: async (data: Omit<Parche, 'id' | 'status' | 'created_at' | 'mod_nota' | 'mod_at' | 'mod_alias' | 'total_interesados'>): Promise<Parche> => {
        const res = await apiPublic.post('/api/parches', data);
        return res.data?.data ?? res.data;
    },
};
