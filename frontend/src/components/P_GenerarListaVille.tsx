import { Container, Title, Button, Group, Grid, Text, Card, Checkbox, MultiSelect, Flex, Table, ScrollArea, Stack } from '@mantine/core';
import { Fieldset } from '@mantine/core';
import { IconTableFilled, IconFileDownload, IconFileSpreadsheet } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import * as XLSX from 'xlsx';

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

export function P_GenerarListaVille() {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loading, setLoading] = useState(false);
    const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<string[]>(['Nombre', 'Escuela', 'Grado']);
    const [agruparPorCategoria, setAgruparPorCategoria] = useState(false);
    const [agruparPorSexo, setAgruparPorSexo] = useState(false);
    const [tablasGeneradas, setTablasGeneradas] = useState<GrupoEstudiantes[]>([]);

    // Obtener el ID del profesor del localStorage
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

        if (!agruparPorCategoria && !agruparPorSexo) {
            // Si no hay agrupación, mostrar todos los estudiantes en una sola tabla
            setTablasGeneradas([{
                key: 'todos',
                label: 'Todos los estudiantes',
                estudiantes: estudiantes.sort((a, b) => {
                    // Ordenar por categoría primero, luego por nombre
                    if (a.categoria && b.categoria && a.categoria !== b.categoria) {
                        return a.categoria.localeCompare(b.categoria);
                    }
                    return a.nombre_estudiante.localeCompare(b.nombre_estudiante);
                })
            }]);
            return;
        }

        // Crear mapa para agrupar estudiantes
        const grupos = new Map<string, { label: string; estudiantes: Estudiante[] }>();

        estudiantes.forEach(estudiante => {
            let key = '';
            let label = '';

            if (agruparPorCategoria && agruparPorSexo) {
                // Agrupar por categoría y sexo
                const categoria = estudiante.categoria || 'Sin categoría';
                const sexo = estudiante.sexo || 'Sin especificar';
                key = `${categoria}_${sexo}`;
                label = `${categoria} - ${sexo}`;
            } else if (agruparPorCategoria) {
                // Agrupar solo por categoría
                const categoria = estudiante.categoria || 'Sin categoría';
                key = categoria;
                label = categoria;
            } else if (agruparPorSexo) {
                // Agrupar solo por sexo
                const sexo = estudiante.sexo || 'Sin especificar';
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
                if (a.grado && b.grado && a.grado !== b.grado) {
                    return a.grado - b.grado;
                }
                return a.nombre_estudiante.localeCompare(b.nombre_estudiante);
            })
        }));

        // Ordenar grupos por categoría (si aplica) y luego por sexo
        gruposArray.sort((a, b) => {
            const categoriaA = a.estudiantes[0]?.categoria || '';
            const categoriaB = b.estudiantes[0]?.categoria || '';
            if (categoriaA !== categoriaB) {
                return categoriaA.localeCompare(categoriaB);
            }
            const sexoA = a.estudiantes[0]?.sexo || '';
            const sexoB = b.estudiantes[0]?.sexo || '';
            return sexoA.localeCompare(sexoB);
        });

        setTablasGeneradas(gruposArray);
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
                    switch (col) {
                        case 'Nombre':
                            fila['Nombre'] = est.nombre_estudiante;
                            break;
                        case 'Escuela':
                            fila['Escuela'] = est.nombre_escuela || '-';
                            break;
                        case 'Grado':
                            fila['Grado'] = est.grado || '-';
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
                    switch (col) {
                        case 'Nombre':
                            fila.push(`"${est.nombre_estudiante}"`);
                            break;
                        case 'Escuela':
                            fila.push(`"${est.nombre_escuela || '-'}"`);
                            break;
                        case 'Grado':
                            fila.push(`${est.grado || '-'}`);
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
                        <Grid.Col span={5}>
                            <MultiSelect
                                label="Seleccione las columnas"
                                placeholder="Seleccione las columnas a generar"
                                data={columnasDisponibles}
                                value={columnasSeleccionadas}
                                onChange={setColumnasSeleccionadas}
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={7}>
                            <Text fw={400} ml={30} size="sm" mb="xs">Agrupar por ...</Text>
                            <Flex
                                mih={50}
                                gap="md"
                                justify="flex-start"
                                align="flex-start"
                                direction="row"
                                wrap="wrap"
                            >
                                <Checkbox
                                    ml={20}
                                    label="Categoría"
                                    mt={10}
                                    checked={agruparPorCategoria}
                                    onChange={(e) => setAgruparPorCategoria(e.currentTarget.checked)}
                                />
                                <Checkbox
                                    label="Sexo"
                                    mt={10}
                                    checked={agruparPorSexo}
                                    onChange={(e) => setAgruparPorSexo(e.currentTarget.checked)}
                                />
                                <Group mt={5} ml={20}>
                                    <Button
                                        variant="filled"
                                        rightSection={<IconTableFilled size={16} />}
                                        onClick={generarTablas}
                                        loading={loading}
                                    >
                                        Generar tabla
                                    </Button>
                                </Group>
                            </Flex>
                        </Grid.Col>
                    </Grid>
                </Card>

                {tablasGeneradas.length > 0 && (
                    <Card withBorder mt={10}>
                        <Group justify="space-between" mb="md">
                            <Title order={3}>Tablas Generadas</Title>
                            <Group>
                                <Button
                                    variant="light"
                                    leftSection={<IconFileSpreadsheet size={16} />}
                                    onClick={exportarExcel}
                                >
                                    Exportar Excel
                                </Button>
                                <Button
                                    variant="light"
                                    leftSection={<IconFileDownload size={16} />}
                                    onClick={exportarCSV}
                                >
                                    Exportar CSV
                                </Button>
                            </Group>
                        </Group>
                        <ScrollArea>
                            <Stack gap="xl">
                                {tablasGeneradas.map((grupo) => (
                                    <Card key={grupo.key} withBorder p="md">
                                        <Title order={4} mb="md">{grupo.label}</Title>
                                        <Table stickyHeader stickyHeaderOffset={60} highlightOnHover>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    {columnasSeleccionadas.map((col) => (
                                                        <Table.Th key={col} style={{ padding: '12px 16px' }}>{col}</Table.Th>
                                                    ))}
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {grupo.estudiantes.map((estudiante) => (
                                                    <Table.Tr key={estudiante.id}>
                                                        {columnasSeleccionadas.map((col) => {
                                                            let contenido = '';
                                                            switch (col) {
                                                                case 'Nombre':
                                                                    contenido = estudiante.nombre_estudiante;
                                                                    break;
                                                                case 'Escuela':
                                                                    contenido = estudiante.nombre_escuela || '-';
                                                                    break;
                                                                case 'Grado':
                                                                    contenido = estudiante.grado?.toString() || '-';
                                                                    break;
                                                            }
                                                            return <Table.Td key={col} style={{ padding: '12px 16px' }}>{contenido}</Table.Td>;
                                                        })}
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
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
