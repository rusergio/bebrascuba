import { Container, Title, Button, Group, Grid, Text, Card, MultiSelect, Flex, Table, ScrollArea, Stack } from '@mantine/core';
import { Fieldset } from '@mantine/core';
import { IconTableFilled, IconFileDownload, IconFileSpreadsheet } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import * as XLSX from 'xlsx';
import { useComputedColorScheme } from '@mantine/core';

axios.defaults.baseURL = 'http://localhost:8000';

interface Estudiante {
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

interface GrupoEstudiantes {
    key: string;
    label: string;
    estudiantes: Estudiante[];
}

const columnasDisponibles = [
    { value: 'Nombre', label: 'Nombre' },
    { value: 'Escuela', label: 'Escuela' },
    { value: 'Grado', label: 'Grado' },
];

const opcionesAgrupacion = [
    { value: 'categoria', label: 'Categoría' },
    { value: 'sexo', label: 'Sexo' },
];

const normalizarCategoria = (categoria: string | null) => {
    const c = (categoria ?? '').trim();
    return c === '' || c === '0' ? 'Sin categoría' : c;
};

const normalizarSexo = (sexo: string | null) => {
    const s = (sexo ?? '').trim();
    return s === '' ? 'Sin especificar' : s;
};

const uniqueById = (items: Estudiante[]) => {
    const map = new Map<number, Estudiante>();
    items.forEach((it) => {
        if (!map.has(it.id)) map.set(it.id, it);
    });
    return Array.from(map.values());
};

const normalizarGrado = (grado: number | null | undefined, categoria?: string | null) => {
    if (grado != null && grado > 0) return String(grado);

    const c = (categoria ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    const rangoPorCategoria: Record<string, string> = {
        superpeque: '1-2',
        peque: '3-4',
        benjamin: '5-6',
        cadete: '7-8',
        junior: '9-10',
        senior: '11-12',
    };

    if (c && c !== 'nocategoria' && c !== 'sin categoria' && rangoPorCategoria[c]) {
        return rangoPorCategoria[c];
    }

    return 'Sin grado';
};

export function P_GenerarListaVille() {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loading, setLoading] = useState(false);
    const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<string[]>(['Nombre', 'Escuela', 'Grado']);
    const [agruparPor, setAgruparPor] = useState<string[]>([]);
    const [tablasGeneradas, setTablasGeneradas] = useState<GrupoEstudiantes[]>([]);
    const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const tableTextColor = colorScheme === 'dark' ? '#e5e7eb' : '#111827';
    const tableHeaderColor = colorScheme === 'dark' ? '#f9fafb' : '#0f172a';

    // IMPORTANTE: este endpoint espera user_id (tabla users), no profesor_id.
    // Usamos userId como principal para evitar mezclar estudiantes de otro profesor.
    const profesorId = localStorage.getItem('userId') || localStorage.getItem('profesorId');

    useEffect(() => {
        if (profesorId) {
            cargarEstudiantes();
        }
    }, [profesorId]);

    const cargarEstudiantes = async () => {
        if (!profesorId) {
            notifications.show({
                title: 'Error',
                message: 'No se encontró el ID del profesor',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/api/listar-estudiantes/${profesorId}`);
            if (response.data.success && response.data.estudiantes) {
                setEstudiantes(response.data.estudiantes);
            } else {
                notifications.show({
                    title: 'Advertencia',
                    message: 'No se encontraron estudiantes',
                    color: 'yellow',
                });
            }
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Error al cargar estudiantes',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para generar las tablas agrupadas
    const generarTablas = () => {
        if (estudiantes.length === 0) {
            notifications.show({
                title: 'Advertencia',
                message: 'No hay estudiantes para generar tablas',
                color: 'yellow',
            });
            return;
        }

        if (columnasSeleccionadas.length === 0) {
            notifications.show({
                title: 'Error',
                message: 'Debe seleccionar al menos una columna',
                color: 'red',
            });
            return;
        }

        const estudiantesUnicos = uniqueById(estudiantes);
        const agruparPorCategoria = agruparPor.includes('categoria');
        const agruparPorSexo = agruparPor.includes('sexo');

        if (!agruparPorCategoria && !agruparPorSexo) {
            // Si no hay agrupación, mostrar todos los estudiantes en una sola tabla
            setTablasGeneradas([{
                key: 'todos',
                label: 'Todos los estudiantes',
                estudiantes: estudiantesUnicos.sort((a, b) => {
                    // Ordenar por categoría, grado y nombre
                    const categoriaA = normalizarCategoria(a.categoria);
                    const categoriaB = normalizarCategoria(b.categoria);
                    if (categoriaA !== categoriaB) {
                        return categoriaA.localeCompare(categoriaB);
                    }
                    const gradoA = a.grado ?? Number.MAX_SAFE_INTEGER;
                    const gradoB = b.grado ?? Number.MAX_SAFE_INTEGER;
                    if (gradoA !== gradoB) {
                        return gradoA - gradoB;
                    }
                    return a.nombre_estudiante.localeCompare(b.nombre_estudiante);
                })
            }]);
            notifications.show({
                title: 'Tabla generada',
                message: `Se generó 1 tabla con ${estudiantesUnicos.length} estudiantes (sin duplicados).`,
                color: 'teal',
            });
            return;
        }

        // Crear mapa para agrupar estudiantes
        const grupos = new Map<string, { label: string; estudiantes: Estudiante[] }>();

        estudiantesUnicos.forEach(estudiante => {
            let key = '';
            let label = '';

            if (agruparPorCategoria && agruparPorSexo) {
                // Agrupar por categoría y sexo
                const categoria = normalizarCategoria(estudiante.categoria);
                const sexo = normalizarSexo(estudiante.sexo);
                key = `${categoria}_${sexo}`;
                label = `${categoria} - ${sexo}`;
            } else if (agruparPorCategoria) {
                // Agrupar solo por categoría
                const categoria = normalizarCategoria(estudiante.categoria);
                key = categoria;
                label = categoria;
            } else if (agruparPorSexo) {
                // Agrupar solo por sexo
                const sexo = normalizarSexo(estudiante.sexo);
                key = sexo;
                label = sexo;
            }

            if (!grupos.has(key)) {
                grupos.set(key, { label, estudiantes: [] });
            }
            grupos.get(key)!.estudiantes.push(estudiante);
        });

        // Convertir a array y ordenar
        const gruposArray: GrupoEstudiantes[] = Array.from(grupos.entries()).map(([key, grupo]) => ({
            key,
            label: grupo.label,
            estudiantes: grupo.estudiantes.sort((a, b) => {
                // Ordenar por grado (ascendente), luego por nombre
                const gradoA = a.grado ?? Number.MAX_SAFE_INTEGER;
                const gradoB = b.grado ?? Number.MAX_SAFE_INTEGER;
                if (gradoA !== gradoB) {
                    return gradoA - gradoB;
                }
                return a.nombre_estudiante.localeCompare(b.nombre_estudiante);
            })
        }));

        // Ordenar grupos por categoría (si aplica) y luego por sexo
        gruposArray.sort((a, b) => {
            const categoriaA = normalizarCategoria(a.estudiantes[0]?.categoria || '');
            const categoriaB = normalizarCategoria(b.estudiantes[0]?.categoria || '');
            if (categoriaA !== categoriaB) {
                return categoriaA.localeCompare(categoriaB);
            }
            const sexoA = normalizarSexo(a.estudiantes[0]?.sexo || '');
            const sexoB = normalizarSexo(b.estudiantes[0]?.sexo || '');
            return sexoA.localeCompare(sexoB);
        });

        setTablasGeneradas(gruposArray);
        notifications.show({
            title: 'Tablas actualizadas',
            message: `Se generaron ${gruposArray.length} tabla(s) con ${estudiantesUnicos.length} estudiantes sin duplicados.`,
            color: 'teal',
        });
    };

    // Función para exportar a Excel
    const exportarExcel = () => {
        if (tablasGeneradas.length === 0) {
            notifications.show({
                title: 'Advertencia',
                message: 'No hay tablas generadas para exportar',
                color: 'yellow',
            });
            return;
        }

        const workbook = XLSX.utils.book_new();

        tablasGeneradas.forEach((grupo) => {
            const datos = grupo.estudiantes.map(est => {
                const fila: any = {};
                columnasSeleccionadas.forEach(col => {
                    const colKey = col.trim();
                    switch (colKey) {
                        case 'Nombre':
                            fila['Nombre'] = est.nombre_estudiante;
                            break;
                        case 'Escuela':
                            fila['Escuela'] = est.nombre_escuela || '-';
                            break;
                        case 'Grado':
                            fila['Grado'] = normalizarGrado(est.grado, est.categoria);
                            break;
                    }
                });
                return fila;
            });

            const worksheet = XLSX.utils.json_to_sheet(datos);
            const nombreHoja = grupo.label.length > 31 ? grupo.label.substring(0, 31) : grupo.label;
            XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja || grupo.key);
        });

        const nombreArchivo = `Lista_Ville_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, nombreArchivo);

        notifications.show({
            title: 'Éxito',
            message: 'Archivo Excel exportado correctamente',
            color: 'teal',
        });
    };

    // Función para exportar a CSV
    const exportarCSV = () => {
        if (tablasGeneradas.length === 0) {
            notifications.show({
                title: 'Advertencia',
                message: 'No hay tablas generadas para exportar',
                color: 'yellow',
            });
            return;
        }

        let csvContent = '';

        tablasGeneradas.forEach((grupo) => {
            csvContent += `\n=== ${grupo.label} ===\n`;
            
            // Encabezados
            csvContent += columnasSeleccionadas.join(',') + '\n';
            
            // Datos
            grupo.estudiantes.forEach(est => {
                const fila: string[] = [];
                columnasSeleccionadas.forEach(col => {
                    const colKey = col.trim();
                    switch (colKey) {
                        case 'Nombre':
                            fila.push(`"${est.nombre_estudiante}"`);
                            break;
                        case 'Escuela':
                            fila.push(`"${est.nombre_escuela || '-'}"`);
                            break;
                        case 'Grado':
                            fila.push(`${normalizarGrado(est.grado, est.categoria)}`);
                            break;
                    }
                });
                csvContent += fila.join(',') + '\n';
            });
            
            csvContent += '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Lista_Ville_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        notifications.show({
            title: 'Éxito',
            message: 'Archivo CSV exportado correctamente',
            color: 'teal',
        });
    };

    return (
        <Container size='lg' mt={40}>
            <Title order={1} ta="center" mb='sm'>
                Generar lista para Ville
            </Title>
            <Fieldset mt={20} legend="Configuración">
                <Card withBorder mt={'md'}>
                    <Title order={3}>Configurar datos para examen</Title>
                    <Text c="dimmed">Configure los datos según el orden de la organización internacional</Text>
                    <Grid mt={15}>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <MultiSelect
                                label="Seleccione las columnas"
                                placeholder="Seleccione las columnas a generar"
                                data={columnasDisponibles}
                                value={columnasSeleccionadas}
                                onChange={setColumnasSeleccionadas}
                                clearable
                                size="sm"
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Flex
                                mih={50}
                                gap="md"
                                justify="flex-start"
                                align="flex-end"
                                direction="column"
                                wrap="nowrap"
                            >
                                <MultiSelect
                                    label="Seleccione agrupación"
                                    data={opcionesAgrupacion}
                                    value={agruparPor}
                                    onChange={setAgruparPor}
                                    placeholder="Sin agrupación"
                                    clearable
                                    size="sm"
                                    style={{ minWidth: 220, width: '100%' }}
                                />
                            </Flex>
                        </Grid.Col>
                    </Grid>
                    <Group mt="md" justify="flex-start" wrap="wrap">
                        <Button
                            variant="filled"
                            rightSection={<IconTableFilled size={16} />}
                            onClick={generarTablas}
                            loading={loading}
                        >
                            Generar tabla
                        </Button>
                        <Button
                            variant="light"
                            color="gray"
                            onClick={() => setTablasGeneradas([])}
                        >
                            Limpiar
                        </Button>
                    </Group>
                </Card>

                {tablasGeneradas.length > 0 && (
                    <Card withBorder mt={10}>
                        <Group justify="space-between" mb="md" wrap="wrap" gap="md">
                            <Title order={3}>Tablas Generadas</Title>
                            <Group gap="xs" wrap="wrap">
                                <Button
                                    variant="light"
                                    leftSection={<IconFileSpreadsheet size={16} />}
                                    onClick={exportarExcel}
                                    size="sm"
                                >
                                    <Text span hidden={{ base: true, sm: false }}>Exportar </Text>Excel
                                </Button>
                                <Button
                                    variant="light"
                                    leftSection={<IconFileDownload size={16} />}
                                    onClick={exportarCSV}
                                    size="sm"
                                >
                                    <Text span hidden={{ base: true, sm: false }}>Exportar </Text>CSV
                                </Button>
                            </Group>
                        </Group>
                        <ScrollArea>
                            <Stack gap="xl">
                                {tablasGeneradas.map((grupo) => (
                                    <Card key={grupo.key} withBorder p="md">
                                        <Title order={4} mb="md">{grupo.label} ({grupo.estudiantes.length})</Title>
                                        <Table.ScrollContainer minWidth={500} type="native">
                                            <Table stickyHeader stickyHeaderOffset={60} highlightOnHover>
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        {columnasSeleccionadas.map((col) => (
                                                            <Table.Th key={col} style={{ padding: '12px 16px', color: tableHeaderColor }}>{col}</Table.Th>
                                                        ))}
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {grupo.estudiantes.map((estudiante) => (
                                                        <Table.Tr key={`${grupo.key}-${estudiante.id}`}>
                                                            {columnasSeleccionadas.map((col) => {
                                                                let contenido = '';
                                                                const colKey = col.trim();
                                                                switch (colKey) {
                                                                    case 'Nombre':
                                                                        contenido = estudiante.nombre_estudiante;
                                                                        break;
                                                                    case 'Escuela':
                                                                        contenido = estudiante.nombre_escuela || '-';
                                                                        break;
                                                                    case 'Grado':
                                                                        contenido = normalizarGrado(estudiante.grado, estudiante.categoria);
                                                                        break;
                                                                }
                                                                return (
                                                                    <Table.Td key={col} style={{ padding: '12px 16px', color: tableTextColor }}>
                                                                        {contenido && contenido.trim() !== '' ? contenido : '—'}
                                                                    </Table.Td>
                                                                );
                                                            })}
                                                        </Table.Tr>
                                                    ))}
                                                </Table.Tbody>
                                            </Table>
                                        </Table.ScrollContainer>
                                    </Card>
                                ))}
                            </Stack>
                        </ScrollArea>
                    </Card>
                )}
            </Fieldset>
        </Container>
    );
}
