import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getToken } from '../lib/auth';

export type EstudiantesVista = 'todos' | 'inscripcion' | 'reinscripcion';

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
    inscrito?: boolean;
    es_nuevo?: boolean;
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
    ubicacion?: {
        id_escuela?: number;
        nombre_escuela?: string;
        provincia?: string;
        municipio?: string;
    };
    edicion_abierta?: boolean;
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

interface EdicionConResultados {
    id: number;
    n_edicion: number;
    a_edicion: number;
    abierto?: boolean;
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
    id_escuela?: number;
    nombre_escuela: string;
    escuela_validado?: boolean;
    subsistema: string;
    poblado: string;
    telefono_escuela: string | null;
    municipio?: string;
    provincia?: string;
    cdgo_municipio?: number;
    cdgo_provincia?: number;
}

interface DataContextType {
    estudiantes: Alumno[];
    totalEstudiantes: number;
    resultados: ResultadosProvincia[];
    totalPorCategoria: TotalPorCategoria | null;
    /** Ediciones que tienen filas en resultados (orden: más reciente primero). */
    edicionesConResultados: EdicionConResultados[];
    /** Año calendario de la edición seleccionada para la tabla de inicio; null = última edición cerrada (API sin filtro). */
    aEdicionResultados: number | null;
    recursos: RecursoData[];
    solicitudes: SolicitudProfesor[];
    numeroEdicion: number;
    anioEdicion: number | null;
    /** Última edición cerrada (con resultados publicados o ya finalizada). */
    ultimaEdicionCerrada: number;
    anioUltimaEdicionCerrada: number | null;
    estadoEdicion: string; // 'Abierto' o 'Cerrado'
    isLoading: boolean;
    isInitialized: boolean;
    refreshEstudiantes: (vista?: EstudiantesVista) => Promise<void>;
    refreshResultados: () => Promise<void>;
    selectEdicionResultados: (aEdicion: number | null) => Promise<void>;
    refreshRecursos: () => Promise<void>;
    refreshSolicitudes: () => Promise<void>;
    refreshNumeroEdicion: () => Promise<void>;
    refreshEdicionesPublicas: () => Promise<void>;
    refreshEstadoEdicion: () => Promise<void>;
    clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [estudiantes, setEstudiantes] = useState<Alumno[]>([]);
    const [totalEstudiantes, setTotalEstudiantes] = useState(0);
    const [resultados, setResultados] = useState<ResultadosProvincia[]>([]);
    const [totalPorCategoria, setTotalPorCategoria] = useState<TotalPorCategoria | null>(null);
    const [edicionesConResultados, setEdicionesConResultados] = useState<EdicionConResultados[]>([]);
    const [aEdicionResultados, setAEdicionResultados] = useState<number | null>(null);
    const [recursos, setRecursos] = useState<RecursoData[]>([]);
    const [solicitudes, setSolicitudes] = useState<SolicitudProfesor[]>([]);
    const [numeroEdicion, setNumeroEdicion] = useState<number>(0);
    const [anioEdicion, setAnioEdicion] = useState<number | null>(null);
    const [ultimaEdicionCerrada, setUltimaEdicionCerrada] = useState<number>(0);
    const [anioUltimaEdicionCerrada, setAnioUltimaEdicionCerrada] = useState<number | null>(null);
    const [estadoEdicion, setEstadoEdicion] = useState<string>("Cerrado");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Función para cargar estudiantes
    const loadEstudiantes = useCallback(async (vista: EstudiantesVista = 'todos') => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('⚠️ No hay userId, no se cargan estudiantes');
            setIsInitialized(true);
            return;
        }

