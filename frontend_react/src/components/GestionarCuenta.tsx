import {
    Alert,
    Button,
    Container,
    Grid,
    Group,
    Input,
    Paper,
    PasswordInput,
    PinInput,
    Stack,
    Switch,
    Tabs,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconAt,
    IconDeviceMobile,
    IconEyeClosed,
    IconEyeFilled,
    IconLock,
    IconLockCheck,
    IconLockCog,
    IconPasswordMobilePhone,
    IconPasswordUser,
    IconRefresh,
    IconShieldLock,
} from '@tabler/icons-react';
import { isEmail, useForm } from '@mantine/form';
import { useState } from 'react';
import axios from 'axios';
import { IMaskInput } from 'react-imask';
import { Link } from 'react-router-dom';
import classes from '../styles/GestionarCuenta.module.css';

function FeedbackMessage({ message }: { message: string | null }) {
    if (!message) return null;
    const isSuccess = !message.toLowerCase().includes('error');
    return (
        <Alert color={isSuccess ? 'teal' : 'red'} variant="light" radius="md" mt="sm">
            {message}
        </Alert>
    );
}

export function GestionarCuenta() {
    const userId = localStorage.getItem('userId');

    const [showPin, setShowPin] = useState(false);
    const [showConfPin, setShowConfPin] = useState(false);
    const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
    const [errorTelefono, setErrorTelefono] = useState<string | null>(null);
    const [errorContrasenia, setErrorContrasenia] = useState<string | null>(null);
    const [errorPin, setErrorPin] = useState<string | null>(null);
    const [loadingContrasenia, setLoadingContrasenia] = useState(false);
    const [loadingTelefono, setLoadingTelefono] = useState(false);
    const [loadingCorreo, setLoadingCorreo] = useState(false);
    const [loadingPin, setLoadingPin] = useState(false);

    const formCorreo = useForm({
        initialValues: { correo: '' },
        validate: { correo: isEmail('Correo electrónico inválido') },
    });

    const formContrasenia = useForm({
        initialValues: { contrasenia: '', confirmContrasenia: '' },
        validate: {
            contrasenia: (value) =>
                value.length < 3 ? 'La contraseña debe tener al menos 3 caracteres' : null,
            confirmContrasenia: (value, values) =>
                value !== values.contrasenia ? 'Las contraseñas no coinciden' : null,
        },
    });

    const formTelefono = useForm({
        initialValues: { telefono: '', confirmTelefono: '' },
        validate: {
            telefono: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 8 ? 'El teléfono debe tener 8 dígitos' : null;
            },
            confirmTelefono: (value, values) =>
                value !== values.telefono ? 'Los números de teléfono no coinciden' : null,
        },
    });

    const formPin = useForm({
        initialValues: { pin: '', confirmPin: '' },
        validate: {
            pin: (value) => (value.length < 3 ? 'El PIN debe tener al menos 4 números' : null),
            confirmPin: (value, values) => (value !== values.pin ? 'Los PINes no coinciden' : null),
        },
    });

    const handleSubmitCorreo = async () => {
        if (!formCorreo.isValid()) return;
        setErrorCorreo(null);
        setLoadingCorreo(true);
        try {
            await axios.put(`/api/cambiar-correo/${userId}`, { correo: formCorreo.values.correo });
            formCorreo.reset();
            setErrorCorreo('Correo cambiado con éxito');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrorCorreo(Object.values(error.response.data.errors).flat().join(', '));
                } else {
                    setErrorCorreo(error.response?.data?.message || 'Error al cambiar el correo');
                }
            } else {
                setErrorCorreo('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingCorreo(false);
        }
    };

    const handleSubmitContrasenia = async () => {
        if (!formContrasenia.isValid()) return;
        setLoadingContrasenia(true);
        setErrorContrasenia(null);
        try {
            await axios.put(`/api/cambiar-contrasenia/${userId}`, {
                contrasenia: formContrasenia.values.contrasenia,
            });
            formContrasenia.reset();
            setErrorContrasenia('Contraseña modificada con éxito');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrorContrasenia(Object.values(error.response.data.errors).flat().join(', '));
                } else {
                    setErrorContrasenia(
                        error.response?.data?.message || 'Error al cambiar la contraseña',
                    );
                }
            } else {
                setErrorContrasenia('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingContrasenia(false);
        }
    };

    const handleSubmitTelefono = async () => {
        if (!formTelefono.isValid()) return;
        setLoadingTelefono(true);
        setErrorTelefono(null);
        try {
            const telefono = formTelefono.values.telefono.replace(/\D/g, '');
            await axios.put(`/api/cambiar-telefono/${userId}`, { telefono });
            localStorage.setItem('userTelefono', telefono);
            formTelefono.reset();
            setErrorTelefono('Número de teléfono cambiado con éxito');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrorTelefono(Object.values(error.response.data.errors).flat().join(', '));
                } else {
                    setErrorTelefono(error.response?.data?.message || 'Error al cambiar el teléfono');
                }
            } else {
                setErrorTelefono('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingTelefono(false);
        }
    };

    const handleSubmitPin = async () => {
        if (!formPin.isValid()) return;
        setLoadingPin(true);
        setErrorPin(null);
        try {
            await axios.put(`/api/cambiar-pin/${userId}`, { pin: formPin.values.pin });
            formPin.reset();
            setErrorPin('PIN cambiado con éxito');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrorPin(Object.values(error.response.data.errors).flat().join(', '));
                } else {
                    setErrorPin(error.response?.data?.message || 'Error al cambiar el PIN');
                }
            } else {
                setErrorPin('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingPin(false);
        }
    };

    return (
        <Container size="md" py="xl" className={classes.wrapper}>
            <Paper radius="lg" className={classes.hero} p="xl" mb="lg">
                <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                    <Stack gap="xs" maw={480}>
                        <Text size="xs" tt="uppercase" fw={700} c="white" opacity={0.85} lts={1}>
                            Seguridad y contacto
                        </Text>
                        <Title order={2} c="white">
                            Gestionar cuenta
                        </Title>
                        <Text c="white" opacity={0.9} size="sm">
                            Actualiza correo, teléfono, contraseña y PIN de forma segura.
                        </Text>
                    </Stack>
                    <Button
                        component={Link}
                        to="/mi_perfil"
                        variant="white"
                        color="blue"
                        leftSection={<IconArrowLeft size={16} />}
                        radius="md"
                    >
                        Volver al perfil
                    </Button>
                </Group>
            </Paper>

            <Paper radius="lg" p="lg" shadow="sm" withBorder>
                <Group gap="sm" mb="lg">
                    <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'cyan', deg: 120 }}>
                        <IconShieldLock size={22} />
                    </ThemeIcon>
                    <div>
                        <Title order={3}>Ajustes de la cuenta</Title>
                        <Text size="sm" c="dimmed">
                            Elige una sección y guarda los cambios cuando termines
                        </Text>
                    </div>
                </Group>

                <Tabs defaultValue="contacto" variant="pills" radius="md" color="blue">
                    <Tabs.List mb="lg" grow>
                        <Tabs.Tab value="contacto" leftSection={<IconPasswordMobilePhone size={16} />}>
                            Contacto
                        </Tabs.Tab>
                        <Tabs.Tab value="contrasenia" leftSection={<IconPasswordUser size={16} />}>
                            Contraseña
                        </Tabs.Tab>
                        <Tabs.Tab value="pin" leftSection={<IconLockCog size={16} />}>
                            PIN
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="contacto">
                        <Stack gap="lg">
                            <Paper className={classes.formSection} p="lg" radius="md" withBorder>
                                <Group gap="sm" mb="md">
                                    <ThemeIcon size={32} radius="md" variant="light" color="cyan">
                                        <IconAt size={18} />
                                    </ThemeIcon>
                                    <div>
                                        <Text fw={600}>Correo electrónico</Text>
                                        <Text size="sm" c="dimmed">
                                            Introduce tu nuevo correo si deseas actualizarlo
                                        </Text>
                                    </div>
                                </Group>
                                <form onSubmit={formCorreo.onSubmit(handleSubmitCorreo)}>
                                    <TextInput
                                        withAsterisk
                                        label="Nuevo correo"
                                        placeholder="correo@ejemplo.cu"
                                        leftSection={<IconAt size={16} />}
                                        radius="md"
                                        {...formCorreo.getInputProps('correo')}
                                    />
                                    <FeedbackMessage message={errorCorreo} />
                                    <Button
                                        type="submit"
                                        mt="md"
                                        variant="gradient"
                                        gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
                                        loading={loadingCorreo}
                                        rightSection={<IconRefresh size={16} />}
                                        radius="md"
                                    >
                                        Cambiar correo
                                    </Button>
                                </form>
                            </Paper>

                            <Paper className={classes.formSection} p="lg" radius="md" withBorder>
                                <Group gap="sm" mb="md">
                                    <ThemeIcon size={32} radius="md" variant="light" color="teal">
                                        <IconDeviceMobile size={18} />
                                    </ThemeIcon>
                                    <div>
                                        <Text fw={600}>Teléfono de contacto</Text>
                                        <Text size="sm" c="dimmed">
                                            8 dígitos, sin código de país
                                        </Text>
                                    </div>
                                </Group>
                                <form onSubmit={formTelefono.onSubmit(handleSubmitTelefono)}>
                                    <Grid>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <Input.Wrapper withAsterisk label="Número de teléfono">
                                                <Input
                                                    leftSection={<IconDeviceMobile size={16} />}
                                                    component={IMaskInput}
                                                    mask="00000000"
                                                    placeholder="________"
                                                    radius="md"
                                                    mt={4}
                                                    key={formTelefono.key('telefono')}
                                                    {...formTelefono.getInputProps('telefono')}
                                                />
                                            </Input.Wrapper>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <Input.Wrapper withAsterisk label="Confirmar número">
                                                <Input
                                                    leftSection={<IconDeviceMobile size={16} />}
                                                    component={IMaskInput}
                                                    mask="00000000"
                                                    placeholder="________"
                                                    radius="md"
                                                    mt={4}
                                                    key={formTelefono.key('confirmTelefono')}
                                                    {...formTelefono.getInputProps('confirmTelefono')}
                                                />
                                            </Input.Wrapper>
                                        </Grid.Col>
                                    </Grid>
                                    <FeedbackMessage message={errorTelefono} />
                                    <Button
                                        type="submit"
                                        mt="md"
                                        variant="gradient"
                                        gradient={{ from: 'teal', to: 'cyan', deg: 90 }}
                                        loading={loadingTelefono}
                                        rightSection={<IconRefresh size={16} />}
                                        radius="md"
                                    >
                                        Cambiar teléfono
                                    </Button>
                                </form>
                            </Paper>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="contrasenia">
                        <Paper className={classes.formSection} p="lg" radius="md" withBorder>
                            <Group gap="sm" mb="md">
                                <ThemeIcon size={32} radius="md" variant="light" color="indigo">
                                    <IconLock size={18} />
                                </ThemeIcon>
                                <div>
                                    <Text fw={600}>Nueva contraseña</Text>
                                    <Text size="sm" c="dimmed">
                                        Crea una contraseña segura para proteger tu cuenta
                                    </Text>
                                </div>
                            </Group>
                            <form onSubmit={formContrasenia.onSubmit(handleSubmitContrasenia)}>
                                <Grid>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <PasswordInput
                                            label="Nueva contraseña"
                                            leftSection={<IconLock size={16} />}
                                            placeholder="Escribe la contraseña"
                                            withAsterisk
                                            radius="md"
                                            {...formContrasenia.getInputProps('contrasenia')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <PasswordInput
                                            label="Confirmar contraseña"
                                            withAsterisk
                                            leftSection={<IconLockCheck size={16} />}
                                            placeholder="Confirma la contraseña"
                                            radius="md"
                                            {...formContrasenia.getInputProps('confirmContrasenia')}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <FeedbackMessage message={errorContrasenia} />
                                <Button
                                    type="submit"
                                    mt="md"
                                    variant="gradient"
                                    gradient={{ from: 'indigo', to: 'violet', deg: 90 }}
                                    loading={loadingContrasenia}
                                    rightSection={<IconRefresh size={16} />}
                                    radius="md"
                                >
                                    Cambiar contraseña
                                </Button>
                            </form>
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="pin">
                        <Paper className={classes.formSection} p="lg" radius="md" withBorder>
                            <Group gap="sm" mb="md">
                                <ThemeIcon size={32} radius="md" variant="light" color="grape">
                                    <IconLockCog size={18} />
                                </ThemeIcon>
                                <div>
                                    <Text fw={600}>PIN de seguridad</Text>
                                    <Text size="sm" c="dimmed">
                                        El PIN debe tener al menos 4 números
                                    </Text>
                                </div>
                            </Group>
                            <form onSubmit={formPin.onSubmit(handleSubmitPin)}>
                                <Grid>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <Input.Wrapper withAsterisk label="Ingrese el PIN">
                                            <PinInput
                                                mt={4}
                                                mask={!showPin}
                                                type="number"
                                                key={formPin.key('pin')}
                                                {...formPin.getInputProps('pin')}
                                            />
                                        </Input.Wrapper>
                                        <Switch
                                            size="sm"
                                            mt="xs"
                                            label="Mostrar PIN"
                                            checked={showPin}
                                            onChange={() => setShowPin((v) => !v)}
                                            onLabel={
                                                <IconEyeFilled size={14} color="var(--mantine-color-yellow-4)" />
                                            }
                                            offLabel={
                                                <IconEyeClosed size={14} color="var(--mantine-color-blue-6)" />
                                            }
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <Input.Wrapper withAsterisk label="Confirme el PIN">
                                            <PinInput
                                                mt={4}
                                                mask={!showConfPin}
                                                type="number"
                                                key={formPin.key('confirmPin')}
                                                {...formPin.getInputProps('confirmPin')}
                                            />
                                        </Input.Wrapper>
                                        <Switch
                                            size="sm"
                                            mt="xs"
                                            label="Mostrar confirmación"
                                            checked={showConfPin}
                                            onChange={() => setShowConfPin((v) => !v)}
                                            onLabel={
                                                <IconEyeFilled size={14} color="var(--mantine-color-yellow-4)" />
                                            }
                                            offLabel={
                                                <IconEyeClosed size={14} color="var(--mantine-color-blue-6)" />
                                            }
                                        />
                                    </Grid.Col>
                                </Grid>
                                <FeedbackMessage message={errorPin} />
                                <Button
                                    type="submit"
                                    mt="md"
                                    variant="gradient"
                                    gradient={{ from: 'grape', to: 'pink', deg: 90 }}
                                    loading={loadingPin}
                                    rightSection={<IconRefresh size={16} />}
                                    radius="md"
                                >
                                    Cambiar PIN
                                </Button>
                            </form>
                        </Paper>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Container>
    );
}
