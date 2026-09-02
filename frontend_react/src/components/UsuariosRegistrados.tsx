import {
    Alert,
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
    IconAlertTriangle,
    IconAt,
    IconEyeSearch,
    IconPhone,
    IconRefresh,
    IconSchool,
    IconShield,
    IconUser,
    IconUsers,
    IconUsersGroup,
} from '@tabler/icons-react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModuleHero } from './panel/ModuleHero';
import panelClasses from '../styles/PanelModules.module.css';
import classes from '../styles/UsuariosRegistrados.module.css';

interface Usuario {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    roles: string[];
    codigo_escuela: string | null;
}

const ROWS_PER_PAGE = 12;
const SIN_ROL_KEY = '__sin_rol__';

const ROLE_COLORS: Record<string, string> = {
    Profesor: 'blue',
    'Coordinador Nacional': 'grape',
    'Coordinador Asistente': 'violet',
    'Coordinador Provincial MINED': 'indigo',
    'Coordinador Municipal MINED': 'cyan',
    'Colaborador Bebras': 'teal',
    'Colaborador Universitario Bebras': 'green',
    Administrador: 'red',
};

function roleColor(rol: string) {
    return ROLE_COLORS[rol] ?? 'gray';
}

function iniciales(nombre: string, apellidos: string) {
    const a = (nombre?.[0] ?? '').toUpperCase();
    const b = (apellidos?.[0] ?? '').toUpperCase();
    return a + b || '?';
}

function nombreCompleto(u: Usuario) {
    return `${u.nombre} ${u.apellidos}`.trim();
}

function filtrarUsuarios(usuarios: Usuario[], busqueda: string) {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => {
        const rolesStr = u.roles.join(' ').toLowerCase();
        return (
            nombreCompleto(u).toLowerCase().includes(q) ||
            u.correo.toLowerCase().includes(q) ||
            (u.telefono ?? '').toLowerCase().includes(q) ||
            rolesStr.includes(q) ||
            (u.codigo_escuela ?? '').toLowerCase().includes(q)
        );
    });
}

function RoleBadges({ roles, size = 'sm' }: { roles: string[]; size?: 'xs' | 'sm' }) {
    if (roles.length === 0) {
        return (
            <Badge size={size} variant="light" color="gray">
                Sin rol
            </Badge>
        );
    }
    return (
        <Group gap={4}>
            {roles.map((rol) => (
                <Badge key={rol} size={size} variant="light" color={roleColor(rol)}>
                    {rol}
                </Badge>
            ))}
        </Group>
    );
}

