import { IconArrowLeft, IconEyeClosed, IconEyeFilled, IconListSearch, IconNumber } from '@tabler/icons-react';
import { Anchor, Button, Center, Container, Grid, Group, Input, InputBase, Paper, PinInput, Switch, Text, Title } from '@mantine/core';
import classes from '../styles/CambiarClave.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IMaskInput } from 'react-imask';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración
import { useState } from 'react';

export function RecuperarContrasenia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
    const navigate = useNavigate();
    const [showPin, setShowPin] = useState(false);  
    const nro_ci = localStorage.getItem('userCI');

    const handleToggleShowPin = () => {  
        setShowPin((prevShowPin) => !prevShowPin);  
    }; 
    
    const form = useForm({
        initialValues: {
            pin: '',
        },
        validate: {
            pin: (value) => (value.length < 3 ? 'El pin tiene que ser al menos 4 numeros' : null), 
        },
    });
    const handleSubmit = async () => {
        if(!form.isValid()) return ;
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/comprobar-pin',{
                ci: nro_ci,
                pin: form.values.pin,
            });
            const userData = response.data.user;
            localStorage.removeItem('userCI');
            localStorage.setItem('userId', userData.id); 
            navigate('/cambiar-contrasenia'); // Redirigir al inicio
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422) {
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
        <Container size={470} my={30}>
        <Title ta="center" size={25}>
            Comprobar el PIN
        </Title>
        <Text c="dimmed" fz="sm" ta="center">
            Debes poner su PIN para poder cambiar la contraseña
        </Text>
        <Paper withBorder shadow="md" p={30} radius="md" mt="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid mt={10}>
                    <Grid.Col span={12}>
                        <Input.Wrapper withAsterisk label="Ingrese su PIN" description="El pin debe tener al menos 4 números">
                            <PinInput
                                mask={!showPin}
                                type="number" 
                                key={form.key('pin')}
                                {...form.getInputProps('pin')}
                            />
                        </Input.Wrapper>
                        <Switch
                            size="md"
                            mt={'xs'}
                            color="dark.4"
                            // label='Ver el pin'
                            checked={showPin}  
                            onChange={handleToggleShowPin}
                            onLabel={<IconEyeFilled size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
                            offLabel={<IconEyeClosed size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
                        />
                    </Grid.Col>
                </Grid>
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