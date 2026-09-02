import { useEffect, useMemo, useState } from 'react';
import {
    Table,
    Group,
    Text,
    Center,
    TextInput,
    rem,
    Container,
    Title,
    Badge,
    Button,
    Checkbox,
    Paper,
    Stack,
    Divider,
    Alert,
} from '@mantine/core';
import {
    IconSearch,
    IconMapPin,
    IconSchool,
    IconUsers,
    IconArrowUp,
    IconWriting,
} from '@tabler/icons-react';
import axios from 'axios';
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

export function TablaEstudiantesProfesor() {
    const { estudiantes, refreshEstudiantes } = useDataContext();
    const [search, setSearch] = useState('');
    const [selection, setSelection] = useState<number[]>([]);
    const [loadingSubirGrado, setLoadingSubirGrado] = useState(false);
    const [loadingReinscribir, setLoadingReinscribir] = useState(false);
    const [isEditionOpen, setIsEditionOpen] = useState<boolean | null>(null);
    const [ubicacion, setUbicacion] = useState<Ubicacion>({
        nombre_escuela: localStorage.getItem('userSchoolName') || undefined,
        provincia: localStorage.getItem('userProvincia') || undefined,
        municipio: localStorage.getItem('userMunicipio') || undefined,
    });

    useEffect(() => {
        void refreshEstudiantes('reinscripcion');

        const loadMeta = async () => {
            try {
                const [editionResp, userId] = await Promise.all([
                    axios.get('/api/is-open'),
                    Promise.resolve(localStorage.getItem('userId')),
                ]);
                setIsEditionOpen(Boolean(editionResp.data?.is_open));

                if (!userId) return;

                const resp = await axios.get(`/api/listar-estudiantes/${userId}`, {
                    params: { vista: 'reinscripcion' },
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

    const estudiantesAnteriores = useMemo(() => estudiantes, [estudiantes]);

    const pendientesReinscripcion = estudiantesAnteriores.length;

    const filteredData = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return estudiantesAnteriores;
        return estudiantesAnteriores.filter((alumno) => {
            const nombre = (alumno.nombre_estudiante ?? '').toLowerCase();
            const ci = alumno.nro_ci ?? '';
            const escuela = (alumno.nombre_escuela ?? '').toLowerCase();
            const sexo = (alumno.sexo ?? '').toLowerCase();
            const grado = String(alumno.grado ?? '');
            const categoria = (alumno.categoria ?? '').toLowerCase();
            return (
                nombre.includes(query) ||
                ci.includes(query) ||
                escuela.includes(query) ||
                sexo.includes(query) ||
                grado.includes(query) ||
                categoria.includes(query)
            );
        });
    }, [estudiantesAnteriores, search]);

    const toggleRow = (id: number) => {
        setSelection((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    const toggleAllVisible = () => {
        const visibleIds = filteredData.map((item) => item.id);
        const allSelected = visibleIds.every((id) => selection.includes(id));
        if (allSelected) {
            setSelection((current) => current.filter((id) => !visibleIds.includes(id)));
        } else {
            setSelection((current) => Array.from(new Set([...current, ...visibleIds])));
        }
    };

    const handleSubirGrado = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId || selection.length === 0) return;

        if (isEditionOpen !== true) {
            notifications.show({
                title: 'Edición cerrada',
                message: 'Subir grado solo está disponible con la edición abierta.',
                color: 'red',
            });
            return;
        }

        setLoadingSubirGrado(true);
        try {
            const response = await axios.post('/api/estudiantes/subir-grado', {
                ids: selection,
                id_profesor: parseInt(userId, 10),
            });

            notifications.show({
                title: 'Grado actualizado',
                message: response.data?.message || 'Grado actualizado correctamente.',
                color: 'green',
            });

            await refreshEstudiantes('reinscripcion');
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'No se pudo subir el grado.'
                : 'Error inesperado.';
            notifications.show({ title: 'Error', message, color: 'red' });
        } finally {
            setLoadingSubirGrado(false);
        }
    };

    const handleReinscribir = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId || selection.length === 0) return;

        if (isEditionOpen !== true) {
            notifications.show({
                title: 'Edición cerrada',
                message: 'Reinscribir solo está disponible con la edición abierta.',
                color: 'red',
            });
            return;
        }

        setLoadingReinscribir(true);
        try {
            const response = await axios.post('/api/estudiantes/reinscribir', {
                ids: selection,
                id_profesor: parseInt(userId, 10),
            });

            const reinscritos = response.data?.reinscritos ?? 0;
            notifications.show({
                title: reinscritos > 0 ? 'Reinscripción completada' : 'Sin cambios',
                message: response.data?.message || 'Acción realizada.',
                color: reinscritos > 0 ? 'green' : 'yellow',
            });

            setSelection([]);
            await refreshEstudiantes('reinscripcion');
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'No se pudo reinscribir.'
                : 'Error inesperado.';
            notifications.show({ title: 'Error', message, color: 'red' });
        } finally {
            setLoadingReinscribir(false);
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
                <Text fz="sm" c="dimmed">{index + 1}</Text>
            </Table.Td>
            <Table.Td>
                <Checkbox
                    aria-label="Seleccionar fila"
                    checked={selection.includes(alumno.id)}
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
                        'linear-gradient(120deg, var(--mantine-color-indigo-6), var(--mantine-color-cyan-5), var(--mantine-color-teal-4))',
                }}
            >
                <Title order={2} c="white">
                    Reinscripción de estudiantes
                </Title>
                <Text c="white" opacity={0.9} mt={4}>
                    Alumnos de ediciones anteriores (Nuevo = No). Reinscribir solo cambia el estado a Inscrito en esta misma lista.
                </Text>
            </Paper>

            <Paper withBorder radius="lg" p="lg" shadow="sm">
                <Stack gap="sm">
                    <Title order={3}>Estudiantes de ediciones anteriores</Title>

                    <Group gap="md">
                        <Group gap={6}>
                            <IconMapPin size={18} />
                            <Text>
                                <Text span fw={600}>Provincia:</Text>{' '}
                                {ubicacion.provincia || '—'}
                            </Text>
                        </Group>
                        <Group gap={6}>
                            <IconMapPin size={18} />
                            <Text>
                                <Text span fw={600}>Municipio:</Text>{' '}
                                {ubicacion.municipio || '—'}
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
                            <Text span fw={600}>Estudiantes del profesor (ediciones anteriores):</Text>{' '}
                            {pendientesReinscripcion}
                        </Text>
                    </Group>

                    {isEditionOpen === false && (
                        <Alert color="yellow" title="Edición cerrada">
                            Solo puedes consultar la lista. Para reinscribir o subir grado, la edición debe estar abierta.
                        </Alert>
                    )}

                    <Divider />

                    <Group justify="space-between" align="center">
                        <TextInput
                            placeholder="Buscar estudiante..."
                            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <Group>
                            <Button
                                variant="gradient"
                                gradient={{ from: 'blue', to: 'teal', deg: 90 }}
                                rightSection={<IconArrowUp size={16} />}
                                disabled={selection.length === 0 || isEditionOpen !== true || loadingSubirGrado || loadingReinscribir}
                                loading={loadingSubirGrado}
                                onClick={() => void handleSubirGrado()}
                            >
                                Subir grado ({selection.length})
                            </Button>
                            <Button
                                variant="gradient"
                                gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
                                leftSection={<IconWriting size={16} />}
                                disabled={selection.length === 0 || isEditionOpen !== true || loadingSubirGrado || loadingReinscribir}
                                loading={loadingReinscribir}
                                onClick={() => void handleReinscribir()}
                            >
                                Reinscribir ({selection.length})
                            </Button>
                        </Group>
                    </Group>

                    <Table.ScrollContainer minWidth={900}>
                        <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th ta="center" w={60}>Nº</Table.Th>
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
                                                        : 'No hay estudiantes de ediciones anteriores en esta lista.'}
                                                </Text>
                                            </Center>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Stack>
            </Paper>
        </Container>
    );
}
