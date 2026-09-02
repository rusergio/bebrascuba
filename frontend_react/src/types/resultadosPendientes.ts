export interface ResultadoPendienteCategoria {
    id: number;
    nombre_cuba: string;
    nombre_bebras?: string;
}

export interface ResultadoPendiente {
    id: number;
    edicion: number | null;
    id_categoria: number | null;
    correo_profesor: string | null;
    nombre_profesor: string | null;
    id_profesor?: number | null;
    student_username: string | null;
    nombre_estudiante: string;
    id_estudiante?: number | null;
    sexo: string | null;
    escuela_excel: string | null;
    id_escuela?: number | null;
    grado: number | null;
    puntuacion: number | null;
    medalla: string | null;
    datos_faltantes: string | null;
    descripcion_estado?: string | null;
    observaciones: string | null;
    estado: string;
    estado_validacion?: string;
    requiere_aprobacion?: boolean;
    editado_por_profesor?: boolean;
    aprobado_por_coordinador?: boolean;
    created_at?: string;
    updated_at?: string;
    categoria?: ResultadoPendienteCategoria | null;
}

export interface RevisionResumen {
    success: boolean;
    edicion: number;
    total: number;
    por_estado: Record<string, number>;
    por_categoria: Record<string, number>;
    por_profesor: Array<{ correo_profesor: string; total: number }>;
}

export interface ListaResultadosResponse {
    success: boolean;
    data: ResultadoPendiente[];
    total: number;
}

export interface ResultadoOficial {
    id: number;
    nombre_estudiante: string;
    nombre_escuela: string | null;
    categoria: string;
    puntuacion: number | null;
    medalla: string | null;
    grado: number | null;
}

export interface OficialesListaResponse {
    success: boolean;
    data: ResultadoOficial[];
    total: number;
}

export interface OficialesResumenProfesor {
    success: boolean;
    edicion: number;
    total: number;
    por_medalla: Record<string, number>;
    por_categoria: Record<string, number>;
}

export interface ModificarPendientePayload {
    nombre_estudiante?: string;
    escuela_excel?: string;
    grado?: number | null;
    sexo?: string;
    observaciones?: string;
}

export interface IntegracionHistoricoResponse {
    success: boolean;
    message: string;
    insertados: number;
    omitidos: number;
    pendientes_integracion: number;
}
