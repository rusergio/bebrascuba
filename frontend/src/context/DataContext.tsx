import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

interface Alumno {
    id: number;
    nro_ci: string;
    nombre_estudiante: string;
    sexo: string;
    nombre_escuela: string | null;
    grado: number | null;
    categoria: string | null;
    puntuacion?: number | null;
    medalla?: string | null;
}

interface ApiResponse {
    success: boolean;
    usuario: {
        id: number;
        nombre: string;
        apellidos: string;
        correo: string;
        telefono: string;
        nro_ci: string;
    };
    profesor: {
        id: number;
        esta_activo: boolean;
        es_nuevo: boolean;
        perfil_editado: boolean;
    };
    roles: Array<{
        id: number;
        rol: string;
        descripcion: string;
    }>;
    total_estudiantes: number;
    estudiantes: Alumno[];
}

interface ResultadosProvincia {
    provincia: string;
    superpegues: number;
    peque: number;
    benjamin: number;
    cadete: number;
    junior: number;
    senior: number;
    total: number;
}

interface TotalPorCategoria {
    superpegues: number;
    peques: number;
    benjamin: number;
    cadete: number;
    junior: number;
    senior: number;
    total: number;
}

interface RecursoData {
    id: number;
    nombre: string;
    descripcion: string;
    archivo_path: string;
}

interface SolicitudProfesor {
    id: number;
    nro_ci: string;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    es_nuevo: boolean;
    perfil_editado: boolean;
    esta_activo: boolean;
    nombre_escuela: string;
    subsistema: string;
    poblado: string;
    telefono_escuela: string | null;
}

interface DataContextType {
    estudiantes: Alumno[];
    totalEstudiantes: number;
    resultados: ResultadosProvincia[];
    totalPorCategoria: TotalPorCategoria | null;
    recursos: RecursoData[];
    solicitudes: SolicitudProfesor[];
    numeroEdicion: number;
    estadoEdicion: string; // 'Abierto' o 'Cerrado'
    isLoading: boolean;
    isInitialized: boolean;
    refreshEstudiantes: () => Promise<void>;
    refreshResultados: () => Promise<void>;
    refreshRecursos: () => Promise<void>;
    refreshSolicitudes: () => Promise<void>;
    refreshNumeroEdicion: () => Promise<void>;
    refreshEstadoEdicion: () => Promise<void>;
    clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [estudiantes, setEstudiantes] = useState<Alumno[]>([]);
    const [totalEstudiantes, setTotalEstudiantes] = useState(0);
    const [resultados, setResultados] = useState<ResultadosProvincia[]>([]);
    const [totalPorCategoria, setTotalPorCategoria] = useState<TotalPorCategoria | null>(null);
    const [recursos, setRecursos] = useState<RecursoData[]>([]);
    const [solicitudes, setSolicitudes] = useState<SolicitudProfesor[]>([]);
    const [numeroEdicion, setNumeroEdicion] = useState<number>(0);
    const [estadoEdicion, setEstadoEdicion] = useState<string>("Cerrado");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Función para cargar estudiantes
    const loadEstudiantes = useCallback(async () => {
        const profesorId = localStorage.getItem('profesorId');
        if (!profesorId) {
            console.log('⚠️ No hay profesorId, no se cargan estudiantes');
            setIsInitialized(true);
            return;
        }

        setIsLoading(true);
        try {
            console.log('🔄 Cargando estudiantes al iniciar la app...');
            const response = await axios.get<ApiResponse>(`/api/listar-estudiantes/${profesorId}`);
            
            if (response.data.success) {
                const estudiantesData = response.data.estudiantes || [];
                setEstudiantes(estudiantesData);
                setTotalEstudiantes(response.data.total_estudiantes || estudiantesData.length);
                console.log('✅ Estudiantes cargados:', estudiantesData.length);
            }
        } catch (error) {
            console.error('❌ Error al cargar estudiantes:', error);
            setEstudiantes([]);
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, []);

    // Función para cargar resultados
    const loadResultados = useCallback(async () => {
        try {
            console.log('🔄 Cargando resultados al iniciar la app...');
            const response = await axios.get<ResultadosProvincia[]>('/api/resultados');
            setResultados(response.data);
            console.log('✅ Resultados cargados:', response.data.length);
        } catch (error) {
            console.error('❌ Error al cargar resultados:', error);
            setResultados([]);
        }
    }, []);

    // Función para cargar totales por categoría
    const loadTotalPorCategoria = useCallback(async () => {
        try {
            console.log('🔄 Cargando totales por categoría al iniciar la app...');
            const response = await axios.get<TotalPorCategoria>('/api/total-categorias');
            setTotalPorCategoria(response.data);
            console.log('✅ Totales por categoría cargados');
        } catch (error) {
            console.error('❌ Error al cargar totales por categoría:', error);
            setTotalPorCategoria(null);
        }
    }, []);

    // Función para cargar recursos
    const loadRecursos = useCallback(async () => {
        try {
            console.log('🔄 Cargando recursos al iniciar la app...');
            const response = await axios.get<RecursoData[]>('/api/listar-recursos');
            setRecursos(response.data);
            console.log('✅ Recursos cargados:', response.data.length);
        } catch (error) {
            console.error('❌ Error al cargar recursos:', error);
            setRecursos([]);
        }
    }, []);

    // Función para cargar número de edición
    const loadNumeroEdicion = useCallback(async () => {
        try {
            console.log('🔄 Cargando número de edición al iniciar la app...');
            const response = await axios.get<{ n_edicion: number }>('/api/nro_edicion');
            setNumeroEdicion(response.data.n_edicion);
            console.log('✅ Número de edición cargado:', response.data.n_edicion);
        } catch (error) {
            console.error('❌ Error al cargar número de edición:', error);
            setNumeroEdicion(0);
        }
    }, []);

    // Función para cargar solicitudes de profesores
    const loadSolicitudes = useCallback(async () => {
        try {
            console.log('🔄 Cargando solicitudes de profesores al iniciar la app...');
            const response = await axios.get<SolicitudProfesor[]>('/api/profesores-inactivos');
            setSolicitudes(response.data);
            console.log('✅ Solicitudes cargadas:', response.data.length);
        } catch (error) {
            console.error('❌ Error al cargar solicitudes:', error);
            setSolicitudes([]);
        }
    }, []);

    // Función para cargar estado de la edición
    const loadEstadoEdicion = useCallback(async () => {
        try {
            console.log('🔄 Cargando estado de la edición al iniciar la app...');
            const response = await axios.get<{ is_open: boolean }>('/api/is-open');
            setEstadoEdicion(response.data.is_open ? 'Abierto' : 'Cerrado');
            console.log('✅ Estado de edición cargado:', response.data.is_open ? 'Abierto' : 'Cerrado');
        } catch (error) {
            console.error('❌ Error al cargar estado de edición:', error);
            setEstadoEdicion('Cerrado');
        }
    }, []);

    // Cargar todos los datos cuando hay un usuario logueado o siempre (para datos públicos)
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const profesorId = localStorage.getItem('profesorId');
        
        // Cargar datos públicos siempre (resultados, recursos, solicitudes, número de edición y estado de edición)
        console.log('🚀 Cargando datos públicos (resultados, recursos, solicitudes, número de edición y estado de edición)...');
        Promise.all([
            loadResultados(),
            loadTotalPorCategoria(),
            loadRecursos(),
            loadSolicitudes(),
            loadNumeroEdicion(),
            loadEstadoEdicion()
        ]).then(() => {
            // Solo cargar estudiantes si hay usuario logueado
            if (userId || profesorId) {
                console.log('🚀 Usuario detectado, cargando datos del usuario...');
                loadEstudiantes();
            } else {
                // Si no hay usuario, marcar como inicializado pero sin datos de estudiante
                setIsInitialized(true);
            }
        }).catch(() => {
            setIsInitialized(true);
        });
    }, [loadEstudiantes, loadResultados, loadTotalPorCategoria, loadRecursos, loadSolicitudes, loadNumeroEdicion, loadEstadoEdicion]);

