import {
    Alert,
    Badge,
    Button,
    Checkbox,
    Divider,
    Group,
    Loader,
    Modal,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Stepper,
    Table,
    Tabs,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconArrowLeft,
    IconArrowRight,
    IconCheck,
    IconDatabaseExport,
    IconMedal,
    IconRefresh,
    IconSearch,
    IconUserCheck,
    IconUserExclamation,
    IconLink,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ModulePageShell } from '../../components/panel/ModulePageShell';
import { FlujoResultadosPanel } from '../../components/resultados/FlujoResultadosPanel';
import { labelEstadoValidacion } from '../../config/flujoResultados';
import { useDataContext } from '../../context/DataContext';
import { calcularMedallasPendientes } from '../../lib/api/medallas';
import {
    aceptarMasivo,
    aceptarPreinscritos,
    aceptarResultado,
    ajustarMedalla,
    fetchDetalleResultado,
    fetchResultadosCoordinador,
    fetchRevisionResumen,
    insertarHistorico,
    repararVinculos,
    autoVincularDesdeExcel,
    type FiltroRevisionCoordinador,
} from '../../lib/api/resultados';
import type { IntegracionHistoricoResponse, ResultadoPendiente, RevisionResumen } from '../../types/resultadosPendientes';
import classes from '../../styles/ResultadosPendientes.module.css';

type PasoFlujo = 1 | 2 | 3;

const EXCEPCION_TABS: { value: FiltroRevisionCoordinador; label: string; estadoKey: string; color: string }[] = [
    { value: 'pendientes', label: 'No preinscritos', estadoKey: 'pendiente_no_preinscrito', color: 'orange' },
    { value: 'inconsistencias', label: 'Inconsistencias', estadoKey: 'inconsistencia', color: 'red' },
    { value: 'modificados-profesor', label: 'Modif. profesor', estadoKey: 'modificado_profesor', color: 'violet' },
];

const MEDALLAS = ['Oro', 'Plata', 'Bronce', 'Participa', 'Sin medalla'];

function estadoColor(estado?: string) {
    if (!estado) return 'gray';
    if (estado.includes('preinscrito') && !estado.includes('no')) return 'cyan';
    if (estado.includes('aceptado')) return 'teal';
    if (estado.includes('insertado')) return 'green';
    if (estado.includes('modificado')) return 'violet';
    if (estado.includes('inconsistencia')) return 'red';
    if (estado.includes('no_preinscrito')) return 'orange';
    return 'gray';
}

function medallaClass(m: string | null | undefined) {
    const v = (m ?? '').toLowerCase();
    if (v === 'oro') return classes.medallaOro;
    if (v === 'plata') return classes.medallaPlata;
    if (v === 'bronce') return classes.medallaBronce;
    return '';
}

function labelEstado(estado?: string) {
    if (!estado) return '—';
    return labelEstadoValidacion(estado).replace(/\s*\(paso \d+\)/g, '').replace(/\s*\(paso \d+→\d+\)/g, '');
}

function sexoLabel(sexo: string | null | undefined) {
    const s = (sexo ?? '').toLowerCase();
    if (s === 'male' || s === 'm') return 'Masculino';
    if (s === 'female' || s === 'f') return 'Femenino';
    return sexo || 'No indicado';
}

function pasoDesdeResumen(resumen: RevisionResumen | null): PasoFlujo {
    if (!resumen) return 1;
    const pe = resumen.por_estado?.preinscrito ?? 0;
    const ex =
        (resumen.por_estado?.pendiente_no_preinscrito ?? 0) +
        (resumen.por_estado?.inconsistencia ?? 0) +
        (resumen.por_estado?.modificado_profesor ?? 0);
    const ac = resumen.por_estado?.aceptado_coordinador ?? 0;
    if (pe > 0) return 1;
    if (ex > 0) return 2;
    if (ac > 0) return 3;
    return 1;
}

function filtroParaPaso(paso: PasoFlujo, excepcionTab: FiltroRevisionCoordinador): FiltroRevisionCoordinador {
    if (paso === 1) return 'preinscritos';
    if (paso === 2) return excepcionTab;
    if (paso === 3) return 'aceptados';
    return 'todos';
}

