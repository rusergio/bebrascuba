import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import {
    getTerritorio,
    saveTerritorio,
    type TerritorioCoord,
} from '../lib/territorio';

export function useTerritorioCoord() {
    const [territorio, setTerritorio] = useState<TerritorioCoord | null>(() => getTerritorio());
    const [loading, setLoading] = useState(!getTerritorio());
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get<{
                success: boolean;
                territorio: TerritorioCoord | null;
                message?: string;
            }>('/api/mi-territorio');

            if (data.success && data.territorio) {
                saveTerritorio(data.territorio);
                setTerritorio(data.territorio);
            } else {
                saveTerritorio(null);
                setTerritorio(null);
                setError(data.message || 'Sin territorio asignado');
            }
        } catch {
            setError('No se pudo obtener el territorio del coordinador');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void cargar();
    }, [cargar]);

    return { territorio, loading, error, refresh: cargar };
}
