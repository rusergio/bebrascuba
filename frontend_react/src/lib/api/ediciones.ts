import axios from 'axios';

export interface VistaPreviaPublicacion {
    success: boolean;
    n_edicion: number;
    a_edicion: number;
    total_estudiantes: number;
    provincias_con_datos: number;
    filas_agregadas: number;
    ya_publicado: boolean;
}

export interface PublicarResultadosResponse {
    success: boolean;
    message: string;
    n_edicion: number;
    a_edicion: number;
    total_estudiantes: number;
    filas_insertadas: number;
}

export async function fetchVistaPreviaPublicacion(nEdicion: number) {
    const { data } = await axios.get<VistaPreviaPublicacion>(
        `/api/ediciones/${nEdicion}/vista-previa-publicacion`,
    );
    return data;
}

export async function publicarResultadosWeb(nEdicion: number) {
    const { data } = await axios.post<PublicarResultadosResponse>(
        `/api/ediciones/${nEdicion}/publicar-resultados-web`,
    );
    return data;
}
