import axios from 'axios';

export async function aceptarSolicitudProfesor(profesorId: number) {
    const { data } = await axios.put(`/api/aceptar-solicitud/${profesorId}`);
    return data;
}

export async function aceptarSolicitudesProfesor(ids: number[]) {
    for (const id of ids) {
        await aceptarSolicitudProfesor(id);
    }
}

export async function validarEscuela(escuelaId: number) {
    const { data } = await axios.put(`/api/escuelas/${escuelaId}/validar`);
    return data;
}
