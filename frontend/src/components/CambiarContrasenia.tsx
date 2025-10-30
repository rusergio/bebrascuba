import { IconArrowLeft, IconDeviceFloppy, IconLock, IconLockCheck } from '@tabler/icons-react';
import { Anchor, Button, Center, Container, Grid, Group, Paper, PasswordInput, Text, Title } from '@mantine/core';
import classes from '../styles/CambiarClave.module.css';
import { Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración
import { useState } from 'react';

export function CambiarContrasenia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
    
    const id = localStorage.getItem('userId');
    const form = useForm({
        initialValues: {
            contrasenia: '', confirmContrasenia: '',
        },

        validate: {
            contrasenia: (value) => (value.length < 2 ? 'La contraseña debe tener al menos 3 caracteres' : null),
            confirmContrasenia: (value, values) => value !== values.contrasenia ? 'La contraseña no coincide ' : null,
        },
    });
    const handleSubmit = async () => {
        if(!form.isValid()) return ;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`/api/cambiar-contrasenia/${id}`, {
                contrasenia: form.values.contrasenia,
            });
            form.reset();
            setError('Contraseña modificado con suceso');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setError(errorMessage);
                    
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
                    setError(errorMessage);
                }
            } else {
                setError('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <Container size={500} my={30}>
        <Title ta="center" size={25}>
            Cambie su contraseña
        </Title>
        <Text c="dimmed" fz="sm" ta="center">
            Cambie la contraseña para mejor seguridad
        </Text>
        <Paper withBorder shadow="md" p={30} radius="md" mt="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid mt={10} mb={10}>
                    <Grid.Col span={12}>
                        <PasswordInput
                            label='Nueva contraseña'
                            leftSection={<IconLock size={16} />}
                            placeholder="Digite la contraseña"
                            withAsterisk
                            {...form.getInputProps('contrasenia')}
                        />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <PasswordInput
                            label='Confirme la nueva contraseña'
                            withAsterisk
                            leftSection={<IconLockCheck  size={16} />}
                            placeholder="Confirme la contraseña"
                            {...form.getInputProps('confirmContrasenia')}
                        />
                    </Grid.Col>
                </Grid>
                    <Text c={'blue'} fz={'xs'}>{error}</Text>
                <Group justify="space-between" mt="xs" className={classes.controls}>
                    <Anchor c="dimmed" size="sm" >
                        <Center inline>
                            <IconArrowLeft size={16} stroke={1.5} />
                            <Anchor  ml={5} c={'gray'} size="sm" component={Link} to="/acceso" >
                                Regresar
                            </Anchor>
                        </Center>
                    </Anchor>
                    <Button type="submit" loading={loading} leftSection={<IconDeviceFloppy size={18} />}>Salvar contraseña</Button>
                </Group>
            </form>
        </Paper>
        </Container>
    );
}