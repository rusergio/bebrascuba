import {
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
    IconBooks,
    IconBuilding,
    IconCheck,
    IconClock,
    IconMapPin,
    IconPhone,
    IconRefresh,
    IconSchool,
    IconSearch,
} from '@tabler/icons-react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTerritorioCoord } from '../hooks/useTerritorioCoord';
import { ModuleHero } from './panel/ModuleHero';
import { SearchableAsyncCombobox, type ComboboxOption } from './ui/SearchableAsyncCombobox';
import panelClasses from '../styles/PanelModules.module.css';
import classes from '../styles/TablaEscuelaMunic.module.css';

interface Escuela {
    id: number;
    codigo: string | null;
    nombre: string;
    telefono: string | null;
    poblado: string | null;
    subsistema: string;
    subsistema_id: number;
    activo: boolean;
    validado: boolean;
    municipio: string | null;
    cdgo_municipio: number;
}

const ROWS_PER_PAGE = 12;
const TODOS_KEY = '__todos__';

const SUBSISTEMA_COLORS: Record<string, string> = {
    Primaria: 'blue',
    'Secundaria Básica': 'green',
    Preuniversitario: 'violet',
    Politécnico: 'orange',
    Especial: 'pink',
    Vocacional: 'cyan',
};

function subsistemaColor(nombre: string) {
    return SUBSISTEMA_COLORS[nombre] ?? 'teal';
}

function filtrarEscuelas(escuelas: Escuela[], busqueda: string) {
    const q = busqueda.trim().toLowerCase();
    if (!q) return escuelas;
    return escuelas.filter(
        (e) =>
            e.nombre.toLowerCase().includes(q) ||
            (e.poblado ?? '').toLowerCase().includes(q) ||
            e.subsistema.toLowerCase().includes(q) ||
            (e.telefono ?? '').toLowerCase().includes(q) ||
            (e.codigo ?? '').toLowerCase().includes(q),
    );
}

