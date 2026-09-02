import {
    Badge,
    Button,
    Group,
    Loader,
    Modal,
    Paper,
    SimpleGrid,
    Stack,
    Table,
    Tabs,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconMedal } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ModulePageShell } from '../../components/panel/ModulePageShell';
import { FlujoResultadosPanel } from '../../components/resultados/FlujoResultadosPanel';
import { useDataContext } from '../../context/DataContext';
import {
    fetchDetalleOficialProfesor,
    fetchDetallePendienteProfesor,
    fetchOficialesProfesor,
    fetchOficialesResumenProfesor,
    fetchPendientesProfesor,
    getProfesorId,
    modificarPendienteProfesor,
} from '../../lib/api/resultados';
import type { ResultadoOficial, ResultadoPendiente } from '../../types/resultadosPendientes';

function medallaColor(m: string | null) {
    const v = (m ?? '').toLowerCase();
    if (v === 'oro') return 'yellow';
    if (v === 'plata') return 'gray';
    if (v === 'bronce') return 'orange';
    return 'blue';
}

function estadoColor(estado?: string) {
    if (estado?.includes('inconsistencia')) return 'red';
    if (estado?.includes('modificado')) return 'violet';
    return 'orange';
}

export default function PagResultadosProfesor() {
    const { numeroEdicion, anioEdicion } = useDataContext();
    const idProfesor = getProfesorId();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') === 'oficiales' ? 'oficiales' : 'pendientes';

    const [pendientes, setPendientes] = useState<ResultadoPendiente[]>([]);
    const [oficiales, setOficiales] = useState<ResultadoOficial[]>([]);
    const [resumen, setResumen] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState<ResultadoPendiente | null>(null);
    const [detalleOficial, setDetalleOficial] = useState<Record<string, unknown> | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState({
        nombre_estudiante: '',
        escuela_excel: '',
        grado: '',
        sexo: '',
        observaciones: '',
    });

    const cargarPendientes = useCallback(async () => {
        if (!idProfesor || numeroEdicion <= 0) return;
        const res = await fetchPendientesProfesor(numeroEdicion, idProfesor);
        setPendientes(res.data ?? []);
    }, [idProfesor, numeroEdicion]);

    const cargarOficiales = useCallback(async () => {
        if (!idProfesor || numeroEdicion <= 0) return;
        const [lista, res] = await Promise.all([
            fetchOficialesProfesor(numeroEdicion, idProfesor),
            fetchOficialesResumenProfesor(numeroEdicion, idProfesor),
        ]);
        setOficiales(lista.data ?? []);
        setResumen(res.por_medalla ?? {});
    }, [idProfesor, numeroEdicion]);

    const cargar = useCallback(async () => {
        if (!idProfesor || numeroEdicion <= 0) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            if (tab === 'pendientes') {
                await cargarPendientes();
            } else {
                await cargarOficiales();
            }
        } catch {
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'No se pudieron cargar los resultados.',
            });
        } finally {
            setLoading(false);
        }
    }, [tab, idProfesor, numeroEdicion, cargarPendientes, cargarOficiales]);

    useEffect(() => {
        void cargar();
    }, [cargar]);

    const abrirEdicion = async (id: number) => {
        if (!idProfesor) return;
        try {
            const res = await fetchDetallePendienteProfesor(idProfesor, id);
            const p = res.data as ResultadoPendiente;
            setEditando(p);
            setForm({
                nombre_estudiante: p.nombre_estudiante ?? '',
                escuela_excel: p.escuela_excel ?? '',
                grado: p.grado != null ? String(p.grado) : '',
                sexo: p.sexo ?? '',
                observaciones: p.observaciones ?? '',
            });
        } catch {
            notifications.show({ color: 'red', title: 'Error', message: 'No se pudo abrir el pendiente.' });
        }
    };

    const guardarPendiente = async () => {
        if (!editando) return;
        setGuardando(true);
        try {
            await modificarPendienteProfesor(editando.id, {
                nombre_estudiante: form.nombre_estudiante,
                escuela_excel: form.escuela_excel,
                grado: form.grado ? Number(form.grado) : null,
                sexo: form.sexo,
                observaciones: form.observaciones,
            });
            notifications.show({
                color: 'teal',
                title: 'Enviado al coordinador',
                message: 'El pendiente quedó marcado como modificado_profesor y requiere aprobación.',
            });
            setEditando(null);
            await cargarPendientes();
        } catch {
            notifications.show({ color: 'red', title: 'Error', message: 'No se pudo guardar el pendiente.' });
        } finally {
            setGuardando(false);
        }
    };

    const verOficial = async (idEstudianteEscuela: number) => {
        if (!idProfesor) return;
        try {
            const res = await fetchDetalleOficialProfesor(idProfesor, idEstudianteEscuela);
            setDetalleOficial(res.data);
        } catch {
            notifications.show({ color: 'red', title: 'Error', message: 'No se pudo cargar el detalle.' });
        }
    };

    if (!idProfesor) {
        return (
            <ModulePageShell
                badge="Profesor"
                title="Mis resultados"
                subtitle="Pendientes de corrección y resultados oficiales de la edición."
                backTo="/profesor/dashboard"
                gradient="blue"
                showApiNotice={false}
            >
                <Text c="orange">No se encontró el ID del profesor. Vuelve a iniciar sesión.</Text>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell
            badge="Profesor"
            title="Mis resultados"
            subtitle={`Edición ${numeroEdicion}${anioEdicion ? ` (${anioEdicion})` : ''} · pasos 9–10: pendientes vs oficiales`}
            backTo="/profesor/dashboard"
            gradient="blue"
            showApiNotice={false}
        >
            <FlujoResultadosPanel
                destacar={tab === 'pendientes' ? [9] : [10]}
                actor="profesor"
                titulo={tab === 'pendientes' ? 'Paso 9 · Pendientes a corregir' : 'Paso 10 · Resultados oficiales'}
            />

            <Text size="sm" c="dimmed" mb="md" mt="md">
                <strong>Pendientes</strong> se leen de <code>resultados_pendientes</code> (casos que debe revisar).
                Los <strong>oficiales</strong> se leen de <code>estudiante_escuela</code>, una vez integrados por el
                coordinador.
            </Text>

            <Tabs
                value={tab}
                onChange={(v) => setSearchParams(v === 'oficiales' ? { tab: 'oficiales' } : {})}
                mb="md"
            >
                <Tabs.List>
                    <Tabs.Tab value="pendientes" leftSection={<IconAlertTriangle size={16} />}>
                        Pendientes ({pendientes.length})
                    </Tabs.Tab>
                    <Tabs.Tab value="oficiales" leftSection={<IconMedal size={16} />}>
                        Resultados oficiales
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {loading ? (
                <Group justify="center" py="xl">
                    <Loader />
                </Group>
            ) : tab === 'pendientes' ? (
                <>
                    {pendientes.length === 0 ? (
                        <Paper withBorder p="lg" radius="md">
                            <Text c="dimmed" ta="center">
                                No tienes pendientes por corregir en esta edición.
                            </Text>
                        </Paper>
                    ) : (
                        <Table.ScrollContainer minWidth={900}>
                            <Table striped highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Estudiante</Table.Th>
                                        <Table.Th>Escuela (Excel)</Table.Th>
                                        <Table.Th>Categoría</Table.Th>
                                        <Table.Th>Puntos</Table.Th>
                                        <Table.Th>Estado</Table.Th>
                                        <Table.Th>Motivo</Table.Th>
                                        <Table.Th>Acción</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {pendientes.map((p) => (
                                        <Table.Tr key={p.id}>
                                            <Table.Td>{p.nombre_estudiante}</Table.Td>
                                            <Table.Td>{p.escuela_excel || '—'}</Table.Td>
                                            <Table.Td>{p.categoria?.nombre_cuba ?? '—'}</Table.Td>
                                            <Table.Td>{p.puntuacion ?? '—'}</Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    color={estadoColor(p.estado_validacion ?? p.estado)}
                                                    variant="light"
                                                >
                                                    {p.estado_validacion ?? p.estado}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td maw={200}>
                                                <Text size="xs" lineClamp={2}>
                                                    {p.descripcion_estado ?? p.datos_faltantes ?? '—'}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Button size="xs" variant="light" onClick={() => void abrirEdicion(p.id)}>
                                                    Corregir
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                    )}
                </>
            ) : (
                <>
                    {Object.keys(resumen).length > 0 && (
                        <SimpleGrid cols={{ base: 2, sm: 4, md: 6 }} mb="lg">
                            <Paper withBorder p="md" radius="md">
                                <Text size="xs" c="dimmed">
                                    Total
                                </Text>
                                <Text fw={700} size="xl">
                                    {oficiales.length}
                                </Text>
                            </Paper>
                            {Object.entries(resumen).map(([medalla, total]) => (
                                <Paper key={medalla} withBorder p="md" radius="md">
                                    <Text size="xs" c="dimmed">
                                        {medalla || 'Participa'}
                                    </Text>
                                    <Text fw={700} size="xl">
                                        {total}
                                    </Text>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    )}

                    {oficiales.length === 0 ? (
                        <Paper withBorder p="lg" radius="md">
                            <Text c="dimmed" ta="center">
                                Aún no tienes resultados oficiales publicados para esta edición.
                            </Text>
                        </Paper>
                    ) : (
                        <Table.ScrollContainer minWidth={800}>
                            <Table striped highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Estudiante</Table.Th>
                                        <Table.Th>Escuela</Table.Th>
                                        <Table.Th>Categoría</Table.Th>
                                        <Table.Th>Puntuación</Table.Th>
                                        <Table.Th>Medalla</Table.Th>
                                        <Table.Th>Detalle</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {oficiales.map((o) => (
                                        <Table.Tr key={o.id}>
                                            <Table.Td>{o.nombre_estudiante}</Table.Td>
                                            <Table.Td>{o.nombre_escuela ?? '—'}</Table.Td>
                                            <Table.Td>{o.categoria}</Table.Td>
                                            <Table.Td>{o.puntuacion ?? '—'}</Table.Td>
                                            <Table.Td>
                                                <Badge color={medallaColor(o.medalla)} variant="light">
                                                    {o.medalla ?? 'Participa'}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    onClick={() => void verOficial(o.id)}
                                                >
                                                    Ver
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                    )}
                </>
            )}

            <Modal
                opened={editando !== null}
                onClose={() => setEditando(null)}
                title="Corregir pendiente"
                size="lg"
            >
                {editando && (
                    <Stack gap="md">
                        <Text size="sm" c="dimmed">
                            {editando.descripcion_estado ?? editando.datos_faltantes}
                        </Text>
                        <TextInput
                            label="Nombre del estudiante"
                            value={form.nombre_estudiante}
                            onChange={(e) => setForm((f) => ({ ...f, nombre_estudiante: e.target.value }))}
                        />
                        <TextInput
                            label="Escuela"
                            value={form.escuela_excel}
                            onChange={(e) => setForm((f) => ({ ...f, escuela_excel: e.target.value }))}
                        />
                        <Group grow>
                            <TextInput
                                label="Grado"
                                value={form.grado}
                                onChange={(e) => setForm((f) => ({ ...f, grado: e.target.value }))}
                            />
                            <TextInput
                                label="Sexo"
                                value={form.sexo}
                                onChange={(e) => setForm((f) => ({ ...f, sexo: e.target.value }))}
                            />
                        </Group>
                        <Textarea
                            label="Observaciones"
                            minRows={3}
                            value={form.observaciones}
                            onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                        />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={() => setEditando(null)}>
                                Cancelar
                            </Button>
                            <Button loading={guardando} onClick={() => void guardarPendiente()}>
                                Enviar al coordinador
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

            <Modal
                opened={detalleOficial !== null}
                onClose={() => setDetalleOficial(null)}
                title="Resultado oficial"
            >
                {detalleOficial && (
                    <Stack gap="xs">
                        {Object.entries(detalleOficial).map(([k, v]) => (
                            <Text key={k} size="sm">
                                <strong>{k}:</strong> {String(v ?? '—')}
                            </Text>
                        ))}
                    </Stack>
                )}
            </Modal>
        </ModulePageShell>
    );
}
