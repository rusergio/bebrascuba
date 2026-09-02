import {
    Alert,
    Box,
    Button,
    Checkbox,
    Container,
    Grid,
    Group,
    Input,
    PasswordInput,
    PinInput,
    Stack,
    Switch,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    IconArrowLeft,
    IconAt,
    IconBooks,
    IconBuildingEstate,
    IconCheck,
    IconEyeClosed,
    IconEyeFilled,
    IconLock,
    IconLockCheck,
    IconMapPin,
    IconNumber,
    IconPhone,
    IconSchool,
    IconSend,
    IconUser,
    IconX,
} from '@tabler/icons-react';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MaskInputField } from './ui/MaskInputField';
import {
    PasswordStrengthInput,
    passwordMeetsAllRequirements,
} from './ui/PasswordStrengthInput';
import { SearchableAsyncCombobox, type ComboboxOption } from './ui/SearchableAsyncCombobox';
import classes from '../styles/RegistrarProfe.module.css';

export function RegistrarProfe() {
    const [loading, setLoading] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [showConfPin, setShowConfPin] = useState(false);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
    const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
    const navigate = useNavigate();

    const form = useForm({
        initialValues: {
            nombre: '',
            apellidos: '',
            correo: '',
            telefono: '',
            nro_ci: '',
            id_escuela: '',
            registrar_escuela_nueva: false,
            codigo_escuela: '',
            nombre_escuela: '',
            poblado: '',
            subsistema: '',
            telefono_escuela: '',
            telefono_responsable: '',
            contrasenia: '',
            confirmContrasenia: '',
            pin: '',
            confirmPin: '',
        },
        validate: {
            nombre: (value) =>
                value.length < 3
                    ? 'El nombre debe tener al menos 3 letras'
                    : /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)
                      ? 'El nombre solo puede contener letras'
                      : null,
            apellidos: (value) =>
                value.length < 3
                    ? 'Los apellidos deben tener al menos 3 letras'
                    : /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)
                      ? 'Los apellidos solo pueden contener letras'
                      : null,
            correo: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo electrónico inválido'),
            telefono: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 8 ? 'El teléfono debe tener 8 dígitos' : null;
            },
            nro_ci: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 11 ? 'Número de carnet inválido' : null;
            },
            id_escuela: (value, values) =>
                !values.registrar_escuela_nueva && !value ? 'Seleccione la escuela' : null,
            codigo_escuela: (value, values) => {
                if (!values.registrar_escuela_nueva) return null;
                const digits = value.replace(/\D/g, '');
                return digits.length !== 6 ? 'El código debe tener 6 dígitos' : null;
            },
            nombre_escuela: (value, values) =>
                values.registrar_escuela_nueva && value.trim().length < 3
                    ? 'El nombre de la escuela debe tener al menos 3 caracteres'
                    : null,
            poblado: (value, values) =>
                values.registrar_escuela_nueva && value.trim().length < 3
                    ? 'El poblado debe tener al menos 3 caracteres'
                    : null,
            subsistema: (value, values) =>
                values.registrar_escuela_nueva && !value ? 'Seleccione el subsistema' : null,
            telefono_escuela: (value, values) => {
                if (!values.registrar_escuela_nueva) return null;
                const schoolDigits = value.replace(/\D/g, '');
                const contactDigits = values.telefono_responsable.replace(/\D/g, '');
                if (schoolDigits.length === 8 || contactDigits.length === 8) return null;
                return 'Indique el teléfono de la escuela o el del responsable';
            },
            contrasenia: (value) =>
                passwordMeetsAllRequirements(value)
                    ? null
                    : 'La contraseña debe cumplir todos los requisitos de seguridad',
            confirmContrasenia: (value, values) =>
                value !== values.contrasenia ? 'La contraseña no coincide' : null,
            pin: (value) => (value.length < 4 ? 'El PIN debe tener al menos 4 números' : null),
            confirmPin: (value, values) =>
                value !== values.pin ? 'El PIN no coincide' : null,
        },
    });

    const registrarEscuelaNueva = form.values.registrar_escuela_nueva;

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

    const loadEscuelas = useCallback(async (): Promise<ComboboxOption[]> => {
        if (!selectedMunicipio) return [];
        try {
            const response = await axios.get(`/api/escuelas/${selectedMunicipio}`);
            const data = Array.isArray(response.data) ? response.data : [];
            const filtered = data
                .filter((e: ComboboxOption) => e.value && String(e.value).trim() !== '')
                .map((e: ComboboxOption) => ({ ...e, value: String(e.value) }));

            return filtered.reduce((acc: ComboboxOption[], current: ComboboxOption) => {
                if (!acc.some((item) => item.value === current.value)) acc.push(current);
                return acc;
            }, []);
        } catch {
            return [];
        }
    }, [selectedMunicipio]);

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
        form.setFieldValue('id_escuela', '');
    };

    const handleMunicipioChange = (codigo: string | null) => {
        setSelectedMunicipio(codigo);
        form.setFieldValue('id_escuela', '');
    };

    const handleToggleEscuelaNueva = (checked: boolean) => {
        form.setFieldValue('registrar_escuela_nueva', checked);
        form.clearFieldError('id_escuela');
        form.clearFieldError('codigo_escuela');
        form.clearFieldError('nombre_escuela');
        form.clearFieldError('poblado');
        form.clearFieldError('subsistema');
        form.clearFieldError('telefono_escuela');
        if (checked) {
            form.setFieldValue('id_escuela', '');
        } else {
            form.setFieldValue('codigo_escuela', '');
            form.setFieldValue('nombre_escuela', '');
            form.setFieldValue('poblado', '');
            form.setFieldValue('subsistema', '');
            form.setFieldValue('telefono_escuela', '');
            form.setFieldValue('telefono_responsable', '');
        }
    };

    const handlePinChange = (value: string) => {
        form.setFieldValue('pin', value);
        if (form.values.confirmPin) {
            form.validateField('confirmPin');
        }
    };

    const handleConfirmPinChange = (value: string) => {
        form.setFieldValue('confirmPin', value);
        form.validateField('confirmPin');
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
            let idEscuela = form.values.id_escuela;

            if (registrarEscuelaNueva) {
                const schoolDigits = form.values.telefono_escuela.replace(/\D/g, '');
                const telefonoEscuela =
                    schoolDigits.length === 8
                        ? form.values.telefono_escuela
                        : form.values.telefono_responsable;

                const { data: escuela } = await axios.post<{ id: number }>('/api/registrar-escuela', {
                    codigo_escuela: form.values.codigo_escuela.replace(/\D/g, ''),
                    telefono: telefonoEscuela,
                    nombre_escuela: form.values.nombre_escuela.trim(),
                    poblado: form.values.poblado.trim(),
                    subsistema: form.values.subsistema,
                    cdgo_municipio: selectedMunicipio,
                });

                idEscuela = String(escuela.id);
            }

            await axios.post('/api/registrar-profesor', {
                nombre: form.values.nombre,
                apellidos: form.values.apellidos,
                correo: form.values.correo,
                telefono: form.values.telefono,
                nro_ci: form.values.nro_ci,
                id_escuela: idEscuela,
                contrasenia: form.values.contrasenia,
                pin: form.values.pin,
            });

            notifications.show({
                title: 'Registro exitoso',
                message: registrarEscuelaNueva
                    ? 'Escuela registrada y solicitud de profesor enviada. El coordinador las revisará pronto.'
                    : 'Solicitud de profesor enviada con éxito. El coordinador la revisará pronto.',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });

            form.reset();
            setSelectedProvinceCode(null);
            setSelectedMunicipio(null);
            navigate('/');
        } catch (err) {
            let errorMessage = 'Error inesperado. Por favor, inténtalo de nuevo.';
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 400 || err.response?.status === 422) {
                    const errors = err.response.data.errors;
                    errorMessage =
                        Object.values(errors ?? {}).flat().join(', ') ||
                        err.response.data.message ||
                        errorMessage;
                } else {
                    errorMessage = err.response?.data?.message || 'Error al registrar profesor';
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

    const pinMismatch =
        form.values.confirmPin.length > 0 &&
        form.values.pin.length > 0 &&
        form.values.confirmPin !== form.values.pin;

    return (
        <Box className={classes.page}>
            <Container size="md" py="xl">
                <Link to="/" className={classes.backLink}>
                    <IconArrowLeft size={16} />
                    Volver al inicio
                </Link>

                <PaperHero />

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <div className={classes.section}>
                        <SectionHeader
                            icon={<IconUser size={22} />}
                            title="Datos personales"
                            subtitle="Información de identificación y contacto"
                        />
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Nombre(s)"
                                    placeholder="Digite su nombre"
                                    withAsterisk
                                    {...form.getInputProps('nombre')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Apellidos"
                                    placeholder="Digite sus apellidos"
                                    withAsterisk
                                    {...form.getInputProps('apellidos')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Correo electrónico"
                                    placeholder="correo@ejemplo.cu"
                                    withAsterisk
                                    leftSection={<IconAt size={16} />}
                                    {...form.getInputProps('correo')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <MaskInputField
                                    withAsterisk
                                    leftSection={<IconPhone size={16} />}
                                    label="Teléfono"
                                    mask="9999-9999"
                                    placeholder="________"
                                    {...form.getInputProps('telefono')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <MaskInputField
                                    withAsterisk
                                    leftSection={<IconNumber size={16} />}
                                    label="Carné de identidad"
                                    mask="99999999999"
                                    placeholder="11 dígitos"
                                    {...form.getInputProps('nro_ci')}
                                />
                            </Grid.Col>
                        </Grid>
                    </div>

                    <div className={classes.section}>
                        <SectionHeader
                            icon={<IconSchool size={22} />}
                            title="Datos de la escuela"
                            subtitle="Busque su escuela o regístrela si no aparece en el sistema"
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

                            {!registrarEscuelaNueva && (
                                <Grid.Col span={12}>
                                    <SearchableAsyncCombobox
                                        label="Escuela"
                                        withAsterisk
                                        leftSection={<IconSchool size={16} />}
                                        description="Formato: nombre / subsistema / poblado"
                                        placeholder={
                                            selectedMunicipio
                                                ? 'Buscar escuela…'
                                                : 'Seleccione municipio primero'
                                        }
                                        value={form.values.id_escuela || null}
                                        onChange={(v) => form.setFieldValue('id_escuela', v ?? '')}
                                        loadOptions={loadEscuelas}
                                        disabled={!selectedMunicipio}
                                        cacheKey={selectedMunicipio}
                                        error={form.errors.id_escuela as string | undefined}
                                    />
                                </Grid.Col>
                            )}

                            <Grid.Col span={12}>
                                <Checkbox
                                    label="Mi escuela no aparece en la lista"
                                    description="Active esta opción para registrar el centro educativo junto con su solicitud"
                                    checked={registrarEscuelaNueva}
                                    onChange={(event) =>
                                        handleToggleEscuelaNueva(event.currentTarget.checked)
                                    }
                                    disabled={!selectedMunicipio}
                                />
                            </Grid.Col>

                            {registrarEscuelaNueva && (
                                <>
                                    <Grid.Col span={12}>
                                        <Alert color="violet" variant="light" radius="md">
                                            Complete los datos de su escuela. Quedará pendiente de
                                            validación por la coordinación.
                                        </Alert>
                                    </Grid.Col>
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
                                            onChange={(v) =>
                                                form.setFieldValue('subsistema', v ?? '')
                                            }
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
                                    <Grid.Col span={12}>
                                        <TextInput
                                            withAsterisk
                                            label="Poblado"
                                            placeholder="Digite el nombre del poblado"
                                            leftSection={<IconBuildingEstate size={16} />}
                                            {...form.getInputProps('poblado')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <MaskInputField
                                            withAsterisk
                                            label="Teléfono de la escuela"
                                            description="8 dígitos, sin código de país"
                                            leftSection={<IconPhone size={16} />}
                                            mask="9999-9999"
                                            placeholder="________"
                                            {...form.getInputProps('telefono_escuela')}
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
                                </>
                            )}
                        </Grid>
                    </div>

                    <div className={classes.section}>
                        <SectionHeader
                            icon={<IconLock size={22} />}
                            title="Datos de la cuenta"
                            subtitle="Contraseña y PIN de recuperación"
                        />
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <PasswordStrengthInput
                                    label="Contraseña"
                                    placeholder="Su contraseña"
                                    withAsterisk
                                    leftSection={<IconLock size={16} />}
                                    value={form.values.contrasenia}
                                    onChange={(value) => form.setFieldValue('contrasenia', value)}
                                    error={form.errors.contrasenia as string | undefined}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <PasswordInput
                                    label="Confirmar contraseña"
                                    placeholder="Repita la contraseña"
                                    withAsterisk
                                    leftSection={<IconLockCheck size={16} />}
                                    {...form.getInputProps('confirmContrasenia')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Input.Wrapper
                                    withAsterisk
                                    label="PIN de recuperación"
                                    description="Mínimo 4 números"
                                    error={form.errors.pin}
                                >
                                    <div className={classes.pinRow}>
                                        <PinInput
                                            mask={!showPin}
                                            type="number"
                                            length={4}
                                            value={form.values.pin}
                                            onChange={handlePinChange}
                                        />
                                        <Switch
                                            size="md"
                                            checked={showPin}
                                            onChange={() => setShowPin((p) => !p)}
                                            onLabel={
                                                <IconEyeFilled
                                                    size={16}
                                                    color="var(--mantine-color-yellow-4)"
                                                />
                                            }
                                            offLabel={
                                                <IconEyeClosed
                                                    size={16}
                                                    color="var(--mantine-color-blue-6)"
                                                />
                                            }
                                        />
                                    </div>
                                </Input.Wrapper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Input.Wrapper
                                    withAsterisk
                                    label="Confirmar PIN"
                                    description="Debe coincidir con el PIN anterior"
                                >
                                    <div className={classes.pinRow}>
                                        <PinInput
                                            mask={!showConfPin}
                                            type="number"
                                            length={4}
                                            value={form.values.confirmPin}
                                            onChange={handleConfirmPinChange}
                                            error={!!form.errors.confirmPin || pinMismatch}
                                        />
                                        <Switch
                                            size="md"
                                            checked={showConfPin}
                                            onChange={() => setShowConfPin((p) => !p)}
                                            onLabel={
                                                <IconEyeFilled
                                                    size={16}
                                                    color="var(--mantine-color-yellow-4)"
                                                />
                                            }
                                            offLabel={
                                                <IconEyeClosed
                                                    size={16}
                                                    color="var(--mantine-color-blue-6)"
                                                />
                                            }
                                        />
                                    </div>
                                    {(form.errors.confirmPin || pinMismatch) && (
                                        <Text className={classes.pinHint}>
                                            {form.errors.confirmPin || 'El PIN no coincide'}
                                        </Text>
                                    )}
                                </Input.Wrapper>
                            </Grid.Col>
                        </Grid>
                    </div>

                    <Alert color="blue" variant="light" mb="md" radius="md">
                        Tras enviar la solicitud, el coordinador nacional revisará y activará su
                        cuenta.
                    </Alert>

                    <div className={classes.submitWrap}>
                        <Button
                            type="submit"
                            fullWidth
                            size="md"
                            color="violet"
                            loading={loading}
                            rightSection={<IconSend size={16} />}
                        >
                            Enviar solicitud de registro
                        </Button>
                        <Text ta="center" size="sm" c="dimmed" mt="md">
                            ¿Ya tiene cuenta?{' '}
                            <Text component={Link} to="/acceso" span inherit c="violet" fw={600}>
                                Iniciar sesión
                            </Text>
                            {' · '}
                            <Text component={Link} to="/" span inherit c="violet" fw={600}>
                                Inicio
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
                        Registro de profesores
                    </Text>
                    <Title order={1} className={classes.heroTitle}>
                        Solicitar registro como profesor
                    </Title>
                    <Text className={classes.heroSubtitle}>
                        Complete el formulario para participar en BebrasCuba. Sus datos serán
                        revisados por el coordinador nacional antes de activar el acceso.
                    </Text>
                </Stack>
                <ThemeIcon size={56} radius="xl" variant="white" color="violet" visibleFrom="sm">
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
    icon: React.ReactNode;
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
