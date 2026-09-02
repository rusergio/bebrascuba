import { Alert, Button, Input, PinInput, Switch } from '@mantine/core';
import { IconArrowRight, IconEyeClosed, IconEyeFilled, IconNumber } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { setResetToken } from '../lib/auth';
import { useEffect, useState } from 'react';
import { RecoveryAccessLayout } from './RecoveryAccessLayout';
import classes from '../styles/CambiarClave.module.css';

export function RecuperarContrasenia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPin, setShowPin] = useState(false);
    const navigate = useNavigate();
    const nro_ci = localStorage.getItem('userCI');

    useEffect(() => {
        if (!nro_ci) {
            navigate('/cambiar-clave', { replace: true });
        }
    }, [nro_ci, navigate]);

    const form = useForm({
        initialValues: {
            pin: '',
        },
        validate: {
            pin: (value) => (value.length < 4 ? 'El PIN debe tener 4 números' : null),
        },
    });

    const handleSubmit = async () => {
        if (!form.isValid() || !nro_ci) return;
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/comprobar-pin', {
                ci: nro_ci,
                pin: form.values.pin,
            });
            const userData = response.data.user;
            const resetToken = response.data.reset_token;
            if (!resetToken) {
                setError('No se recibió token de recuperación. Inténtalo de nuevo.');
                return;
            }
            localStorage.removeItem('userCI');
            localStorage.setItem('userId', String(userData.id));
            setResetToken(resetToken);
            navigate('/cambiar-contrasenia');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    const errors = err.response.data.errors;
                    setError(Object.values(errors).flat().join(', '));
                } else {
                    setError(err.response?.data?.message || 'El PIN no coincide. Inténtalo de nuevo.');
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
            activeStep={2}
            headline={
                <>
                    Un último sello para{' '}
                    <span className={classes.headlineAccent}>confirmar que eres tú</span>
                </>
            }
            lead="El PIN es el código corto que registraste con tu cuenta. No lo compartas con nadie."
            icon={<IconNumber size={26} stroke={1.7} />}
            title="Comprobar el PIN"
            subtitle="Escribe los 4 números. Si coinciden, pasas a elegir una contraseña nueva."
            backTo="/cambiar-clave"
            backLabel="Volver al carnet"
            note="Si no recuerdas el PIN, pide ayuda a tu coordinador. Por seguridad no lo enviamos por correo."
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <div className={classes.pinWrap}>
                    <Input.Wrapper
                        withAsterisk
                        label="Tu PIN de seguridad"
                        description="Cuatro dígitos, en el mismo orden que los registraste"
                    >
                        <PinInput
                            length={4}
                            type="number"
                            size="lg"
                            radius="md"
                            mask={!showPin}
                            mt={8}
                            key={form.key('pin')}
                            {...form.getInputProps('pin')}
                        />
                    </Input.Wrapper>
                </div>

                <Switch
                    className={classes.pinToggle}
                    size="md"
                    color="teal"
                    label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                    checked={showPin}
                    onChange={(event) => setShowPin(event.currentTarget.checked)}
                    onLabel={<IconEyeFilled size={14} stroke={2.4} />}
                    offLabel={<IconEyeClosed size={14} stroke={2.4} />}
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
                    Comprobar PIN
                </Button>
            </form>
        </RecoveryAccessLayout>
    );
}
