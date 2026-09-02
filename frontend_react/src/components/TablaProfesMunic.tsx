import {
    Avatar,
    Badge,
    Box,
    Center,
    Container,
    Grid,
    Group,
    Loader,
    Modal,
    Pagination,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Tabs,
    Text,
    TextInput,
    ThemeIcon,
    Title,
    UnstyledButton,
} from '@mantine/core';
import {
    IconAt,
    IconBuilding,
    IconMapPin,
    IconPhone,
    IconRefresh,
    IconSchool,
    IconSearch,
    IconUserCheck,
    IconUserPlus,
    IconUsers,
} from '@tabler/icons-react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModuleHero } from './panel/ModuleHero';
import { SearchableAsyncCombobox, type ComboboxOption } from './ui/SearchableAsyncCombobox';
import panelClasses from '../styles/PanelModules.module.css';
import classes from '../styles/TablaEscuelaMunic.module.css';

interface Profesor {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
    nro_ci: string;
    escuela_nombre: string;
    municipio_nombre: string;
    provincia_nombre: string;
    es_nuevo: boolean;
    esta_activo: boolean;
}

const ROWS_PER_PAGE = 12;
const TODAS_KEY = '__todas__';

function iniciales(nombre: string, apellidos: string) {
    const a = (nombre?.[0] ?? '').toUpperCase();
    const b = (apellidos?.[0] ?? '').toUpperCase();
    return a + b || '?';
}

function nombreCompleto(p: Profesor) {
    return `${p.nombre} ${p.apellidos}`.trim();
}

function filtrarProfesores(profesores: Profesor[], busqueda: string) {
    const q = busqueda.trim().toLowerCase();
    if (!q) return profesores;
    return profesores.filter(
        (p) =>
            nombreCompleto(p).toLowerCase().includes(q) ||
            p.correo.toLowerCase().includes(q) ||
            (p.telefono ?? '').toLowerCase().includes(q) ||
            (p.escuela_nombre ?? '').toLowerCase().includes(q) ||
            (p.nro_ci ?? '').toLowerCase().includes(q),
    );
}

