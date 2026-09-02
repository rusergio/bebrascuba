import {
    Alert,
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Grid,
    Group,
    List,
    Modal,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Tabs,
    Text,
    Switch,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    IconAlertTriangle,
    IconCalendarEvent,
    IconCalendarStats,
    IconCheck,
    IconDoorEnter,
    IconDoorExit,
    IconInfoCircle,
    IconLock,
    IconLockOpen,
    IconTrophy,
    IconUsers,
    IconWorld,
} from '@tabler/icons-react';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCallback, useEffect, useState } from 'react';
import { useDataContext } from '../context/DataContext';
import {
    fetchVistaPreviaPublicacion,
    publicarResultadosWeb,
    type VistaPreviaPublicacion,
} from '../lib/api/ediciones';
import { ModuleHero } from './panel/ModuleHero';
import panelClasses from '../styles/PanelModules.module.css';
import classes from '../styles/GestionarConcurso.module.css';

dayjs.extend(customParseFormat);

interface EdicionDetalle {
    id: number;
    n_edicion: number;
    a_edicion: number;
    abierto: boolean;
    fecha_convocatoria?: string | null;
    fecha_inic_preinscrip?: string | null;
    fecha_fin_preinscrip?: string | null;
    fecha_inic_inscripVille?: string | null;
    fecha_inic_realiz?: string | null;
    fecha_fin_realiz?: string | null;
    fecha_resultados?: string | null;
}

function fmtDate(value?: string | null) {
    if (!value) return null;
    const d = dayjs(value);
    return d.isValid() ? d.format('DD MMM YYYY') : null;
}

function TimelineStep({
    icon: Icon,
    label,
    value,
    filled,
}: {
    icon: typeof IconCalendarEvent;
    label: string;
    value?: string | null;
    filled: boolean;
}) {
    return (
        <div className={classes.timelineItem}>
            <div className={`${classes.timelineDot} ${filled ? classes.timelineDotFilled : ''}`}>
                <Icon size={14} stroke={1.8} />
            </div>
            <Stack gap={2}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>
                    {label}
                </Text>
                <Text size="sm" fw={filled ? 600 : 400} c={filled ? undefined : 'dimmed'}>
                    {value ?? 'Sin definir'}
                </Text>
            </Stack>
        </div>
    );
}

