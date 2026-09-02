import {
    Alert,
    Box,
    Button,
    Container,
    Grid,
    Group,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    IconBooks,
    IconBuildingEstate,
    IconBuildingSkyscraper,
    IconCheck,
    IconMapPin,
    IconNumber,
    IconPhone,
    IconSchool,
    IconX,
} from '@tabler/icons-react';
import axios from 'axios';
import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MaskInputField } from './ui/MaskInputField';
import { SearchableAsyncCombobox, type ComboboxOption } from './ui/SearchableAsyncCombobox';
import classes from '../styles/GestionarEscuela.module.css';

export function GestionarEscuela() {
    const [loading, setLoading] = useState(false);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
    const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            codigo_escuela: '',
            nombre_escuela: '',
            poblado: '',
            subsistema: '',
            telefono: '',
            telefono_responsable: '',
        },
        validate: {
            codigo_escuela: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 6 ? 'El código debe tener 6 dígitos' : null;
            },
            nombre_escuela: (value) =>
                value.trim().length < 3
                    ? 'El nombre debe tener al menos 3 caracteres'
                    : null,
            poblado: (value) =>
                value.trim().length < 3
                    ? 'El poblado debe tener al menos 3 caracteres'
                    : null,
            subsistema: (value) => (!value ? 'Seleccione el subsistema' : null),
            telefono: (value, values) => {
                const schoolDigits = value.replace(/\D/g, '');
                const contactDigits = values.telefono_responsable.replace(/\D/g, '');
                if (schoolDigits.length === 8 || contactDigits.length === 8) return null;
                return 'Indique el teléfono de la escuela o el del responsable';
            },
            telefono_responsable: () => null,
        },
    });

    const loadProvincias = useCallback(async (): Promise<ComboboxOption[]> => {
        const response = await axios.get('/api/provincias');
        return response.data.map((p: { codigo: number; nombre: string }) => ({
            value: String(p.codigo),
            label: p.nombre,
        }));
    }, []);

    const loadMunicipios = useCallback(async (): Promise<ComboboxOption[]> => {
        if (!selectedProvinceCode) return [];
        const response = await axios.get(`/api/municipios/${selectedProvinceCode}`);
        return response.data.map((m: { codigo: number; nombre: string }) => ({
            value: String(m.codigo),
            label: m.nombre,
        }));
    }, [selectedProvinceCode]);

    const loadSubsistemas = useCallback(async (): Promise<ComboboxOption[]> => {
        const response = await axios.get('/api/listar-subsistemas');
        return response.data.map((s: { id: number; nombre: string }) => ({
            value: String(s.id),
            label: s.nombre,
        }));
    }, []);

    const handleProvinceChange = (codigo: string | null) => {
        setSelectedProvinceCode(codigo);
        setSelectedMunicipio(null);
    };

    const handleMunicipioChange = (codigo: string | null) => {
        setSelectedMunicipio(codigo);
    };

    const handleSubmit = async () => {
        const validation = form.validate();
        if (validation.hasErrors) return;

        if (!selectedMunicipio) {
            notifications.show({
                title: 'Ubicación incompleta',
                message: 'Seleccione provincia y municipio',
                color: 'red',
                icon: <IconX size={18} />,
            });
            return;
        }

        setLoading(true);
        try {
            const schoolDigits = form.values.telefono.replace(/\D/g, '');
            const telefono =
                schoolDigits.length === 8
                    ? form.values.telefono
                    : form.values.telefono_responsable;

            await axios.post('/api/registrar-escuela', {
                codigo_escuela: form.values.codigo_escuela.replace(/\D/g, ''),
                telefono,
                nombre_escuela: form.values.nombre_escuela.trim(),
                poblado: form.values.poblado.trim(),
                subsistema: form.values.subsistema,
                cdgo_municipio: selectedMunicipio,
            });

            notifications.show({
                title: 'Escuela registrada',
                message: 'La escuela fue registrada correctamente y quedará pendiente de validación.',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });

            form.reset();
            setSelectedProvinceCode(null);
            setSelectedMunicipio(null);
        } catch (err) {
            let errorMessage = 'No se pudo registrar la escuela';
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 400 || err.response?.status === 422) {
                    const errors = err.response.data.errors;
                    errorMessage = Object.values(errors ?? {}).flat().join(', ') || errorMessage;
                } else {
                    errorMessage = err.response?.data?.message || errorMessage;
                }
            }
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconX size={18} />,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className={classes.page}>
            <Container size="md" py="xl">
                <PaperHero />

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <div className={classes.section}>
                        <SectionHeader
                            icon={<IconSchool size={22} />}
                            title="Información general"
                            subtitle="Código, subsistema y nombre del centro"
                        />
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <MaskInputField
                                    withAsterisk
                                    label="Código de escuela"
                                    leftSection={<IconNumber size={16} />}
                                    mask="999999"
                                    placeholder="6 dígitos"
                                    {...form.getInputProps('codigo_escuela')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <SearchableAsyncCombobox
                                    label="Subsistema"
                                    withAsterisk
                                    leftSection={<IconBooks size={16} />}
                                    placeholder="Buscar subsistema…"
                                    value={form.values.subsistema || null}
                                    onChange={(v) => form.setFieldValue('subsistema', v ?? '')}
                                    loadOptions={loadSubsistemas}
                                    cacheKey="subsistemas"
                                    error={form.errors.subsistema as string | undefined}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    withAsterisk
                                    label="Nombre de la escuela"
                                    placeholder="Digite el nombre de la escuela"
                                    leftSection={<IconSchool size={16} />}
                                    {...form.getInputProps('nombre_escuela')}
                                />
                            </Grid.Col>
                        </Grid>
                    </div>

                    <div className={classes.section}>
                        <SectionHeader
                            icon={<IconMapPin size={22} />}
                            title="Ubicación"
                            subtitle="Provincia, municipio y poblado del centro"
                        />
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <SearchableAsyncCombobox
                                    label="Provincia"
                                    withAsterisk
                                    leftSection={<IconMapPin size={16} />}
                                    placeholder="Buscar provincia…"
                                    value={selectedProvinceCode}
                                    onChange={handleProvinceChange}
                                    loadOptions={loadProvincias}
                                    cacheKey="provincias"
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <SearchableAsyncCombobox
                                    label="Municipio"
                                    withAsterisk
                                    leftSection={<IconMapPin size={16} />}
                                    placeholder={
                                        selectedProvinceCode
                                            ? 'Buscar municipio…'
                                            : 'Seleccione provincia primero'
                                    }
                                    value={selectedMunicipio}
                                    onChange={handleMunicipioChange}
                                    loadOptions={loadMunicipios}
                                    disabled={!selectedProvinceCode}
                                    cacheKey={selectedProvinceCode}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    withAsterisk
                                    label="Poblado"
                                    placeholder="Digite el nombre del poblado"
                                    leftSection={<IconBuildingEstate size={16} />}
                                    {...form.getInputProps('poblado')}
                                />
                            </Grid.Col>
                        </Grid>
                    </div>

                    <div className={classes.section}>
                        <SectionHeader
                            icon={<IconPhone size={22} />}
                            title="Contacto"
                            subtitle="Teléfono de la escuela o del responsable"
                        />
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <MaskInputField
                                    withAsterisk
                                    label="Teléfono de la escuela"
                                    description="8 dígitos, sin código de país"
                                    leftSection={<IconPhone size={16} />}
                                    mask="9999-9999"
                                    placeholder="________"
                                    {...form.getInputProps('telefono')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <MaskInputField
                                    label="Contacto del responsable"
                                    description="Use este campo si la escuela no tiene teléfono"
                                    leftSection={<IconPhone size={16} />}
                                    mask="9999-9999"
                                    placeholder="________"
                                    {...form.getInputProps('telefono_responsable')}
                                />
                            </Grid.Col>
                        </Grid>
                    </div>

                    <Alert color="teal" variant="light" mb="md" radius="md">
                        La escuela quedará registrada y pendiente de validación por la coordinación.
                    </Alert>

                    <div className={classes.submitWrap}>
                        <Button
                            type="submit"
                            fullWidth
                            size="md"
                            color="teal"
                            loading={loading}
                            rightSection={<IconBuildingSkyscraper size={16} />}
                        >
                            Registrar escuela
                        </Button>
                        <Text ta="center" size="sm" c="dimmed" mt="md">
                            ¿Necesita volver?{' '}
                            <Text component={Link} to="/mi_perfil" span inherit c="teal" fw={600}>
                                Ir al perfil
                            </Text>
                        </Text>
                    </div>
                </form>
            </Container>
        </Box>
    );
}

function PaperHero() {
    return (
        <div className={classes.hero}>
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <Stack gap={4} maw={520}>
                    <Text size="xs" tt="uppercase" fw={700} opacity={0.85} lts={1}>
                        Coordinación municipal
                    </Text>
                    <Title order={1} className={classes.heroTitle}>
                        Gestionar escuela
                    </Title>
                    <Text className={classes.heroSubtitle}>
                        Registre un nuevo centro educativo de su municipio. Complete la ubicación,
                        el subsistema y los datos de contacto.
                    </Text>
                </Stack>
                <ThemeIcon size={56} radius="xl" variant="white" color="teal" visibleFrom="sm">
                    <IconSchool size={28} />
                </ThemeIcon>
            </Group>
        </div>
    );
}

function SectionHeader({
    icon,
    title,
    subtitle,
}: {
    icon: ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className={classes.sectionHeader}>
            <div className={classes.sectionIcon}>{icon}</div>
            <div>
                <Title order={4} mb={2}>
                    {title}
                </Title>
                <Text size="sm" c="dimmed">
                    {subtitle}
                </Text>
            </div>
        </div>
    );
}