function ProfesoresTable({
    profesores,
    pagina,
    onPaginaChange,
    onSelect,
}: {
    profesores: Profesor[];
    pagina: number;
    onPaginaChange: (p: number) => void;
    onSelect: (p: Profesor) => void;
}) {
    const totalPaginas = Math.max(1, Math.ceil(profesores.length / ROWS_PER_PAGE));
    const paginados = profesores.slice((pagina - 1) * ROWS_PER_PAGE, pagina * ROWS_PER_PAGE);

    if (profesores.length === 0) {
        return (
            <Box className={classes.emptyState}>
                <Text c="dimmed">No hay profesores que coincidan con los filtros.</Text>
            </Box>
        );
    }

    return (
        <>
            <ScrollArea>
                <Table highlightOnHover striped verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Profesor</Table.Th>
                            <Table.Th visibleFrom="sm">Contacto</Table.Th>
                            <Table.Th>Escuela</Table.Th>
                            <Table.Th>Estado</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {paginados.map((p) => (
                            <Table.Tr
                                key={`${p.id}-${p.escuela_nombre}`}
                                className={p.es_nuevo ? classes.rowPending : undefined}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onSelect(p)}
                            >
                                <Table.Td>
                                    <Group gap="sm" wrap="nowrap">
                                        <Avatar size={36} radius="xl" color="cyan">
                                            {iniciales(p.nombre, p.apellidos)}
                                        </Avatar>
                                        <div>
                                            <Text size="sm" fw={600} lineClamp={1}>
                                                {nombreCompleto(p)}
                                            </Text>
                                            <Text size="xs" c="dimmed" hiddenFrom="sm">
                                                {p.correo}
                                            </Text>
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td visibleFrom="sm">
                                    <Stack gap={2}>
                                        <Group gap={6} wrap="nowrap">
                                            <IconAt size={14} color="var(--mantine-color-dimmed)" />
                                            <Text size="sm" lineClamp={1}>
                                                {p.correo}
                                            </Text>
                                        </Group>
                                        <Group gap={6} wrap="nowrap">
                                            <IconPhone size={14} color="var(--mantine-color-dimmed)" />
                                            <Text size="sm">{p.telefono || '—'}</Text>
                                        </Group>
                                    </Stack>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap={6} wrap="nowrap">
                                        <IconSchool size={14} color="var(--mantine-color-dimmed)" />
                                        <Text size="sm" lineClamp={2}>
                                            {p.escuela_nombre || '—'}
                                        </Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Stack gap={4}>
                                        <Badge
                                            size="sm"
                                            variant="light"
                                            color={p.esta_activo ? 'teal' : 'gray'}
                                        >
                                            {p.esta_activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                        {p.es_nuevo && (
                                            <Badge size="xs" variant="outline" color="yellow">
                                                Nuevo
                                            </Badge>
                                        )}
                                    </Stack>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            {totalPaginas > 1 && (
                <Group justify="center" mt="md">
                    <Pagination total={totalPaginas} value={pagina} onChange={onPaginaChange} />
                </Group>
            )}
        </>
    );
}

export function TablaProfesMunic() {
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [municipioNombre, setMunicipioNombre] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [tab, setTab] = useState<string | null>('todos');
    const [escuelaActiva, setEscuelaActiva] = useState<string | null>(TODAS_KEY);
    const [filtroEscuela, setFiltroEscuela] = useState('');
    const [pagina, setPagina] = useState(1);
    const [detalle, setDetalle] = useState<Profesor | null>(null);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
    const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);

    const loadProvincias = useCallback(async (): Promise<ComboboxOption[]> => {
        const response = await axios.get('/api/provincias');
        return response.data.map((p: { codigo: number; nombre: string }) => ({
            value: String(p.codigo),
            label: p.nombre,
        }));
    }, []);

    const loadMunicipios = useCallback(async (): Promise<ComboboxOption[]> => {
        if (!selectedProvinceCode) return [];
        const response = await axios.get(`/api/municipios/${selectedProvinceCode}`);
        return response.data.map((m: { codigo: number; nombre: string }) => ({
            value: String(m.codigo),
            label: m.nombre,
        }));
    }, [selectedProvinceCode]);

    const cargarProfesores = useCallback(async (cdgoMunicipio: string) => {
        setLoading(true);
        try {
            const { data } = await axios.get<Profesor[]>(`/api/profesores/municipio/${cdgoMunicipio}`);
            const lista = Array.isArray(data) ? data : [];
            setProfesores(lista);
            setMunicipioNombre(lista[0]?.municipio_nombre ?? null);
        } catch {
            setProfesores([]);
            setMunicipioNombre(null);
            notifications.show({
                title: 'Error',
                message: 'No se pudieron cargar los profesores del municipio',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedMunicipio) {
            void cargarProfesores(selectedMunicipio);
        } else {
            setProfesores([]);
            setMunicipioNombre(null);
        }
    }, [selectedMunicipio, cargarProfesores]);

    const stats = useMemo(() => {
        const activos = profesores.filter((p) => p.esta_activo).length;
        const nuevos = profesores.filter((p) => p.es_nuevo).length;
        const escuelas = new Set(profesores.map((p) => p.escuela_nombre).filter(Boolean)).size;
        return { total: profesores.length, activos, nuevos, escuelas };
    }, [profesores]);

    const escuelas = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of profesores) {
            const nombre = p.escuela_nombre || 'Sin escuela';
            map.set(nombre, (map.get(nombre) ?? 0) + 1);
        }
        return [...map.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([nombre, count]) => ({ nombre, count }));
    }, [profesores]);

    const escuelasSidebar = useMemo(() => {
        const q = filtroEscuela.trim().toLowerCase();
        if (!q) return escuelas;
        return escuelas.filter((e) => e.nombre.toLowerCase().includes(q));
    }, [escuelas, filtroEscuela]);

    const profesoresFiltrados = useMemo(
        () => filtrarProfesores(profesores, busqueda),
        [profesores, busqueda],
    );

    const profesoresPorEscuela = useMemo(() => {
        if (!escuelaActiva || escuelaActiva === TODAS_KEY) return profesoresFiltrados;
        return profesoresFiltrados.filter(
            (p) => (p.escuela_nombre || 'Sin escuela') === escuelaActiva,
        );
    }, [profesoresFiltrados, escuelaActiva]);

    const nuevos = useMemo(
        () => profesoresFiltrados.filter((p) => p.es_nuevo),
        [profesoresFiltrados],
    );

    const listaActual =
        tab === 'nuevos'
            ? nuevos
            : tab === 'escuela'
              ? profesoresPorEscuela
              : profesoresFiltrados;

    useEffect(() => {
        setPagina(1);
    }, [tab, escuelaActiva, busqueda, selectedMunicipio]);

    const handleProvinceChange = (codigo: string | null) => {
        setSelectedProvinceCode(codigo);
        setSelectedMunicipio(null);
        setEscuelaActiva(TODAS_KEY);
        setFiltroEscuela('');
    };

    return (
        <Box className={classes.page}>
            <Container size="xl" py="xl">
                <ModuleHero
                    badge="Coordinación municipal"
                    title="Profesores del municipio"
                    subtitle="Consulte los profesores activos, filtre por escuela y revise quienes son nuevos en el sistema."
                    backTo="/mi_perfil"
                    backLabel="Volver al perfil"
                    gradient="teal"
                />

                <Paper
                    radius="lg"
                    p="xl"
                    shadow="sm"
                    withBorder
                    className={`${panelClasses.mainPanel} ${classes.mainPanel}`}
                >
                    <div className={classes.toolbar}>
                        <Grid gutter="md" align="flex-end">
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <SearchableAsyncCombobox
                                    label="Provincia"
                                    leftSection={<IconMapPin size={16} />}
                                    placeholder="Buscar provincia…"
                                    value={selectedProvinceCode}
                                    onChange={handleProvinceChange}
                                    loadOptions={loadProvincias}
                                    cacheKey="provincias-prof-munic"
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <SearchableAsyncCombobox
                                    label="Municipio"
                                    leftSection={<IconBuilding size={16} />}
                                    placeholder={
                                        selectedProvinceCode
                                            ? 'Buscar municipio…'
                                            : 'Seleccione provincia primero'
                                    }
                                    value={selectedMunicipio}
                                    onChange={setSelectedMunicipio}
                                    loadOptions={loadMunicipios}
                                    disabled={!selectedProvinceCode}
                                    cacheKey={selectedProvinceCode}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 8, md: 4 }}>
                                <TextInput
                                    label="Buscar"
                                    placeholder="Nombre, correo, escuela…"
                                    leftSection={<IconSearch size={16} />}
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.currentTarget.value)}
                                    radius="md"
                                    disabled={!selectedMunicipio}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4, md: 2 }}>
                                <UnstyledButton
                                    onClick={() =>
                                        selectedMunicipio && void cargarProfesores(selectedMunicipio)
                                    }
                                    disabled={!selectedMunicipio || loading}
                                    style={{ paddingBottom: 10, width: '100%' }}
                                >
                                    <Group gap={6} justify="center">
                                        <IconRefresh size={16} />
                                        <Text size="sm" fw={500}>
                                            Actualizar
                                        </Text>
                                    </Group>
                                </UnstyledButton>
                            </Grid.Col>
                        </Grid>
                    </div>

                    {!selectedMunicipio ? (
                        <Box className={classes.emptyState}>
                            <ThemeIcon size={48} radius="xl" variant="light" color="cyan" mb="md">
                                <IconUsers size={24} />
                            </ThemeIcon>
                            <Text fw={600}>Seleccione un municipio</Text>
                            <Text size="sm" c="dimmed" maw={360} mx="auto" mt={4}>
                                Elija provincia y municipio para ver los profesores registrados en ese
                                territorio.
                            </Text>
                        </Box>
                    ) : loading ? (
                        <Center py={80}>
                            <Stack align="center" gap="md">
                                <Loader color="cyan" size="lg" type="dots" />
                                <Text c="dimmed">Cargando profesores…</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <>
                            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="lg">
                                <Paper className={classes.statCard} withBorder radius="md">
                                    <ThemeIcon size={34} radius="md" variant="light" color="cyan" mb="xs">
                                        <IconUsers size={18} />
                                    </ThemeIcon>
                                    <Text className={classes.statNumber}>{stats.total}</Text>
                                    <Text size="sm" c="dimmed">
                                        Total profesores
                                    </Text>
                                </Paper>
                                <Paper className={classes.statCard} withBorder radius="md">
                                    <ThemeIcon size={34} radius="md" variant="light" color="teal" mb="xs">
                                        <IconUserCheck size={18} />
                                    </ThemeIcon>
                                    <Text className={classes.statNumber}>{stats.activos}</Text>
                                    <Text size="sm" c="dimmed">
                                        Activos
                                    </Text>
                                </Paper>
                                <Paper
                                    className={`${classes.statCard} ${stats.nuevos > 0 ? classes.statCardHighlight : ''}`}
                                    withBorder
                                    radius="md"
                                >
                                    <ThemeIcon size={34} radius="md" variant="light" color="yellow" mb="xs">
                                        <IconUserPlus size={18} />
                                    </ThemeIcon>
                                    <Text className={classes.statNumber}>{stats.nuevos}</Text>
                                    <Text size="sm" c="dimmed">
                                        Nuevos
                                    </Text>
                                </Paper>
                                <Paper className={classes.statCard} withBorder radius="md">
                                    <ThemeIcon size={34} radius="md" variant="light" color="blue" mb="xs">
                                        <IconSchool size={18} />
                                    </ThemeIcon>
                                    <Text className={classes.statNumber}>{stats.escuelas}</Text>
                                    <Text size="sm" c="dimmed">
                                        Escuelas
                                    </Text>
                                </Paper>
                            </SimpleGrid>

                            {municipioNombre && (
                                <Text size="sm" c="dimmed" mb="md">
                                    Mostrando profesores de{' '}
                                    <Text span fw={600} c="cyan">
                                        {municipioNombre}
                                    </Text>
                                </Text>
                            )}

                            <Tabs value={tab} onChange={setTab} variant="pills" radius="md" mb="md">
                                <Tabs.List grow>
                                    <Tabs.Tab value="todos" leftSection={<IconUsers size={16} />}>
                                        Todos ({profesoresFiltrados.length})
                                    </Tabs.Tab>
                                    <Tabs.Tab value="escuela" leftSection={<IconSchool size={16} />}>
                                        Por escuela
                                    </Tabs.Tab>
                                    <Tabs.Tab value="nuevos" leftSection={<IconUserPlus size={16} />}>
                                        Nuevos ({nuevos.length})
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="todos" pt="md">
                                    <Paper className={classes.tableWrap} p="md" withBorder>
                                        <ProfesoresTable
                                            profesores={profesoresFiltrados}
                                            pagina={pagina}
                                            onPaginaChange={setPagina}
                                            onSelect={setDetalle}
                                        />
                                    </Paper>
                                </Tabs.Panel>

                                <Tabs.Panel value="escuela" pt="md">
                                    <Grid gutter="lg">
                                        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                                            <Paper className={classes.roleSidebar} p="md" withBorder radius="lg">
                                                <Text fw={600} mb="xs">
                                                    Escuelas
                                                </Text>
                                                <Text size="xs" c="dimmed" mb="sm">
                                                    Filtre los profesores por centro
                                                </Text>
                                                {escuelas.length > 6 && (
                                                    <TextInput
                                                        placeholder="Buscar escuela…"
                                                        leftSection={<IconSchool size={14} />}
                                                        value={filtroEscuela}
                                                        onChange={(e) =>
                                                            setFiltroEscuela(e.currentTarget.value)
                                                        }
                                                        mb="sm"
                                                        radius="md"
                                                        size="xs"
                                                    />
                                                )}
                                                <ScrollArea.Autosize mah={420} type="auto" offsetScrollbars>
                                                    <Stack gap={6}>
                                                        <UnstyledButton
                                                            className={`${classes.roleItem} ${escuelaActiva === TODAS_KEY ? classes.roleItemActive : ''}`}
                                                            onClick={() => setEscuelaActiva(TODAS_KEY)}
                                                        >
                                                            <Group justify="space-between" wrap="nowrap">
                                                                <Text
                                                                    size="sm"
                                                                    fw={escuelaActiva === TODAS_KEY ? 600 : 500}
                                                                >
                                                                    Todas
                                                                </Text>
                                                                <Badge size="sm" variant="light" color="cyan" circle>
                                                                    {profesoresFiltrados.length}
                                                                </Badge>
                                                            </Group>
                                                        </UnstyledButton>
                                                        {escuelasSidebar.map(({ nombre, count }) => {
                                                            const activo = escuelaActiva === nombre;
                                                            return (
                                                                <UnstyledButton
                                                                    key={nombre}
                                                                    className={`${classes.roleItem} ${activo ? classes.roleItemActive : ''}`}
                                                                    onClick={() => setEscuelaActiva(nombre)}
                                                                >
                                                                    <Group
                                                                        justify="space-between"
                                                                        wrap="nowrap"
                                                                        gap="xs"
                                                                    >
                                                                        <Group gap="xs" wrap="nowrap" miw={0}>
                                                                            <ThemeIcon
                                                                                size={28}
                                                                                radius="md"
                                                                                variant={activo ? 'filled' : 'light'}
                                                                                color="cyan"
                                                                            >
                                                                                <IconSchool size={14} />
                                                                            </ThemeIcon>
                                                                            <Text
                                                                                size="sm"
                                                                                fw={activo ? 600 : 500}
                                                                                lineClamp={2}
                                                                            >
                                                                                {nombre}
                                                                            </Text>
                                                                        </Group>
                                                                        <Badge
                                                                            size="sm"
                                                                            variant={activo ? 'filled' : 'light'}
                                                                            color="cyan"
                                                                            circle
                                                                        >
                                                                            {count}
                                                                        </Badge>
                                                                    </Group>
                                                                </UnstyledButton>
                                                            );
                                                        })}
                                                        {escuelasSidebar.length === 0 && (
                                                            <Text size="sm" c="dimmed" ta="center" py="md">
                                                                Ninguna escuela coincide
                                                            </Text>
                                                        )}
                                                    </Stack>
                                                </ScrollArea.Autosize>
                                            </Paper>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                                            <Paper className={classes.tableWrap} p="md" withBorder>
                                                <Group justify="space-between" mb="md">
                                                    <div>
                                                        <Title order={4}>
                                                            {escuelaActiva === TODAS_KEY
                                                                ? 'Todas las escuelas'
                                                                : escuelaActiva}
                                                        </Title>
                                                        <Text size="sm" c="dimmed">
                                                            {profesoresPorEscuela.length} profesor
                                                            {profesoresPorEscuela.length !== 1 ? 'es' : ''}
                                                        </Text>
                                                    </div>
                                                </Group>
                                                <ProfesoresTable
                                                    profesores={profesoresPorEscuela}
                                                    pagina={pagina}
                                                    onPaginaChange={setPagina}
                                                    onSelect={setDetalle}
                                                />
                                            </Paper>
                                        </Grid.Col>
                                    </Grid>
                                </Tabs.Panel>

                                <Tabs.Panel value="nuevos" pt="md">
                                    <Paper className={classes.tableWrap} p="md" withBorder>
                                        <Group justify="space-between" mb="md">
                                            <div>
                                                <Title order={4}>Profesores nuevos</Title>
                                                <Text size="sm" c="dimmed">
                                                    Cuentas marcadas como nuevas en el sistema
                                                </Text>
                                            </div>
                                        </Group>
                                        <ProfesoresTable
                                            profesores={nuevos}
                                            pagina={pagina}
                                            onPaginaChange={setPagina}
                                            onSelect={setDetalle}
                                        />
                                    </Paper>
                                </Tabs.Panel>
                            </Tabs>

                            <Text size="xs" c="dimmed" ta="center" mt="sm">
                                {listaActual.length} resultado{listaActual.length !== 1 ? 's' : ''} en la
                                vista activa
                            </Text>
                        </>
                    )}
                </Paper>
            </Container>

            <Modal
                opened={!!detalle}
                onClose={() => setDetalle(null)}
                title="Detalle del profesor"
                size="md"
                radius="md"
            >
                {detalle && (
                    <Stack gap="md">
                        <Group gap="md">
                            <Avatar size={56} radius="xl" color="cyan">
                                {iniciales(detalle.nombre, detalle.apellidos)}
                            </Avatar>
                            <div>
                                <Title order={4}>{nombreCompleto(detalle)}</Title>
                                <Text size="sm" c="dimmed">
                                    {detalle.municipio_nombre}
                                    {detalle.provincia_nombre ? ` · ${detalle.provincia_nombre}` : ''}
                                </Text>
                            </div>
                        </Group>

                        <SimpleGrid cols={1} spacing="sm">
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Correo
                                </Text>
                                <Text size="sm">{detalle.correo}</Text>
                            </Box>
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Teléfono
                                </Text>
                                <Text size="sm">{detalle.telefono || '—'}</Text>
                            </Box>
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Carné de identidad
                                </Text>
                                <Text size="sm">{detalle.nro_ci || '—'}</Text>
                            </Box>
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Escuela
                                </Text>
                                <Text size="sm">{detalle.escuela_nombre || '—'}</Text>
                            </Box>
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Estado
                                </Text>
                                <Group gap="xs">
                                    <Badge variant="light" color={detalle.esta_activo ? 'teal' : 'gray'}>
                                        {detalle.esta_activo ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                    {detalle.es_nuevo && (
                                        <Badge variant="light" color="yellow">
                                            Nuevo
                                        </Badge>
                                    )}
                                </Group>
                            </Box>
                        </SimpleGrid>
                    </Stack>
                )}
            </Modal>
        </Box>
    );
}
