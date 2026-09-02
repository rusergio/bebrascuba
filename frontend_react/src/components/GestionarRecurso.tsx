import {
    ActionIcon,
    Anchor,
    Box,
    Button,
    Checkbox,
    Container,
    FileInput,
    FileInputProps,
    Group,
    Modal,
    Paper,
    Pill,
    rem,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Textarea,
    TextInput,
    ThemeIcon,
    Title,
    Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
    IconAlertCircle,
    IconBooks,
    IconCheck,
    IconExternalLink,
    IconFileTypePdf,
    IconPencil,
    IconRefresh,
    IconSearch,
    IconTrash,
    IconUpload,
    IconX,
} from '@tabler/icons-react';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDataContext } from '../context/DataContext';
import { ModuleHero } from './panel/ModuleHero';
import panelClasses from '../styles/PanelModules.module.css';
import classes from '../styles/GestionarRecurso.module.css';

interface RecursoFormData {
    id: number;
    nombre: string;
    descripcion: string;
    archivo: File | null;
}

type RecursoFromContext = {
    id: number;
    nombre: string;
    descripcion: string;
    archivo_path: string;
};

const apiBase = (axios.defaults.baseURL || '').replace(/\/$/, '');

function getFileNameFromPath(filePath: string): string {
    if (!filePath) return '';
    if (filePath.includes('recursos/')) {
        return filePath.split('recursos/')[1];
    }
    return filePath;
}

const ValueComponent: FileInputProps['valueComponent'] = ({ value }) => {
    if (value === null) return null;
    if (Array.isArray(value)) {
        return (
            <Pill.Group>
                {value.map((file, index) => (
                    <Pill key={index}>{file.name}</Pill>
                ))}
            </Pill.Group>
        );
    }
    return <Pill>{value.name}</Pill>;
};

