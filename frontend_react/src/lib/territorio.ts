export interface TerritorioCoord {
    provincia_id: number;
    provincia_codigo: string | number;
    provincia_nombre: string;
    municipio_id: number | null;
    municipio_codigo: string | number | null;
    municipio_nombre: string | null;
    edicion_id: number;
    ambito: 'provincial' | 'municipal';
}

const TERRITORIO_KEY = 'userTerritorio';

export function saveTerritorio(territorio: TerritorioCoord | null | undefined): void {
    if (!territorio) {
        localStorage.removeItem(TERRITORIO_KEY);
        return;
    }
    localStorage.setItem(TERRITORIO_KEY, JSON.stringify(territorio));
}

export function getTerritorio(): TerritorioCoord | null {
    const raw = localStorage.getItem(TERRITORIO_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as TerritorioCoord;
    } catch {
        return null;
    }
}

export function clearTerritorio(): void {
    localStorage.removeItem(TERRITORIO_KEY);
}
