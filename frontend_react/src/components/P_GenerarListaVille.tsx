import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container,
    Title,
    Button,
    Group,
    Grid,
    Text,
    Paper,
    MultiSelect,
    Table,
    ScrollArea,
    Stack,
    Badge,
    Divider,
    ThemeIcon,
    SimpleGrid,
    Center,
    Box,
} from '@mantine/core';
import {
    IconTableFilled,
    IconFileDownload,
    IconFileSpreadsheet,
    IconRefresh,
    IconListDetails,
    IconColumns,
    IconCategory,
    IconUsers,
    IconFileExport,
} from '@tabler/icons-react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import * as XLSX from '@e965/xlsx';
import { useDataContext } from '../context/DataContext';
import { AnimatedSection } from './AnimatedSection';
import animClasses from '../styles/animations.module.css';

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

    const c = (categoria ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
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

const obtenerValorColumna = (estudiante: Estudiante, col: string) => {
    const colKey = col.trim();
    switch (colKey) {
        case 'Nombre':
            return estudiante.nombre_estudiante;
        case 'Escuela':
            return estudiante.nombre_escuela || '—';
        case 'Grado':
            return normalizarGrado(estudiante.grado, estudiante.categoria);
        default:
            return '—';
    }
};

export function P_GenerarListaVille() {
    const { estudiantes: estudiantesContexto, refreshEstudiantes, isLoading: contextLoading } =
        useDataContext();
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loading, setLoading] = useState(false);
    const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<string[]>([
        'Nombre',
        'Escuela',
        'Grado',
    ]);
    const [agruparPor, setAgruparPor] = useState<string[]>([]);
    const [tablasGeneradas, setTablasGeneradas] = useState<GrupoEstudiantes[]>([]);

    const userId = localStorage.getItem('userId');
    const isBusy = loading || contextLoading;

    const totalFilasExport = useMemo(
        () => tablasGeneradas.reduce((acc, g) => acc + g.estudiantes.length, 0),
        [tablasGeneradas],
    );

    const cargarEstudiantes = useCallback(async () => {
        if (!userId) {
            notifications.show({
                title: 'Error',
                message: 'No se encontró el ID del usuario. Inicia sesión nuevamente.',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        try {
            await refreshEstudiantes();
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Error al cargar estudiantes'
                : 'Error al cargar estudiantes';
            notifications.show({ title: 'Error', message, color: 'red' });
        } finally {
            setLoading(false);
        }
    }, [userId, refreshEstudiantes]);

    useEffect(() => {
        if (userId) void cargarEstudiantes();
    }, [userId, cargarEstudiantes]);

    useEffect(() => {
        setEstudiantes(estudiantesContexto);
    }, [estudiantesContexto]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible' && userId) void cargarEstudiantes();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [userId, cargarEstudiantes]);

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
            setTablasGeneradas([
                {
                    key: 'todos',
                    label: 'Todos los estudiantes',
                    estudiantes: estudiantesUnicos.sort((a, b) => {
                        const categoriaA = normalizarCategoria(a.categoria);
                        const categoriaB = normalizarCategoria(b.categoria);
                        if (categoriaA !== categoriaB) return categoriaA.localeCompare(categoriaB);
                        const gradoA = a.grado ?? Number.MAX_SAFE_INTEGER;
                        const gradoB = b.grado ?? Number.MAX_SAFE_INTEGER;
                        if (gradoA !== gradoB) return gradoA - gradoB;
                        return a.nombre_estudiante.localeCompare(b.nombre_estudiante);
                    }),
                },
            ]);
            notifications.show({
                title: 'Tabla generada',
                message: `Se generó 1 tabla con ${estudiantesUnicos.length} estudiantes (sin duplicados).`,
                color: 'teal',
            });
            return;
        }

        const grupos = new Map<string, { label: string; estudiantes: Estudiante[] }>();

        estudiantesUnicos.forEach((estudiante) => {
            let key = '';
            let label = '';

            if (agruparPorCategoria && agruparPorSexo) {
                const categoria = normalizarCategoria(estudiante.categoria);
                const sexo = normalizarSexo(estudiante.sexo);
                key = `${categoria}_${sexo}`;
                label = `${categoria} — ${sexo}`;
            } else if (agruparPorCategoria) {
                key = normalizarCategoria(estudiante.categoria);
                label = key;
            } else if (agruparPorSexo) {
                key = normalizarSexo(estudiante.sexo);
                label = key;
            }

            if (!grupos.has(key)) grupos.set(key, { label, estudiantes: [] });
            grupos.get(key)!.estudiantes.push(estudiante);
        });

        const gruposArray: GrupoEstudiantes[] = Array.from(grupos.entries()).map(([key, grupo]) => ({
            key,
            label: grupo.label,
            estudiantes: grupo.estudiantes.sort((a, b) => {
                const gradoA = a.grado ?? Number.MAX_SAFE_INTEGER;
                const gradoB = b.grado ?? Number.MAX_SAFE_INTEGER;
                if (gradoA !== gradoB) return gradoA - gradoB;
                return a.nombre_estudiante.localeCompare(b.nombre_estudiante);
            }),
        }));

        gruposArray.sort((a, b) => {
            const categoriaA = normalizarCategoria(a.estudiantes[0]?.categoria || '');
            const categoriaB = normalizarCategoria(b.estudiantes[0]?.categoria || '');
            if (categoriaA !== categoriaB) return categoriaA.localeCompare(categoriaB);
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
            const datos = grupo.estudiantes.map((est) => {
                const fila: Record<string, string> = {};
                columnasSeleccionadas.forEach((col) => {
                    fila[col.trim()] = obtenerValorColumna(est, col);
                });
                return fila;
            });

            const worksheet = XLSX.utils.json_to_sheet(datos);
            const nombreHoja = grupo.label.length > 31 ? grupo.label.substring(0, 31) : grupo.label;
            XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja || grupo.key);
        });

        XLSX.writeFile(workbook, `Lista_Ville_${new Date().toISOString().split('T')[0]}.xlsx`);

        notifications.show({
            title: 'Éxito',
            message: 'Archivo Excel exportado correctamente',
            color: 'teal',
        });
    };

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
            csvContent += columnasSeleccionadas.join(',') + '\n';

            grupo.estudiantes.forEach((est) => {
                const fila = columnasSeleccionadas.map((col) => {
                    const valor = obtenerValorColumna(est, col);
                    return col.trim() === 'Grado' ? valor : `"${valor}"`;
                });
                csvContent += fila.join(',') + '\n';
            });

            csvContent += '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Lista_Ville_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);

        notifications.show({
            title: 'Éxito',
            message: 'Archivo CSV exportado correctamente',
            color: 'teal',
        });
    };

    return (
        <Container size="xl" py="md">
            <AnimatedSection variant="fadeIn" delay={0}>
                <Paper
                    radius="lg"
                    p="xl"
                    mb="md"
                    style={{
                        background:
                            'linear-gradient(120deg, var(--mantine-color-teal-7), var(--mantine-color-cyan-6), var(--mantine-color-blue-5))',
                    }}
                >
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
                        <Stack gap="xs" maw={560}>
                            <Group gap="sm">
                                <ThemeIcon size={44} radius="md" variant="white" color="teal">
                                    <IconFileExport size={24} />
                                </ThemeIcon>
                                <div>
                                    <Title order={2} c="white">
                                        Generar lista para Ville
                                    </Title>
                                    <Text c="white" opacity={0.9} size="sm" mt={4}>
                                        Configura columnas y agrupación, genera la vista previa y exporta
                                        en Excel o CSV según el formato internacional.
                                    </Text>
                                </div>
                            </Group>
                        </Stack>
                        <Group gap="xs">
                            <Badge size="lg" variant="white" color="teal" leftSection={<IconUsers size={14} />}>
                                {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''}
                            </Badge>
                            {tablasGeneradas.length > 0 && (
                                <Badge size="lg" variant="white" color="cyan" leftSection={<IconTableFilled size={14} />}>
                                    {tablasGeneradas.length} tabla{tablasGeneradas.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </Group>
                    </Group>
                </Paper>
            </AnimatedSection>

            <AnimatedSection variant="fadeIn" delay={60}>
                <Paper withBorder radius="lg" p="lg" shadow="sm" mb="md">
                    <Group gap="sm" mb="md">
                        <ThemeIcon size={36} radius="md" variant="light" color="teal">
                            <IconListDetails size={20} />
                        </ThemeIcon>
                        <div>
                            <Title order={3}>1. Configurar datos</Title>
                            <Text size="sm" c="dimmed">
                                Elige las columnas y cómo agrupar los estudiantes antes de generar.
                            </Text>
                        </div>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                        <Paper withBorder p="md" radius="md" bg="var(--mantine-color-teal-light)">
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={4}>
                                Fuente de datos
                            </Text>
                            <Text fw={700} fz="xl">
                                {estudiantes.length}
                            </Text>
                            <Text size="sm" c="dimmed">
                                estudiantes cargados
                            </Text>
                        </Paper>
                        <Paper withBorder p="md" radius="md" bg="var(--mantine-color-cyan-light)">
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={4}>
                                Columnas activas
                            </Text>
                            <Text fw={700} fz="xl">
                                {columnasSeleccionadas.length}
                            </Text>
                            <Text size="sm" c="dimmed">
                                campos en la exportación
                            </Text>
                        </Paper>
                        <Paper withBorder p="md" radius="md" bg="var(--mantine-color-blue-light)">
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={4}>
                                Agrupación
                            </Text>
                            <Text fw={700} fz="xl">
                                {agruparPor.length === 0 ? 'Ninguna' : agruparPor.length}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {agruparPor.length === 0
                                    ? 'una sola tabla'
                                    : agruparPor.map((a) => (a === 'categoria' ? 'categoría' : 'sexo')).join(' + ')}
                            </Text>
                        </Paper>
                    </SimpleGrid>

                    <Grid gutter="md">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <MultiSelect
                                label="Columnas a incluir"
                                description="Datos que aparecerán en la lista exportada"
                                placeholder="Seleccione columnas"
                                data={columnasDisponibles}
                                value={columnasSeleccionadas}
                                onChange={setColumnasSeleccionadas}
                                leftSection={<IconColumns size={16} />}
                                clearable
                                radius="md"
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <MultiSelect
                                label="Agrupar por"
                                description="Opcional: divide en varias tablas o hojas"
                                data={opcionesAgrupacion}
                                value={agruparPor}
                                onChange={setAgruparPor}
                                placeholder="Sin agrupación"
                                leftSection={<IconCategory size={16} />}
                                clearable
                                radius="md"
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="lg" />

                    <Group justify="space-between" wrap="wrap" gap="sm">
                        <Group gap="sm" wrap="wrap">
                            <Button
                                variant="light"
                                color="teal"
                                leftSection={<IconRefresh size={16} />}
                                onClick={() => void cargarEstudiantes()}
                                loading={isBusy}
                                radius="md"
                            >
                                Actualizar lista
                            </Button>
                            <Button
                                variant="gradient"
                                gradient={{ from: 'teal', to: 'cyan', deg: 90 }}
                                rightSection={<IconTableFilled size={16} />}
                                onClick={generarTablas}
                                loading={isBusy}
                                radius="md"
                            >
                                Generar tabla
                            </Button>
                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={() => setTablasGeneradas([])}
                                disabled={tablasGeneradas.length === 0}
                                radius="md"
                            >
                                Limpiar vista
                            </Button>
                        </Group>
                        {tablasGeneradas.length > 0 && (
                            <Group gap="sm" wrap="wrap">
                                <Button
                                    variant="light"
                                    color="green"
                                    leftSection={<IconFileSpreadsheet size={16} />}
                                    onClick={exportarExcel}
                                    radius="md"
                                >
                                    Exportar Excel
                                </Button>
                                <Button
                                    variant="light"
                                    color="blue"
                                    leftSection={<IconFileDownload size={16} />}
                                    onClick={exportarCSV}
                                    radius="md"
                                >
                                    Exportar CSV
                                </Button>
                            </Group>
                        )}
                    </Group>
                </Paper>
            </AnimatedSection>

            <AnimatedSection variant="fadeIn" delay={120}>
                <Paper withBorder radius="lg" p="lg" shadow="sm">
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md" mb="md">
                        <Group gap="sm">
                            <ThemeIcon size={36} radius="md" variant="light" color="cyan">
                                <IconTableFilled size={20} />
                            </ThemeIcon>
                            <div>
                                <Title order={3}>2. Vista previa y exportación</Title>
                                <Text size="sm" c="dimmed">
                                    {tablasGeneradas.length > 0
                                        ? `${tablasGeneradas.length} grupo(s) · ${totalFilasExport} fila(s) listas para exportar`
                                        : 'Genera la tabla para ver la vista previa aquí'}
                                </Text>
                            </div>
                        </Group>
                    </Group>

                    {tablasGeneradas.length === 0 ? (
                        <Center py={48}>
                            <Stack align="center" gap="sm" maw={400}>
                                <ThemeIcon size={56} radius="xl" variant="light" color="gray">
                                    <IconTableFilled size={28} />
                                </ThemeIcon>
                                <Text fw={600} ta="center">
                                    Aún no hay tablas generadas
                                </Text>
                                <Text size="sm" c="dimmed" ta="center">
                                    Configura las columnas y pulsa &quot;Generar tabla&quot; para ver la
                                    vista previa antes de exportar.
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <ScrollArea.Autosize mah={640} offsetScrollbars>
                            <Stack gap="lg">
                                {tablasGeneradas.map((grupo, index) => (
                                    <Box
                                        key={grupo.key}
                                        className={animClasses.fadeInUp}
                                        style={{ animationDelay: `${index * 60}ms` }}
                                    >
                                        <Paper withBorder radius="md" p="md">
                                            <Group justify="space-between" mb="sm" wrap="wrap">
                                                <Group gap="xs">
                                                    <Badge variant="light" color="teal" size="lg">
                                                        {grupo.label}
                                                    </Badge>
                                                    <Text size="sm" c="dimmed">
                                                        {grupo.estudiantes.length} estudiante
                                                        {grupo.estudiantes.length !== 1 ? 's' : ''}
                                                    </Text>
                                                </Group>
                                            </Group>

                                            <Table.ScrollContainer minWidth={480}>
                                                <Table
                                                    striped
                                                    highlightOnHover
                                                    withTableBorder
                                                    withColumnBorders
                                                    verticalSpacing="sm"
                                                >
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th w={50} ta="center">
                                                                Nº
                                                            </Table.Th>
                                                            {columnasSeleccionadas.map((col) => (
                                                                <Table.Th key={col}>{col}</Table.Th>
                                                            ))}
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {grupo.estudiantes.map((estudiante, rowIndex) => (
                                                            <Table.Tr key={`${grupo.key}-${estudiante.id}`}>
                                                                <Table.Td ta="center" c="dimmed" fz="sm">
                                                                    {rowIndex + 1}
                                                                </Table.Td>
                                                                {columnasSeleccionadas.map((col) => (
                                                                    <Table.Td key={col}>
                                                                        {obtenerValorColumna(estudiante, col)}
                                                                    </Table.Td>
                                                                ))}
                                                            </Table.Tr>
                                                        ))}
                                                    </Table.Tbody>
                                                </Table>
                                            </Table.ScrollContainer>
                                        </Paper>
                                    </Box>
                                ))}
                            </Stack>
                        </ScrollArea.Autosize>
                    )}
                </Paper>
            </AnimatedSection>
        </Container>
    );
}
