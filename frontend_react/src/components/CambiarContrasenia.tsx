import { Alert, Button, PasswordInput } from '@mantine/core';
import { IconArrowRight, IconCheck, IconLock, IconLockCheck } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { clearResetToken, getResetToken } from '../lib/auth';
import { useEffect, useState } from 'react';
import {
    PasswordStrengthInput,
    passwordMeetsAllRequirements,
} from './ui/PasswordStrengthInput';
import { RecoveryAccessLayout } from './RecoveryAccessLayout';
import classes from '../styles/CambiarClave.module.css';

export function CambiarContrasenia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const id = localStorage.getItem('userId');

    useEffect(() => {
        if (success) return;
        if (!id || !getResetToken()) {
            navigate('/cambiar-clave', { replace: true });
        }
    }, [id, navigate, success]);

    const form = useForm({
        initialValues: {
            contrasenia: '',
            confirmContrasenia: '',
        },
        validate: {
            contrasenia: (value) =>
                passwordMeetsAllRequirements(value)
                    ? null
                    : 'La contraseña no cumple los requisitos de seguridad',
            confirmContrasenia: (value, values) =>
                value !== values.contrasenia ? 'La contraseña no coincide' : null,
        },
    });

    const handleSubmit = async () => {
        if (!form.isValid() || !id) return;
        setLoading(true);
        setError(null);

        try {
            const resetToken = getResetToken();
            await axios.put(`/api/cambiar-contrasenia/${id}`, {
                contrasenia: form.values.contrasenia,
                reset_token: resetToken,
            });
            form.reset();
            clearResetToken();
            localStorage.removeItem('userId');
            setSuccess(true);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    const errors = err.response.data.errors;
                    setError(Object.values(errors).flat().join(', '));
                } else {
                    setError(err.response?.data?.message || 'No se pudo cambiar la contraseña.');
                }
            } else {
                setError('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <RecoveryAccessLayout
            activeStep={3}
            headline={
                <>
                    Ya casi. Elige una{' '}
                    <span className={classes.headlineAccent}>clave más segura</span>
                </>
            }
            lead="Esta será la contraseña con la que entres de ahora en adelante a BebrasCuba."
            icon={<IconLockCheck size={26} stroke={1.7} />}
            title={success ? 'Contraseña actualizada' : 'Nueva contraseña'}
            subtitle={
                success
                    ? 'Ya puedes entrar con la clave nueva. Guárdala en un lugar que recuerdes.'
                    : 'Usa una combinación de letras, números y un símbolo. Las dos casillas deben coincidir.'
            }
            backTo="/acceso"
            backLabel={success ? 'Ir a iniciar sesión' : 'Cancelar y volver al acceso'}
            note={
                success
                    ? undefined
                    : 'Después de guardarla tendrás que iniciar sesión otra vez. El PIN no cambia.'
            }
        >
            {success ? (
                <>
                    <Alert color="teal" radius="md" variant="light" icon={<IconCheck size={18} />}>
                        Tu contraseña se cambió correctamente.
                    </Alert>
                    <div className={classes.successActions}>
                        <Button
                            component={Link}
                            to="/acceso"
                            fullWidth
                            radius="md"
                            className={classes.submitBtn}
                            rightSection={<IconArrowRight size={18} />}
                        >
                            Iniciar sesión
                        </Button>
                    </div>
                </>
            ) : (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PasswordStrengthInput
                        label="Nueva contraseña"
                        placeholder="Elige una clave segura"
                        leftSection={<IconLock size={16} />}
                        withAsterisk
                        size="md"
                        radius="md"
                        value={form.values.contrasenia}
                        onChange={(value) => form.setFieldValue('contrasenia', value)}
                        error={form.errors.contrasenia}
                    />
                    <PasswordInput
                        mt="md"
                        label="Confirma la nueva contraseña"
                        placeholder="Repite la misma clave"
                        leftSection={<IconLockCheck size={16} />}
                        withAsterisk
                        size="md"
                        radius="md"
                        {...form.getInputProps('confirmContrasenia')}
                    />

                    {error && (
                        <Alert color="red" mt="md" radius="md" variant="light">
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        disabled={loading}
                        fullWidth
                        mt="xl"
                        radius="md"
                        className={classes.submitBtn}
                        rightSection={<IconArrowRight size={18} />}
                    >
                        Guardar contraseña
                    </Button>
                </form>
            )}
        </RecoveryAccessLayout>
    );
}
