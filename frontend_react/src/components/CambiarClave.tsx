import { Alert, Button, InputBase } from '@mantine/core';
import { IconArrowRight, IconId, IconKey } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IMaskInput } from 'react-imask';
import axios from 'axios';
import { useState } from 'react';
import { RecoveryAccessLayout } from './RecoveryAccessLayout';
import classes from '../styles/CambiarClave.module.css';

export function CambiarClave() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const form = useForm({
        initialValues: {
            nro_ci: '',
        },
        validate: {
            nro_ci: (value) => {
                const digits = value.replace(/\D/g, '');
                return digits.length !== 11 ? 'El carnet debe tener 11 dígitos' : null;
            },
        },
    });

    const digits = form.values.nro_ci.replace(/\D/g, '');

    const handleSubmit = async () => {
        if (!form.isValid()) return;
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/comprobar-ci/${form.values.nro_ci}`);
            const userData = response.data.user;
            localStorage.setItem('userCI', userData.ci);
            navigate('/recuperar-senia');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    const errors = err.response.data.errors;
                    setError(Object.values(errors).flat().join(', '));
                } else {
                    setError(err.response?.data?.message || 'No encontramos una cuenta con ese carnet.');
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
            activeStep={1}
            headline={
                <>
                    Tu cuenta sigue aquí. Solo hay que{' '}
                    <span className={classes.headlineAccent}>encontrar la llave</span>
                </>
            }
            lead="En tres pasos cortos comprobamos que eres tú y te dejamos elegir una contraseña nueva."
            icon={<IconKey size={26} stroke={1.7} />}
            title="¿Olvidaste la contraseña?"
            subtitle="Empieza con tu carnet de identidad. Si coincide con una cuenta, pasamos al PIN."
            backTo="/acceso"
            backLabel="Volver a iniciar sesión"
            note="Si el carnet no aparece, revisa que esté bien escrito o pide ayuda a tu coordinador. No compartimos este dato en pantalla."
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <InputBase
                    withAsterisk
                    component={IMaskInput}
                    mask="00000000000"
                    leftSection={<IconId size={18} />}
                    label="Número de carnet"
                    placeholder="11 dígitos, sin espacios"
                    size="md"
                    radius="md"
                    key={form.key('nro_ci')}
                    {...form.getInputProps('nro_ci')}
                />
                <div className={classes.digitHint}>
                    <span>Solo números del documento</span>
                    <span className={classes.digitCount}>{digits.length}/11</span>
                </div>

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
                    Comprobar identidad
                </Button>
            </form>
        </RecoveryAccessLayout>
    );
}
