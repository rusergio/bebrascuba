import {
    Alert,
    Button,
    Container,
    Divider,
    Grid,
    Group,
    Input,
    Paper,
    PasswordInput,
    PinInput,
    Select,
    Stack,
    Stepper,
    Switch,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconArrowRight,
    IconAt,
    IconCheck,
    IconEyeClosed,
    IconEyeFilled,
    IconLock,
    IconLockCheck,
    IconMapPin,
    IconNumber,
    IconPhone,
    IconSchool,
    IconShieldLock,
    IconUser,
    IconUserPlus,
    IconUsers,
} from '@tabler/icons-react';
import { isEmail, useForm } from '@mantine/form';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { MaskInputField } from './ui/MaskInputField';
import {
    PasswordStrengthInput,
    passwordMeetsAllRequirements,
} from './ui/PasswordStrengthInput';
import classes from '../styles/AdminConcurso.module.css';

interface RolOption {
    value: string;
    label: string;
    description?: string;
}

interface SelectOption {
    value: string;
    label: string;
}

const ROLES_NO_DISPONIBLES = [
    'Representante MINED/MES',
    'Representante Provincial MINED',
    'Elaborador Tareas Bebras',
    'Revisor Tareas Bebras',
    'Colaborador Universitario Bebras',
];

const ROLES_REGISTRO = [
    'Profesor',
    'Coordinador Nacional',
    'Coordinador Asistente',
    'Coordinador Provincial MINED',
    'Coordinador Municipal MINED',
    'Colaborador Bebras',
];

const ROLES_CON_PROVINCIA = ['Coordinador Provincial MINED'];
const ROLES_CON_MUNICIPIO = ['Coordinador Municipal MINED'];
const ROLES_CON_ESCUELA = ['Profesor'];

const ROLE_HINTS: Record<string, string> = {
    Profesor: 'Se crea la cuenta activa. Opcionalmente puedes asignar escuela ahora.',
    'Coordinador Nacional': 'Acceso a gestión del concurso a nivel nacional.',
    'Coordinador Asistente': 'Apoya la gestión del concurso con permisos ampliados.',
    'Coordinador Provincial MINED': 'Requiere seleccionar la provincia de responsabilidad.',
    'Coordinador Municipal MINED': 'Requiere provincia y municipio de responsabilidad.',
    'Colaborador Bebras': 'Colaborador institucional del concurso.',
};

function SectionBlock({
    icon: Icon,
    color,
    title,
    subtitle,
    children,
}: {
    icon: typeof IconUser;
    color: string;
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <Paper className={classes.formSection} p="lg" radius="md" withBorder>
            <Group gap="sm" mb="md">
                <ThemeIcon size={36} radius="md" variant="light" color={color}>
                    <Icon size={18} />
                </ThemeIcon>
                <div>
                    <Text fw={600}>{title}</Text>
                    <Text size="sm" c="dimmed">
                        {subtitle}
                    </Text>
                </div>
            </Group>
            {children}
        </Paper>
    );
}

