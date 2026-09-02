import {
    Alert,
    Badge,
    Button,
    FileInput,
    Group,
    List,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Stepper,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconCheck,
    IconClipboardList,
    IconMedal,
    IconUpload,
    IconUserCheck,
    IconUserExclamation,
    IconArrowRight,
} from '@tabler/icons-react';
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ModulePageShell } from '../../components/panel/ModulePageShell';
import { FlujoResultadosPanel } from '../../components/resultados/FlujoResultadosPanel';
import { PASOS_UI_COORDINADOR } from '../../config/flujoResultados';
import { useDataContext } from '../../context/DataContext';
import { aceptarPreinscritos } from '../../lib/api/resultados';

interface ImportarResultadosData {
    edicion: number;
    a_edicion: number | null;
    total_filas_validas: number;
    preinscritos: number;
    pendiente_no_preinscrito: number;
    inconsistencias: number;
    pendientes_insertados: number;
    pendientes_actualizados: number;
    pendientes_duplicados: number;
    profesores_encontrados: number;
    profesores_no_encontrados: number;
    pendientes_por_categoria: Record<string, number>;
    medallas: Record<string, { participantes: number; validos: number; resumen_medallas: Record<string, number> }>;
    ausentes: {
        cantidad: number;
        muestras: Array<Record<string, unknown>>;
    };
    hojas_procesadas: string[];
}

interface ImportarResultadosResponse {
    success: boolean;
    message: string;
    data?: ImportarResultadosData;
}

const PASOS_FLUJO = PASOS_UI_COORDINADOR.map((p) => ({ label: p.label, desc: p.desc }));