function EscuelasTable({
    escuelas,
    pagina,
    onPaginaChange,
    onSelect,
}: {
    escuelas: Escuela[];
    pagina: number;
    onPaginaChange: (p: number) => void;
    onSelect: (e: Escuela) => void;
}) {
    const totalPaginas = Math.max(1, Math.ceil(escuelas.length / ROWS_PER_PAGE));
    const paginados = escuelas.slice((pagina - 1) * ROWS_PER_PAGE, pagina * ROWS_PER_PAGE);

    if (escuelas.length === 0) {
        return (
            <Box className={classes.emptyState}>
                <Text c="dimmed">No hay escuelas que coincidan con los filtros.</Text>
            </Box>
        );
    }

    return (
        <>
            <ScrollArea>
                <Table highlightOnHover striped verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Escuela</Table.Th>
                            <Table.Th visibleFrom="sm">Poblado</Table.Th>
                            <Table.Th>Subsistema</Table.Th>
                            <Table.Th visibleFrom="md">Contacto</Table.Th>
                            <Table.Th>Estado</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {paginados.map((e) => (
                            <Table.Tr
                                key={e.id}
                                className={!e.validado ? classes.rowPending : undefined}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onSelect(e)}
                            >
                                <Table.Td>
                                    <Group gap="sm" wrap="nowrap">
                                        <ThemeIcon size={34} radius="md" variant="light" color="teal">
                                            <IconSchool size={16} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="sm" fw={600} lineClamp={1}>
                                                {e.nombre}
                                            </Text>
                                            {e.codigo && (
                                                <Text size="xs" c="dimmed">
                                                    Código {e.codigo}
                                                </Text>
                                            )}
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td visibleFrom="sm">
                                    <Group gap={6} wrap="nowrap">
                                        <IconMapPin size={14} color="var(--mantine-color-dimmed)" />
                                        <Text size="sm">{e.poblado || '—'}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge size="sm" variant="light" color={subsistemaColor(e.subsistema)}>
                                        {e.subsistema}
                                    </Badge>
                                </Table.Td>
                                <Table.Td visibleFrom="md">
                                    <Group gap={6} wrap="nowrap">
                                        <IconPhone size={14} color="var(--mantine-color-dimmed)" />
                                        <Text size="sm">{e.telefono || '—'}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Stack gap={4}>
                                        <Badge size="sm" variant="light" color={e.activo ? 'teal' : 'gray'}>
                                            {e.activo ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                        {!e.validado && (
                                            <Badge size="xs" variant="outline" color="yellow">
                                                Pendiente
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

export function TablaEscuelaProvinc() {
    const { territorio, loading: loadingTerritorio, error: errorTerritorio } = useTerritorioCoord();
    const [escuelas, setEscuelas] = useState<Escuela[]>([]);
    const [municipioNombre, setMunicipioNombre] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [tab, setTab] = useState<string | null>('todos');
    const [subsistemaActivo, setSubsistemaActivo] = useState<string | null>(TODOS_KEY);
    const [pagina, setPagina] = useState(1);
    const [detalle, setDetalle] = useState<Escuela | null>(null);
    const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);

    const provinciaCodigo = territorio ? String(territorio.provincia_codigo) : null;
    const provinciaNombre = territorio?.provincia_nombre ?? null;

    const loadMunicipios = useCallback(async (): Promise<ComboboxOption[]> => {
        if (!provinciaCodigo) return [];
        const response = await axios.get(`/api/municipios/${provinciaCodigo}`);
        return response.data.map((m: { codigo: number; nombre: string }) => ({
            value: String(m.codigo),
            label: m.nombre,
        }));
    }, [provinciaCodigo]);

    const cargarEscuelas = useCallback(async (cdgoMunicipio: string) => {
        setLoading(true);
        try {
            const { data } = await axios.get<{
                success: boolean;
                municipio?: string;
                escuelas: Escuela[];
                message?: string;
            }>(`/api/escuelas/${cdgoMunicipio}/detalle`);

            if (data.success) {
                setEscuelas(data.escuelas ?? []);
                setMunicipioNombre(data.municipio ?? null);
            } else {
                setEscuelas([]);
                notifications.show({
                    title: 'Sin datos',
                    message: data.message || 'No se encontraron escuelas',
                    color: 'yellow',
                });
            }
        } catch {
            setEscuelas([]);
            setMunicipioNombre(null);
            notifications.show({
                title: 'Error',
                message: 'No se pudieron cargar las escuelas del municipio',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedMunicipio) {
            void cargarEscuelas(selectedMunicipio);
        } else {
            setEscuelas([]);
            setMunicipioNombre(null);
        }
    }, [selectedMunicipio, cargarEscuelas]);

    const stats = useMemo(() => {
        const activas = escuelas.filter((e) => e.activo).length;
        const pendientes = escuelas.filter((e) => !e.validado).length;
        return { total: escuelas.length, activas, pendientes };
    }, [escuelas]);

    const subsistemas = useMemo(() => {
        const map = new Map<string, number>();
        for (const e of escuelas) {
            map.set(e.subsistema, (map.get(e.subsistema) ?? 0) + 1);
        }
        return [...map.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([nombre, count]) => ({ nombre, count }));
    }, [escuelas]);

    const escuelasFiltradas = useMemo(
        () => filtrarEscuelas(escuelas, busqueda),
        [escuelas, busqueda],
    );

    const escuelasPorSubsistema = useMemo(() => {
        if (!subsistemaActivo || subsistemaActivo === TODOS_KEY) return escuelasFiltradas;
        return escuelasFiltradas.filter((e) => e.subsistema === subsistemaActivo);
    }, [escuelasFiltradas, subsistemaActivo]);

    const pendientes = useMemo(
        () => escuelasFiltradas.filter((e) => !e.validado),
        [escuelasFiltradas],
    );

    const listaActual =
        tab === 'pendientes'
            ? pendientes
            : tab === 'subsistema'
              ? escuelasPorSubsistema
              : escuelasFiltradas;

    useEffect(() => {
        setPagina(1);
    }, [tab, subsistemaActivo, busqueda, selectedMunicipio]);

    const subtitulo = loadingTerritorio
        ? 'Cargando territorio del coordinador…'
        : provinciaNombre
          ? `Provincia: ${provinciaNombre}. Seleccione un municipio para ver sus escuelas.`
          : 'No tiene provincia asignada en coordinación regional.';

    return (
        <Box className={classes.page}>
            <Container size="xl" py="xl">
                <ModuleHero
                    badge="Coordinador Provincial"
                    title="Escuelas de la provincia"
                    subtitle={subtitulo}
                    backTo="/pag-provinc/tabla-prof-prov"
                    backLabel="Profesores de la provincia"
                    gradient="teal"
                />

                <Paper
                    radius="lg"
                    p="xl"
                    shadow="sm"
                    withBorder
                    className={`${panelClasses.mainPanel} ${classes.mainPanel}`}
                >
                    {loadingTerritorio ? (
                        <Center py={80}>
                            <Stack align="center" gap="md">
                                <Loader color="teal" size="lg" type="dots" />
                                <Text c="dimmed">Cargando territorio…</Text>
                            </Stack>
                        </Center>
                    ) : !territorio || !provinciaCodigo ? (
                        <Box className={classes.emptyState}>
                            <ThemeIcon size={48} radius="xl" variant="light" color="orange" mb="md">
                                <IconBuilding size={24} />
                            </ThemeIcon>
                            <Text fw={600}>Sin provincia asignada</Text>
                            <Text size="sm" c="dimmed" maw={400} mx="auto" mt={4}>
                                {errorTerritorio ||
                                    'Su cuenta de coordinador provincial no tiene territorio en coord_regionales. Contacte al administrador.'}
                            </Text>
                        </Box>
                    ) : (
                        <>
                            <div className={classes.toolbar}>
                                <Grid gutter="md" align="flex-end">
                                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                        <TextInput
                                            label="Provincia"
                                            value={provinciaNombre || ''}
                                            readOnly
                                            leftSection={<IconBuilding size={16} />}
                                            radius="md"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                        <SearchableAsyncCombobox
                                            label="Municipio"
                                            leftSection={<IconMapPin size={16} />}
                                            placeholder="Buscar municipio…"
                                            value={selectedMunicipio}
                                            onChange={(v) => {
                                                setSelectedMunicipio(v);
                                                setSubsistemaActivo(TODOS_KEY);
                                                setTab('todos');
                                            }}
                                            loadOptions={loadMunicipios}
                                            cacheKey={`municipios-esc-prov-${provinciaCodigo}`}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 8, md: 3 }}>
                                        <TextInput
                                            label="Buscar"
                                            placeholder="Nombre, poblado, código…"
                                            leftSection={<IconSearch size={16} />}
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.currentTarget.value)}
                                            radius="md"
                                            disabled={!selectedMunicipio}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 4, md: 1 }}>
                                        <UnstyledButton
                                            onClick={() =>
                                                selectedMunicipio && void cargarEscuelas(selectedMunicipio)
                                            }
                                            disabled={!selectedMunicipio || loading}
                                            style={{ paddingBottom: 10, width: '100%' }}
                                        >
                                            <Group gap={6} justify="center">
                                                <IconRefresh size={16} />
                                                <Text size="sm" fw={500}>
                                                    Act.
                                                </Text>
                                            </Group>
                                        </UnstyledButton>
                                    </Grid.Col>
                                </Grid>
                            </div>

                            {!selectedMunicipio ? (
                                <Box className={classes.emptyState}>
                                    <ThemeIcon size={48} radius="xl" variant="light" color="teal" mb="md">
                                        <IconSchool size={24} />
                                    </ThemeIcon>
                                    <Text fw={600}>Seleccione un municipio</Text>
                                    <Text size="sm" c="dimmed" maw={360} mx="auto" mt={4}>
                                        Los municipios listados pertenecen a{' '}
                                        <Text span fw={600}>
                                            {provinciaNombre}
                                        </Text>
                                        . Elija uno para ver sus escuelas.
                                    </Text>
                                </Box>
                            ) : loading ? (
                                <Center py={80}>
                                    <Stack align="center" gap="md">
                                        <Loader color="teal" size="lg" type="dots" />
                                        <Text c="dimmed">Cargando escuelas…</Text>
                                    </Stack>
                                </Center>
                            ) : (
                                <>
                                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="lg">
                                        <Paper className={classes.statCard} withBorder radius="md">
                                            <ThemeIcon size={34} radius="md" variant="light" color="teal" mb="xs">
                                                <IconSchool size={18} />
                                            </ThemeIcon>
                                            <Text className={classes.statNumber}>{stats.total}</Text>
                                            <Text size="sm" c="dimmed">
                                                Total escuelas
                                            </Text>
                                        </Paper>
                                        <Paper className={classes.statCard} withBorder radius="md">
                                            <ThemeIcon size={34} radius="md" variant="light" color="green" mb="xs">
                                                <IconCheck size={18} />
                                            </ThemeIcon>
                                            <Text className={classes.statNumber}>{stats.activas}</Text>
                                            <Text size="sm" c="dimmed">
                                                Activas
                                            </Text>
                                        </Paper>
                                        <Paper
                                            className={`${classes.statCard} ${stats.pendientes > 0 ? classes.statCardHighlight : ''}`}
                                            withBorder
                                            radius="md"
                                        >
                                            <ThemeIcon size={34} radius="md" variant="light" color="yellow" mb="xs">
                                                <IconClock size={18} />
                                            </ThemeIcon>
                                            <Text className={classes.statNumber}>{stats.pendientes}</Text>
                                            <Text size="sm" c="dimmed">
                                                Pendientes
                                            </Text>
                                        </Paper>
                                        <Paper className={classes.statCard} withBorder radius="md">
                                            <ThemeIcon size={34} radius="md" variant="light" color="violet" mb="xs">
                                                <IconBooks size={18} />
                                            </ThemeIcon>
                                            <Text className={classes.statNumber}>{subsistemas.length}</Text>
                                            <Text size="sm" c="dimmed">
                                                Subsistemas
                                            </Text>
                                        </Paper>
                                    </SimpleGrid>

                                    {(municipioNombre || provinciaNombre) && (
                                        <Text size="sm" c="dimmed" mb="md">
                                            Escuelas de{' '}
                                            <Text span fw={600} c="teal">
                                                {municipioNombre || 'municipio'}
                                            </Text>
                                            {provinciaNombre ? ` · ${provinciaNombre}` : ''}
                                        </Text>
                                    )}

                                    <Tabs value={tab} onChange={setTab} variant="pills" radius="md" mb="md">
                                        <Tabs.List grow>
                                            <Tabs.Tab value="todos" leftSection={<IconSchool size={16} />}>
                                                Todas ({escuelasFiltradas.length})
                                            </Tabs.Tab>
                                            <Tabs.Tab value="subsistema" leftSection={<IconBooks size={16} />}>
                                                Por subsistema
                                            </Tabs.Tab>
                                            <Tabs.Tab value="pendientes" leftSection={<IconClock size={16} />}>
                                                Pendientes ({pendientes.length})
                                            </Tabs.Tab>
                                        </Tabs.List>

                                        <Tabs.Panel value="todos" pt="md">
                                            <Paper className={classes.tableWrap} p="md" withBorder>
                                                <EscuelasTable
                                                    escuelas={escuelasFiltradas}
                                                    pagina={pagina}
                                                    onPaginaChange={setPagina}
                                                    onSelect={setDetalle}
                                                />
                                            </Paper>
                                        </Tabs.Panel>

                                        <Tabs.Panel value="subsistema" pt="md">
                                            <Grid gutter="lg">
                                                <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                                                    <Paper className={classes.roleSidebar} p="md" withBorder radius="lg">
                                                        <Text fw={600} mb="xs">
                                                            Subsistemas
                                                        </Text>
                                                        <ScrollArea.Autosize mah={420} type="auto" offsetScrollbars>
                                                            <Stack gap={6}>
                                                                <UnstyledButton
                                                                    className={`${classes.roleItem} ${subsistemaActivo === TODOS_KEY ? classes.roleItemActive : ''}`}
                                                                    onClick={() => setSubsistemaActivo(TODOS_KEY)}
                                                                >
                                                                    <Group justify="space-between" wrap="nowrap">
                                                                        <Text size="sm">Todos</Text>
                                                                        <Badge size="sm" variant="light" color="teal" circle>
                                                                            {escuelasFiltradas.length}
                                                                        </Badge>
                                                                    </Group>
                                                                </UnstyledButton>
                                                                {subsistemas.map(({ nombre, count }) => {
                                                                    const activo = subsistemaActivo === nombre;
                                                                    const color = subsistemaColor(nombre);
                                                                    return (
                                                                        <UnstyledButton
                                                                            key={nombre}
                                                                            className={`${classes.roleItem} ${activo ? classes.roleItemActive : ''}`}
                                                                            onClick={() => setSubsistemaActivo(nombre)}
                                                                        >
                                                                            <Group justify="space-between" wrap="nowrap" gap="xs">
                                                                                <Text size="sm" fw={activo ? 600 : 500} lineClamp={2}>
                                                                                    {nombre}
                                                                                </Text>
                                                                                <Badge
                                                                                    size="sm"
                                                                                    variant={activo ? 'filled' : 'light'}
                                                                                    color={color}
                                                                                    circle
                                                                                >
                                                                                    {count}
                                                                                </Badge>
                                                                            </Group>
                                                                        </UnstyledButton>
                                                                    );
                                                                })}
                                                            </Stack>
                                                        </ScrollArea.Autosize>
                                                    </Paper>
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                                                    <Paper className={classes.tableWrap} p="md" withBorder>
                                                        <EscuelasTable
                                                            escuelas={escuelasPorSubsistema}
                                                            pagina={pagina}
                                                            onPaginaChange={setPagina}
                                                            onSelect={setDetalle}
                                                        />
                                                    </Paper>
                                                </Grid.Col>
                                            </Grid>
                                        </Tabs.Panel>

                                        <Tabs.Panel value="pendientes" pt="md">
                                            <Paper className={classes.tableWrap} p="md" withBorder>
                                                <EscuelasTable
                                                    escuelas={pendientes}
                                                    pagina={pagina}
                                                    onPaginaChange={setPagina}
                                                    onSelect={setDetalle}
                                                />
                                            </Paper>
                                        </Tabs.Panel>
                                    </Tabs>

                                    <Text size="xs" c="dimmed" ta="center" mt="sm">
                                        {listaActual.length} resultado
                                        {listaActual.length !== 1 ? 's' : ''} en la vista activa
                                    </Text>
                                </>
                            )}
                        </>
                    )}
                </Paper>
            </Container>

            <Modal
                opened={!!detalle}
                onClose={() => setDetalle(null)}
                title="Detalle de la escuela"
                size="md"
                radius="md"
            >
                {detalle && (
                    <Stack gap="md">
                        <Group gap="md">
                            <ThemeIcon size={56} radius="xl" variant="light" color="teal">
                                <IconSchool size={28} />
                            </ThemeIcon>
                            <div>
                                <Title order={4}>{detalle.nombre}</Title>
                                <Text size="sm" c="dimmed">
                                    {detalle.municipio || 'Municipio'}
                                    {detalle.codigo ? ` · Código ${detalle.codigo}` : ''}
                                </Text>
                            </div>
                        </Group>
                        <SimpleGrid cols={1} spacing="sm">
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Subsistema
                                </Text>
                                <Badge variant="light" color={subsistemaColor(detalle.subsistema)}>
                                    {detalle.subsistema}
                                </Badge>
                            </Box>
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Poblado
                                </Text>
                                <Text size="sm">{detalle.poblado || '—'}</Text>
                            </Box>
                            <Box className={classes.detailBlock}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                    Estado
                                </Text>
                                <Group gap="xs">
                                    <Badge variant="light" color={detalle.activo ? 'teal' : 'gray'}>
                                        {detalle.activo ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                    <Badge variant="light" color={detalle.validado ? 'green' : 'yellow'}>
                                        {detalle.validado ? 'Validada' : 'Pendiente de validación'}
                                    </Badge>
                                </Group>
                            </Box>
                        </SimpleGrid>
                    </Stack>
                )}
            </Modal>
        </Box>
    );
}
