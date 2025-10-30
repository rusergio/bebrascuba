import { Anchor, Button, Card, Center, Checkbox, Container, Group, TextInput, Title, Text } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { IconArrowLeft, IconMail, IconMailFilled, IconSend } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

export function ConfirmEmail() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
        
    const form = useForm({
        initialValues: {
        email: '',
        },
        validate: {
        email: isEmail('Correo electrónico inválido'),
        },
    });

    const handleSubmit = async () => {
        if(!form.isValid()) return ;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/enviar-link-registro', {
                email: form.values.email,
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
        <Container size="xs" >
            <Card padding="md" withBorder shadow="md" p={30} mt={30} radius="md">
                <Title order={3} ta="center" mb={5}>Confirmar correo electrónico</Title>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        withAsterisk
                        leftSection={<IconMailFilled size={16} />}
                        label="Correo electrónico"
                        placeholder="Digite aqui su correo electrónico"
                        key={form.key('email')}
                        {...form.getInputProps('email')}
                    />
                    <Text c={'blue'} fz={'xs'} mt={5}>{error}</Text>
                    <Checkbox
                        mt="md"
                        label="Aceptar la política de privacidad "
                        key={form.key('termsOfService')}
                        {...form.getInputProps('termsOfService', { type: 'checkbox' })}
                    />
                    <Group justify="flex-end" mt="md" >
                        <Anchor c="dimmed" size="sm" mr={250}>
                            <Center inline>
                                <IconArrowLeft size={16} stroke={1.5} />
                                {/* <Box ml={5} component={Link} to="/acceso">Regresar a Iniciar Sesion</Box> */}
                                <Anchor  ml={10} c={'gray'} size="sm" component={Link} to="/acceso">
                                    Regresar
                                </Anchor>
                            </Center>
                        </Anchor>
                        <Button type="submit" loading={loading}
                        rightSection={<IconSend size={16} />} >Enviar</Button>
                    </Group>
                </form>
            </Card>
        </Container>
    );
}