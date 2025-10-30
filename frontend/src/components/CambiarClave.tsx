import { IconArrowLeft, IconListSearch, IconNumber } from '@tabler/icons-react';
import { Anchor, Button, Center, Container, Group, InputBase, Paper, Text, Title } from '@mantine/core';
import classes from '../styles/CambiarClave.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IMaskInput } from 'react-imask';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración
import { useState } from 'react';

export function CambiarClave() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
    const navigate = useNavigate();

    const form = useForm({
        initialValues: {
        nro_ci: '',
        },

        validate: {
            nro_ci: (value) => {  
                const digits = value.replace(/\D/g, ''); // Solo números  
                return digits.length !== 11 ? 'Número de carnet inválido' : null;  
            },
        },
    });
    const handleSubmit = async () => {
        if(!form.isValid()) return ;
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`/api/comprobar-ci/${form.values.nro_ci}`);
            const userData = response.data.user; // Suponiendo que el backend devuelve todos los datos del usuario
            // Guardar los datos del usuario en el contexto
            localStorage.setItem('userCI', userData.ci);
            
            navigate('/recuperar-senia'); // Redirigir al inicio
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setError(errorMessage);
                    navigate('/recuperar-senia'); // Redirigir al inicio
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
        <Container size={470} my={30}>
        <Title ta="center" size={25}>
            Olvidaste la contraseña?
        </Title>
        <Text c="dimmed" fz="sm" ta="center">
            Ingrese su número de carnet para cambiar la contraseña
        </Text>
        <Paper withBorder shadow="md" p={30} radius="md" mt="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <InputBase
                    withAsterisk
                    component={IMaskInput}
                    mask="00000000000"
                    leftSection={<IconNumber size={16} />}
                    label="Su carnet" placeholder="Digite aqui su numero de carnet"
                    key={form.key('nro_ci')}
                    {...form.getInputProps('nro_ci')}
                />
                    <Text c={'blue'} fz={'xs'}>{error}</Text>
                <Group justify="space-between" mt="xs" className={classes.controls}>
                    <Anchor c="dimmed" size="sm" >
                        <Center inline>
                            <IconArrowLeft size={16} stroke={1.5} />
                            <Anchor  ml={5} c={'gray'} size="sm" component={Link} to="/acceso">
                                Regresar
                            </Anchor>
                        </Center>
                    </Anchor>
                    <Button type="submit" loading={loading} rightSection={<IconListSearch size={18} />}>Comprobar</Button>
                </Group>
            </form>
        </Paper>
        </Container>
    );
}