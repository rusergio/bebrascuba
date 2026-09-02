import axios from 'axios';

export async function calcularMedallasPendientes(edicion: number) {
    const { data } = await axios.get(`/api/medallas/edicion/${edicion}/calcular-pendientes`);
    return data;
}
