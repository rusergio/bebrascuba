import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Group,
    Button,
    Alert,
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import {
    IconArrowLeft,
    IconLockFilled,
    IconMailFilled,
    IconSparkles,
} from '@tabler/icons-react';
import { useState, useEffect, type MouseEvent } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { isEmail, useForm } from '@mantine/form';
import { useUserContext } from '../context/UserContext';
import { useDataContext } from '../context/DataContext';
import { setToken } from '../lib/auth';
import { saveTerritorio } from '../lib/territorio';
import logoBebras from '../assets/logobebrascuba.png';
import classes from '../styles/Acceso.module.css';

export function LoginLinks() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditionOpen, setIsEditionOpen] = useState(false);
    const [editionChecked, setEditionChecked] = useState(false);
    const navigate = useNavigate();

    const { setUser, setActiveRole } = useUserContext();
    const { refreshEstudiantes } = useDataContext();

    useEffect(() => {
        const checkEditionState = async () => {
            try {
                const response = await axios.get('api/edicion/esta-abierta');
                setIsEditionOpen(response.data?.is_open === true);
            } catch {
                console.error('Error al verificar el estado de la edición');
                setIsEditionOpen(false);
            } finally {
                setEditionChecked(true);
            }
        };
        checkEditionState();
    }, []);

    const handleRegistroClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!editionChecked) {
            event.preventDefault();
            notifications.show({
                title: 'Espera un momento',
                message: 'Estamos comprobando si la edición permite nuevos registros.',
                color: 'yellow',
            });
            return;
        }
        if (!isEditionOpen) {
            event.preventDefault();
            notifications.show({
                title: 'Edición cerrada',
                message:
                    'No hay ninguna edición abierta en este momento. No es posible registrarse hasta la próxima apertura oficial.',
                color: 'red',
            });
        }
    };

    const handleSubmit = async (values: { correo: string; contrasenia: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('api/user/login', {
                correo: values.correo,
                contrasenia: values.contrasenia,
            });
            const userData = response.data.user;
            const token = response.data.token;

            if (!token) {
                throw new Error('El servidor no devolvió un token de autenticación');
            }

            setToken(token);

            const primaryRole =
                userData.roles && userData.roles.length > 0 ? userData.roles[0].rol : 'Sin rol';

            const allRoles = userData.roles ? userData.roles.map((role: { rol: string }) => role.rol) : [];
            localStorage.setItem('allUserRoles', JSON.stringify(allRoles));

            if (userData.roles) {
                try {
                    localStorage.setItem('allUserRolesData', JSON.stringify(userData.roles));
                } catch (e) {
                    console.warn('No se pudo guardar allUserRolesData en localStorage', e);
                }
            }

            if (userData.profesor) {
                if (userData.profesor.profesor_id) {
                    localStorage.setItem('profesorTableId', String(userData.profesor.profesor_id));
                }
                if (userData.profesor.id) {
                    localStorage.setItem('profesorId', String(userData.profesor.id));
                }
                if (userData.profesor.id_escuela) {
                    localStorage.setItem('userSchoolId', String(userData.profesor.id_escuela));
                }
                if (userData.profesor.nombre_escuela) {
                    localStorage.setItem('userSchoolName', userData.profesor.nombre_escuela);
                }
                if (userData.profesor.provincia) {
                    localStorage.setItem('userProvincia', userData.profesor.provincia);
                }
                if (userData.profesor.municipio) {
                    localStorage.setItem('userMunicipio', userData.profesor.municipio);
                }
            }

            if (userData.territorio) {
                saveTerritorio(userData.territorio);
            } else {
                saveTerritorio(null);
            }

            localStorage.setItem('userRole', primaryRole);
            localStorage.setItem('activeRole', primaryRole);
            localStorage.setItem('userName', userData.nombre);
            localStorage.setItem('userLastName', userData.apellidos);
            localStorage.setItem('userEmail', userData.correo);
            localStorage.setItem('userId', userData.id.toString());
            if (userData.nro_ci) {
                localStorage.setItem('userCI', userData.nro_ci);
            }
            if (userData.telefono) {
                localStorage.setItem('userTelefono', userData.telefono);
            }
            localStorage.removeItem('userPhoto');

            setUser(userData);
            setActiveRole(primaryRole);
            window.dispatchEvent(new Event('localStorageUpdate'));

            try {
                await refreshEstudiantes();
            } catch {
                // No bloquear el login si falla la carga de estudiantes
            }

            notifications.show({
                title: 'Bienvenido',
                message: response.data.message || 'Sesión iniciada correctamente',
                color: 'teal',
            });

            navigate('/', { replace: true });
        } catch (err) {
            let errorMessage = 'Error inesperado. Por favor, inténtalo de nuevo.';
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    switch (err.response.status) {
                        case 401:
                            errorMessage = 'El correo o contraseña son incorrectos';
                            break;
                        case 403:
                            errorMessage =
                                err.response.data?.message ||
                                (err.response.data?.error === 'No hay edición abierta'
                                    ? 'No hay edición abierta; verifique la fecha de apertura en la página inicial.'
                                    : err.response.data?.error === 'El profesor no está activo'
                                      ? 'Tu cuenta aún no está activa; está en proceso de validación.'
                                      : errorMessage);
                            break;
                        case 422:
                            errorMessage = Object.values(err.response.data.errors || {})
                                .flat()
                                .join(', ');
                            break;
                        default:
                            errorMessage = err.response.data?.message || errorMessage;
                    }
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        initialValues: { correo: '', contrasenia: '' },
        validate: {
            correo: isEmail('Correo electrónico inválido'),
            contrasenia: (value) =>
                value.length < 3 ? 'La contraseña debe tener al menos 3 caracteres' : null,
        },
    });

    return (
        <div className={classes.page}>
            <aside className={classes.visual} aria-label="BebrasCuba">
                <div className={classes.visualBg} />
                <div className={classes.visualMesh} aria-hidden />
                <div className={`${classes.orb} ${classes.orbA}`} aria-hidden />
                <div className={`${classes.orb} ${classes.orbB}`} aria-hidden />

                <div className={classes.visualContent}>
                    <div className={classes.brandRow}>
                        <img src={logoBebras} alt="" className={classes.logo} />
                        <div>
                            <div className={classes.brandName}>BebrasCuba</div>
                            <div className={classes.brandTag}>Pensamiento computacional</div>
                        </div>
                    </div>

                    <div className={classes.heroCopy}>
                        <span className={classes.eyebrow}>
                            <IconSparkles size={14} />
                            Concurso nacional
                        </span>
                        <h1 className={classes.headline}>
                            Entra al espacio donde Cuba{' '}
                            <span className={classes.headlineAccent}>piensa en código</span>
                        </h1>
                        <p className={classes.lead}>
                            Profesores y coordinadores gestionan ediciones, escuelas y resultados desde
                            un solo lugar.
                        </p>
                    </div>

                    <div className={classes.footerMeta}>
                        <span className={classes.chip}>Escuelas de toda Cuba</span>
                        <span className={classes.chip}>Categorías Bebras</span>
                        <span className={classes.chip}>Resultados oficiales</span>
                    </div>
                </div>
            </aside>

            <main className={classes.panel}>
                <div className={classes.panelInner}>
                    <Link to="/" className={classes.backLink}>
                        <IconArrowLeft size={16} />
                        Volver al inicio
                    </Link>

                    <div className={classes.formCard}>
                        <h2 className={classes.formTitle}>Iniciar sesión</h2>
                        <p className={classes.formSubtitle}>
                            ¿Aún no tienes cuenta?{' '}
                            <Link
                                to="/registro"
                                className={classes.registerLink}
                                onClick={handleRegistroClick}
                            >
                                Regístrate ahora
                            </Link>
                        </p>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <TextInput
                                leftSection={<IconMailFilled size={16} />}
                                label="Correo electrónico"
                                placeholder="tu.correo@ejemplo.cu"
                                size="md"
                                radius="md"
                                {...form.getInputProps('correo')}
                            />
                            <PasswordInput
                                leftSection={<IconLockFilled size={16} />}
                                label="Contraseña"
                                placeholder="Tu contraseña"
                                mt="md"
                                size="md"
                                radius="md"
                                {...form.getInputProps('contrasenia')}
                            />

                            {error && (
                                <Alert color="red" mt="md" radius="md" variant="light">
                                    {error}
                                </Alert>
                            )}

                            <Group justify="space-between" mt="lg">
                                <Checkbox label="Recuérdame" color="teal" />
                                <Anchor size="sm" component={Link} to="/cambiar-clave" c="teal">
                                    Olvidé la contraseña
                                </Anchor>
                            </Group>

                            <Button
                                loading={loading}
                                fullWidth
                                type="submit"
                                mt="xl"
                                radius="md"
                                disabled={loading}
                                className={classes.submitBtn}
                            >
                                Entrar a BebrasCuba
                            </Button>
                        </form>

                        {editionChecked && (
                            <div
                                className={`${classes.editionHint} ${!isEditionOpen ? classes.editionHintClosed : ''}`}
                            >
                                {isEditionOpen
                                    ? 'Hay una edición abierta: los profesores pueden registrarse.'
                                    : 'La edición está cerrada: el acceso sigue disponible para cuentas activas.'}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
