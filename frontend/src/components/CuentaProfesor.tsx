import { Avatar, Button, Container, Grid, Input, Paper, PasswordInput, PinInput, Switch, Tabs, TextInput, Title } from '@mantine/core';
import { Card, Text } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { IconAt, IconDeviceMobile, IconEyeClosed, IconEyeFilled, IconLock, IconLockCheck, IconLockCog, IconPasswordUser, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { IMaskInput } from 'react-imask';
import axios from 'axios'; 
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

export function CuentaProfesor() {
    const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);
    const [schoolSelectDisabled, setSchoolSelectDisabled] = useState(false);
    const [showPin, setShowPin] = useState(false);  
    const [showConfPin, setShowConfPin] = useState(false);
    const [loadingPin, setLoadingPin] = useState(false);
    const [loadingCorreo, setLoadingCorreo] = useState(false);
    const [loadingTelefono, setLoadingTelefono] = useState(false);
    const [loadingContrasenia, setLoadingContrasenia] = useState(false);
    const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
    const [message, setMessage] = useState<string | null>(null);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {  
        setShowSchoolRegistration(event.currentTarget.checked);  
        setSchoolSelectDisabled(event.currentTarget.checked);  
    };

    const handleToggleShowPin = () => {  
        setShowPin((prevShowPin) => !prevShowPin);  
    }; 
    const handleToggleShowConfPin = () => {  
        setShowConfPin((prevShowConfPin) => !prevShowConfPin);  
    };
    // 
    const formCorreo = useForm({
        initialValues: { correo: ''},
        // 
        validate: {
            correo: isEmail('Correo electrónico inválido'),
        },
    });
    const handleSubmitCorreo = async () => {
        if(!formCorreo.isValid()) return ;
        setError(null); // Limpiar errores previos
        setLoadingCorreo(true); // Iniciar el estado de carga
        
        try {
            const response = await axios.post("/api/registrar-profesor", {
                pin: formCorreo.values.correo,
            });
            setError('Solicitud enviado con suceso');
            console.log("Respuesta del servidor:", response.data);
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
            setLoadingCorreo(false);
        }
    };
    // 
    const formTelefono = useForm({
        initialValues: { telefono: '', confirmTelefono: ''},
            
        // functions will be used to validate values at corresponding key
        validate: {
            telefono: (value) => {  
                const digits = value.replace(/\D/g, ''); // Solo números  
                return digits.length !== 10 ? 'Número de teléfono inválido' : null;  
            },
            confirmTelefono: (value, values) => value !== values.telefono ? 'Los numeros de telefonos no coenciden' : null,
        },
    });
    const handleSubmitTelefono = async () => {
        if(!formTelefono.isValid()) return ;
        setLoadingTelefono(true); // Iniciar el estado de carga
        setError(null); // Limpiar errores previos
        
        try {
            const response = await axios.post("/api/registrar-profesor", {
                pin: formTelefono.values.telefono,
            });
            setError('Solicitud enviado con suceso');
            console.log("Respuesta del servidor:", response.data);
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
            setLoadingTelefono(false);
        }
    };
    // 
    const formContrasenia = useForm({
        initialValues: { contrasenia: '', confirmContrasenia: ''},
            
        // functions will be used to validate values at corresponding key
        validate: {
            contrasenia: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
            confirmContrasenia: (value, values) => value !== values.contrasenia ? 'Passwords did not match' : null,
            
        },
    });
    // 
    const handleSubmitContrasenia = async () => {
        if(!formContrasenia.isValid()) return ;
        setLoadingContrasenia(true); // Iniciar el estado de carga
        setError(null); // Limpiar errores previos
        
        try {
            const response = await axios.post("/api/registrar-profesor", {
                pin: formContrasenia.values.contrasenia,
            });
            setError('Solicitud enviado con suceso');
            console.log("Respuesta del servidor:", response.data);
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
            setLoadingContrasenia(false);
        }
    };
    // 
    const formPin = useForm({
        initialValues: { pin: '', confirmPin: ''},
            
        // functions will be used to validate values at corresponding key
        validate: {
            pin: (value) => (value.length < 3 ? 'El pin tiene que ser al menos 4 numeros' : null),
            confirmPin: (value, values) => {
                if(value !== values.pin) {
                    return 'Los pines no coenciden';
                }
                return null;
            }
        },
    });
    const handleSubmitPin = async () => {
        if(!formPin.isValid()) return ;
        setLoadingPin(true); // Iniciar el estado de carga
        setError(null); // Limpiar errores previos
        
        try {
            const response = await axios.post("/api/registrar-profesor", {
                pin: formPin.values.pin,
            });
            setError('Solicitud enviado con suceso');
            console.log("Respuesta del servidor:", response.data);
            
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
            setLoadingPin(false);
        }
    };
    return (
        <Container size={'lg'}>
            <Card >
                <Grid>
                    <Grid.Col span={5}>
                        <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
                            <Avatar
                                src=""
                                size={120}
                                radius={120}
                                mx="auto"
                            />
                            <Text ta="center" fz="h4" fw={500} mt="md">
                                {localStorage.getItem('userName')} {localStorage.getItem('userLastName')}
                            </Text>
                            <Text ta="center" size="md">Profesor</Text>
                            {/* <Text size='sm' ta="center" c="dimmed">Santa Clara, Caibarien</Text> */}
                            <Text size='sm' ta="center" c="dimmed">{localStorage.getItem('userEmail')}</Text>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={7}>
                        <Paper radius="sm" withBorder p="lg" bg="var(--mantine-color-body)">
                            <Title ta="center" order={3} mb={10}>Editar Cuenta</Title>

                            <Tabs defaultValue="contacto">
                                <Tabs.List>
                                    <Tabs.Tab value="contacto" leftSection={<IconPasswordUser size={16} />}>
                                        Cambiar Contactos
                                    </Tabs.Tab>
                                    <Tabs.Tab value="contrasenia" leftSection={<IconPasswordUser size={16} />}>
                                        Cambiar contraseña
                                    </Tabs.Tab>
                                    <Tabs.Tab value="pin" leftSection={<IconLockCog size={16} />}>
                                        Cambiar pin
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="contacto">
                                    <Text size='md' mt={10} c={'gray'} fw={300}>Cambie su contacto en caso que tengas otro </Text>
                                    <form onSubmit={formCorreo.onSubmit(handleSubmitCorreo)}>
                                        <Grid mt={10}>
                                            <Grid.Col span={12}>
                                                <TextInput 
                                                    withAsterisk 
                                                    label='Correo electronico'
                                                    mb={10} 
                                                    placeholder="Introduzca su nuevo correo"
                                                    leftSection={<IconAt size={16} />} 
                                                    {...formCorreo.getInputProps('correo')}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Text c={'red'} >{error}</Text>
                                        <Button type="submit" loading={loadingCorreo} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar Correo</Button>
                                    </form>
                                    <form onSubmit={formTelefono.onSubmit(handleSubmitTelefono)}>
                                        <Grid mt={10}>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Telefono" mb={10}>
                                                    <Input 
                                                        leftSection={<IconDeviceMobile size={16} />}
                                                        component={IMaskInput} mask="+53 00000000"
                                                        placeholder="Digite aqui su numero de telefono"
                                                        key={formTelefono.key('telefono')}
                                                        {...formTelefono.getInputProps('telefono')}
                                                    />
                                                </Input.Wrapper> 
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Confirmar Numero" mb={5}>
                                                    <Input 
                                                        leftSection={<IconDeviceMobile size={16} />}
                                                        component={IMaskInput} mask="+53 00000000"
                                                        placeholder="Confirme aqui su numero de telefono"
                                                        key={formTelefono.key('confirmTelefono')}
                                                        {...formTelefono.getInputProps('confirmTelefono')}
                                                    />
                                                </Input.Wrapper> 
                                            </Grid.Col>
                                        </Grid>
                                        <Text c={'red'} >{error}</Text>
                                        <Button type="submit" loading={loadingTelefono} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar nro de telefono</Button>
                                    </form>
                                </Tabs.Panel>

                                {/* Nueva Contraseña */}
                                <Tabs.Panel value="contrasenia">
                                    <Text size='md' mt={10} c={'gray'} fw={300}>Cree una nueva contraseña</Text>
                                    <form onSubmit={formContrasenia.onSubmit(handleSubmitContrasenia)}>
                                        <Grid mt={10} mb={10}>
                                            <Grid.Col span={6}>
                                                <PasswordInput
                                                    label='Nueva contraseña'
                                                    leftSection={<IconLock size={16} />}
                                                    placeholder="Digite aqui la contraseña"
                                                    withAsterisk
                                                    {...formContrasenia.getInputProps('contrasenia')}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <PasswordInput
                                                    label='Confirme la contraseña'
                                                    withAsterisk
                                                    leftSection={<IconLockCheck  size={16} />}
                                                    placeholder="Confirme aqui la contraseña"
                                                    {...formContrasenia.getInputProps('confirmContrasenia')}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Text c={'red'} >{error}</Text> 
                                        <Button type="submit" loading={loadingContrasenia} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar contraseña</Button>
                                    </form>
                                </Tabs.Panel>

                                {/* Nuevo PIN */}
                                <Tabs.Panel value="pin">
                                <Text size='md' mt={10} c={'gray'} fw={300}>Cree una nuevo PIN</Text>
                                    <form onSubmit={formPin.onSubmit(handleSubmitPin)}>
                                        <Grid mt={10}>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Ingrese el PIN" description="El pin debe tener al menos 4 números">
                                                    <PinInput
                                                        mask={!showPin}
                                                        type="number" 
                                                        key={formPin.key('pin')}
                                                        {...formPin.getInputProps('pin')}
                                                    />
                                                </Input.Wrapper>
                                                <Switch
                                                    size="md"
                                                    mt={'xs'}
                                                    color="dark.4"
                                                    // label='Ver el PIN'
                                                    checked={showPin}  
                                                    onChange={handleToggleShowPin}
                                                    onLabel={<IconEyeFilled size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
                                                    offLabel={<IconEyeClosed size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Confirme el PIN" description="El pin debe coencidir con el anterior">
                                                    <PinInput
                                                        mask={!showConfPin} 
                                                        type="number" 
                                                        key={formPin.key('confirmPin')}
                                                        {...formPin.getInputProps('confirmPin')}
                                                    />
                                                </Input.Wrapper>
                                                    <Switch
                                                        size="md"
                                                        mt={'xs'}
                                                        color="dark.4"
                                                        // label='Ver el PIN'
                                                        checked={showConfPin}  
                                                        onChange={handleToggleShowConfPin}  
                                                        onLabel={<IconEyeFilled size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
                                                        offLabel={<IconEyeClosed size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
                                                    />
                                            </Grid.Col>
                                            <Text c={'red'} >{error}</Text>
                                            <Button type='submit' loading={loadingPin} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar PIN</Button>
                                        </Grid>
                                    </form>
                                </Tabs.Panel>
                                
                            </Tabs>


                            {/* <Fieldset legend="Información personal" mb={5}>
                                <Grid mb={5}>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="Nombre"
                                            withAsterisk
                                            // description="Input description"
                                            placeholder="Input placeholder"
                                            value={'Juan Carlos'}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="Apellidos"
                                            withAsterisk
                                            // description="Input description"
                                            placeholder="Input placeholder"
                                            value={'Perez Mendez'}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <TextInput 
                                    withAsterisk 
                                    label='Correo electronico'
                                    mb={5} 
                                    value={'juanca@uclv.edu.cu'}
                                    placeholder="Correo electronico"
                                    leftSection={<IconAt size={16} />} 
                                />
                                <Grid mb={10}>
                            <Grid.Col span={6}>
                            <Input.Wrapper withAsterisk label="Telefono">
                                <Input leftSection={<IconDeviceMobile size={16} />} component={IMaskInput} mask="+53 00000000" value='+53 590392290' placeholder="Digite aqui su numero de telefono" />
                            </Input.Wrapper>
                            </Grid.Col>
                            <Grid.Col span={6}>
                            <Input.Wrapper withAsterisk label="Numero de carnet">
                                <Input
                                    onChange={(event) => setValue(event.currentTarget.value)}
                                    rightSectionPointerEvents="all"
                                    leftSection={<IconId size={16} />}
                                    component={IMaskInput} 
                                    value={'0209214990001'}
                                    mask="00000000000" 
                                    placeholder="Digite aqui su numero de carnet"
                                    rightSection={
                                        <CloseButton
                                            aria-label="Clear input"
                                            onClick={() => setValue('')}
                                            style={{ display: value ? undefined : 'none' }}
                                        />
                                    }
                                />
                            </Input.Wrapper>
                            </Grid.Col>
                            </Grid>
                                <Button fullWidth rightSection={<IconRefresh size={14} />}>Cambiar datos</Button>
                            </Fieldset>  */}

                            {/* <Fieldset legend="Información de escuela">
                                <Grid mt={10}>
                                    <Grid.Col span={6}>
                                        <Select
                                            label="Provincia"
                                            withAsterisk
                                            clearable
                                            placeholder="Seleccione la provincia"
                                            data={['React', 'Angular', 'Vue', 'Svelte']}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Select
                                            label="Municipio"
                                            withAsterisk
                                            clearable
                                            placeholder="Seleccione el municipio"
                                            data={['React', 'Angular', 'Vue', 'Svelte']}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid mt={10}>
                                    <Grid.Col span={12}>
                                        <Select
                                            label="Escuela"
                                            withAsterisk
                                            leftSection={<IconSchool size={16} />}
                                            clearable
                                            disabled={schoolSelectDisabled}  
                                            placeholder="Seleccione la escuela"
                                            data={['React', 'Angular', 'Vue', 'Svelte']}
                                            value={'React'}
                                        />
                                    </Grid.Col>
                                </Grid>
                    <Text mt={10} color='red'>
                        No encuentras su escuela ?
                    </Text>
                    <Checkbox  
                        mt={10}  
                        label="Solicitar registro de mi escuela"  
                        onChange={handleCheckboxChange}   
                    /> 

                    
                    {showSchoolRegistration && (  
                        <>  
                            
                            <Grid>  
                                <Grid.Col span={8}>  
                                    <TextInput mt={10} withAsterisk label='Escuela' mb={10} placeholder="Escribe nombre su escuela aqui" leftSection={<IconSchool size={16} />} />
                                </Grid.Col>
                                <Grid.Col span={4}>  
                                    <Input.Wrapper mt={10} withAsterisk label="Teléfono">
                                        <Input
                                            leftSection={<IconPhone size={16} />}  
                                            component={IMaskInput}  
                                            mask="+00 00000000"  
                                            placeholder="Numero de telefono"  
                                        />
                                    </Input.Wrapper>      
                                </Grid.Col>  
                            </Grid>  

                        </>  
                        )}
                            <Button fullWidth mt={10} rightSection={<IconRefresh size={14} />}>Editar</Button>
                            
                            </Fieldset> */}
                            
                            {/* <Fieldset legend="Nueva contraseña">
                                <Grid mt={5}>
                                    <Grid.Col span={6}>
                                        <PasswordInput
                                            label='Nueva contraseña'
                                            leftSection={<IconLock size={16} />}
                                            placeholder="Digite aqui la contraseña"
                                            withAsterisk
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <PasswordInput
                                            label='Confirme la contraseña'
                                            withAsterisk
                                            leftSection={<IconLockCheck  size={16} />}
                                            placeholder="Confirme aqui la contraseña"
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Button fullWidth mt={10} rightSection={<IconRefresh size={14} />}>Cambiar contraseña</Button>
                            </Fieldset> */}
                            
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Card>

            
            
        </Container>
    );
}