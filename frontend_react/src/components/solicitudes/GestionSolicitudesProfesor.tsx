import {
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Group,
    Loader,
    Modal,
    Paper,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconBuilding,
    IconCheck,
    IconMail,
    IconMapPin,
    IconPhone,
    IconRefresh,
    IconSchool,
    IconSearch,
    IconUserPlus,
    IconUsers,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { useTerritorioCoord } from '../../hooks/useTerritorioCoord';
import { aceptarSolicitudesProfesor, validarEscuela } from '../../lib/api/solicitudes';
import { ModuleHero } from '../panel/ModuleHero';
import panelClasses from '../../styles/PanelModules.module.css';
import classes from '../../styles/SolicitudesProfesor.module.css';

interface SolicitudProfesor {
    id: number;
    nro_ci: string;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    es_nuevo: boolean;
    perfil_editado: boolean;
    esta_activo: boolean;
    id_escuela?: number;
    nombre_escuela: string;
    escuela_validado?: boolean;
    subsistema: string;
    poblado: string;
    telefono_escuela: string | null;
    municipio?: string;
    provincia?: string;
    cdgo_municipio?: number;
    cdgo_provincia?: number;
}

export type SolicitudesVariant = 'nacional' | 'provincial';

function iniciales(nombre: string, apellidos: string) {
    const a = (nombre?.[0] ?? '').toUpperCase();
    const b = (apellidos?.[0] ?? '').toUpperCase();
    return a + b || '?';
}

interface GestionSolicitudesProfesorProps {
    /** Sin hero ni shell — para incrustar en otras pantallas */
    embedded?: boolean;
    /** Contexto visual y copy según el rol */
    variant?: SolicitudesVariant;
}

export function GestionSolicitudesProfesor({
    embedded = false,
    variant = 'nacional',
}: GestionSolicitudesProfesorProps) {
    const esProvincial = variant === 'provincial';
    const { territorio } = useTerritorioCoord();
    const { solicitudes, refreshSolicitudes } = useDataContext();
    const data = solicitudes as SolicitudProfesor[];

    const [loading, setLoading] = useState(false);
    const [accionando, setAccionando] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [selection, setSelection] = useState<number[]>([]);
    const [detalle, setDetalle] = useState<SolicitudProfesor | null>(null);
    const [confirmAceptar, setConfirmAceptar] = useState(false);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            await refreshSolicitudes();
        } finally {
            setLoading(false);
        }
    }, [refreshSolicitudes]);

    useEffect(() => {
        void cargar();
    }, [cargar]);

    const filtradas = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return data;
        return data.filter(
            (s) =>
                `${s.nombre} ${s.apellidos}`.toLowerCase().includes(q) ||
                s.correo?.toLowerCase().includes(q) ||
                s.nombre_escuela?.toLowerCase().includes(q) ||
                s.nro_ci?.includes(q) ||
                s.poblado?.toLowerCase().includes(q) ||
                s.municipio?.toLowerCase().includes(q) ||
                s.provincia?.toLowerCase().includes(q),
        );
    }, [data, busqueda]);

    const seleccionables = useMemo(
        () => filtradas.filter((s) => s.escuela_validado !== false),
        [filtradas],
    );

    const allSelected =
        seleccionables.length > 0 && seleccionables.every((s) => selection.includes(s.id));

    const toggleAll = () => {
        setSelection(allSelected ? [] : seleccionables.map((s) => s.id));
    };

    const toggleRow = (id: number) => {
        const item = filtradas.find((s) => s.id === id);
        if (item && item.escuela_validado === false) {
            notifications.show({
                color: 'yellow',
                title: 'Escuela pendiente',
                message: 'Apruebe primero la escuela antes de seleccionar al profesor.',
            });
            return;
        }
        setSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const ejecutarValidacionEscuela = async (escuelaId: number) => {
        setAccionando(true);
        try {
            await validarEscuela(escuelaId);
            notifications.show({
                color: 'teal',
                title: 'Escuela aprobada',
                message: 'Ahora puede aceptar la solicitud del profesor.',
                icon: <IconSchool size={16} />,
            });
            await cargar();
            if (detalle?.id_escuela === escuelaId) {
                setDetalle((prev) => (prev ? { ...prev, escuela_validado: true } : prev));
            }
        } catch {
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'No se pudo aprobar la escuela.',
            });
        } finally {
            setAccionando(false);
        }
    };

    const ejecutarAceptacion = async (ids: number[]) => {
        if (ids.length === 0) return;

        const bloqueados = data.filter(
            (s) => ids.includes(s.id) && s.escuela_validado === false,
        );
        if (bloqueados.length > 0) {
            notifications.show({
                color: 'yellow',
                title: 'Escuela pendiente',
                message:
                    'Hay solicitudes cuya escuela aún no está aprobada. Valide la escuela primero.',
            });
            return;
        }

        setAccionando(true);
        try {
            await aceptarSolicitudesProfesor(ids);
            notifications.show({
                color: 'teal',
                title: 'Solicitudes aceptadas',
                message:
                    ids.length === 1
                        ? 'El profesor quedó activo y puede usar la plataforma.'
                        : `Se activaron ${ids.length} profesores.`,
                icon: <IconCheck size={16} />,
            });
            setSelection([]);
            setDetalle(null);
            setConfirmAceptar(false);
            await cargar();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            notifications.show({
                color: 'red',
                title: 'Error',
                message:
                    axiosErr.response?.data?.message ||
                    'No se pudieron aceptar las solicitudes.',
            });
        } finally {
            setAccionando(false);
        }
    };

    const idsParaAceptar = detalle ? [detalle.id] : selection;

    const subtituloHero = loading
        ? 'Consultando solicitudes de profesores…'
        : data.length === 0
          ? esProvincial
            ? 'No hay profesores pendientes de activación en su provincia.'
            : 'No hay profesores esperando activación en este momento.'
          : esProvincial && territorio
            ? `${territorio.provincia_nombre}: ${data.length} solicitud${data.length === 1 ? '' : 'es'} pendiente${data.length === 1 ? '' : 's'}.`
            : `Hay ${data.length} solicitud${data.length === 1 ? '' : 'es'} pendiente${data.length === 1 ? '' : 's'} de aprobación.`;

    const introTitle = esProvincial
        ? 'Solicitudes de profesores en la provincia'
        : 'Bandeja de solicitudes de registro';

    const introText = esProvincial
        ? 'Si el profesor registró una escuela nueva, apruebe primero la escuela y después active al profesor. Solo verá solicitudes de su provincia.'
        : 'Los profesores que completaron el formulario de registro aparecen aquí con estado pendiente. Revise escuela y datos de contacto antes de activar la cuenta.';

    const searchPlaceholder = esProvincial
        ? 'Buscar por nombre, CI, escuela, municipio o provincia…'
        : 'Buscar por nombre, correo, CI o escuela…';

    const contenido = (
        <Stack gap="md">
            <Paper
                radius="md"
                className={`${classes.introBanner} ${esProvincial ? classes.introBannerProvincial : ''}`}
            >
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                    <Stack gap={4} maw={520}>
                        <Title order={3}>{introTitle}</Title>
                        <Text size="sm" c="dimmed" lh={1.6}>
                            {introText}
                        </Text>
                    </Stack>
                    <div
                        className={`${classes.countHighlight} ${esProvincial ? classes.countHighlightProvincial : ''}`}
                    >
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                            Total pendientes
                        </Text>
                        {loading ? (
                            <Loader size="sm" mx="auto" />
                        ) : (
                            <Text
                                className={`${classes.countNumber} ${esProvincial ? classes.countNumberProvincial : ''}`}
                            >
                                {data.length}
                            </Text>
                        )}
                    </div>
                </Group>
            </Paper>

            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xs">
                <Paper withBorder className={`${classes.statCard} ${classes.statCardPrimary}`}>
                    <ThemeIcon variant="light" color="orange" size="lg" radius="md" mb="xs" mx="auto">
                        <IconUserPlus size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                        Pendientes de aprobación
                    </Text>
                    <Text fw={700} size="xl">
                        {data.length}
                    </Text>
                </Paper>
                <Paper withBorder className={classes.statCard}>
                    <ThemeIcon variant="light" color="indigo" size="lg" radius="md" mb="xs" mx="auto">
                        <IconUsers size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                        Seleccionados
                    </Text>
                    <Text fw={700} size="xl">
                        {selection.length}
                    </Text>
                </Paper>
                <Paper withBorder className={classes.statCard}>
                    <ThemeIcon variant="light" color="gray" size="lg" radius="md" mb="xs" mx="auto">
                        <IconBuilding size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                        Mostrando (filtro)
                    </Text>
                    <Text fw={700} size="xl">
                        {filtradas.length}
                    </Text>
                </Paper>
            </SimpleGrid>

            <div className={classes.toolbar}>
                <Group justify="space-between" wrap="wrap" gap="sm">
                    <TextInput
                        placeholder={searchPlaceholder}
                        leftSection={<IconSearch size={16} />}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.currentTarget.value)}
                        style={{ flex: 1, minWidth: 220 }}
                    />
                    <Group gap="xs">
                        <Button
                            variant="light"
                            color="teal"
                            leftSection={<IconCheck size={16} />}
                            disabled={selection.length === 0 || accionando}
                            onClick={() => setConfirmAceptar(true)}
                        >
                            Aceptar seleccionados ({selection.length})
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<IconRefresh size={16} />}
                            onClick={() => void cargar()}
                            loading={loading}
                        >
                            Actualizar
                        </Button>
                    </Group>
                </Group>
            </div>

            {loading && data.length === 0 ? (
                <Group justify="center" py="xl">
                    <Loader />
                </Group>
            ) : filtradas.length === 0 ? (
                <Paper withBorder radius="md" className={classes.emptyState}>
                    <ThemeIcon size={56} radius="xl" variant="light" color="gray" mb="md" mx="auto">
                        <IconUserPlus size={28} />
                    </ThemeIcon>
                    <Text fw={600} mb="xs">
                        {data.length === 0 ? 'No hay solicitudes pendientes' : 'Sin coincidencias'}
                    </Text>
                    <Text size="sm" c="dimmed" maw={400} mx="auto">
                        {data.length === 0
                            ? esProvincial
                                ? 'Cuando un profesor se registre en su provincia, aparecerá aquí para revisión.'
                                : 'Cuando un profesor se registre, aparecerá aquí para que pueda activar su cuenta.'
                            : 'Prueba otro término de búsqueda.'}
                    </Text>
                </Paper>
            ) : (
                <Paper withBorder className={classes.tableWrap}>
                <Table.ScrollContainer minWidth={esProvincial ? 860 : 780}>
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={44}>
                                    <Checkbox
                                        checked={allSelected}
                                        indeterminate={selection.length > 0 && !allSelected}
                                        onChange={toggleAll}
                                    />
                                </Table.Th>
                                <Table.Th>Profesor</Table.Th>
                                <Table.Th>Escuela</Table.Th>
                                <Table.Th>{esProvincial ? 'Municipio' : 'Ubicación'}</Table.Th>
                                {esProvincial && <Table.Th>Provincia</Table.Th>}
                                <Table.Th>Estado</Table.Th>
                                <Table.Th w={80}>Acciones</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filtradas.map((item) => (
                                <Table.Tr
                                    key={item.id}
                                    className={selection.includes(item.id) ? classes.rowSelected : undefined}
                                >
                                    <Table.Td>
                                        <Checkbox
                                            checked={selection.includes(item.id)}
                                            disabled={item.escuela_validado === false}
                                            onChange={() => toggleRow(item.id)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm" wrap="nowrap">
                                            <Avatar radius="xl" color={esProvincial ? 'teal' : 'indigo'}>
                                                {iniciales(item.nombre, item.apellidos)}
                                            </Avatar>
                                            <div>
                                                <Text size="sm" fw={600}>
                                                    {item.nombre} {item.apellidos}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    CI: {item.nro_ci}
                                                </Text>
                                            </div>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td maw={200}>
                                        <Text size="sm" lineClamp={2}>
                                            {item.nombre_escuela}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {item.subsistema}
                                        </Text>
                                        {item.escuela_validado === false && (
                                            <Badge size="xs" color="yellow" variant="outline" mt={4}>
                                                Escuela pendiente
                                            </Badge>
                                        )}
                                        {item.escuela_validado === true && esProvincial && (
                                            <Badge size="xs" color="green" variant="outline" mt={4}>
                                                Escuela aprobada
                                            </Badge>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        {esProvincial ? (
                                            <Stack gap={2}>
                                                <Text size="sm">{item.municipio || '—'}</Text>
                                                {item.poblado && (
                                                    <Text size="xs" c="dimmed">
                                                        {item.poblado}
                                                    </Text>
                                                )}
                                            </Stack>
                                        ) : (
                                            item.poblado || '—'
                                        )}
                                    </Table.Td>
                                    {esProvincial && (
                                        <Table.Td>
                                            <Badge variant="light" color="teal" leftSection={<IconMapPin size={12} />}>
                                                {item.provincia || '—'}
                                            </Badge>
                                        </Table.Td>
                                    )}
                                    <Table.Td>
                                        <Badge color="orange" variant="light">
                                            Pendiente
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Button size="xs" variant="light" onClick={() => setDetalle(item)}>
                                            Ver
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
                </Paper>
            )}

            <Alert variant="light" color="blue" icon={<IconMail size={18} />} title="Sobre las solicitudes">
                {esProvincial ? (
                    <>
                        Abra <strong>Ver</strong> para revisar los datos. Si la escuela es nueva, apruébela
                        primero y después active al profesor. Solo se muestran solicitudes de su provincia
                        {territorio?.provincia_nombre ? ` (${territorio.provincia_nombre})` : ''}.
                    </>
                ) : (
                    <>
                        Abra <strong>Ver</strong> para revisar y activar. Si la escuela es nueva, debe
                        validarla antes de activar al profesor.
                    </>
                )}
            </Alert>

            {/* Detalle */}
            <Modal
                opened={detalle !== null && !confirmAceptar}
                onClose={() => setDetalle(null)}
                title="Detalle de la solicitud"
                size="md"
                radius="md"
            >
                {detalle && (
                    <Stack gap="md">
                        <Group gap="md">
                            <Avatar size={56} radius="xl" color={esProvincial ? 'teal' : 'indigo'}>
                                {iniciales(detalle.nombre, detalle.apellidos)}
                            </Avatar>
                            <div>
                                <Text fw={700} size="lg">
                                    {detalle.nombre} {detalle.apellidos}
                                </Text>
                                <Badge color="orange" variant="light" mt={4}>
                                    Pendiente de aprobación
                                </Badge>
                            </div>
                        </Group>

                        <SimpleGrid cols={2} className={classes.detailBlock}>
                            <Stack gap={4}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Solicitante
                                </Text>
                                <Text size="sm">CI: {detalle.nro_ci}</Text>
                                <Group gap={6}>
                                    <IconMail size={14} />
                                    <Text size="sm">{detalle.correo}</Text>
                                </Group>
                                <Group gap={6}>
                                    <IconPhone size={14} />
                                    <Text size="sm">{detalle.telefono}</Text>
                                </Group>
                            </Stack>
                            <Stack gap={4}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Escuela solicitada
                                </Text>
                                <Text size="sm" fw={500}>
                                    {detalle.nombre_escuela}
                                </Text>
                                <Text size="sm">Subsistema: {detalle.subsistema}</Text>
                                {(detalle.municipio || detalle.provincia) && (
                                    <Text size="sm">
                                        {detalle.municipio}
                                        {detalle.municipio && detalle.provincia ? ', ' : ''}
                                        {detalle.provincia}
                                    </Text>
                                )}
                                <Text size="sm">Poblado: {detalle.poblado || '—'}</Text>
                                {detalle.telefono_escuela && (
                                    <Text size="sm">Tel. escuela: {detalle.telefono_escuela}</Text>
                                )}
                                <Badge
                                    mt={6}
                                    variant="light"
                                    color={detalle.escuela_validado ? 'green' : 'yellow'}
                                >
                                    {detalle.escuela_validado
                                        ? 'Escuela aprobada'
                                        : 'Escuela pendiente'}
                                </Badge>
                            </Stack>
                        </SimpleGrid>

                        <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="sm">
                                Pasos de aprobación
                            </Text>
                            <Stack gap="sm">
                                <Group justify="space-between" wrap="wrap" gap="sm">
                                    <div>
                                        <Text size="sm" fw={600}>
                                            1. Aprobar escuela
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {detalle.escuela_validado
                                                ? 'Ya está aprobada'
                                                : 'Necesario si la escuela es nueva'}
                                        </Text>
                                    </div>
                                    {detalle.escuela_validado === false && detalle.id_escuela ? (
                                        <Button
                                            color="yellow"
                                            leftSection={<IconSchool size={16} />}
                                            loading={accionando}
                                            onClick={() => void ejecutarValidacionEscuela(detalle.id_escuela!)}
                                        >
                                            Aprobar escuela
                                        </Button>
                                    ) : (
                                        <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
                                            Listo
                                        </Badge>
                                    )}
                                </Group>
                                <Group justify="space-between" wrap="wrap" gap="sm">
                                    <div>
                                        <Text size="sm" fw={600}>
                                            2. Aprobar profesor
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            Activa la cuenta del solicitante
                                        </Text>
                                    </div>
                                    <Button
                                        color="teal"
                                        leftSection={<IconCheck size={16} />}
                                        disabled={detalle.escuela_validado === false}
                                        onClick={() => setConfirmAceptar(true)}
                                    >
                                        Aprobar profesor
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>

                        <Group justify="flex-end">
                            <Button variant="default" onClick={() => setDetalle(null)}>
                                Cerrar
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Confirmar aceptación */}
            <Modal
                opened={confirmAceptar}
                onClose={() => !accionando && setConfirmAceptar(false)}
                title="Confirmar aceptación"
                centered
                radius="md"
            >
                <Stack gap="md">
                    <Text size="sm">
                        {idsParaAceptar.length === 1 && detalle ? (
                            <>
                                ¿Activar la cuenta de{' '}
                                <strong>
                                    {detalle.nombre} {detalle.apellidos}
                                </strong>
                                ? Podrá iniciar sesión como profesor.
                            </>
                        ) : (
                            <>
                                ¿Activar <strong>{idsParaAceptar.length}</strong> profesor(es) seleccionado(s)?
                            </>
                        )}
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setConfirmAceptar(false)} disabled={accionando}>
                            Cancelar
                        </Button>
                        <Button
                            color="teal"
                            loading={accionando}
                            leftSection={<IconCheck size={16} />}
                            onClick={() => void ejecutarAceptacion(idsParaAceptar)}
                        >
                            Sí, aceptar
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );

    if (embedded) {
        return contenido;
    }

    return (
        <Box className={`${classes.page} ${esProvincial ? classes.pageProvincial : ''}`}>
            <Container size="lg" py="xl">
                <ModuleHero
                    badge={esProvincial ? 'Coordinador Provincial' : 'Coordinador Nacional'}
                    title={esProvincial ? 'Solicitudes de profesores' : 'Solicitudes de registro'}
                    subtitle={subtituloHero}
                    backTo={esProvincial ? '/pag-provinc/tabla-esc-prov' : '/gestionar_concurso'}
                    backLabel={esProvincial ? 'Escuelas de la provincia' : 'Gestionar concurso'}
                    gradient={esProvincial ? 'teal' : 'indigo'}
                />
                <Paper radius="lg" p="xl" withBorder shadow="sm" className={panelClasses.mainPanel}>
                    {contenido}
                </Paper>
            </Container>
        </Box>
    );
}

/** @deprecated Usar GestionSolicitudesProfesor */
export function SolitudesACoordNac() {
    return <GestionSolicitudesProfesor />;
}

/** Tabla reutilizable (vista embebida) */
export function TablaDeSolicitudes() {
    return <GestionSolicitudesProfesor embedded />;
}

/** Pantalla de solicitudes para coordinador provincial */
export function SolicitudesCoordProvincial() {
    return <GestionSolicitudesProfesor variant="provincial" />;
}