export function GestionarConcurso() {
    const {
        numeroEdicion,
        anioEdicion,
        estadoEdicion,
        ultimaEdicionCerrada,
        anioUltimaEdicionCerrada,
        refreshEdicionesPublicas,
    } = useDataContext();

    const [detalle, setDetalle] = useState<EdicionDetalle | null>(null);
    const [loadingDetalle, setLoadingDetalle] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [loadingFechas, setLoadingFechas] = useState(false);
    const [loadingConv, setLoadingConv] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'abrir' | 'cerrar' | null>(null);
    const [confirmCierreEntendido, setConfirmCierreEntendido] = useState(false);
    const [estadoSelect, setEstadoSelect] = useState<'Abierto' | 'Cerrado'>('Cerrado');
    const [publicarAlCerrar, setPublicarAlCerrar] = useState(true);
    const [confirmPublicar, setConfirmPublicar] = useState(false);
    const [preview, setPreview] = useState<VistaPreviaPublicacion | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [loadingPublicar, setLoadingPublicar] = useState(false);

    const abierta = estadoEdicion === 'Abierto';
    const estadoActual: 'Abierto' | 'Cerrado' = abierta ? 'Abierto' : 'Cerrado';
    const hayCambioEstado = estadoSelect !== estadoActual;

    useEffect(() => {
        setEstadoSelect(estadoActual);
    }, [estadoActual]);
    const edicionParaPublicar =
        numeroEdicion > 0 ? numeroEdicion : ultimaEdicionCerrada > 0 ? ultimaEdicionCerrada : 0;
    const edicionLabel =
        numeroEdicion > 0
            ? `${numeroEdicion}ª edición${anioEdicion ? ` · ${anioEdicion}` : ''}`
            : ultimaEdicionCerrada > 0
              ? `Última cerrada: ${ultimaEdicionCerrada}ª${anioUltimaEdicionCerrada ? ` · ${anioUltimaEdicionCerrada}` : ''}`
              : 'Sin edición activa';

    const cargarDetalle = useCallback(async () => {
        setLoadingDetalle(true);
        try {
            const { data } = await axios.get<EdicionDetalle>('/api/listar-edicion-actual');
            setDetalle(data);
        } catch {
            setDetalle(null);
        } finally {
            setLoadingDetalle(false);
        }
    }, []);

    useEffect(() => {
        if (abierta) {
            void cargarDetalle();
        } else {
            setDetalle(null);
            setLoadingDetalle(false);
        }
    }, [abierta, cargarDetalle, numeroEdicion]);

    const cargarPreview = useCallback(async () => {
        if (edicionParaPublicar <= 0) {
            setPreview(null);
            return;
        }
        setLoadingPreview(true);
        try {
            const data = await fetchVistaPreviaPublicacion(edicionParaPublicar);
            setPreview(data);
        } catch {
            setPreview(null);
        } finally {
            setLoadingPreview(false);
        }
    }, [edicionParaPublicar]);

    useEffect(() => {
        void cargarPreview();
    }, [cargarPreview]);

    const ejecutarPublicacion = async (nEdicion: number) => {
        setLoadingPublicar(true);
        try {
            const res = await publicarResultadosWeb(nEdicion);
            await refreshEdicionesPublicas();
            await cargarPreview();
            notifications.show({
                title: 'Resultados publicados',
                message: res.message,
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            setConfirmPublicar(false);
            return true;
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'No se pudieron publicar los resultados'
                : 'Error de conexión';
            notifications.show({
                title: 'Error',
                message,
                color: 'red',
                icon: <IconAlertTriangle size={18} />,
            });
            return false;
        } finally {
            setLoadingPublicar(false);
        }
    };

    const formE = useForm({
        initialValues: { fecha_conv: null as Date | null, fecha_insc_ville: null as Date | null, periodo_insc: [] as Date[] },
        validate: {
            fecha_conv: (v) => (!v ? 'Indica la fecha de convocatoria' : null),
            fecha_insc_ville: (v) => (!v ? 'Indica la fecha de inscripción en Ville' : null),
            periodo_insc: (v) => (v.length < 2 ? 'Indica el periodo de preinscripción' : null),
        },
    });

    const formC = useForm({
        initialValues: { fecha_result: null as Date | null, fecha_realz_concurs: [] as Date[] },
        validate: {
            fecha_result: (v) => (!v ? 'Indica la fecha de publicación de resultados' : null),
            fecha_realz_concurs: (v) => (v.length < 2 ? 'Indica el periodo de realización' : null),
        },
    });

    const minDate = new Date();
    const maxDate = dayjs().add(18, 'month').toDate();

    const ejecutarCambioEstado = async () => {
        if (!confirmAction) return;
        const nEdicionAlCerrar = numeroEdicion;
        setLoadingStatus(true);
        try {
            const response =
                confirmAction === 'abrir'
                    ? await axios.post('/api/ediciones/abrir')
                    : await axios.post('/api/ediciones/cerrar');

            await refreshEdicionesPublicas();
            if (confirmAction === 'abrir') {
                await cargarDetalle();
            }

            if (confirmAction === 'cerrar' && publicarAlCerrar && nEdicionAlCerrar > 0) {
                await ejecutarPublicacion(nEdicionAlCerrar);
            }

            notifications.show({
                title: confirmAction === 'abrir' ? 'Edición abierta' : 'Edición cerrada',
                message: response.data.message,
                color: 'violet',
                icon: <IconCheck size={18} />,
            });
            setConfirmAction(null);
            setConfirmCierreEntendido(false);
            setPublicarAlCerrar(true);
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'No se pudo cambiar el estado'
                : 'Error de conexión';
            setEstadoSelect(estadoActual);
            setConfirmAction(null);
            setConfirmCierreEntendido(false);
            notifications.show({
                title: 'Error',
                message,
                color: 'red',
                icon: <IconAlertTriangle size={18} />,
            });
        } finally {
            setLoadingStatus(false);
        }
    };

    const cancelarConfirmacion = () => {
        if (loadingStatus) return;
        setConfirmAction(null);
        setConfirmCierreEntendido(false);
        setEstadoSelect(estadoActual);
    };

    const solicitarCambioEstado = () => {
        if (!hayCambioEstado) return;
        if (estadoSelect === 'Abierto') {
            setConfirmAction('abrir');
        } else {
            setConfirmCierreEntendido(false);
            setConfirmAction('cerrar');
        }
    };

    const handleEditionDate = formE.onSubmit(async (values) => {
        setLoadingFechas(true);
        try {
            const response = await axios.put('/api/actualizar-fecha', {
                fecha_convocatoria: dayjs(values.fecha_conv).format('YYYY-MM-DD'),
                fecha_inic_preinscrip: dayjs(values.periodo_insc[0]).format('YYYY-MM-DD'),
                fecha_fin_preinscrip: dayjs(values.periodo_insc[1]).format('YYYY-MM-DD'),
                fecha_inic_inscripVille: dayjs(values.fecha_insc_ville).format('YYYY-MM-DD'),
            });
            notifications.show({
                title: 'Fechas guardadas',
                message: response.data.message || 'Calendario de preinscripción actualizado.',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            formE.reset();
            await cargarDetalle();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                  Object.values(error.response?.data?.errors ?? {})
                      .flat()
                      .join(', ') ||
                  'Error al guardar'
                : 'Error inesperado';
            notifications.show({ title: 'Error', message, color: 'red' });
        } finally {
            setLoadingFechas(false);
        }
    });

    const handleConvocatoria = formC.onSubmit(async (values) => {
        setLoadingConv(true);
        try {
            const response = await axios.put('/api/actualizar-fecha-import', {
                fecha_resultados: dayjs(values.fecha_result).format('YYYY-MM-DD'),
                fecha_inic_realiz: dayjs(values.fecha_realz_concurs[0]).format('YYYY-MM-DD'),
                fecha_fin_realiz: dayjs(values.fecha_realz_concurs[1]).format('YYYY-MM-DD'),
            });
            notifications.show({
                title: 'Fechas publicadas',
                message: response.data.message || 'Calendario del concurso actualizado.',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            formC.reset();
            await cargarDetalle();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                  Object.values(error.response?.data?.errors ?? {})
                      .flat()
                      .join(', ') ||
                  'Error al guardar'
                : 'Error inesperado';
            notifications.show({ title: 'Error', message, color: 'red' });
        } finally {
            setLoadingConv(false);
        }
    });

    return (
        <Container size="lg" py="xl" className={classes.page}>
            <ModuleHero
                badge="Coordinador Nacional"
                title="Gestionar la edición"
                subtitle="Control del ciclo de vida del concurso: apertura, calendario de actividades y cierre oficial."
                gradient="violet"
                backTo="/coordinador/dashboard"
                backLabel="Panel coordinador"
            />

            <Paper radius="lg" p="xl" withBorder shadow="sm" className={panelClasses.mainPanel}>
                {/* Tarjeta de estado */}
                <Paper
                    radius="lg"
                    p="xl"
                    withBorder
                    mb="xl"
                    className={`${classes.statusCard} ${abierta ? classes.statusCardOpen : classes.statusCardClosed}`}
                >
                    <Box className={`${classes.statusGlow} ${abierta ? classes.statusGlowOpen : classes.statusGlowClosed}`} />
                    <Grid align="center" gutter="xl">
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Group wrap="nowrap" align="flex-start" gap="lg">
                                <div className={`${classes.editionBadge} ${abierta ? classes.editionBadgeOpen : classes.editionBadgeClosed}`}>
                                    {numeroEdicion > 0 ? numeroEdicion : '—'}
                                </div>
                                <Stack gap="xs" style={{ flex: 1 }}>
                                    <Group gap="xs">
                                        <Badge
                                            size="lg"
                                            variant="light"
                                            color={abierta ? 'violet' : 'gray'}
                                            leftSection={
                                                abierta ? (
                                                    <span className={classes.pulseDot} />
                                                ) : (
                                                    <IconLock size={12} />
                                                )
                                            }
                                        >
                                            {abierta ? 'Edición abierta' : 'Edición cerrada'}
                                        </Badge>
                                    </Group>
                                    <Title order={3}>{edicionLabel}</Title>
                                    <Text size="sm" c="dimmed" maw={480}>
                                        {abierta
                                            ? 'Los profesores pueden preinscribir estudiantes. Puedes importar resultados y gestionar el calendario.'
                                            : 'No hay edición activa. Abre una nueva edición para iniciar el ciclo del concurso.'}
                                    </Text>
                                </Stack>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Paper withBorder p="md" radius="md" className={classes.estadoControl}>
                                <Text size="sm" fw={600} mb="xs">
                                    Cambiar estado de la edición
                                </Text>
                                <Text size="xs" c="dimmed" mb="md">
                                    Seleccione el estado deseado y confirme con el botón. El cierre requiere
                                    confirmación adicional por seguridad.
                                </Text>
                                <Select
                                    label="Estado"
                                    description={`Actual: ${estadoActual}`}
                                    data={[
                                        { value: 'Abierto', label: 'Abierta — preinscripciones activas' },
                                        { value: 'Cerrado', label: 'Cerrada — finalizar edición actual' },
                                    ]}
                                    value={estadoSelect}
                                    onChange={(v) => v && setEstadoSelect(v as 'Abierto' | 'Cerrado')}
                                    disabled={loadingStatus}
                                    mb="sm"
                                    allowDeselect={false}
                                />
                                <Button
                                    fullWidth
                                    variant={estadoSelect === 'Cerrado' && hayCambioEstado ? 'light' : 'filled'}
                                    color={estadoSelect === 'Cerrado' && hayCambioEstado ? 'red' : 'violet'}
                                    leftSection={
                                        hayCambioEstado && estadoSelect === 'Abierto' ? (
                                            <IconDoorEnter size={18} />
                                        ) : hayCambioEstado ? (
                                            <IconDoorExit size={18} />
                                        ) : undefined
                                    }
                                    disabled={!hayCambioEstado || loadingStatus}
                                    onClick={solicitarCambioEstado}
                                >
                                    {hayCambioEstado
                                        ? estadoSelect === 'Abierto'
                                            ? 'Solicitar apertura…'
                                            : 'Solicitar cierre…'
                                        : 'Sin cambios pendientes'}
                                </Button>
                                <Text size="xs" c="dimmed" mt="sm">
                                    {abierta
                                        ? 'Al cerrar: profesores inactivos e inscripciones reiniciadas.'
                                        : 'Al abrir: se crea la siguiente edición en secuencia.'}
                                </Text>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Paper>

                <Grid gutter="xl">
                    {/* Calendario configurado */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Paper radius="md" p="lg" withBorder h="100%">
                            <Group gap="xs" mb="md">
                                <ThemeIcon variant="light" color="violet" size="lg" radius="md">
                                    <IconCalendarStats size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text fw={600}>Calendario publicado</Text>
                                    <Text size="xs" c="dimmed">
                                        Fechas guardadas en la edición activa
                                    </Text>
                                </div>
                            </Group>

                            {!abierta ? (
                                <Stack align="center" py="xl" gap="sm">
                                    <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                                        <IconLockOpen size={24} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed" ta="center">
                                        Abre una edición para configurar y visualizar el calendario.
                                    </Text>
                                </Stack>
                            ) : loadingDetalle ? (
                                <Text size="sm" c="dimmed">
                                    Cargando fechas…
                                </Text>
                            ) : (
                                <div className={classes.timeline}>
                                    <TimelineStep
                                        icon={IconCalendarEvent}
                                        label="Convocatoria"
                                        value={fmtDate(detalle?.fecha_convocatoria)}
                                        filled={!!detalle?.fecha_convocatoria}
                                    />
                                    <TimelineStep
                                        icon={IconUsers}
                                        label="Preinscripción"
                                        value={
                                            detalle?.fecha_inic_preinscrip && detalle?.fecha_fin_preinscrip
                                                ? `${fmtDate(detalle.fecha_inic_preinscrip)} → ${fmtDate(detalle.fecha_fin_preinscrip)}`
                                                : null
                                        }
                                        filled={!!detalle?.fecha_inic_preinscrip}
                                    />
                                    <TimelineStep
                                        icon={IconCalendarEvent}
                                        label="Inscripción Ville"
                                        value={fmtDate(detalle?.fecha_inic_inscripVille)}
                                        filled={!!detalle?.fecha_inic_inscripVille}
                                    />
                                    <TimelineStep
                                        icon={IconTrophy}
                                        label="Realización"
                                        value={
                                            detalle?.fecha_inic_realiz && detalle?.fecha_fin_realiz
                                                ? `${fmtDate(detalle.fecha_inic_realiz)} → ${fmtDate(detalle.fecha_fin_realiz)}`
                                                : null
                                        }
                                        filled={!!detalle?.fecha_inic_realiz}
                                    />
                                    <TimelineStep
                                        icon={IconCalendarStats}
                                        label="Resultados"
                                        value={fmtDate(detalle?.fecha_resultados)}
                                        filled={!!detalle?.fecha_resultados}
                                    />
                                </div>
                            )}
                        </Paper>
                    </Grid.Col>

                    {/* Formularios */}
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        {!abierta && (
                            <Paper radius="md" p="md" mb="md" className={classes.hintBox}>
                                <Group gap="sm" wrap="nowrap" align="flex-start">
                                    <IconInfoCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <Text size="sm">
                                        Los formularios de fechas solo están disponibles mientras la edición esté{' '}
                                        <strong>abierta</strong>.
                                    </Text>
                                </Group>
                            </Paper>
                        )}

                        <Tabs defaultValue="preinscripcion" variant="pills" radius="md">
                            <Tabs.List mb="lg">
                                <Tabs.Tab value="preinscripcion" leftSection={<IconUsers size={16} />}>
                                    Preinscripción
                                </Tabs.Tab>
                                <Tabs.Tab value="concurso" leftSection={<IconTrophy size={16} />}>
                                    Concurso y resultados
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="preinscripcion">
                                <Paper radius="md" p="xl" withBorder className={classes.formCard}>
                                    <div className={classes.formCardHeader}>
                                        <div className={`${classes.formIcon} ${classes.formIconBlue}`}>
                                            <IconUsers size={22} />
                                        </div>
                                        <div>
                                            <Title order={4}>Fase de preinscripción</Title>
                                            <Text size="sm" c="dimmed">
                                                Convocatoria, periodo de preinscripción e inscripción en Ville.
                                            </Text>
                                        </div>
                                    </div>

                                    <form onSubmit={handleEditionDate}>
                                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                            <DateInput
                                                valueFormat="DD/MM/YYYY"
                                                minDate={minDate}
                                                maxDate={maxDate}
                                                label="Fecha de convocatoria"
                                                description="Inicio oficial de la convocatoria"
                                                placeholder="Seleccionar fecha"
                                                clearable
                                                withAsterisk
                                                disabled={!abierta}
                                                {...formE.getInputProps('fecha_conv')}
                                            />
                                            <DateInput
                                                valueFormat="DD/MM/YYYY"
                                                minDate={minDate}
                                                maxDate={maxDate}
                                                label="Inscripción en Ville"
                                                description="Fecha de inicio en la plataforma Ville"
                                                placeholder="Seleccionar fecha"
                                                clearable
                                                withAsterisk
                                                disabled={!abierta}
                                                {...formE.getInputProps('fecha_insc_ville')}
                                            />
                                        </SimpleGrid>
                                        <DatePickerInput
                                            type="range"
                                            valueFormat="DD/MM/YYYY"
                                            minDate={minDate}
                                            maxDate={maxDate}
                                            label="Periodo de preinscripción"
                                            description="Rango de fechas en que los profesores pueden preinscribir"
                                            placeholder="Desde — hasta"
                                            clearable
                                            withAsterisk
                                            mt="md"
                                            disabled={!abierta}
                                            {...formE.getInputProps('periodo_insc')}
                                        />
                                        <Group justify="flex-end" mt="xl">
                                            <Button
                                                type="submit"
                                                loading={loadingFechas}
                                                disabled={!abierta}
                                                leftSection={<IconCalendarEvent size={18} />}
                                            >
                                                Guardar calendario
                                            </Button>
                                        </Group>
                                    </form>
                                </Paper>
                            </Tabs.Panel>

                            <Tabs.Panel value="concurso">
                                <Paper radius="md" p="xl" withBorder className={classes.formCard}>
                                    <div className={classes.formCardHeader}>
                                        <div className={`${classes.formIcon} ${classes.formIconViolet}`}>
                                            <IconTrophy size={22} />
                                        </div>
                                        <div>
                                            <Title order={4}>Concurso y publicación de resultados</Title>
                                            <Text size="sm" c="dimmed">
                                                Periodo de realización del concurso y fecha de resultados oficiales.
                                            </Text>
                                        </div>
                                    </div>

                                    <form onSubmit={handleConvocatoria}>
                                        <DatePickerInput
                                            type="range"
                                            valueFormat="DD/MM/YYYY"
                                            minDate={minDate}
                                            maxDate={maxDate}
                                            label="Periodo de realización del concurso"
                                            description="Fechas en que se aplica el concurso en las escuelas"
                                            placeholder="Desde — hasta"
                                            clearable
                                            withAsterisk
                                            disabled={!abierta}
                                            {...formC.getInputProps('fecha_realz_concurs')}
                                        />
                                        <DateInput
                                            valueFormat="DD/MM/YYYY"
                                            minDate={minDate}
                                            maxDate={maxDate}
                                            label="Publicación de resultados"
                                            description="Fecha en que se publican los resultados oficiales"
                                            placeholder="Seleccionar fecha"
                                            clearable
                                            withAsterisk
                                            mt="md"
                                            disabled={!abierta}
                                            {...formC.getInputProps('fecha_result')}
                                        />
                                        <Group justify="flex-end" mt="xl">
                                            <Button
                                                type="submit"
                                                loading={loadingConv}
                                                disabled={!abierta}
                                                color="violet"
                                                leftSection={<IconCalendarStats size={18} />}
                                            >
                                                Publicar fechas
                                            </Button>
                                        </Group>
                                    </form>
                                </Paper>
                            </Tabs.Panel>
                        </Tabs>
                    </Grid.Col>
                </Grid>

                {/* Publicación en página inicial */}
                {edicionParaPublicar > 0 && (
                    <Paper radius="lg" p="xl" withBorder mt="xl" className={classes.publishCard}>
                        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md" mb="lg">
                            <Group gap="md" wrap="nowrap" align="flex-start">
                                <ThemeIcon size={48} radius="md" variant="light" color="violet">
                                    <IconWorld size={26} />
                                </ThemeIcon>
                                <div>
                                    <Title order={4}>Publicar resultados en la web</Title>
                                    <Text size="sm" c="dimmed" maw={520}>
                                        Genera la tabla pública por provincias en la página inicial a partir de los
                                        resultados oficiales en <strong>estudiante_escuela</strong> (importados, revisados
                                        e integrados al histórico).
                                    </Text>
                                </div>
                            </Group>
                            <Badge color={preview?.ya_publicado ? 'teal' : 'gray'} variant="light" size="lg">
                                {preview?.ya_publicado ? 'Ya publicado' : 'Sin publicar'}
                            </Badge>
                        </Group>

                        {loadingPreview ? (
                            <Text size="sm" c="dimmed">
                                Calculando vista previa…
                            </Text>
                        ) : preview ? (
                            <>
                                <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
                                    <div className={classes.statPill}>
                                        <Text size="xs" c="dimmed">
                                            Estudiantes
                                        </Text>
                                        <Text fw={700} size="xl">
                                            {preview.total_estudiantes}
                                        </Text>
                                    </div>
                                    <div className={classes.statPill}>
                                        <Text size="xs" c="dimmed">
                                            Provincias
                                        </Text>
                                        <Text fw={700} size="xl">
                                            {preview.provincias_con_datos}
                                        </Text>
                                    </div>
                                    <div className={classes.statPill}>
                                        <Text size="xs" c="dimmed">
                                            Edición
                                        </Text>
                                        <Text fw={700} size="xl">
                                            {preview.n_edicion}ª · {preview.a_edicion}
                                        </Text>
                                    </div>
                                    <div className={classes.statPill}>
                                        <Text size="xs" c="dimmed">
                                            Celdas tabla
                                        </Text>
                                        <Text fw={700} size="xl">
                                            {preview.filas_agregadas}
                                        </Text>
                                    </div>
                                </SimpleGrid>

                                {preview.total_estudiantes === 0 ? (
                                    <Paper radius="md" p="md" className={classes.hintBox}>
                                        <Group gap="sm" wrap="nowrap" align="flex-start">
                                            <IconInfoCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                                            <Text size="sm">
                                                Aún no hay resultados oficiales para publicar. Completa el flujo:
                                                importar Excel → revisar → insertar al histórico.
                                            </Text>
                                        </Group>
                                    </Paper>
                                ) : (
                                    <Group justify="flex-end">
                                        <Button
                                            variant="light"
                                            color="violet"
                                            leftSection={<IconWorld size={18} />}
                                            onClick={() => setConfirmPublicar(true)}
                                            loading={loadingPublicar}
                                        >
                                            {preview.ya_publicado
                                                ? 'Republicar en la página inicial'
                                                : 'Publicar en la página inicial'}
                                        </Button>
                                    </Group>
                                )}
                            </>
                        ) : null}
                    </Paper>
                )}
            </Paper>

            <Modal
                opened={confirmAction !== null}
                onClose={cancelarConfirmacion}
                title={
                    confirmAction === 'abrir'
                        ? 'Confirmar apertura de edición'
                        : '¿Está seguro de cerrar la edición?'
                }
                centered
                radius="md"
                size={confirmAction === 'cerrar' ? 'md' : 'sm'}
            >
                <Stack gap="md">
                    {confirmAction === 'abrir' ? (
                        <Text size="sm">
                            Se creará la <strong>siguiente edición</strong> en secuencia. Los profesores podrán
                            iniciar preinscripciones y el concurso quedará activo.
                        </Text>
                    ) : (
                        <>
                            <Alert
                                color="red"
                                variant="light"
                                icon={<IconAlertTriangle size={20} />}
                                title="Acción irreversible para el ciclo actual"
                            >
                                Está a punto de cerrar la edición <strong>{edicionLabel}</strong>. Revise las
                                consecuencias antes de continuar.
                            </Alert>
                            <List size="sm" spacing="xs" withPadding>
                                <List.Item>Los profesores quedarán <strong>inactivos</strong>.</List.Item>
                                <List.Item>
                                    Se reinicia el estado de <strong>inscripción al concurso</strong> de los
                                    estudiantes.
                                </List.Item>
                                <List.Item>
                                    No podrá importar resultados ni preinscribir hasta abrir una nueva edición.
                                </List.Item>
                            </List>
                            {preview && preview.total_estudiantes > 0 && (
                                <Switch
                                    checked={publicarAlCerrar}
                                    onChange={(e) => setPublicarAlCerrar(e.currentTarget.checked)}
                                    label="Publicar resultados en la página inicial al cerrar"
                                    description={`${preview.total_estudiantes} estudiantes en ${preview.provincias_con_datos} provincias`}
                                />
                            )}
                            <Checkbox
                                checked={confirmCierreEntendido}
                                onChange={(e) => setConfirmCierreEntendido(e.currentTarget.checked)}
                                label="He leído la información y confirmo que deseo cerrar la edición"
                                color="red"
                            />
                        </>
                    )}
                    <Group justify="flex-end">
                        <Button variant="default" onClick={cancelarConfirmacion} disabled={loadingStatus}>
                            Cancelar
                        </Button>
                        <Button
                            color={confirmAction === 'abrir' ? 'violet' : 'red'}
                            loading={loadingStatus}
                            disabled={confirmAction === 'cerrar' && !confirmCierreEntendido}
                            onClick={() => void ejecutarCambioEstado()}
                        >
                            {confirmAction === 'abrir' ? 'Sí, abrir edición' : 'Sí, cerrar edición'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal
                opened={confirmPublicar}
                onClose={() => !loadingPublicar && setConfirmPublicar(false)}
                title="Publicar resultados en la página inicial"
                centered
                radius="md"
            >
                <Stack gap="md">
                    <Text size="sm">
                        Se actualizará la tabla pública de provincias para la{' '}
                        <strong>
                            {preview?.n_edicion}ª edición ({preview?.a_edicion})
                        </strong>{' '}
                        con <strong>{preview?.total_estudiantes}</strong> estudiantes contabilizados.
                        {preview?.ya_publicado && ' Se reemplazarán los datos publicados anteriormente.'}
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={() => setConfirmPublicar(false)}
                            disabled={loadingPublicar}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="violet"
                            loading={loadingPublicar}
                            leftSection={<IconWorld size={18} />}
                            onClick={() =>
                                edicionParaPublicar > 0 && void ejecutarPublicacion(edicionParaPublicar)
                            }
                        >
                            Confirmar publicación
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
