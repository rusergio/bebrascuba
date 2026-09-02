import {
    Container,
    Modal,
    Button,
    Group,
    Input,
    Grid,
    Select,
    Text,
    Title,
    Paper,
    Stack,
    Divider,
    Alert,
    Badge,
    Table,
    Checkbox,
    TextInput,
    Center,
    rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconDeviceFloppy,
    IconUserPlus,
    IconWritingSign,
    IconMapPin,
    IconSchool,
    IconUsers,
    IconSearch,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { IMaskInput } from 'react-imask';
import axios from 'axios';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useDataContext } from '../context/DataContext';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

interface Ubicacion {
    id_escuela?: number;
    nombre_escuela?: string;
    provincia?: string;
    municipio?: string;
}

export function P_InscribirAlumno() {
    const { estudiantes, refreshEstudiantes } = useDataContext();

    const [opened, { open, close }] = useDisclosure(false);
    const [loading, setLoading] = useState(false);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const [editionNotice, setEditionNotice] = useState<string | null>(null);
    const [isEditionOpen, setIsEditionOpen] = useState<boolean | null>(null);
    const [selection, setSelection] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [ubicacion, setUbicacion] = useState<Ubicacion>({
        nombre_escuela: localStorage.getItem('userSchoolName') || undefined,
        provincia: localStorage.getItem('userProvincia') || undefined,
        municipio: localStorage.getItem('userMunicipio') || undefined,
    });

    const form = useForm({
        initialValues: { nro_ci: '', nombre: '', sexo: '', grado: '' },
        validate: {
            nro_ci: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 11 ? 'Número de carnet inválido' : null;
            },
            nombre: (value) =>
                value.length < 3
                    ? 'El nombre debe tener al menos 3 letras'
                    : /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)
                      ? 'El nombre solo puede contener letras'
                      : null,
            sexo: (value) => (!value ? 'Seleccione el sexo' : null),
            grado: (value) => (!value ? 'Seleccione el grado' : null),
        },
    });

    useEffect(() => {
        void refreshEstudiantes('inscripcion');

        const loadMeta = async () => {
            try {
                const [editionResp, userId] = await Promise.all([
                    axios.get('/api/is-open'),
                    Promise.resolve(localStorage.getItem('userId')),
                ]);
                setIsEditionOpen(Boolean(editionResp.data?.is_open));

                if (!userId) return;

                const resp = await axios.get(`/api/listar-estudiantes/${userId}`, {
                    params: { vista: 'inscripcion' },
                });
                if (resp.data?.ubicacion) {
                    const u = resp.data.ubicacion as Ubicacion;
                    setUbicacion(u);
                    if (u.nombre_escuela) localStorage.setItem('userSchoolName', u.nombre_escuela);
                    if (u.provincia) localStorage.setItem('userProvincia', u.provincia);
                    if (u.municipio) localStorage.setItem('userMunicipio', u.municipio);
                    if (u.id_escuela) localStorage.setItem('userSchoolId', String(u.id_escuela));
                }
                setIsEditionOpen(Boolean(resp.data?.edicion_abierta ?? editionResp.data?.is_open));
            } catch {
                setIsEditionOpen(false);
            }
        };

        void loadMeta();
    }, [refreshEstudiantes]);

    const estudiantesNuevos = useMemo(() => estudiantes, [estudiantes]);

    const pendientesInscripcion = useMemo(
        () => estudiantesNuevos.filter((e) => !e.inscrito),
        [estudiantesNuevos],
    );

    const filteredData = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return estudiantesNuevos;
        return estudiantesNuevos.filter((alumno) => {
            const nombre = (alumno.nombre_estudiante ?? '').toLowerCase();
            const ci = alumno.nro_ci ?? '';
            const categoria = (alumno.categoria ?? '').toLowerCase();
            const grado = String(alumno.grado ?? '');
            return (
                nombre.includes(query) ||
                ci.includes(query) ||
                categoria.includes(query) ||
                grado.includes(query)
            );
        });
    }, [estudiantesNuevos, search]);

    const toggleRow = (id: number) => {
        setSelection((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const toggleAllVisible = () => {
        const visibleIds = filteredData.filter((e) => !e.inscrito).map((item) => item.id);
        const allSelected = visibleIds.every((id) => selection.includes(id));
        if (allSelected) {
            setSelection((current) => current.filter((id) => !visibleIds.includes(id)));
        } else {
            setSelection((current) => Array.from(new Set([...current, ...visibleIds])));
        }
    };

    const ensureEditionOpen = async (): Promise<boolean> => {
        try {
            setEditionNotice(null);
            const resp = await axios.get('/api/is-open');
            const open = Boolean(resp.data?.is_open);
            setIsEditionOpen(open);
            if (!open) {
                setEditionNotice('La edición está cerrada. No se puede registrar estudiante(s).');
            }
            return open;
        } catch {
            setEditionNotice('No se pudo verificar el estado de la edición.');
            return false;
        }
    };

    const handleOpenPreinscribir = async () => {
        const openEdition = await ensureEditionOpen();
        if (!openEdition) return;
        setMessage('');
        setSubmitError(null);
        form.reset();
        open();
    };

    const handlePreinscribirSubmit = async () => {
        setLoading(true);
        setMessage('');
        setSubmitError(null);

        if (!form.isValid()) {
            setLoading(false);
            return;
        }

        const userIdFromStorage = localStorage.getItem('userId');
        const escuelaIdFromStorage = localStorage.getItem('userSchoolId');

        if (!userIdFromStorage) {
            setSubmitError('No se encontró el ID del usuario. Inicia sesión nuevamente.');
            setLoading(false);
            return;
        }
        if (!escuelaIdFromStorage) {
            setSubmitError('No se encontró la escuela del profesor.');
            setLoading(false);
            return;
        }

        try {
            await axios.post('/api/estudiantes/inscribir', {
                nro_ci: form.values.nro_ci.replace(/\D/g, ''),
                nombre: form.values.nombre,
                sexo: form.values.sexo,
                grado: parseInt(form.values.grado, 10),
                id_escuela: parseInt(escuelaIdFromStorage, 10),
                id_profesor: parseInt(userIdFromStorage, 10),
            });

            setMessage('Estudiante preinscrito con éxito.');
            form.reset();
            await refreshEstudiantes('inscripcion');

            setTimeout(() => {
                close();
                setMessage('');
            }, 1500);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    setSubmitError(Object.values(errors).flat().join(', '));
                } else {
                    setSubmitError(error.response?.data?.message || 'Error al preinscribir estudiante');
                }
            } else {
                setSubmitError('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInscribirSeleccionados = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId || selection.length === 0) return;

        if (isEditionOpen !== true) {
            setEditionNotice('La edición está cerrada. No se puede inscribir estudiante(s).');
            return;
        }

        setInscribiendo(true);
        setEditionNotice(null);

        try {
            const idsPendientes = selection.filter((id) => {
                const alumno = estudiantesNuevos.find((e) => e.id === id);
                return alumno && !alumno.inscrito;
            });

            if (idsPendientes.length === 0) {
                notifications.show({
                    title: 'Sin selección válida',
                    message: 'Selecciona estudiantes preinscritos que aún no estén inscritos.',
                    color: 'yellow',
                });
                setInscribiendo(false);
                return;
            }

            const response = await axios.post('/api/estudiantes/preinscribir', {
                ids: idsPendientes,
                id_profesor: parseInt(userId, 10),
            });

            notifications.show({
                title: 'Inscripción completada',
                message: response.data?.message || 'Estudiante(s) inscrito(s) en el concurso.',
                color: 'green',
            });

            setSelection([]);
            await refreshEstudiantes('inscripcion');
        } catch (error) {
            const msg = axios.isAxiosError(error)
                ? error.response?.data?.message || 'No se pudo inscribir.'
                : 'Error inesperado.';
            notifications.show({ title: 'Error', message: msg, color: 'red' });
        } finally {
            setInscribiendo(false);
        }
    };

    const visibleIds = filteredData.map((item) => item.id);
    const allVisibleSelected =
        visibleIds.length > 0 && visibleIds.every((id) => selection.includes(id));
    const partiallyVisibleSelected =
        visibleIds.some((id) => selection.includes(id)) && !allVisibleSelected;

    const rows = filteredData.map((alumno, index) => (
        <Table.Tr
            key={alumno.id}
            bg={selection.includes(alumno.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td ta="center">
                <Text fz="sm" c="dimmed">
                    {index + 1}
                </Text>
            </Table.Td>
            <Table.Td>
                <Checkbox
                    aria-label="Seleccionar fila"
                    checked={selection.includes(alumno.id)}
                    disabled={alumno.inscrito}
                    onChange={() => toggleRow(alumno.id)}
                />
            </Table.Td>
            <Table.Td fw={500}>{alumno.nombre_estudiante}</Table.Td>
            <Table.Td>{alumno.nro_ci}</Table.Td>
            <Table.Td>{alumno.sexo}</Table.Td>
            <Table.Td ta="center">{alumno.grado ?? '—'}</Table.Td>
            <Table.Td>{alumno.categoria || '—'}</Table.Td>
            <Table.Td ta="center">
                <Badge color={alumno.es_nuevo ? 'orange' : 'gray'} variant="light">
                    {alumno.es_nuevo ? 'Sí' : 'No'}
                </Badge>
            </Table.Td>
            <Table.Td ta="center">
                <Badge color={alumno.inscrito ? 'green' : 'cyan'} variant="light">
                    {alumno.inscrito ? 'Inscrito' : 'Preinscrito'}
                </Badge>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container size="xl" py="md">
            <Paper
                radius="lg"
                p="xl"
                mb="md"
                style={{
                    background:
                        'linear-gradient(120deg, var(--mantine-color-violet-6), var(--mantine-color-blue-5), var(--mantine-color-cyan-4))',
                }}
            >
                <Title order={2} c="white">
                    Inscripción de estudiantes
                </Title>
                <Text c="white" opacity={0.9} mt={4}>
                    Preinscribe alumnos nuevos e inscríbelos en el concurso cuando la edición esté abierta.
                </Text>
            </Paper>

            <Paper withBorder radius="lg" p="lg" shadow="sm">
                <Stack gap="sm">
                    <Group justify="space-between" align="center">
                        <Title order={3}>Estudiantes nuevos de la edición (primera vez)</Title>
                        <Badge
                            color={isEditionOpen === true ? 'green' : isEditionOpen === false ? 'gray' : 'blue'}
                            variant="light"
                            size="lg"
                        >
                            {isEditionOpen === null
                                ? 'Comprobando edición…'
                                : `Edición ${isEditionOpen ? 'abierta' : 'cerrada'}`}
                        </Badge>
                    </Group>

                    <Group gap="md">
                        <Group gap={6}>
                            <IconMapPin size={18} />
                            <Text>
                                <Text span fw={600}>Provincia:</Text> {ubicacion.provincia || '—'}
                            </Text>
                        </Group>
                        <Group gap={6}>
                            <IconMapPin size={18} />
                            <Text>
                                <Text span fw={600}>Municipio:</Text> {ubicacion.municipio || '—'}
                            </Text>
                        </Group>
                    </Group>

                    <Group gap={6}>
                        <IconSchool size={18} />
                        <Text>
                            <Text span fw={600}>Escuela o institución:</Text>{' '}
                            {ubicacion.nombre_escuela || '—'}
                        </Text>
                    </Group>

                    <Group gap={6}>
                        <IconUsers size={18} />
                        <Text>
                            <Text span fw={600}>Estudiantes nuevos:</Text> {estudiantesNuevos.length}
                            {pendientesInscripcion.length > 0 && (
                                <Text span c="dimmed" size="sm">
                                    {' '}({pendientesInscripcion.length} pendientes de inscribir)
                                </Text>
                            )}
                        </Text>
                    </Group>

                    {isEditionOpen === false && (
                        <Alert color="yellow" title="Edición cerrada">
                            Solo puedes consultar la lista. Para preinscribir o inscribir, la edición debe estar abierta.
                        </Alert>
                    )}

                    <Divider />

                    <Group justify="space-between" align="center">
                        <TextInput
                            placeholder="Buscar estudiante..."
                            leftSection={
                                <IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                            }
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <Group>
                            <Button
                                variant="gradient"
                                gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
                                leftSection={<IconUserPlus size={16} />}
                                disabled={isEditionOpen !== true}
                                onClick={() => void handleOpenPreinscribir()}
                            >
                                Preinscribir estudiante
                            </Button>
                            <Button
                                variant="gradient"
                                gradient={{ from: 'teal', to: 'green', deg: 90 }}
                                leftSection={<IconWritingSign size={16} />}
                                disabled={selection.length === 0 || isEditionOpen !== true || inscribiendo}
                                loading={inscribiendo}
                                onClick={() => void handleInscribirSeleccionados()}
                            >
                                Inscribir estudiante ({selection.length})
                            </Button>
                        </Group>
                    </Group>

                    <Table.ScrollContainer minWidth={900}>
                        <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th ta="center" w={60}>
                                        Nº
                                    </Table.Th>
                                    <Table.Th w={50}>
                                        <Checkbox
                                            onChange={toggleAllVisible}
                                            checked={allVisibleSelected}
                                            indeterminate={partiallyVisibleSelected}
                                            aria-label="Seleccionar todos"
                                        />
                                    </Table.Th>
                                    <Table.Th>Nombre</Table.Th>
                                    <Table.Th>CI</Table.Th>
                                    <Table.Th>Sexo</Table.Th>
                                    <Table.Th ta="center">Grado</Table.Th>
                                    <Table.Th>Categoría</Table.Th>
                                    <Table.Th ta="center">Nuevo</Table.Th>
                                    <Table.Th ta="center">Estado</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.length > 0 ? (
                                    rows
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={9}>
                                            <Center py="lg">
                                                <Text c="dimmed">
                                                    {search
                                                        ? `No se encontraron resultados para "${search}".`
                                                        : 'No hay estudiantes nuevos. Usa "Preinscribir estudiante" para agregar uno.'}
                                                </Text>
                                            </Center>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>

                    {editionNotice && <Text c="red">{editionNotice}</Text>}
                </Stack>
            </Paper>

            <Modal opened={opened} onClose={close} title="Preinscribir estudiante" radius="md" centered>
                <form onSubmit={form.onSubmit(handlePreinscribirSubmit)}>
                    <Input.Wrapper mb={10} label="Número de CI" withAsterisk>
                        <Input
                            component={IMaskInput}
                            mask="00000000000"
                            placeholder="Digite el número de CI"
                            {...form.getInputProps('nro_ci')}
                        />
                    </Input.Wrapper>
                    <Input.Wrapper label="Nombre completo" withAsterisk>
                        <Input
                            placeholder="Digite el nombre del alumno"
                            {...form.getInputProps('nombre')}
                        />
                    </Input.Wrapper>
                    <Grid mt={10}>
                        <Grid.Col span={6}>
                            <Select
                                label="Sexo"
                                withAsterisk
                                placeholder="Seleccione el sexo"
                                clearable
                                data={['Masculino', 'Femenino']}
                                {...form.getInputProps('sexo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Grado"
                                withAsterisk
                                placeholder="Seleccione el grado"
                                clearable
                                data={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
                                {...form.getInputProps('grado')}
                            />
                        </Grid.Col>
                    </Grid>
                    <Text c="dimmed" size="sm" mt="sm">
                        El estudiante quedará en estado <strong>Preinscrito</strong>.
                    </Text>
                    {message && (
                        <Text c="green" fw={500} mt={10}>
                            {message}
                        </Text>
                    )}
                    {submitError && (
                        <Text c="red" fw={500} mt={10}>
                            {submitError}
                        </Text>
                    )}
                    <Button
                        rightSection={<IconDeviceFloppy size={18} />}
                        mt={10}
                        loading={loading}
                        type="submit"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'teal', deg: 90 }}
                        disabled={loading}
                        fullWidth
                    >
                        Preinscribir
                    </Button>
                </form>
            </Modal>
        </Container>
    );
}