export default function PagResultadosPendientes() {
    const { numeroEdicion, anioEdicion } = useDataContext();
    const [searchParams, setSearchParams] = useSearchParams();

    const pasoParam = searchParams.get('paso');
    const [paso, setPaso] = useState<PasoFlujo>(() => {
        const n = Number(pasoParam);
        return n === 2 || n === 3 ? n : 1;
    });
    const [excepcionTab, setExcepcionTab] = useState<FiltroRevisionCoordinador>('pendientes');

    const [resumen, setResumen] = useState<RevisionResumen | null>(null);
    const [rows, setRows] = useState<ResultadoPendiente[]>([]);
    const [pendIntegracion, setPendIntegracion] = useState<ResultadoPendiente[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResumen, setLoadingResumen] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [detalle, setDetalle] = useState<ResultadoPendiente | null>(null);
    const [medallaEdit, setMedallaEdit] = useState('Participa');
    const [accionando, setAccionando] = useState(false);
    const [confirmIntegrar, setConfirmIntegrar] = useState(false);
    const [resultadoIntegracion, setResultadoIntegracion] = useState<IntegracionHistoricoResponse | null>(null);

    const tabActivo = filtroParaPaso(paso, excepcionTab);

    const cambiarPaso = (nuevo: PasoFlujo) => {
        setPaso(nuevo);
        setSearchParams({ paso: String(nuevo) }, { replace: true });
        setSelected(new Set());
        setBusqueda('');
    };

    const cargarResumen = useCallback(async () => {
        if (numeroEdicion <= 0) {
            setResumen(null);
            setLoadingResumen(false);
            return;
        }
        setLoadingResumen(true);
        try {
            setResumen(await fetchRevisionResumen(numeroEdicion));
        } catch {
            setResumen(null);
        } finally {
            setLoadingResumen(false);
        }
    }, [numeroEdicion]);

    const cargar = useCallback(async () => {
        if (numeroEdicion <= 0) {
            setRows([]);
            setPendIntegracion([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [res, pendInt] = await Promise.all([
                fetchResultadosCoordinador(numeroEdicion, tabActivo),
                paso === 3
                    ? fetchResultadosCoordinador(numeroEdicion, 'pendientes-integracion')
                    : Promise.resolve({ data: [] as ResultadoPendiente[], total: 0, success: true }),
            ]);
            setRows(res.data ?? []);
            setPendIntegracion(pendInt.data ?? []);
            setSelected(new Set());
        } catch {
            setRows([]);
            setPendIntegracion([]);
            notifications.show({ color: 'red', title: 'Error', message: 'No se pudieron cargar los resultados.' });
        } finally {
            setLoading(false);
        }
    }, [numeroEdicion, tabActivo, paso]);

    useEffect(() => {
        void cargarResumen();
    }, [cargarResumen]);

    useEffect(() => {
        void cargar();
    }, [cargar]);

    useEffect(() => {
        if (!pasoParam && resumen && !loadingResumen) {
            const sugerido = pasoDesdeResumen(resumen);
            if (sugerido !== paso) {
                cambiarPaso(sugerido);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumen, loadingResumen, pasoParam]);

    useEffect(() => {
        if (paso === 2 && resumen) {
            const primeraConDatos = EXCEPCION_TABS.find(
                (t) => (resumen.por_estado[t.estadoKey] ?? 0) > 0,
            );
            if (primeraConDatos && !EXCEPCION_TABS.some((t) => t.value === excepcionTab && (resumen.por_estado[t.estadoKey] ?? 0) > 0)) {
                setExcepcionTab(primeraConDatos.value);
            }
        }
    }, [paso, resumen, excepcionTab]);

    const refrescarTodo = async () => {
        await Promise.all([cargarResumen(), cargar()]);
    };

    const filtradas = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.nombre_estudiante?.toLowerCase().includes(q) ||
                r.correo_profesor?.toLowerCase().includes(q) ||
                r.escuela_excel?.toLowerCase().includes(q) ||
                r.nombre_profesor?.toLowerCase().includes(q),
        );
    }, [rows, busqueda]);

    const allSelected = filtradas.length > 0 && selected.size === filtradas.length;

    const toggleAll = () =>
        setSelected(allSelected ? new Set() : new Set(filtradas.map((r) => r.id)));

    const toggleOne = (id: number) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const abrirDetalle = async (id: number) => {
        try {
            const res = await fetchDetalleResultado(id);
            setDetalle(res.data);
            setMedallaEdit(res.data?.medalla ?? 'Participa');
        } catch {
            notifications.show({ color: 'red', title: 'Error', message: 'No se pudo cargar el detalle.' });
        }
    };

    const ejecutar = async (fn: () => Promise<unknown>, ok: string) => {
        setAccionando(true);
        try {
            await fn();
            notifications.show({ color: 'teal', title: 'Listo', message: ok, icon: <IconCheck size={16} /> });
            setDetalle(null);
            setConfirmIntegrar(false);
            await refrescarTodo();
        } catch {
            notifications.show({ color: 'red', title: 'Error', message: 'La acción no se completó.' });
        } finally {
            setAccionando(false);
        }
    };

    const countPreinscritos = resumen?.por_estado?.preinscrito ?? 0;
    const countExcepciones =
        (resumen?.por_estado?.pendiente_no_preinscrito ?? 0) +
        (resumen?.por_estado?.inconsistencia ?? 0) +
        (resumen?.por_estado?.modificado_profesor ?? 0);
    const countAceptados = resumen?.por_estado?.aceptado_coordinador ?? 0;
    const countHistorico = resumen?.por_estado?.insertado_historico ?? 0;

    const puedeAceptar = paso === 1 || paso === 2;

    const renderTabla = () => (
        <>
            <Group mb="md" wrap="wrap">
                <TextInput
                    placeholder="Buscar estudiante, profesor o escuela…"
                    leftSection={<IconSearch size={16} />}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 220 }}
                />
                {puedeAceptar && (
                    <Button
                        variant="light"
                        color="teal"
                        disabled={selected.size === 0 || accionando}
                        onClick={() =>
                            ejecutar(() => aceptarMasivo([...selected]), `${selected.size} registro(s) aceptado(s).`)
                        }
                    >
                        Aceptar seleccionados ({selected.size})
                    </Button>
                )}
            </Group>

            {loading ? (
                <Group justify="center" py="xl">
                    <Loader />
                </Group>
            ) : (
                <Table.ScrollContainer minWidth={1100}>
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                {puedeAceptar && (
                                    <Table.Th w={40}>
                                        <Checkbox checked={allSelected} onChange={toggleAll} />
                                    </Table.Th>
                                )}
                                <Table.Th>Estudiante</Table.Th>
                                <Table.Th>Escuela (Excel)</Table.Th>
                                <Table.Th>Profesor (Teacher Email)</Table.Th>
                                <Table.Th>Vínculo</Table.Th>
                                <Table.Th>Categoría</Table.Th>
                                <Table.Th>Puntos</Table.Th>
                                <Table.Th>Medalla</Table.Th>
                                <Table.Th>Estado</Table.Th>
                                <Table.Th w={140}>Acciones</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filtradas.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={puedeAceptar ? 10 : 9}>
                                        <Text ta="center" c="dimmed" py="xl">
                                            {busqueda
                                                ? 'Ningún registro coincide con la búsqueda.'
                                                : 'Sin registros en este paso.'}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                filtradas.map((r) => (
                                    <Table.Tr key={r.id}>
                                        {puedeAceptar && (
                                            <Table.Td>
                                                <Checkbox
                                                    checked={selected.has(r.id)}
                                                    onChange={() => toggleOne(r.id)}
                                                />
                                            </Table.Td>
                                        )}
                                        <Table.Td>
                                            <Text size="sm" fw={500}>
                                                {r.nombre_estudiante}
                                            </Text>
                                            {r.id_estudiante && (
                                                <Text size="xs" c="dimmed">
                                                    ID est. {r.id_estudiante}
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td maw={160}>
                                            <Text size="sm" lineClamp={2}>
                                                {r.escuela_excel || '—'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td maw={180}>
                                            <Text size="sm" lineClamp={1}>
                                                {r.correo_profesor ?? '—'}
                                            </Text>
                                            {r.id_profesor && (
                                                <Text size="xs" c="dimmed">
                                                    ID prof. {r.id_profesor}
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {r.id_estudiante && r.id_escuela ? (
                                                <Badge color="teal" variant="light" size="sm">
                                                    OK · est.{r.id_estudiante}
                                                </Badge>
                                            ) : (
                                                <Badge color="orange" variant="light" size="sm">
                                                    Sin vínculo
                                                </Badge>
                                            )}
                                        </Table.Td>
                                        <Table.Td>{r.categoria?.nombre_cuba ?? '—'}</Table.Td>
                                        <Table.Td fw={600}>{r.puntuacion ?? '—'}</Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" className={medallaClass(r.medalla)}>
                                                {r.medalla ?? '—'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={estadoColor(r.estado_validacion ?? r.estado)}
                                                variant="light"
                                                size="sm"
                                            >
                                                {labelEstado(r.estado_validacion ?? r.estado)}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap={4} wrap="nowrap">
                                                <Button size="xs" variant="subtle" onClick={() => void abrirDetalle(r.id)}>
                                                    Ver
                                                </Button>
                                                {puedeAceptar && (
                                                    <Button
                                                        size="xs"
                                                        color="teal"
                                                        variant="light"
                                                        loading={accionando}
                                                        onClick={() =>
                                                            ejecutar(
                                                                () => aceptarResultado(r.id),
                                                                'Resultado aceptado.',
                                                            )
                                                        }
                                                    >
                                                        Aceptar
                                                    </Button>
                                                )}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            )}
        </>
    );

    if (numeroEdicion <= 0) {
        return (
            <ModulePageShell
                badge="Coordinador Nacional"
                title="Revisión de resultados"
                subtitle="Flujo guiado: preinscritos → excepciones → histórico oficial."
                backTo="/coordinador/dashboard"
                gradient="yellow"
                showApiNotice={false}
            >
                <Alert color="orange" title="Sin edición activa">
                    Abre una edición en{' '}
                    <Text component={Link} to="/gestionar_concurso" span inherit c="blue">
                        Gestionar edición
                    </Text>{' '}
                    e importa el Excel en{' '}
                    <Text component={Link} to="/coordinador/importar-resultados" span inherit c="blue">
                        Importar resultados
                    </Text>
                    .
                </Alert>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell
            badge="Coordinador Nacional"
            title="Revisión de resultados pendientes"
            subtitle={`Edición ${numeroEdicion}${anioEdicion ? ` (${anioEdicion})` : ''} · paso 8 del flujo: revisar, aceptar e integrar a estudiante_escuela`}
            backTo="/coordinador/dashboard"
            gradient="yellow"
            showApiNotice={false}
        >
            {loadingResumen ? (
                <Group justify="center" py="md" mb="lg">
                    <Loader size="sm" />
                </Group>
            ) : !resumen || resumen.total === 0 ? (
                <Alert color="blue" mb="lg" title="Sin datos de revisión">
                    Primero importa el Excel Ville.{' '}
                    <Text component={Link} to="/coordinador/importar-resultados" span inherit c="blue">
                        Ir a importar →
                    </Text>
                </Alert>
            ) : (
                <>
                    <FlujoResultadosPanel destacar={[8]} titulo="Paso 8 · Revisión e integración al histórico" />

                    <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
                        <Paper withBorder p="sm" radius="md" ta="center">
                            <Text size="xs" c="dimmed">
                                Preinscritos
                            </Text>
                            <Text fw={700} size="lg" c={countPreinscritos > 0 ? 'cyan' : undefined}>
                                {countPreinscritos}
                            </Text>
                        </Paper>
                        <Paper withBorder p="sm" radius="md" ta="center">
                            <Text size="xs" c="dimmed">
                                Excepciones
                            </Text>
                            <Text fw={700} size="lg" c={countExcepciones > 0 ? 'orange' : undefined}>
                                {countExcepciones}
                            </Text>
                        </Paper>
                        <Paper withBorder p="sm" radius="md" ta="center">
                            <Text size="xs" c="dimmed">
                                Listos p/ histórico
                            </Text>
                            <Text fw={700} size="lg" c={countAceptados > 0 ? 'teal' : undefined}>
                                {countAceptados}
                            </Text>
                        </Paper>
                        <Paper withBorder p="sm" radius="md" ta="center">
                            <Text size="xs" c="dimmed">
                                En histórico
                            </Text>
                            <Text fw={700} size="lg" c={countHistorico > 0 ? 'green' : undefined}>
                                {countHistorico}
                            </Text>
                        </Paper>
                    </SimpleGrid>

                    <Paper withBorder radius="md" p="lg" mb="lg" className={classes.workflowStepper}>
                        <Stepper active={paso - 1} onStepClick={(i) => cambiarPaso((i + 1) as PasoFlujo)} allowNextStepsSelect>
                            <Stepper.Step
                                label="Aceptar preinscritos"
                                description={countPreinscritos > 0 ? `${countPreinscritos} pendiente(s)` : 'Completado'}
                                icon={<IconUserCheck size={18} />}
                            />
                            <Stepper.Step
                                label="Revisar excepciones"
                                description={countExcepciones > 0 ? `${countExcepciones} por revisar` : 'Sin pendientes'}
                                icon={<IconUserExclamation size={18} />}
                            />
                            <Stepper.Step
                                label="Integrar al histórico"
                                description={`${countAceptados} listo(s) · ${countHistorico} integrado(s)`}
                                icon={<IconDatabaseExport size={18} />}
                            />
                        </Stepper>
                    </Paper>
                </>
            )}

            {/* ── PASO 1 ── */}
            {paso === 1 && resumen && resumen.total > 0 && (
                <Stack gap="md">
                    <Alert color="cyan" variant="light" title="Paso 1 · Aceptar preinscritos">
                        Los estudiantes que coinciden con la preinscripción pueden aceptarse en bloque. Después
                        continúe al paso 2 para revisar excepciones.
                    </Alert>

                    {countPreinscritos > 0 ? (
                        <>
                            <Group>
                                <Button
                                    color="cyan"
                                    leftSection={<IconUserCheck size={16} />}
                                    loading={accionando}
                                    onClick={() =>
                                        ejecutar(
                                            () => aceptarPreinscritos(numeroEdicion),
                                            `Se aceptaron ${countPreinscritos} preinscrito(s).`,
                                        )
                                    }
                                >
                                    Aceptar todos los preinscritos ({countPreinscritos})
                                </Button>
                                <Button
                                    variant="light"
                                    color="yellow"
                                    leftSection={<IconMedal size={16} />}
                                    loading={accionando}
                                    onClick={() =>
                                        ejecutar(
                                            () => calcularMedallasPendientes(numeroEdicion),
                                            'Medallas recalculadas.',
                                        )
                                    }
                                >
                                    Recalcular medallas
                                </Button>
                            </Group>
                            {renderTabla()}
                        </>
                    ) : (
                        <Paper withBorder p="xl" radius="md" ta="center">
                            <ThemeIcon size={48} radius="xl" variant="light" color="teal" mx="auto" mb="md">
                                <IconCheck size={24} />
                            </ThemeIcon>
                            <Text fw={600} mb="xs">
                                Paso 1 completado
                            </Text>
                            <Text size="sm" c="dimmed" mb="md">
                                No quedan preinscritos por aceptar. Continúe con las excepciones.
                            </Text>
                            <Button
                                color="orange"
                                rightSection={<IconArrowRight size={16} />}
                                onClick={() => cambiarPaso(2)}
                            >
                                Ir al paso 2: Revisar excepciones
                            </Button>
                        </Paper>
                    )}

                    {countPreinscritos === 0 && (
                        <Group justify="flex-end">
                            <Button variant="default" leftSection={<IconArrowLeft size={16} />} component={Link} to="/coordinador/importar-resultados">
                                Volver a importar
                            </Button>
                            <Button color="orange" rightSection={<IconArrowRight size={16} />} onClick={() => cambiarPaso(2)}>
                                Paso 2: Excepciones
                            </Button>
                        </Group>
                    )}
                </Stack>
            )}

            {/* ── PASO 2 ── */}
            {paso === 2 && resumen && resumen.total > 0 && (
                <Stack gap="md">
                    <Alert color="orange" variant="light" title="Paso 2 · Revisar excepciones">
                        Revise cada caso: no preinscritos, inconsistencias de escuela y correcciones hechas por
                        profesores. Acepte los que estén listos para integrar al histórico.
                    </Alert>

                    <Tabs
                        value={excepcionTab}
                        onChange={(v) => v && setExcepcionTab(v as FiltroRevisionCoordinador)}
                    >
                        <Tabs.List style={{ flexWrap: 'wrap' }}>
                            {EXCEPCION_TABS.map((t) => {
                                const n = resumen.por_estado[t.estadoKey] ?? 0;
                                return (
                                    <Tabs.Tab
                                        key={t.value}
                                        value={t.value}
                                        color={t.color}
                                        rightSection={
                                            n > 0 ? (
                                                <Badge size="xs" circle color={t.color}>
                                                    {n}
                                                </Badge>
                                            ) : undefined
                                        }
                                    >
                                        {t.label}
                                    </Tabs.Tab>
                                );
                            })}
                        </Tabs.List>
                    </Tabs>

                    {countExcepciones === 0 ? (
                        <Paper withBorder p="xl" radius="md" ta="center">
                            <ThemeIcon size={48} radius="xl" variant="light" color="teal" mx="auto" mb="md">
                                <IconCheck size={24} />
                            </ThemeIcon>
                            <Text fw={600} mb="xs">
                                Sin excepciones pendientes
                            </Text>
                            <Text size="sm" c="dimmed" mb="md">
                                Todos los casos especiales fueron revisados. Puede integrar al histórico.
                            </Text>
                            <Button
                                color="teal"
                                rightSection={<IconArrowRight size={16} />}
                                onClick={() => cambiarPaso(3)}
                            >
                                Ir al paso 3: Integrar al histórico
                            </Button>
                        </Paper>
                    ) : (
                        renderTabla()
                    )}

                    <Group justify="space-between" mt="md">
                        <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => cambiarPaso(1)}>
                            Paso 1
                        </Button>
                        <Group>
                            <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={() => void refrescarTodo()}>
                                Actualizar
                            </Button>
                            <Button
                                color="teal"
                                rightSection={<IconArrowRight size={16} />}
                                onClick={() => cambiarPaso(3)}
                                disabled={countAceptados === 0 && countExcepciones > 0}
                            >
                                Paso 3: Integrar ({countAceptados})
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            )}

            {/* ── PASO 3 ── */}
            {paso === 3 && resumen && resumen.total > 0 && (
                <Stack gap="md">
                    <Alert color="teal" variant="light" title="Paso 3 · Integrar al histórico oficial">
                        Los registros <strong>aceptados</strong> se copian a{' '}
                        <strong>estudiante_escuela</strong>. Los profesores verán esos resultados como oficiales.
                    </Alert>

                    <SimpleGrid cols={{ base: 1, sm: 3 }}>
                        <Paper withBorder p="lg" radius="md" className={classes.integracionCard}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                Listos para integrar
                            </Text>
                            <Text fw={800} size="2rem" c="teal">
                                {countAceptados}
                            </Text>
                        </Paper>
                        <Paper withBorder p="lg" radius="md" className={classes.integracionCard}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                Sin vínculo (omitidos)
                            </Text>
                            <Text fw={800} size="2rem" c={pendIntegracion.length > 0 ? 'orange' : undefined}>
                                {pendIntegracion.length}
                            </Text>
                        </Paper>
                        <Paper withBorder p="lg" radius="md" className={classes.integracionCard}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                Ya en histórico
                            </Text>
                            <Text fw={800} size="2rem" c="green">
                                {countHistorico}
                            </Text>
                        </Paper>
                    </SimpleGrid>

                    {pendIntegracion.length > 0 && (
                        <Alert color="orange" title="Registros sin vínculo estudiante/escuela">
                            {pendIntegracion.length} aceptado(s) no tienen{' '}
                            <code>id_estudiante</code> o <code>id_escuela</code>. El sistema vincula por{' '}
                            <strong>Teacher Email</strong> + <strong>Student Name</strong> (o Student Username = CI)
                            contra la preinscripción del profesor en <code>profesor_estudiante</code>.
                            <Group mt="md" gap="sm">
                                <Button
                                    variant="filled"
                                    color="teal"
                                    leftSection={<IconLink size={16} />}
                                    loading={accionando}
                                    onClick={async () => {
                                        setAccionando(true);
                                        try {
                                            const res = await autoVincularDesdeExcel(numeroEdicion);
                                            notifications.show({
                                                color: res.vinculados > 0 ? 'teal' : 'orange',
                                                title: 'Auto-vinculación',
                                                message: res.message,
                                                autoClose: 8000,
                                            });
                                            await refrescarTodo();
                                        } catch {
                                            notifications.show({
                                                color: 'red',
                                                title: 'Error',
                                                message: 'No se pudo auto-vincular.',
                                            });
                                        } finally {
                                            setAccionando(false);
                                        }
                                    }}
                                >
                                    Auto-vincular desde Excel (crear preinscripciones)
                                </Button>
                                <Button
                                    variant="light"
                                    color="orange"
                                    leftSection={<IconLink size={16} />}
                                    loading={accionando}
                                    onClick={() =>
                                        ejecutar(
                                            () => repararVinculos(numeroEdicion),
                                            'Vínculos reparados por Teacher Email + Student Name.',
                                        )
                                    }
                                >
                                    Reparar solo preinscritos existentes
                                </Button>
                            </Group>
                        </Alert>
                    )}

                    {resultadoIntegracion && (
                        <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-teal-0)">
                            <Title order={5} mb="sm">
                                Última integración
                            </Title>
                            <Text size="sm" mb="xs">
                                {resultadoIntegracion.message}
                            </Text>
                            <Group gap="lg">
                                <Text size="sm">
                                    Insertados: <strong>{resultadoIntegracion.insertados}</strong>
                                </Text>
                                <Text size="sm">
                                    Omitidos: <strong>{resultadoIntegracion.omitidos}</strong>
                                </Text>
                            </Group>
                        </Paper>
                    )}

                    {countAceptados > 0 ? (
                        <Group>
                            <Button
                                size="md"
                                color="teal"
                                leftSection={<IconDatabaseExport size={18} />}
                                onClick={() => setConfirmIntegrar(true)}
                            >
                                Integrar {countAceptados} registro(s) al histórico
                            </Button>
                        </Group>
                    ) : countHistorico > 0 ? (
                        <Paper withBorder p="xl" radius="md" ta="center">
                            <ThemeIcon size={48} radius="xl" variant="light" color="green" mx="auto" mb="md">
                                <IconCheck size={24} />
                            </ThemeIcon>
                            <Text fw={600} mb="xs">
                                Integración completada
                            </Text>
                            <Text size="sm" c="dimmed" mb="md">
                                {countHistorico} registro(s) ya están en el histórico oficial.
                            </Text>
                            <Group justify="center" gap="sm">
                                <Button component={Link} to="/gestionar_concurso" color="violet">
                                    Publicar en web
                                </Button>
                                <Button variant="default" component={Link} to="/coordinador/dashboard">
                                    Panel coordinador
                                </Button>
                            </Group>
                        </Paper>
                    ) : (
                        <Alert color="gray" title="Nada que integrar">
                            Acepte preinscritos y excepciones en los pasos anteriores antes de integrar.
                        </Alert>
                    )}

                    {countAceptados > 0 && renderTabla()}

                    <Group justify="space-between" mt="md">
                        <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => cambiarPaso(2)}>
                            Paso 2: Excepciones
                        </Button>
                        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={() => void refrescarTodo()}>
                            Actualizar
                        </Button>
                    </Group>
                </Stack>
            )}

            {/* Modal detalle */}
            <Modal
                opened={detalle !== null}
                onClose={() => setDetalle(null)}
                title={
                    <Group gap="xs">
                        <Text fw={600}>Detalle #{detalle?.id}</Text>
                        {detalle && (
                            <Badge color={estadoColor(detalle.estado_validacion ?? detalle.estado)} variant="light">
                                {labelEstado(detalle.estado_validacion ?? detalle.estado)}
                            </Badge>
                        )}
                    </Group>
                }
                size="lg"
                radius="md"
            >
                {detalle && (
                    <Stack gap="md">
                        <Title order={4}>{detalle.nombre_estudiante}</Title>

                        {(detalle.descripcion_estado || detalle.datos_faltantes) && (
                            <Alert color="orange" variant="light" icon={<IconUserExclamation size={18} />}>
                                {detalle.descripcion_estado ?? detalle.datos_faltantes}
                            </Alert>
                        )}

                        <div className={classes.detailGrid}>
                            <div className={classes.detailSection}>
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                                    Estudiante
                                </Text>
                                <Text size="sm">Usuario: {detalle.student_username ?? '—'}</Text>
                                <Text size="sm">Sexo: {sexoLabel(detalle.sexo)}</Text>
                                <Text size="sm">Grado: {detalle.grado ?? '—'}</Text>
                                <Text size="sm">ID vínculo: {detalle.id_estudiante ?? 'Sin vínculo'}</Text>
                            </div>
                            <div className={classes.detailSection}>
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                                    Resultado
                                </Text>
                                <Text size="sm">Categoría: {detalle.categoria?.nombre_cuba ?? '—'}</Text>
                                <Text size="sm">Puntuación: {detalle.puntuacion ?? '—'}</Text>
                                <Text size="sm">Medalla: {detalle.medalla ?? '—'}</Text>
                            </div>
                            <div className={classes.detailSection}>
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                                    Profesor
                                </Text>
                                <Text size="sm">{detalle.nombre_profesor ?? '—'}</Text>
                                <Text size="sm" c="dimmed">
                                    {detalle.correo_profesor ?? '—'}
                                </Text>
                            </div>
                            <div className={classes.detailSection}>
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                                    Escuela
                                </Text>
                                <Text size="sm">Excel: {detalle.escuela_excel ?? '—'}</Text>
                                <Text size="sm">
                                    Sistema:{' '}
                                    {(detalle as ResultadoPendiente & { escuela?: { nombre?: string } }).escuela
                                        ?.nombre ??
                                        (detalle.id_escuela ? `ID ${detalle.id_escuela}` : '—')}
                                </Text>
                            </div>
                        </div>

                        <Divider />

                        <Select
                            label="Ajustar medalla"
                            data={MEDALLAS}
                            value={medallaEdit}
                            onChange={(v) => setMedallaEdit(v ?? 'Participa')}
                        />

                        <Group justify="space-between">
                            <Button variant="default" onClick={() => setDetalle(null)}>
                                Cerrar
                            </Button>
                            <Group>
                                <Button
                                    variant="light"
                                    loading={accionando}
                                    onClick={() =>
                                        ejecutar(
                                            () => ajustarMedalla(detalle.id, medallaEdit),
                                            'Medalla actualizada.',
                                        )
                                    }
                                >
                                    Guardar medalla
                                </Button>
                                {!['aceptado_coordinador', 'insertado_historico'].includes(
                                    detalle.estado_validacion ?? '',
                                ) && (
                                    <Button
                                        color="teal"
                                        loading={accionando}
                                        leftSection={<IconCheck size={16} />}
                                        onClick={() =>
                                            ejecutar(() => aceptarResultado(detalle.id), 'Resultado aceptado.')
                                        }
                                    >
                                        Aceptar
                                    </Button>
                                )}
                            </Group>
                        </Group>
                    </Stack>
                )}
            </Modal>

            <Modal
                opened={confirmIntegrar}
                onClose={() => !accionando && setConfirmIntegrar(false)}
                title="Confirmar integración al histórico"
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        Se copiarán <strong>{countAceptados}</strong> registro(s) aceptados a{' '}
                        <strong>estudiante_escuela</strong>.
                    </Text>
                    {pendIntegracion.length > 0 && (
                        <Text size="sm" c="orange">
                            {pendIntegracion.length} registro(s) serán omitidos por falta de vínculo estudiante/escuela.
                        </Text>
                    )}
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setConfirmIntegrar(false)} disabled={accionando}>
                            Cancelar
                        </Button>
                        <Button
                            color="teal"
                            loading={accionando}
                            leftSection={<IconDatabaseExport size={16} />}
                            onClick={async () => {
                                setAccionando(true);
                                try {
                                    const res = await insertarHistorico(numeroEdicion);
                                    setResultadoIntegracion(res);
                                    setConfirmIntegrar(false);
                                    notifications.show({
                                        color: 'teal',
                                        title: 'Integración completada',
                                        message: res.message,
                                        icon: <IconCheck size={16} />,
                                    });
                                    await refrescarTodo();
                                } catch {
                                    notifications.show({
                                        color: 'red',
                                        title: 'Error',
                                        message: 'No se pudo integrar al histórico.',
                                    });
                                } finally {
                                    setAccionando(false);
                                }
                            }}
                        >
                            Confirmar integración
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </ModulePageShell>
    );
}