function UsuariosTable({
    usuarios,
    pagina,
    onPaginaChange,
    onSelect,
    resaltarMulti = false,
}: {
    usuarios: Usuario[];
    pagina: number;
    onPaginaChange: (p: number) => void;
    onSelect: (u: Usuario) => void;
    resaltarMulti?: boolean;
}) {
    const totalPaginas = Math.max(1, Math.ceil(usuarios.length / ROWS_PER_PAGE));
    const paginados = usuarios.slice((pagina - 1) * ROWS_PER_PAGE, pagina * ROWS_PER_PAGE);

    if (usuarios.length === 0) {
        return (
            <Box className={classes.emptyState}>
                <Text c="dimmed">No hay usuarios que coincidan con los filtros actuales.</Text>
            </Box>
        );
    }

    return (
        <>
            <ScrollArea>
                <Table highlightOnHover striped verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Usuario</Table.Th>
                            <Table.Th visibleFrom="sm">Contacto</Table.Th>
                            <Table.Th>Roles</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {paginados.map((u) => (
                            <Table.Tr
                                key={u.id}
                                className={
                                    resaltarMulti && u.roles.length >= 2
                                        ? classes.rowMulti
                                        : undefined
                                }
                                style={{ cursor: 'pointer' }}
                                onClick={() => onSelect(u)}
                            >
                                <Table.Td>
                                    <Group gap="sm" wrap="nowrap">
                                        <Avatar size={36} radius="xl" color="cyan">
                                            {iniciales(u.nombre, u.apellidos)}
                                        </Avatar>
                                        <div>
                                            <Text size="sm" fw={600} lineClamp={1}>
                                                {nombreCompleto(u)}
                                            </Text>
                                            <Text size="xs" c="dimmed" hiddenFrom="sm">
                                                {u.correo}
                                            </Text>
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td visibleFrom="sm">
                                    <Stack gap={2}>
                                        <Group gap={6} wrap="nowrap">
                                            <IconAt size={14} color="var(--mantine-color-dimmed)" />
                                            <Text size="sm" lineClamp={1}>
                                                {u.correo}
                                            </Text>
                                        </Group>
                                        <Group gap={6} wrap="nowrap">
                                            <IconPhone size={14} color="var(--mantine-color-dimmed)" />
                                            <Text size="sm">{u.telefono || '—'}</Text>
                                        </Group>
                                    </Stack>
                                </Table.Td>
                                <Table.Td>
                                    <RoleBadges roles={u.roles} />
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

export function UsuariosRegistrados() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [tab, setTab] = useState<string | null>('multi');
    const [rolActivo, setRolActivo] = useState<string | null>(null);
    const [filtroRolSidebar, setFiltroRolSidebar] = useState('');
    const [pagina, setPagina] = useState(1);
    const [detalle, setDetalle] = useState<Usuario | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get<{ success: boolean; usuarios: Usuario[] }>(
                '/api/usuarios/todos',
            );
            if (data.success) {
                setUsuarios(data.usuarios ?? []);
            }
        } catch {
            notifications.show({
                title: 'Error',
                message: 'No se pudieron cargar los usuarios',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void cargar();
    }, [cargar]);

    const stats = useMemo(() => {
        const multi = usuarios.filter((u) => u.roles.length >= 2);
        const uno = usuarios.filter((u) => u.roles.length === 1);
        const sin = usuarios.filter((u) => u.roles.length === 0);
        return { total: usuarios.length, multi, uno, sin };
    }, [usuarios]);

    const rolesDisponibles = useMemo(() => {
        const map = new Map<string, number>();
        for (const u of usuarios) {
            for (const rol of u.roles) {
                map.set(rol, (map.get(rol) ?? 0) + 1);
            }
        }
        const lista = [...map.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([rol, count]) => ({ rol, count, label: rol }));

        if (stats.sin.length > 0) {
            lista.push({ rol: SIN_ROL_KEY, count: stats.sin.length, label: 'Sin rol asignado' });
        }

        return lista;
    }, [usuarios, stats.sin.length]);

    const rolesSidebar = useMemo(() => {
        const q = filtroRolSidebar.trim().toLowerCase();
        if (!q) return rolesDisponibles;
        return rolesDisponibles.filter((r) => r.label.toLowerCase().includes(q));
    }, [rolesDisponibles, filtroRolSidebar]);

    useEffect(() => {
        if (rolesDisponibles.length > 0 && !rolActivo) {
            setRolActivo(rolesDisponibles[0].rol);
        }
    }, [rolesDisponibles, rolActivo]);

    const usuariosMulti = useMemo(
        () => filtrarUsuarios(stats.multi, busqueda),
        [stats.multi, busqueda],
    );

    const usuariosPorRol = useMemo(() => {
        if (!rolActivo) return [];
        const base =
            rolActivo === SIN_ROL_KEY
                ? usuarios.filter((u) => u.roles.length === 0)
                : usuarios.filter((u) => u.roles.includes(rolActivo));
        return filtrarUsuarios(base, busqueda);
    }, [usuarios, rolActivo, busqueda]);

    const rolActivoLabel =
        rolesDisponibles.find((r) => r.rol === rolActivo)?.label ?? rolActivo ?? 'Rol';

    const usuariosTodos = useMemo(
        () => filtrarUsuarios(usuarios, busqueda),
        [usuarios, busqueda],
    );

    const listaActual =
        tab === 'multi' ? usuariosMulti : tab === 'rol' ? usuariosPorRol : usuariosTodos;

    useEffect(() => {
        setPagina(1);
    }, [tab, rolActivo, busqueda]);

    return (
        <Box className={classes.page}>
            <Container size="xl" py="xl">
                <ModuleHero
                    badge="Administración"
                    title="Usuarios registrados"
                    subtitle="Consulte el directorio del sistema, filtre por rol y revise usuarios con más de un rol asignado."
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
                    {loading ? (
                        <Center py={80}>
                            <Stack align="center" gap="md">
                                <Loader color="cyan" size="lg" type="dots" />
                                <Text c="dimmed">Cargando directorio de usuarios…</Text>
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
                                        Total usuarios
                                    </Text>
                                </Paper>
                                <Paper
                                    className={`${classes.statCard} ${stats.multi.length > 0 ? classes.statCardHighlight : ''}`}
                                    withBorder
                                    radius="md"
                                >
                                    <ThemeIcon size={34} radius="md" variant="light" color="orange" mb="xs">
                                        <IconUsersGroup size={18} />
                                    </ThemeIcon>
                                    <Text className={classes.statNumber}>{stats.multi.length}</Text>
                                    <Text size="sm" c="dimmed">
                                        Múltiples roles
                                    </Text>
                                </Paper>
                                <Paper className={classes.statCard} withBorder radius="md">
                                    <ThemeIcon size={34} radius="md" variant="light" color="blue" mb="xs">
                                        <IconUser size={18} />
                                    </ThemeIcon>
                                    <Text className={classes.statNumber}>{stats.uno.length}</Text>
                                    <Text size="sm" c="dimmed">
                                        Un solo rol
                                    </Text>
                                </Paper>
                                <Paper className={classes.statCard} withBorder radius="md">
                                    <ThemeIcon size={34} radius="md" variant="light" color="gray" mb="xs">
                                        <IconShield size={18} />
                                    </ThemeIcon>
                                    <Text className={classes.statNumber}>{stats.sin.length}</Text>
                                    <Text size="sm" c="dimmed">
                                        Sin rol
                                    </Text>
                                </Paper>
                            </SimpleGrid>

                            {stats.multi.length > 0 && (
                                <Alert
                                    className={classes.multiSection}
                                    variant="light"
                                    color="orange"
                                    icon={<IconAlertTriangle size={18} />}
                                    mb="lg"
                                    radius="md"
                                >
                                    Hay <strong>{stats.multi.length}</strong> usuario
                                    {stats.multi.length !== 1 ? 's' : ''} con 2 o más roles. Revise esa
                                    sección para detectar permisos duplicados o asignaciones especiales.
                                </Alert>
                            )}

                            <Group className={classes.toolbar} justify="space-between" wrap="wrap" gap="sm">
                                <TextInput
                                    flex={1}
                                    miw={220}
                                    placeholder="Buscar por nombre, correo, teléfono o rol…"
                                    leftSection={<IconEyeSearch size={16} />}
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.currentTarget.value)}
                                    radius="md"
                                />
                                <UnstyledButton onClick={() => void cargar()}>
                                    <Group gap={6}>
                                        <IconRefresh size={16} />
                                        <Text size="sm" fw={500}>
                                            Actualizar
                                        </Text>
                                    </Group>
                                </UnstyledButton>
                            </Group>

                            <Tabs
                                value={tab}
                                onChange={setTab}
                                variant="pills"
                                radius="md"
                                mb="md"
                            >
                                <Tabs.List grow>
                                    <Tabs.Tab
                                        value="multi"
                                        leftSection={<IconUsersGroup size={16} />}
                                    >
                                        Múltiples roles ({stats.multi.length})
                                    </Tabs.Tab>
                                    <Tabs.Tab value="rol" leftSection={<IconShield size={16} />}>
                                        Por rol
                                    </Tabs.Tab>
                                    <Tabs.Tab value="todos" leftSection={<IconUsers size={16} />}>
                                        Todos ({stats.total})
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="multi" pt="md">
                                    <Paper className={classes.tableWrap} p="md" withBorder>
                                        <Group justify="space-between" mb="md">
                                            <div>
                                                <Title order={4}>Usuarios con 2+ roles</Title>
                                                <Text size="sm" c="dimmed">
                                                    {usuariosMulti.length} en esta vista
                                                </Text>
                                            </div>
                                        </Group>
                                        <UsuariosTable
                                            usuarios={usuariosMulti}
                                            pagina={pagina}
                                            onPaginaChange={setPagina}
                                            onSelect={setDetalle}
                                            resaltarMulti
                                        />
                                    </Paper>
                                </Tabs.Panel>

                                <Tabs.Panel value="rol" pt="md">
                                    <Grid gutter="lg">
                                        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                                            <Paper className={classes.roleSidebar} p="md" withBorder radius="lg">
                                                <Text fw={600} mb="xs">
                                                    Roles del sistema
                                                </Text>
                                                <Text size="xs" c="dimmed" mb="sm">
                                                    Elija un rol para ver sus usuarios
                                                </Text>
                                                {rolesDisponibles.length > 5 && (
                                                    <TextInput
                                                        placeholder="Buscar rol…"
                                                        leftSection={<IconShield size={14} />}
                                                        value={filtroRolSidebar}
                                                        onChange={(e) =>
                                                            setFiltroRolSidebar(e.currentTarget.value)
                                                        }
                                                        mb="sm"
                                                        radius="md"
                                                        size="xs"
                                                    />
                                                )}
                                                <ScrollArea.Autosize mah={420} type="auto" offsetScrollbars>
                                                    <Stack gap={6}>
                                                        {rolesSidebar.map(({ rol, count, label }) => {
                                                            const activo = rolActivo === rol;
                                                            const color =
                                                                rol === SIN_ROL_KEY
                                                                    ? 'gray'
                                                                    : roleColor(rol);
                                                            return (
                                                                <UnstyledButton
                                                                    key={rol}
                                                                    className={`${classes.roleItem} ${activo ? classes.roleItemActive : ''}`}
                                                                    onClick={() => setRolActivo(rol)}
                                                                >
                                                                    <Group
                                                                        justify="space-between"
                                                                        wrap="nowrap"
                                                                        gap="xs"
                                                                    >
                                                                        <Group gap="xs" wrap="nowrap" miw={0}>
                                                                            <ThemeIcon
                                                                                size={30}
                                                                                radius="md"
                                                                                variant={
                                                                                    activo ? 'filled' : 'light'
                                                                                }
                                                                                color={color}
                                                                            >
                                                                                <IconShield size={14} />
                                                                            </ThemeIcon>
                                                                            <Text
                                                                                size="sm"
                                                                                fw={activo ? 600 : 500}
                                                                                lineClamp={2}
                                                                            >
                                                                                {label}
                                                                            </Text>
                                                                        </Group>
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
                                                        {rolesSidebar.length === 0 && (
                                                            <Text size="sm" c="dimmed" ta="center" py="md">
                                                                Ningún rol coincide
                                                            </Text>
                                                        )}
                                                    </Stack>
                                                </ScrollArea.Autosize>
                                            </Paper>
                                        </Grid.Col>

                                        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                                            <Paper className={classes.tableWrap} p="md" withBorder>
                                                <Group justify="space-between" mb="md" wrap="wrap">
                                                    <div>
                                                        <Title order={4}>{rolActivoLabel}</Title>
                                                        <Text size="sm" c="dimmed">
                                                            {usuariosPorRol.length} usuario
                                                            {usuariosPorRol.length !== 1 ? 's' : ''}{' '}
                                                            con este perfil
                                                        </Text>
                                                    </div>
                                                    {rolActivo && rolActivo !== SIN_ROL_KEY && (
                                                        <Badge
                                                            size="lg"
                                                            variant="light"
                                                            color={roleColor(rolActivo)}
                                                        >
                                                            {rolActivo}
                                                        </Badge>
                                                    )}
                                                </Group>
                                                <UsuariosTable
                                                    usuarios={usuariosPorRol}
                                                    pagina={pagina}
                                                    onPaginaChange={setPagina}
                                                    onSelect={setDetalle}
                                                />
                                            </Paper>
                                        </Grid.Col>
                                    </Grid>
                                </Tabs.Panel>

                                <Tabs.Panel value="todos" pt="md">
                                    <Paper className={classes.tableWrap} p="md" withBorder>
                                        <Group justify="space-between" mb="md">
                                            <div>
                                                <Title order={4}>Listado completo</Title>
                                                <Text size="sm" c="dimmed">
                                                    {usuariosTodos.length} usuario
                                                    {usuariosTodos.length !== 1 ? 's' : ''}
                                                </Text>
                                            </div>
                                        </Group>
                                        <UsuariosTable
                                            usuarios={usuariosTodos}
                                            pagina={pagina}
                                            onPaginaChange={setPagina}
                                            onSelect={setDetalle}
                                            resaltarMulti
                                        />
                                    </Paper>
                                </Tabs.Panel>
                            </Tabs>

                            <Text size="xs" c="dimmed" ta="center" mt="sm">
                                Mostrando {listaActual.length} resultado
                                {listaActual.length !== 1 ? 's' : ''} en la pestaña activa
                            </Text>
                        </>
                    )}
                </Paper>
            </Container>

            <Modal
                opened={!!detalle}
                onClose={() => setDetalle(null)}
                title="Detalle del usuario"
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
                                    ID #{detalle.id}
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
                                    Roles ({detalle.roles.length})
                                </Text>
                                <RoleBadges roles={detalle.roles} size="sm" />
                                {detalle.roles.length >= 2 && (
                                    <Text size="xs" c="orange" mt="xs">
                                        Usuario con múltiples roles asignados
                                    </Text>
                                )}
                            </Box>
                            {detalle.codigo_escuela && (
                                <Box className={classes.detailBlock}>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                        Código escuela (profesor)
                                    </Text>
                                    <Text size="sm">{detalle.codigo_escuela}</Text>
                                </Box>
                            )}
                        </SimpleGrid>
                    </Stack>
                )}
            </Modal>
        </Box>
    );
}