export function GestionarRecurso() {
    const { recursos, refreshRecursos } = useDataContext();

    const [selection, setSelection] = useState<number[]>([]);
    const [cargar, setCargar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);

    const editForm = useForm<RecursoFormData>({
        initialValues: { id: 0, nombre: '', descripcion: '', archivo: null },
        validate: {
            nombre: (value) => (value.length < 2 ? 'El nombre debe tener al menos 2 letras' : null),
            descripcion: (value) => (value.length < 10 ? 'La descripción debe tener al menos 10 caracteres' : null),
        },
    });

    const form = useForm<RecursoFormData>({
        initialValues: { id: 0, nombre: '', descripcion: '', archivo: null },
        validate: {
            nombre: (value) => (value.length < 2 ? 'El nombre debe tener al menos 2 letras' : null),
            descripcion: (value) => (value.length < 10 ? 'La descripción debe tener al menos 10 caracteres' : null),
            archivo: (value) => (value === null ? 'Debes seleccionar un archivo' : null),
        },
    });

    const cargarLista = useCallback(async () => {
        setLoading(true);
        try {
            await refreshRecursos();
        } finally {
            setLoading(false);
        }
    }, [refreshRecursos]);

    useEffect(() => {
        void cargarLista();
    }, [cargarLista]);

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return recursos;
        return recursos.filter(
            (r) =>
                r.nombre?.toLowerCase().includes(q) ||
                r.descripcion?.toLowerCase().includes(q),
        );
    }, [recursos, busqueda]);

    const allSelected = filtrados.length > 0 && selection.length === filtrados.length;

    const toggleRow = (id: number) => {
        setSelection((current) =>
            current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
        );
    };

    const toggleAll = () => {
        setSelection(allSelected ? [] : filtrados.map((r) => r.id));
    };

    const handleSubmit = async (values: RecursoFormData) => {
        setCargar(true);
        if (!values.archivo || !values.archivo.type.endsWith('pdf')) {
            notifications.show({
                title: 'Formato incorrecto',
                message: 'Debes seleccionar un archivo PDF',
                color: 'red',
                icon: <IconX size={20} />,
            });
            setCargar(false);
            return;
        }
        try {
            const formData = new FormData();
            formData.append('nombre', values.nombre);
            formData.append('descripcion', values.descripcion);
            formData.append('archivo', values.archivo);

            await axios.post('/api/recursos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            notifications.show({
                title: 'Recurso publicado',
                message: 'El documento se subió correctamente.',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });

            await refreshRecursos();
            form.reset();
        } catch (error) {
            let errorMessage = 'Error al subir el archivo';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
        } finally {
            setCargar(false);
        }
    };

    const eliminarRecursos = async () => {
        if (selection.length === 0) return;
        modals.openConfirmModal({
            title: 'Eliminar recursos seleccionados',
            children: (
                <Text size="sm">
                    ¿Confirma eliminar {selection.length} documento{selection.length === 1 ? '' : 's'}? Esta
                    acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                setLoading(true);
                try {
                    for (const recursoId of selection) {
                        await axios.delete(`/api/eliminar-recurso/${recursoId}`);
                    }
                    notifications.show({
                        title: 'Eliminados',
                        message:
                            selection.length > 1
                                ? `${selection.length} documentos eliminados`
                                : 'Documento eliminado',
                        color: 'teal',
                        icon: <IconCheck size={18} />,
                    });
                    setSelection([]);
                    await refreshRecursos();
                } catch {
                    notifications.show({
                        title: 'Error',
                        message: 'No se pudieron eliminar los documentos',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const openEditModal = (recurso: RecursoFromContext) => {
        editForm.setValues({
            id: recurso.id,
            nombre: recurso.nombre?.trim() || 'Sin nombre',
            descripcion: recurso.descripcion?.trim() || '',
            archivo: null,
        });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        editForm.reset();
    };

    const handleEditSubmit = async (values: RecursoFormData) => {
        if (!editForm.isValid()) return;

        try {
            const formData = new FormData();
            formData.append('nombre', values.nombre.trim());
            formData.append('descripcion', values.descripcion.trim());
            if (values.archivo) {
                formData.append('archivo', values.archivo);
            }

            await axios.put(`/api/recursos/${values.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            notifications.show({
                title: 'Actualizado',
                message: 'Recurso modificado correctamente.',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });

            await refreshRecursos();
            closeEditModal();
        } catch (error) {
            let errorMessage = 'Error al actualizar el recurso';
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    if (errors?.nombre) {
                        errorMessage = Array.isArray(errors.nombre) ? errors.nombre[0] : errors.nombre;
                    } else {
                        errorMessage = error.response.data.message || 'Error de validación';
                    }
                } else {
                    errorMessage = error.response?.data?.message || errorMessage;
                }
            }
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
        }
    };

    const eliminarRecursoIndividual = (recurso: RecursoFromContext) => {
        modals.openConfirmModal({
            title: 'Confirmar eliminación',
            children: (
                <Text size="sm">
                    ¿Eliminar &quot;{recurso.nombre}&quot;? Esta acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/eliminar-recurso/${recurso.id}`);
                    notifications.show({
                        title: 'Eliminado',
                        message: 'Documento eliminado correctamente.',
                        color: 'teal',
                        icon: <IconCheck size={18} />,
                    });
                    setSelection((prev) => prev.filter((id) => id !== recurso.id));
                    await refreshRecursos();
                } catch {
                    notifications.show({
                        title: 'Error',
                        message: 'No se pudo eliminar el documento',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                }
            },
        });
    };

    const subtituloHero =
        recursos.length === 0
            ? 'Aún no hay documentos en la biblioteca. Suba el primer recurso de apoyo al concurso.'
            : `${recursos.length} documento${recursos.length === 1 ? '' : 's'} disponible${recursos.length === 1 ? '' : 's'} para profesores y visitantes.`;

    const rows = filtrados.map((recurso) => {
        const fileName = getFileNameFromPath(recurso.archivo_path || '');
        const fileUrl = `${apiBase}/api/ver-recurso/${fileName}`;

        return (
            <Table.Tr
                key={recurso.id}
                className={selection.includes(recurso.id) ? classes.rowSelected : undefined}
            >
                <Table.Td>
                    <Checkbox
                        checked={selection.includes(recurso.id)}
                        onChange={() => toggleRow(recurso.id)}
                        aria-label={`Seleccionar ${recurso.nombre}`}
                    />
                </Table.Td>
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                        <ThemeIcon variant="light" color="teal" size="md" radius="md">
                            <IconFileTypePdf size={16} />
                        </ThemeIcon>
                        <Text fw={600} size="sm" lineClamp={1}>
                            {recurso.nombre}
                        </Text>
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Tooltip label={recurso.descripcion} multiline maw={320} disabled={!recurso.descripcion}>
                        <Text size="sm" c="dimmed" className={classes.descCell}>
                            {recurso.descripcion || '—'}
                        </Text>
                    </Tooltip>
                </Table.Td>
                <Table.Td>
                    <Anchor href={fileUrl} target="_blank" size="sm" fw={500}>
                        <Group gap={4} wrap="nowrap">
                            Ver PDF
                            <IconExternalLink size={14} />
                        </Group>
                    </Anchor>
                </Table.Td>
                <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Tooltip label="Editar">
                            <ActionIcon variant="subtle" color="teal" onClick={() => openEditModal(recurso)}>
                                <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar">
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => eliminarRecursoIndividual(recurso)}
                            >
                                <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Box className={classes.page}>
            <Container size="lg" py="xl">
                <ModuleHero
                    badge="Coordinador Nacional"
                    title="Biblioteca de recursos"
                    subtitle={subtituloHero}
                    backTo="/coordinador/dashboard"
                    backLabel="Panel coordinador"
                    gradient="teal"
                />

                <Paper radius="lg" p="xl" withBorder shadow="sm" className={panelClasses.mainPanel}>
                    <Paper radius="md" className={classes.introBanner}>
                        <Group justify="space-between" align="center" wrap="wrap" gap="md">
                            <Stack gap={4} maw={520}>
                                <Title order={3}>Gestión de documentos</Title>
                                <Text size="sm" c="dimmed" lh={1.6}>
                                    Publique guías, reglamentos y materiales de apoyo en formato PDF. Los
                                    recursos quedan visibles en la sección pública del sitio para profesores y
                                    visitantes.
                                </Text>
                            </Stack>
                            <div className={classes.countHighlight}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                                    Total publicados
                                </Text>
                                <Text className={classes.countNumber}>{recursos.length}</Text>
                            </div>
                        </Group>
                    </Paper>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                        <Paper withBorder className={`${classes.statCard} ${classes.statCardPrimary}`}>
                            <ThemeIcon variant="light" color="teal" size="lg" radius="md" mb="xs" mx="auto">
                                <IconBooks size={20} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed">
                                En biblioteca
                            </Text>
                            <Text fw={700} size="xl">
                                {recursos.length}
                            </Text>
                        </Paper>
                        <Paper withBorder className={classes.statCard}>
                            <ThemeIcon variant="light" color="cyan" size="lg" radius="md" mb="xs" mx="auto">
                                <IconFileTypePdf size={20} />
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
                                <IconSearch size={20} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed">
                                Mostrando (filtro)
                            </Text>
                            <Text fw={700} size="xl">
                                {filtrados.length}
                            </Text>
                        </Paper>
                    </SimpleGrid>

                    <Paper radius="md" className={classes.uploadSection}>
                        <Group gap="sm" mb="md" className={classes.sectionHeader}>
                            <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                                <IconUpload size={20} />
                            </ThemeIcon>
                            <div>
                                <Text fw={600}>Subir nuevo documento</Text>
                                <Text size="xs" c="dimmed">
                                    Solo archivos PDF · Título y descripción visibles en la biblioteca pública
                                </Text>
                            </div>
                        </Group>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                                <TextInput
                                    {...form.getInputProps('nombre')}
                                    withAsterisk
                                    label="Título del documento"
                                    placeholder="Ej. Reglamento edición 2025"
                                />
                                <Textarea
                                    {...form.getInputProps('descripcion')}
                                    withAsterisk
                                    label="Descripción"
                                    placeholder="Breve resumen del contenido del documento"
                                    minRows={2}
                                    autosize
                                />
                            </SimpleGrid>
                            <Group align="flex-end" wrap="wrap" gap="md">
                                <FileInput
                                    {...form.getInputProps('archivo')}
                                    withAsterisk
                                    label="Archivo PDF"
                                    placeholder="Seleccione el fichero"
                                    valueComponent={ValueComponent}
                                    clearable
                                    leftSection={<IconFileTypePdf size={16} />}
                                    accept="application/pdf,.pdf"
                                    style={{ flex: 1, minWidth: 220 }}
                                />
                                <Button
                                    type="submit"
                                    color="teal"
                                    leftSection={<IconUpload size={16} />}
                                    loading={cargar}
                                >
                                    Publicar documento
                                </Button>
                            </Group>
                        </form>
                    </Paper>

                    <Group justify="space-between" align="center" wrap="wrap" gap="sm" className={classes.toolbar}>
                        <TextInput
                            placeholder="Buscar por título o descripción…"
                            leftSection={<IconSearch size={16} />}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 220, maxWidth: 400 }}
                        />
                        <Group gap="xs">
                            <Button
                                type="button"
                                variant="light"
                                color="gray"
                                leftSection={<IconRefresh size={16} />}
                                loading={loading}
                                onClick={() => void cargarLista()}
                            >
                                Actualizar
                            </Button>
                            <Button
                                type="button"
                                variant="light"
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                loading={loading}
                                disabled={selection.length === 0}
                                onClick={eliminarRecursos}
                            >
                                {selection.length > 0
                                    ? `Eliminar (${selection.length})`
                                    : 'Eliminar selección'}
                            </Button>
                        </Group>
                    </Group>

                    <Title order={4} mb="xs">
                        Documentos publicados
                    </Title>
                    <Text size="sm" c="dimmed" mb="md">
                        Seleccione filas para eliminar en lote o use las acciones de cada fila.
                    </Text>

                    {filtrados.length === 0 ? (
                        <Paper withBorder className={classes.emptyState}>
                            <ThemeIcon size={48} radius="xl" variant="light" color="teal" mx="auto" mb="md">
                                <IconBooks size={24} />
                            </ThemeIcon>
                            <Text fw={600} mb={4}>
                                {busqueda.trim() ? 'Sin coincidencias' : 'Biblioteca vacía'}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {busqueda.trim()
                                    ? 'Pruebe otro término de búsqueda.'
                                    : 'Suba el primer documento PDF con el formulario de arriba.'}
                            </Text>
                        </Paper>
                    ) : (
                        <Paper withBorder className={classes.tableWrap}>
                            <Table.ScrollContainer minWidth={720}>
                                <Table highlightOnHover striped>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th style={{ width: rem(40) }}>
                                                <Checkbox
                                                    onChange={toggleAll}
                                                    checked={allSelected}
                                                    indeterminate={
                                                        selection.length > 0 && selection.length < filtrados.length
                                                    }
                                                    aria-label="Seleccionar todos"
                                                />
                                            </Table.Th>
                                            <Table.Th>Título</Table.Th>
                                            <Table.Th>Descripción</Table.Th>
                                            <Table.Th>Archivo</Table.Th>
                                            <Table.Th style={{ width: rem(90) }} />
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>{rows}</Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Paper>
                    )}
                </Paper>
            </Container>

            <Modal
                opened={editModalOpen}
                onClose={closeEditModal}
                title="Editar recurso"
                size="lg"
                centered
            >
                <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            {...editForm.getInputProps('nombre')}
                            withAsterisk
                            label="Título del documento"
                            placeholder="Digite el título del documento"
                        />
                        <Textarea
                            {...editForm.getInputProps('descripcion')}
                            withAsterisk
                            label="Descripción"
                            placeholder="Digite la descripción del documento"
                            minRows={3}
                            autosize
                        />
                        <FileInput
                            {...editForm.getInputProps('archivo')}
                            label="Nuevo archivo (opcional)"
                            placeholder="Seleccione un PDF para reemplazar el actual"
                            valueComponent={ValueComponent}
                            clearable
                            leftSection={<IconFileTypePdf size={16} />}
                            accept="application/pdf,.pdf"
                            description="Si no selecciona archivo, se conserva el documento actual."
                        />
                        <Group justify="flex-end" mt="xs">
                            <Button type="button" variant="default" onClick={closeEditModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" color="teal" leftSection={<IconPencil size={16} />}>
                                Guardar cambios
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Box>
    );
}
