import axios from 'axios';
import type {
    IntegracionHistoricoResponse,
    ListaResultadosResponse,
    ModificarPendientePayload,
    OficialesListaResponse,
    OficialesResumenProfesor,
    RevisionResumen,
} from '../../types/resultadosPendientes';

export type FiltroRevisionCoordinador =
    | 'todos'
    | 'preinscritos'
    | 'pendientes'
    | 'inconsistencias'
    | 'modificados-profesor'
    | 'aceptados'
    | 'insertados-historico'
    | 'pendientes-integracion'
    | 'oficiales';

const baseCoordinador = (edicion: number) => `/api/coordinador/resultados/edicion/${edicion}`;

export async function fetchRevisionResumen(edicion: number): Promise<RevisionResumen> {
    const { data } = await axios.get<RevisionResumen>(`${baseCoordinador(edicion)}/revision/resumen`);
    return data;
}

export async function fetchResultadosCoordinador(
    edicion: number,
    filtro: FiltroRevisionCoordinador,
): Promise<ListaResultadosResponse> {
    const path =
        filtro === 'todos'
            ? `${baseCoordinador(edicion)}/todos`
            : filtro === 'oficiales'
              ? `${baseCoordinador(edicion)}/oficiales`
              : `${baseCoordinador(edicion)}/${filtro}`;

    const { data } = await axios.get<ListaResultadosResponse>(path);
    return data;
}

export async function fetchDetalleResultado(id: number) {
    const { data } = await axios.get(`/api/coordinador/resultados/${id}/detalle`);
    return data;
}

export async function aceptarResultado(id: number) {
    const { data } = await axios.put(`/api/coordinador/resultados/${id}/aceptar`);
    return data;
}

export async function aceptarPreinscritos(edicion: number) {
    const { data } = await axios.put(`${baseCoordinador(edicion)}/aceptar-preinscritos`);
    return data;
}

export async function aceptarMasivo(ids: number[]) {
    const { data } = await axios.put('/api/coordinador/resultados/aceptar-masivo', { ids });
    return data;
}

export async function ajustarMedalla(id: number, medalla: string) {
    const { data } = await axios.put(`/api/coordinador/resultados/${id}/ajustar-medalla`, { medalla });
    return data;
}

export async function insertarHistorico(edicion: number): Promise<IntegracionHistoricoResponse> {
    const { data } = await axios.put<IntegracionHistoricoResponse>(
        `${baseCoordinador(edicion)}/insertar-historico`,
    );
    return data;
}

export interface RepararVinculosResponse {
    success: boolean;
    message: string;
    reparados: number;
    sin_vinculo: number;
    total_procesados: number;
    aceptados_sin_vinculo: number;
}

export async function repararVinculos(edicion: number): Promise<RepararVinculosResponse> {
    const { data } = await axios.put<RepararVinculosResponse>(
        `${baseCoordinador(edicion)}/reparar-vinculos`,
    );
    return data;
}

export interface AutoVincularExcelResponse {
    success: boolean;
    message: string;
    total: number;
    vinculados: number;
    preinscripciones_creadas: number;
    estudiantes_creados: number;
    sin_profesor: number;
    sin_escuela: number;
    sin_vinculo: number;
    listos_integracion: number;
    total_con_vinculo: number;
}

export async function autoVincularDesdeExcel(edicion: number): Promise<AutoVincularExcelResponse> {
    const { data } = await axios.put<AutoVincularExcelResponse>(
        `${baseCoordinador(edicion)}/auto-vincular-excel`,
    );
    return data;
}

export function getProfesorId(): number | null {
    const tableId = localStorage.getItem('profesorTableId');
    if (tableId) return Number(tableId);
    const legacy = localStorage.getItem('profesorId');
    return legacy ? Number(legacy) : null;
}

const baseProfesor = (edicion: number, idProfesor: number) =>
    `/api/profesor/resultados/edicion/${edicion}/profesor/${idProfesor}`;

export async function fetchPendientesProfesor(edicion: number, idProfesor: number) {
    const { data } = await axios.get<ListaResultadosResponse>(`${baseProfesor(edicion, idProfesor)}/pendientes`);
    return data;
}

export async function fetchDetallePendienteProfesor(idProfesor: number, id: number) {
    const { data } = await axios.get(`/api/profesor/resultados/profesor/${idProfesor}/${id}/detalle-pendiente`);
    return data;
}

export async function modificarPendienteProfesor(id: number, payload: ModificarPendientePayload) {
    const { data } = await axios.put(`/api/profesor/resultados/${id}/modificar-pendiente`, payload);
    return data;
}

export async function fetchOficialesProfesor(edicion: number, idProfesor: number) {
    const { data } = await axios.get<OficialesListaResponse>(`${baseProfesor(edicion, idProfesor)}/oficiales`);
    return data;
}

export async function fetchOficialesResumenProfesor(edicion: number, idProfesor: number) {
    const { data } = await axios.get<OficialesResumenProfesor>(
        `${baseProfesor(edicion, idProfesor)}/oficiales/resumen`,
    );
    return data;
}

export async function fetchDetalleOficialProfesor(idProfesor: number, idEstudianteEscuela: number) {
    const { data } = await axios.get(
        `/api/profesor/resultados/profesor/${idProfesor}/oficial/${idEstudianteEscuela}/detalle`,
    );
    return data;
}