export default function PagImportarResultados() {
    const { numeroEdicion, anioEdicion, estadoEdicion, refreshEdicionesPublicas } = useDataContext();
    const navigate = useNavigate();
    const [archivo, setArchivo] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [aceptando, setAceptando] = useState(false);
    const [preinscritosAceptados, setPreinscritosAceptados] = useState(false);
    const [resultado, setResultado] = useState<ImportarResultadosData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const edicionAbierta = estadoEdicion === 'Abierto' && numeroEdicion > 0;

    const handleImportar = async () => {
        if (!archivo) {
            notifications.show({
                color: 'orange',
                title: 'Archivo requerido',
                message: 'Selecciona un archivo Excel (.xlsx o .xls) antes de importar.',
            });
            return;
        }

        setLoading(true);
        setError(null);
        setResultado(null);

        const formData = new FormData();
        formData.append('archivo', archivo);

        try {
            const response = await axios.post<ImportarResultadosResponse>(
                '/api/importar-resultados',
                formData,
            );

            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.message || 'La importación no se completó.');
            }

            setResultado(response.data.data);
            setArchivo(null);
            setPreinscritosAceptados(false);

            notifications.show({
                color: 'teal',
                title: 'Importación completada',
                message: response.data.message,
                icon: <IconCheck size={18} />,
            });

            await refreshEdicionesPublicas();
        } catch (err: unknown) {
            let message = 'No se pudo importar el archivo.';

            if (axios.isAxiosError(err)) {
                message =
                    err.response?.data?.message ||
                    err.response?.data?.errors?.archivo?.[0] ||
                    message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);
            notifications.show({ color: 'red', title: 'Error al importar', message });
        } finally {
            setLoading(false);
        }
    };

    const handleAceptarPreinscritos = async () => {
        if (!resultado || resultado.preinscritos === 0) return;
        setAceptando(true);
        try {
            const res = await aceptarPreinscritos(numeroEdicion);
            setPreinscritosAceptados(true);
            notifications.show({
                color: 'teal',
                title: 'Preinscritos aceptados',
                message: res.message ?? `Se aceptaron ${resultado.preinscritos} registro(s).`,
                icon: <IconCheck size={18} />,
            });
        } catch {
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'No se pudieron aceptar los preinscritos.',
            });
        } finally {
            setAceptando(false);
        }
    };

    const pasoActivo = resultado
        ? preinscritosAceptados || resultado.preinscritos === 0
            ? 1
            : 0
        : 0;

    const irAExcepciones = () => navigate('/coordinador/resultados-pendientes?paso=2');

    return (
        <ModulePageShell
            badge="Coordinador Nacional"
            title="Importar resultados"
            subtitle="Pasos 1–7 automáticos al importar; paso 8 (revisión e integración) lo realiza el coordinador."
            backTo="/coordinador/dashboard"
            gradient="teal"
            showApiNotice={false}
        >
            <Stack gap="lg">
                {!edicionAbierta && (
                    <Alert color="orange" title="Sin edición abierta">
                        Debe existir una edición abierta. Ábrala en{' '}
                        <Text component={Link} to="/gestionar_concurso" span c="blue" inherit>
                            Gestionar edición
                        </Text>
                        .
                    </Alert>
                )}

                {edicionAbierta && (
                    <Alert color="blue" variant="light" title="Edición activa">
                        Importación contra edición <strong>{numeroEdicion}</strong>
                        {anioEdicion ? ` (${anioEdicion})` : ''}. Nada se escribe directo en{' '}
                        <strong>estudiante_escuela</strong>.
                    </Alert>
                )}

                <FlujoResultadosPanel destacar={[1, 2, 3, 4, 5, 6, 7]} titulo="Qué hace el sistema al importar (pasos 1–7)" />

                <Paper withBorder radius="md" p="lg">
                    <Title order={5} mb="md">
                        Su parte en el flujo (coordinador)
                    </Title>
                    <Stepper active={pasoActivo} size="sm">
                        {PASOS_FLUJO.map((paso) => (
                            <Stepper.Step key={paso.label} label={paso.label} description={paso.desc} />
                        ))}
                    </Stepper>
                </Paper>

                <Paper withBorder radius="md" p="lg">
                    <Title order={4} mb="sm">
                        Subir archivo Excel
                    </Title>
                    <Text size="sm" c="dimmed" mb="md" lh={1.6}>
                        El sistema lee las hojas del Excel, normaliza encabezados, guarda en{' '}
                        <strong>resultados_pendientes</strong>, valida preinscripciones (pasos 4–6) y calcula
                        medallas (paso 7). Nada se escribe directo en <strong>estudiante_escuela</strong>.
                    </Text>
                    <FileInput
                        label="Archivo Excel"
                        placeholder="Seleccionar .xlsx"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        value={archivo}
                        onChange={setArchivo}
                        clearable
                        mb="md"
                        disabled={loading}
                    />
                    <Group>
                        <Button
                            leftSection={loading ? <Loader size={16} color="white" /> : <IconUpload size={16} />}
                            onClick={handleImportar}
                            loading={loading}
                            disabled={!edicionAbierta || !archivo}
                        >
                            Importar resultados
                        </Button>
                        <Button component={Link} to="/coordinador/resultados-pendientes" variant="light" color="orange">
                            Ir a revisión
                        </Button>
                    </Group>
                </Paper>

                {error && (
                    <Alert color="red" title="Error">
                        {error}
                    </Alert>
                )}

                {resultado && (
                    <Paper withBorder radius="md" p="lg" style={{ borderLeft: '6px solid var(--mantine-color-teal-6)' }}>
                        <Title order={4} mb="md">
                            Resumen de importación
                        </Title>

                        <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
                            <Paper withBorder p="md" radius="md" ta="center">
                                <ThemeIcon color="teal" variant="light" mb="xs">
                                    <IconUserCheck size={18} />
                                </ThemeIcon>
                                <Text size="xs" c="dimmed">
                                    Preinscritos OK
                                </Text>
                                <Text fw={700} size="xl">
                                    {resultado.preinscritos}
                                </Text>
                            </Paper>
                            <Paper withBorder p="md" radius="md" ta="center">
                                <ThemeIcon color="orange" variant="light" mb="xs">
                                    <IconUserExclamation size={18} />
                                </ThemeIcon>
                                <Text size="xs" c="dimmed">
                                    No preinscritos
                                </Text>
                                <Text fw={700} size="xl">
                                    {resultado.pendiente_no_preinscrito}
                                </Text>
                            </Paper>
                            <Paper withBorder p="md" radius="md" ta="center">
                                <ThemeIcon color="red" variant="light" mb="xs">
                                    <IconClipboardList size={18} />
                                </ThemeIcon>
                                <Text size="xs" c="dimmed">
                                    Inconsistencias
                                </Text>
                                <Text fw={700} size="xl">
                                    {resultado.inconsistencias}
                                </Text>
                            </Paper>
                            <Paper withBorder p="md" radius="md" ta="center">
                                <ThemeIcon color="yellow" variant="light" mb="xs">
                                    <IconMedal size={18} />
                                </ThemeIcon>
                                <Text size="xs" c="dimmed">
                                    Filas procesadas
                                </Text>
                                <Text fw={700} size="xl">
                                    {resultado.total_filas_validas}
                                </Text>
                            </Paper>
                        </SimpleGrid>

                        <List size="sm" spacing="xs" mb="md">
                            <List.Item>
                                Nuevos en pendientes: <strong>{resultado.pendientes_insertados}</strong>
                                {resultado.pendientes_actualizados > 0 &&
                                    ` · Actualizados: ${resultado.pendientes_actualizados}`}
                                {resultado.pendientes_duplicados > 0 &&
                                    ` · Omitidos (ya en histórico): ${resultado.pendientes_duplicados}`}
                            </List.Item>
                            <List.Item>
                                Profesores: {resultado.profesores_encontrados} encontrados,{' '}
                                {resultado.profesores_no_encontrados} no encontrados
                            </List.Item>
                            <List.Item>
                                Preinscritos ausentes en Excel: {resultado.ausentes.cantidad}
                            </List.Item>
                        </List>

                        {Object.keys(resultado.medallas).length > 0 && (
                            <Paper withBorder p="md" radius="md" mb="md" bg="var(--mantine-color-yellow-0)">
                                <Text fw={600} size="sm" mb="xs">
                                    Medallas calculadas (resultados_pendientes)
                                </Text>
                                <Group gap="xs">
                                    {Object.entries(resultado.medallas).map(([cat, info]) => (
                                        <Badge key={cat} variant="light" color="yellow">
                                            {cat}: {info.participantes} part.
                                        </Badge>
                                    ))}
                                </Group>
                            </Paper>
                        )}

                        <Group>
                            {resultado.preinscritos > 0 && !preinscritosAceptados ? (
                                <Button
                                    color="cyan"
                                    leftSection={<IconUserCheck size={16} />}
                                    loading={aceptando}
                                    onClick={() => void handleAceptarPreinscritos()}
                                >
                                    Aceptar preinscritos ({resultado.preinscritos})
                                </Button>
                            ) : (
                                <Button
                                    color="orange"
                                    rightSection={<IconArrowRight size={16} />}
                                    onClick={irAExcepciones}
                                >
                                    Paso 2: Revisar excepciones
                                </Button>
                            )}
                            <Button
                                component={Link}
                                to="/coordinador/resultados-pendientes?paso=2"
                                variant="light"
                                color="orange"
                            >
                                Ir a revisión
                            </Button>
                            <Button component={Link} to="/coordinador/dashboard" variant="default">
                                Panel coordinador
                            </Button>
                        </Group>
                    </Paper>
                )}
            </Stack>
        </ModulePageShell>
    );
}