export function AdminConcurso() {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [showConfPin, setShowConfPin] = useState(false);
    const [roles, setRoles] = useState<RolOption[]>([]);
    const [provinces, setProvinces] = useState<SelectOption[]>([]);
    const [municipios, setMunicipios] = useState<SelectOption[]>([]);
    const [escuelas, setEscuelas] = useState<SelectOption[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            nombre: '',
            apellidos: '',
            correo: '',
            telefono: '',
            nro_ci: '',
            rol: '',
            provincia: '',
            municipio: '',
            id_escuela: '',
            contrasenia: '',
            confirmContrasenia: '',
            pin: '',
            confirmPin: '',
        },
        validate: {
            nombre: (value) => {
                if (value.length < 2) return 'El nombre es obligatorio';
                if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)) return 'Solo letras permitidas';
                return null;
            },
            apellidos: (value) => {
                if (value.length < 2) return 'Los apellidos son obligatorios';
                if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)) return 'Solo letras permitidas';
                return null;
            },
            correo: isEmail('Correo electrónico no válido'),
            telefono: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 8 ? 'El teléfono debe tener 8 dígitos' : null;
            },
            nro_ci: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 11 ? 'El carné debe tener 11 dígitos' : null;
            },
            rol: (value) => (!value ? 'Seleccione un rol' : null),
            contrasenia: (value) =>
                passwordMeetsAllRequirements(value)
                    ? null
                    : 'La contraseña debe cumplir todos los requisitos de seguridad',
            confirmContrasenia: (value, values) =>
                value !== values.contrasenia ? 'Las contraseñas no coinciden' : null,
            pin: (value) => (value.length !== 4 ? 'El PIN debe tener 4 dígitos' : null),
            confirmPin: (value, values) =>
                value !== values.pin ? 'Los PINes no coinciden' : null,
        },
    });

    const selectedRol = form.values.rol;
    const needsProvincia = ROLES_CON_PROVINCIA.includes(selectedRol) || ROLES_CON_MUNICIPIO.includes(selectedRol);
    const needsMunicipio = ROLES_CON_MUNICIPIO.includes(selectedRol);
    const needsEscuela = ROLES_CON_ESCUELA.includes(selectedRol);
    const roleHint = selectedRol ? ROLE_HINTS[selectedRol] : null;

    const cargarRoles = useCallback(async () => {
        try {
            const { data } = await axios.get<{
                success: boolean;
                data: Array<{ id: number; rol: string; descripcion: string; estado: boolean }>;
            }>('api/listar-roles');
            if (data.success) {
                const filtrados = data.data
                    .filter(
                        (r) =>
                            r.estado &&
                            ROLES_REGISTRO.includes(r.rol) &&
                            !ROLES_NO_DISPONIBLES.includes(r.rol),
                    )
                    .map((r) => ({
                        value: r.rol,
                        label: r.rol,
                        description: r.descripcion,
                    }));
                setRoles(filtrados);
            }
        } catch {
            notifications.show({
                title: 'Error',
                message: 'No se pudieron cargar los roles disponibles',
                color: 'red',
            });
        }
    }, []);

    const fetchProvinces = useCallback(async () => {
        try {
            const { data } = await axios.get<Array<{ codigo: number; nombre: string }>>('api/provincias');
            setProvinces(
                data.map((p) => ({ value: String(p.codigo), label: p.nombre })),
            );
        } catch {
            console.error('Error al cargar provincias');
        }
    }, []);

    const fetchMunicipios = useCallback(async (provinciaCodigo: string) => {
        try {
            const { data } = await axios.get<Array<{ codigo: number; nombre: string }>>(
                `api/municipios/${provinciaCodigo}`,
            );
            setMunicipios(data.map((m) => ({ value: String(m.codigo), label: m.nombre })));
        } catch {
            setMunicipios([]);
        }
    }, []);

    const fetchEscuelas = useCallback(async (municipioCodigo: string) => {
        try {
            const { data } = await axios.get<Array<{ value: string; label: string }>>(
                `api/escuelas/${municipioCodigo}`,
            );
            setEscuelas(data);
        } catch {
            setEscuelas([]);
        }
    }, []);

    useEffect(() => {
        void cargarRoles();
        void fetchProvinces();
    }, [cargarRoles, fetchProvinces]);

    useEffect(() => {
        if (form.values.municipio) {
            void fetchEscuelas(form.values.municipio);
        } else {
            setEscuelas([]);
        }
    }, [form.values.municipio, fetchEscuelas]);

    const handleProvinceChange = (provinciaCodigo: string | null) => {
        setSelectedProvinceCode(provinciaCodigo);
        form.setFieldValue('provincia', provinciaCodigo || '');
        form.setFieldValue('municipio', '');
        form.setFieldValue('id_escuela', '');
        setMunicipios([]);
        setEscuelas([]);
        if (provinciaCodigo) void fetchMunicipios(provinciaCodigo);
    };

    const handleRolChange = (rol: string | null) => {
        form.setFieldValue('rol', rol || '');
        form.setFieldValue('provincia', '');
        form.setFieldValue('municipio', '');
        form.setFieldValue('id_escuela', '');
        setSelectedProvinceCode(null);
        setMunicipios([]);
        setEscuelas([]);
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

    const validateFields = (...fields: (keyof typeof form.values)[]) => {
        let valid = true;
        for (const field of fields) {
            const result = form.validateField(field);
            if (result.hasError) valid = false;
        }
        return valid;
    };

    const validateStep = (step: number) => {
        if (step === 0) {
            return validateFields('nombre', 'apellidos', 'correo', 'telefono', 'nro_ci');
        }
        if (step === 1) {
            let valid = validateFields('rol');
            if (needsProvincia) {
                if (!form.values.provincia) {
                    form.setFieldError('provincia', 'Seleccione una provincia');
                    valid = false;
                } else {
                    form.clearFieldError('provincia');
                }
            }
            if (needsMunicipio) {
                if (!form.values.municipio) {
                    form.setFieldError('municipio', 'Seleccione un municipio');
                    valid = false;
                } else {
                    form.clearFieldError('municipio');
                }
            }
            return valid;
        }
        if (step === 2) {
            return validateFields('contrasenia', 'confirmContrasenia', 'pin', 'confirmPin');
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(activeStep)) {
            setActiveStep((s) => Math.min(s + 1, 2));
        }
    };

    const prevStep = () => setActiveStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async (values: typeof form.values) => {
        if (!validateStep(2)) return;

        setLoading(true);
        try {
            const payload: Record<string, string> = {
                nombre: values.nombre.trim(),
                apellidos: values.apellidos.trim(),
                correo: values.correo.trim(),
                telefono: values.telefono.replace(/\D/g, ''),
                nro_ci: values.nro_ci.replace(/\D/g, ''),
                rol: values.rol,
                contrasenia: values.contrasenia,
                pin: values.pin,
            };

            if (values.provincia) payload.provincia = values.provincia;
            if (values.municipio) payload.municipio = values.municipio;
            if (values.id_escuela) payload.id_escuela = values.id_escuela;

            const { data } = await axios.post<{ success: boolean; message: string }>(
                'api/registrar-usuario',
                payload,
            );

            notifications.show({
                title: 'Usuario registrado',
                message: data.message || 'El usuario fue creado correctamente',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });

            form.reset();
            setActiveStep(0);
            setSelectedProvinceCode(null);
            setMunicipios([]);
            setEscuelas([]);
        } catch (error) {
            let message = 'No se pudo registrar el usuario';
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422 && error.response.data?.errors) {
                    message = Object.values(error.response.data.errors).flat().join(', ');
                } else {
                    message = error.response?.data?.message || message;
                }
            }
            notifications.show({
                title: 'Error al registrar',
                message,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const stepLabels = useMemo(
        () => [
            { label: 'Datos personales', description: 'Identidad y contacto' },
            { label: 'Rol y ubicación', description: 'Tipo de usuario' },
            { label: 'Seguridad', description: 'Contraseña y PIN' },
        ],
        [],
    );

    const pinMismatch =
        form.values.confirmPin.length > 0 &&
        form.values.pin.length > 0 &&
        form.values.confirmPin !== form.values.pin;

    const handleStepClick = (step: number) => {
        if (step <= activeStep) {
            setActiveStep(step);
            return;
        }
        for (let i = activeStep; i < step; i++) {
            if (!validateStep(i)) return;
        }
        setActiveStep(step);
    };

    return (
        <Container size="md" py="xl" className={classes.wrapper}>
            <Paper radius="lg" className={classes.hero} p="xl" mb={0}>
                <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                    <Stack gap="xs" maw={520}>
                        <Text size="xs" tt="uppercase" fw={700} c="white" opacity={0.85} lts={1}>
                            Administración
                        </Text>
                        <Title order={2} c="white">
                            Registrar usuario
                        </Title>
                        <Text c="white" opacity={0.9} size="sm">
                            Crea cuentas de profesores, coordinadores o colaboradores. Completa
                            los tres pasos y confirma al final.
                        </Text>
                    </Stack>
                    <Button
                        component={Link}
                        to="/mi_perfil"
                        variant="white"
                        color="grape"
                        leftSection={<IconArrowLeft size={16} />}
                        radius="md"
                    >
                        Volver al perfil
                    </Button>
                </Group>
            </Paper>

            <Paper radius="lg" p="xl" shadow="sm" withBorder className={classes.mainPanel}>
                <Stepper
                    active={activeStep}
                    onStepClick={handleStepClick}
                    allowNextStepsSelect={false}
                    mb="xl"
                >
                    {stepLabels.map((step) => (
                        <Stepper.Step key={step.label} label={step.label} description={step.description} />
                    ))}
                </Stepper>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {activeStep === 0 && (
                        <SectionBlock
                            icon={IconUser}
                            color="cyan"
                            title="Datos personales"
                            subtitle="Información básica del nuevo usuario"
                        >
                            <Grid>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput
                                        withAsterisk
                                        label="Nombre(s)"
                                        placeholder="Ej. María"
                                        radius="md"
                                        {...form.getInputProps('nombre')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput
                                        withAsterisk
                                        label="Apellidos"
                                        placeholder="Ej. Pérez García"
                                        radius="md"
                                        {...form.getInputProps('apellidos')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <TextInput
                                        withAsterisk
                                        label="Correo electrónico"
                                        placeholder="usuario@ejemplo.cu"
                                        leftSection={<IconAt size={16} />}
                                        radius="md"
                                        {...form.getInputProps('correo')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <MaskInputField
                                        withAsterisk
                                        label="Teléfono"
                                        mask="9999-9999"
                                        placeholder="________"
                                        leftSection={<IconPhone size={16} />}
                                        radius="md"
                                        {...form.getInputProps('telefono')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <MaskInputField
                                        withAsterisk
                                        label="Carné de identidad"
                                        mask="99999999999"
                                        placeholder="11 dígitos"
                                        leftSection={<IconNumber size={16} />}
                                        radius="md"
                                        {...form.getInputProps('nro_ci')}
                                    />
                                </Grid.Col>
                            </Grid>
                        </SectionBlock>
                    )}

                    {activeStep === 1 && (
                        <Stack gap="lg">
                            <SectionBlock
                                icon={IconUsers}
                                color="grape"
                                title="Rol del usuario"
                                subtitle="Define qué tipo de cuenta se creará"
                            >
                                <Select
                                    withAsterisk
                                    searchable
                                    label="Rol"
                                    placeholder="Seleccione un rol"
                                    leftSection={<IconUser size={16} />}
                                    data={roles}
                                    radius="md"
                                    value={form.values.rol}
                                    onChange={handleRolChange}
                                    error={form.errors.rol}
                                />
                                {roleHint && (
                                    <Alert color="grape" variant="light" radius="md" mt="md" className={classes.roleHint}>
                                        {roleHint}
                                    </Alert>
                                )}
                            </SectionBlock>

                            {(needsProvincia || needsEscuela) && (
                                <SectionBlock
                                    icon={IconMapPin}
                                    color="teal"
                                    title="Ubicación"
                                    subtitle={
                                        needsEscuela
                                            ? 'Asignación territorial y escuela (opcional para profesor)'
                                            : 'Territorio de responsabilidad del coordinador'
                                    }
                                >
                                    <Grid>
                                        {(needsProvincia || needsEscuela) && (
                                            <Grid.Col span={{ base: 12, sm: needsMunicipio || needsEscuela ? 6 : 12 }}>
                                                <Select
                                                    withAsterisk={needsProvincia}
                                                    clearable
                                                    searchable
                                                    label="Provincia"
                                                    placeholder="Seleccione provincia"
                                                    leftSection={<IconMapPin size={16} />}
                                                    data={provinces}
                                                    radius="md"
                                                    value={form.values.provincia || null}
                                                    onChange={handleProvinceChange}
                                                    error={form.errors.provincia}
                                                />
                                            </Grid.Col>
                                        )}
                                        {(needsMunicipio || needsEscuela) && (
                                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                                <Select
                                                    withAsterisk={needsMunicipio}
                                                    clearable
                                                    searchable
                                                    label="Municipio"
                                                    placeholder="Seleccione municipio"
                                                    leftSection={<IconMapPin size={16} />}
                                                    data={municipios}
                                                    radius="md"
                                                    disabled={!selectedProvinceCode && !form.values.provincia}
                                                    value={form.values.municipio || null}
                                                    onChange={(v) => {
                                                        form.setFieldValue('municipio', v || '');
                                                        form.setFieldValue('id_escuela', '');
                                                    }}
                                                    error={form.errors.municipio}
                                                />
                                            </Grid.Col>
                                        )}
                                        {needsEscuela && (
                                            <Grid.Col span={12}>
                                                <Select
                                                    clearable
                                                    searchable
                                                    label="Centro educativo"
                                                    description="Opcional. Puede asignarse después."
                                                    placeholder="Seleccione escuela"
                                                    leftSection={<IconSchool size={16} />}
                                                    data={escuelas}
                                                    radius="md"
                                                    disabled={!form.values.municipio}
                                                    {...form.getInputProps('id_escuela')}
                                                />
                                            </Grid.Col>
                                        )}
                                    </Grid>
                                </SectionBlock>
                            )}
                        </Stack>
                    )}

                    {activeStep === 2 && (
                        <SectionBlock
                            icon={IconShieldLock}
                            color="indigo"
                            title="Credenciales de acceso"
                            subtitle="Contraseña de inicio de sesión y PIN de seguridad"
                        >
                            <Grid>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <PasswordStrengthInput
                                        withAsterisk
                                        label="Contraseña"
                                        placeholder="Su contraseña"
                                        leftSection={<IconLock size={16} />}
                                        radius="md"
                                        value={form.values.contrasenia}
                                        onChange={(value) => form.setFieldValue('contrasenia', value)}
                                        error={form.errors.contrasenia as string | undefined}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <PasswordInput
                                        withAsterisk
                                        label="Confirmar contraseña"
                                        placeholder="Repita la contraseña"
                                        leftSection={<IconLockCheck size={16} />}
                                        radius="md"
                                        {...form.getInputProps('confirmContrasenia')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <Input.Wrapper
                                        withAsterisk
                                        label="PIN de recuperación"
                                        description="4 dígitos"
                                        error={form.errors.pin}
                                    >
                                        <div className={classes.pinRow}>
                                            <PinInput
                                                length={4}
                                                mask={!showPin}
                                                type="number"
                                                value={form.values.pin}
                                                onChange={handlePinChange}
                                            />
                                            <Switch
                                                size="md"
                                                checked={showPin}
                                                onChange={() => setShowPin((v) => !v)}
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
                                                length={4}
                                                mask={!showConfPin}
                                                type="number"
                                                value={form.values.confirmPin}
                                                onChange={handleConfirmPinChange}
                                                error={!!form.errors.confirmPin || pinMismatch}
                                            />
                                            <Switch
                                                size="md"
                                                checked={showConfPin}
                                                onChange={() => setShowConfPin((v) => !v)}
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
                        </SectionBlock>
                    )}

                    <Divider my="xl" />

                    <Group justify="space-between">
                        <Button
                            variant="default"
                            onClick={prevStep}
                            disabled={activeStep === 0}
                            radius="md"
                        >
                            Anterior
                        </Button>
                        {activeStep < 2 ? (
                            <Button
                                variant="gradient"
                                gradient={{ from: 'grape', to: 'violet' }}
                                onClick={nextStep}
                                radius="md"
                                rightSection={<IconArrowRight size={18} />}
                            >
                                Siguiente
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                loading={loading}
                                variant="gradient"
                                gradient={{ from: 'grape', to: 'indigo' }}
                                leftSection={<IconUserPlus size={18} />}
                                radius="md"
                            >
                                Registrar usuario
                            </Button>
                        )}
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}