        setIsLoading(true);
        try {
            console.log(`🔄 Cargando estudiantes (${vista})...`);
            const response = await axios.get<ApiResponse>(`/api/listar-estudiantes/${userId}`, {
                params: vista === 'todos' ? undefined : { vista },
            });
            
            if (response.data.success) {
                const estudiantesData = response.data.estudiantes || [];
                setEstudiantes(estudiantesData);
                setTotalEstudiantes(response.data.total_estudiantes || estudiantesData.length);

                if (response.data.ubicacion) {
                    const u = response.data.ubicacion;
                    if (u.nombre_escuela) localStorage.setItem('userSchoolName', u.nombre_escuela);
                    if (u.provincia) localStorage.setItem('userProvincia', u.provincia);
                    if (u.municipio) localStorage.setItem('userMunicipio', u.municipio);
                    if (u.id_escuela) localStorage.setItem('userSchoolId', String(u.id_escuela));
                }

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

    const fetchResultados = useCallback(async (aEdicion: number | null) => {
        try {
            const config =
                aEdicion != null ? { params: { a_edicion: aEdicion } } : {};
            const response = await axios.get<ResultadosProvincia[]>('/api/resultados', config);
            setResultados(response.data);
        } catch (error) {
            console.error('❌ Error al cargar resultados:', error);
            setResultados([]);
        }
    }, []);

    const fetchTotalPorCategoria = useCallback(async (aEdicion: number | null) => {
        try {
            const config =
                aEdicion != null ? { params: { a_edicion: aEdicion } } : {};
            const response = await axios.get<TotalPorCategoria>('/api/total-categorias', config);
            setTotalPorCategoria(response.data);
        } catch (error) {
            console.error('❌ Error al cargar totales por categoría:', error);
            setTotalPorCategoria(null);
        }
    }, []);

    const selectEdicionResultados = useCallback(
        async (aEdicion: number | null) => {
            setAEdicionResultados(aEdicion);
            await Promise.all([fetchResultados(aEdicion), fetchTotalPorCategoria(aEdicion)]);
        },
        [fetchResultados, fetchTotalPorCategoria],
    );

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

    const loadUltimaEdicionCerrada = useCallback(async () => {
        try {
            const response = await axios.get<{ n_edicion: number; a_edicion: number | null }>(
                '/api/ultima-edicion-cerrada',
            );
            setUltimaEdicionCerrada(response.data.n_edicion ?? 0);
            setAnioUltimaEdicionCerrada(response.data.a_edicion ?? null);
        } catch (error) {
            console.error('❌ Error al cargar última edición cerrada:', error);
            setUltimaEdicionCerrada(0);
            setAnioUltimaEdicionCerrada(null);
        }
    }, []);

    const loadNumeroEdicion = useCallback(async () => {
        try {
            const response = await axios.get<{ n_edicion: number; a_edicion: number | null }>('/api/nro_edicion');
            setNumeroEdicion(response.data.n_edicion ?? 0);
            setAnioEdicion(response.data.a_edicion ?? null);
        } catch (error) {
            console.error('❌ Error al cargar número de edición:', error);
            setNumeroEdicion(0);
            setAnioEdicion(null);
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

    const pickDefaultEditionYear = useCallback((list: EdicionConResultados[]): number | null => {
        if (list.length === 0) {
            return null;
        }
        const closedWithResults = list.find((e) => !e.abierto);
        return closedWithResults?.a_edicion ?? list[0].a_edicion;
    }, []);

    const loadEdicionesConResultados = useCallback(async () => {
        try {
            const edResp = await axios.get<EdicionConResultados[]>('/api/ediciones-con-resultados');
            const list = Array.isArray(edResp.data) ? edResp.data : [];
            setEdicionesConResultados(list);
            return pickDefaultEditionYear(list);
        } catch (error) {
            console.error('❌ Error al cargar ediciones públicas:', error);
            setEdicionesConResultados([]);
            return null;
        }
    }, [pickDefaultEditionYear]);

    // Cargar todos los datos cuando hay un usuario logueado o siempre (para datos públicos)
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = getToken();
        let cancelled = false;

        (async () => {
            try {
                let year: number | null = null;
                const loadedYear = await loadEdicionesConResultados();
                if (!cancelled) {
                    year = loadedYear;
                    setAEdicionResultados(year);
                }

                await Promise.all([
                    fetchResultados(year),
                    fetchTotalPorCategoria(year),
                    loadNumeroEdicion(),
                    loadUltimaEdicionCerrada(),
                ]);

                void Promise.all([loadRecursos(), loadEstadoEdicion()]);

                if (cancelled) {
                    return;
                }

                if (userId && token) {
                    await loadEstudiantes();
                } else {
                    setIsInitialized(true);
                }
            } catch {
                if (!cancelled) {
                    setIsInitialized(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        fetchResultados,
        fetchTotalPorCategoria,
        loadEstudiantes,
        loadRecursos,
        loadNumeroEdicion,
        loadUltimaEdicionCerrada,
        loadEstadoEdicion,
        loadEdicionesConResultados,
    ]);

    // Función para refrescar estudiantes (útil después de agregar/eliminar)
    const refreshEstudiantes = useCallback(async (vista: EstudiantesVista = 'todos') => {
        await loadEstudiantes(vista);
    }, [loadEstudiantes]);

    // Función para refrescar resultados
    const refreshResultados = useCallback(async () => {
        await Promise.all([
            fetchResultados(aEdicionResultados),
            fetchTotalPorCategoria(aEdicionResultados),
        ]);
    }, [aEdicionResultados, fetchResultados, fetchTotalPorCategoria]);

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

    const refreshEdicionesPublicas = useCallback(async () => {
        try {
            const edResp = await axios.get<EdicionConResultados[]>('/api/ediciones-con-resultados');
            const list = Array.isArray(edResp.data) ? edResp.data : [];
            setEdicionesConResultados(list);
            const year = pickDefaultEditionYear(list);
            if (year != null) {
                setAEdicionResultados(year);
                await Promise.all([fetchResultados(year), fetchTotalPorCategoria(year)]);
            } else {
                setAEdicionResultados(null);
                await Promise.all([fetchResultados(null), fetchTotalPorCategoria(null)]);
            }
        } catch (error) {
            console.error('❌ Error al refrescar ediciones públicas:', error);
        }
        await Promise.all([loadNumeroEdicion(), loadUltimaEdicionCerrada(), loadEstadoEdicion()]);
    }, [
        pickDefaultEditionYear,
        fetchResultados,
        fetchTotalPorCategoria,
        loadNumeroEdicion,
        loadUltimaEdicionCerrada,
        loadEstadoEdicion,
    ]);

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
        setAnioEdicion(null);
        setUltimaEdicionCerrada(0);
        setAnioUltimaEdicionCerrada(null);
        setEstadoEdicion('Cerrado');
        setEdicionesConResultados([]);
        setAEdicionResultados(null);
        setIsInitialized(false);
    }, []);

    return (
        <DataContext.Provider
            value={{
                estudiantes,
                totalEstudiantes,
                resultados,
                totalPorCategoria,
                edicionesConResultados,
                aEdicionResultados,
                recursos,
                solicitudes,
                numeroEdicion,
                anioEdicion,
                ultimaEdicionCerrada,
                anioUltimaEdicionCerrada,
                estadoEdicion,
                isLoading,
                isInitialized,
                refreshEstudiantes,
                refreshResultados,
                selectEdicionResultados,
                refreshRecursos,
                refreshSolicitudes,
                refreshNumeroEdicion,
                refreshEdicionesPublicas,
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