    // Función para refrescar estudiantes (útil después de agregar/eliminar)
    const refreshEstudiantes = useCallback(async () => {
        await loadEstudiantes();
    }, [loadEstudiantes]);

    // Función para refrescar resultados
    const refreshResultados = useCallback(async () => {
        await Promise.all([loadResultados(), loadTotalPorCategoria()]);
    }, [loadResultados, loadTotalPorCategoria]);

    // Función para refrescar recursos
    const refreshRecursos = useCallback(async () => {
        await loadRecursos();
    }, [loadRecursos]);

    // Función para refrescar solicitudes
    const refreshSolicitudes = useCallback(async () => {
        await loadSolicitudes();
    }, [loadSolicitudes]);

    // Función para refrescar número de edición
    const refreshNumeroEdicion = useCallback(async () => {
        await loadNumeroEdicion();
    }, [loadNumeroEdicion]);

    // Función para refrescar estado de la edición
    const refreshEstadoEdicion = useCallback(async () => {
        await loadEstadoEdicion();
    }, [loadEstadoEdicion]);

    // Limpiar todos los datos (útil al hacer logout)
    const clearAllData = useCallback(() => {
        setEstudiantes([]);
        setTotalEstudiantes(0);
        setResultados([]);
        setTotalPorCategoria(null);
        setRecursos([]);
        setSolicitudes([]);
        setNumeroEdicion(0);
        setEstadoEdicion('Cerrado');
        setIsInitialized(false);
    }, []);

    return (
        <DataContext.Provider
            value={{
                estudiantes,
                totalEstudiantes,
                resultados,
                totalPorCategoria,
                recursos,
                solicitudes,
                numeroEdicion,
                estadoEdicion,
                isLoading,
                isInitialized,
                refreshEstudiantes,
                refreshResultados,
                refreshRecursos,
                refreshSolicitudes,
                refreshNumeroEdicion,
                refreshEstadoEdicion,
                clearAllData,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext debe usarse dentro de DataProvider');
    }
    return context;
};

