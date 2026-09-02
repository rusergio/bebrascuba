/** Flujo oficial de resultados BebrasCuba (coordinador → histórico → profesor). */

export type ActorFlujo = 'sistema' | 'coordinador' | 'profesor';

export interface PasoFlujoResultados {
    num: number;
    titulo: string;
    descripcion: string;
    actor: ActorFlujo;
    /** Pantalla relacionada en la app, si aplica */
    ruta?: string;
    /** Clave técnica opcional */
    tecnico?: string;
}

export const FLUJO_RESULTADOS: PasoFlujoResultados[] = [
    {
        num: 1,
        titulo: 'Importar Excel de resultados',
        descripcion: 'El Coordinador Nacional sube el archivo Excel de Ville.',
        actor: 'coordinador',
        ruta: '/coordinador/importar-resultados',
    },
    {
        num: 2,
        titulo: 'Leer y normalizar hojas',
        descripcion: 'El sistema lee las hojas del Excel y normaliza los encabezados.',
        actor: 'sistema',
    },
    {
        num: 3,
        titulo: 'Guardar en resultados_pendientes',
        descripcion: 'Cada fila válida se guarda en la tabla resultados_pendientes (zona de revisión).',
        actor: 'sistema',
        tecnico: 'resultados_pendientes',
    },
    {
        num: 4,
        titulo: 'Validar preinscripción',
        descripcion:
            'Se comprueba si el estudiante estaba preinscrito por el profesor correspondiente en la edición activa.',
        actor: 'sistema',
    },
    {
        num: 5,
        titulo: 'Clasificar como preinscrito',
        descripcion:
            'Si coinciden estudiante, profesor, escuela y edición, el registro queda como preinscrito.',
        actor: 'sistema',
        tecnico: 'preinscrito',
    },
    {
        num: 6,
        titulo: 'Clasificar excepciones',
        descripcion:
            'Si hay problemas de vínculo o datos, queda como pendiente_no_preinscrito o inconsistencia.',
        actor: 'sistema',
        tecnico: 'pendiente_no_preinscrito · inconsistencia',
    },
    {
        num: 7,
        titulo: 'Calcular medallas',
        descripcion: 'Se calculan las medallas sobre los resultados importados en resultados_pendientes.',
        actor: 'sistema',
    },
    {
        num: 8,
        titulo: 'Revisión e integración al histórico',
        descripcion:
            'El coordinador revisa, acepta, ajusta medallas si hace falta e integra los válidos a estudiante_escuela.',
        actor: 'coordinador',
        ruta: '/coordinador/resultados-pendientes',
        tecnico: 'estudiante_escuela',
    },
    {
        num: 9,
        titulo: 'Profesor revisa pendientes',
        descripcion:
            'El profesor solo ve desde resultados_pendientes los casos que debe corregir o completar.',
        actor: 'profesor',
        ruta: '/profesor/resultados?tab=pendientes',
        tecnico: 'resultados_pendientes',
    },
    {
        num: 10,
        titulo: 'Resultados oficiales del profesor',
        descripcion:
            'Los resultados oficiales del profesor se leen desde estudiante_escuela, no desde resultados_pendientes.',
        actor: 'profesor',
        ruta: '/profesor/resultados?tab=oficiales',
        tecnico: 'estudiante_escuela',
    },
];

/** Pasos automáticos del sistema tras importar (2–7). */
export const PASOS_SISTEMA_IMPORT = FLUJO_RESULTADOS.filter((p) => p.num >= 2 && p.num <= 7);

/** Pasos de acción del coordinador en la UI (agrupación operativa). */
export const PASOS_UI_COORDINADOR = [
    {
        key: 'importar',
        label: 'Importar y aceptar preinscritos',
        pasos: [1, 5, 7] as const,
        desc: 'Excel → resultados_pendientes → preinscritos OK',
        ruta: '/coordinador/importar-resultados',
    },
    {
        key: 'excepciones',
        label: 'Revisar excepciones',
        pasos: [6, 8] as const,
        desc: 'No preinscritos, inconsistencias, correcciones de profesor',
        ruta: '/coordinador/resultados-pendientes?paso=2',
    },
    {
        key: 'historico',
        label: 'Integrar al histórico',
        pasos: [8, 10] as const,
        desc: 'Aceptados → estudiante_escuela (oficial)',
        ruta: '/coordinador/resultados-pendientes?paso=3',
    },
] as const;

export const ESTADO_VALIDACION_LABELS: Record<string, string> = {
    preinscrito: 'Preinscrito (paso 5)',
    pendiente_no_preinscrito: 'No preinscrito (paso 6)',
    inconsistencia: 'Inconsistencia (paso 6)',
    modificado_profesor: 'Corregido por profesor (paso 9)',
    aceptado_coordinador: 'Aceptado por coordinador (paso 8)',
    insertado_historico: 'En histórico oficial (paso 8→10)',
};

export function labelEstadoValidacion(estado: string): string {
    return ESTADO_VALIDACION_LABELS[estado] ?? estado;
}
