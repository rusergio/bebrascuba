import { Container, Card, Input, PasswordInput, Button, Text, TextInput, PinInput, Switch } from '@mantine/core';
import { Grid, Select, Title } from '@mantine/core';
import { IconAt, IconPhone, IconLock, IconLockCheck, IconSchool, IconSend, IconNumber, IconMapPin, IconEyeFilled, IconEyeClosed, IconCheck, IconX } from '@tabler/icons-react';
import { IMaskInput } from 'react-imask';
import { InputBase } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';  
import axios from 'axios'; 
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom'; 

interface Provincia {
    value: string;
    label: string;
}

interface Municipio {
    value: string;
    label: string;
}

interface Escuela {
    value: string;
    label: string;
}

export function RegistrarProfe() {
    const [loading, setLoading] = useState(false);
    const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);
    const [schoolSelectDisabled, setSchoolSelectDisabled] = useState(false);
    const [checked, setChecked] = useState(false);
    const [showPin, setShowPin] = useState(false);  
    const [showConfPin, setShowConfPin] = useState(false);
    const navigate = useNavigate();
    const handleToggleShowPin = () => {  
        setShowPin((prevShowPin) => !prevShowPin);  
    }; 
    const handleToggleShowConfPin = () => {  
        setShowConfPin((prevShowConfPin) => !prevShowConfPin);  
    };
    // Datos para provincia, municipio y escuelas
    const [provinces, setProvinces] = useState<Provincia[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [escuelas, setEscuelas] = useState<Escuela[]>([]);
    // 
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
    const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {  
        setShowSchoolRegistration(event.currentTarget.checked);  
        setSchoolSelectDisabled(event.currentTarget.checked);  
    };

    const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
    // Función para cargar las provincias
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('/api/provincias');  // URL correcta para obtener provincias
                    const provincesData = response.data.map((provincia: { codigo: number; nombre: string }) => ({
                    value: String(provincia.codigo), // Convertir el código a string
                    label: provincia.nombre,
                }));
                setProvinces(provincesData);
            } catch (error) {
                console.error("Error al cargar las provincias", error);
            }
        };
        fetchProvinces();
    }, []);
    
    // Función para Cargar Municipios
    const fetchMunicipios = async (provinciaCodigo: string) => {
        try {
            const response = await axios.get(`/api/municipios/${provinciaCodigo}`);
            const municipiosData = response.data.map((municipio: { codigo: number; nombre: string }) => ({
                value: String(municipio.codigo),
                label: municipio.nombre,
            }));
            setMunicipios(municipiosData);
        } catch (error) {
            console.error("Error al cargar municipios:", error);
        }
    };

    // Función para Cargar Escuelas
    const fetchEscuelas = async (cdgoMunicipio: string) => {
        try {
            const response = await axios.get(`/api/escuelas/${cdgoMunicipio}`);
            
            // Filtrar opciones con `value` vacío y eliminar duplicados
            const filteredEscuelas = response.data
                .filter((escuela: Escuela) => escuela.value && escuela.value.trim() !== "")
                .map((escuela: Escuela) => ({
                    ...escuela,
                    value: String(escuela.value) // Asegúrate de que `value` sea string
                }));
    
            // Eliminar duplicados basados en `value`
            const uniqueEscuelas = filteredEscuelas.reduce((acc: Escuela[], current: Escuela) => {
                const isDuplicate = acc.some(item => item.value === current.value);
                if (!isDuplicate) {
                    acc.push(current);
                }
                return acc;
            }, []);
    
            setEscuelas(uniqueEscuelas);
        } catch (error) {
            console.error("Error al cargar las escuelas:", error);
        }
    };

    // Cambio de Provincia Seleccionada
    const handleProvinceChange = (provinciaCodigo: string | null) => {
        setSelectedProvinceCode(provinciaCodigo);
        setSelectedMunicipio(null); // Limpiar el municipio seleccionado al cambiar de provincia
        setEscuelas([]); // Limpiar el select de escuela
        setMunicipios([]); // Limpiar la lista de municipios  
        setSchoolSelectDisabled(false); // Deshabilitar el select de escuela
        if (provinciaCodigo) {
            fetchMunicipios(provinciaCodigo);
        } else {
            setMunicipios([]);  // Limpiar municipios si no hay provincia seleccionada
        }
    };

    // Cambio de Municipio Seleccionado
    const handleMunicipioChange = (municipioCodigo: string | null) => {
        setSelectedMunicipio(municipioCodigo);
        setEscuelas([]); // Limpiar el select de escuela

        if (municipioCodigo) {
            fetchEscuelas(municipioCodigo);
            setSchoolSelectDisabled(true); // Habilitar el select de escuela
        } else {
            setEscuelas([]);
            setSchoolSelectDisabled(false); // Deshabilitar si no hay municipio seleccionado
        }
    };

    // Validaciones 
    const form = useForm({  
        initialValues: {  nombre: '',  apellidos: '',  correo: '',  telefono: '',  nro_ci: '',  
        id_escuela: '',  contrasenia: '',
            confirmContrasenia: '',  pin: '', confirmPin: '' },  
        validate: {  
            // Datos personales
            nombre: (value) =>  
                value.length < 3 ? 'El nombre debe tener al menos 3 letras' :  
                /[^a-zA-Z\s]/.test(value) ? 'El nombre solo puede contener letras' : null,  
            apellidos: (value) =>  
                value.length < 3 ? 'Los apellidos deben tener al menos 3 letras' :  
                /[^a-zA-Z\s]/.test(value) ? 'Los apellidos solo pueden contener letras' : null,  
            correo: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo electrónico inválido'),  
            telefono: (value) => {  
                const digits = value.replace(/\D/g, ''); // Solo números  
                return digits.length !== 10 ? 'Número de teléfono inválido' : null;  
            },  
            nro_ci: (value) => {  
                const digits = value.replace(/\D/g, ''); // Solo números  
                return digits.length !== 11 ? 'Número de carnet inválido' : null;  
            },  
            // Datos de la escuela
            
            id_escuela: (value) => (!value ? 'Seleccione la escuela' : null),
            // Datos de la cuenta
            contrasenia: (value) => (value.length < 8 ? 'La contraseña debe tener al menos 3 caracteres' : null),  
            confirmContrasenia: (value, values) => {  
                if (value !== values.contrasenia) {  
                    return 'La contraseña no coincide';  
                }  
                return null;  
            },
            pin: (value) => (value.length < 3 ? 'El pin tiene que ser al menos 4 numeros' : null),
            confirmPin: (value, values) => {
                if(value !== values.pin) {
                    return 'Los pines no coenciden';
                }
                return null;
            } 
        },  
    });

    // 
    const handleSubmit = async () => {
        if (!form.isValid()) return;
        setLoading(true);
        setError(null);
        
        try {
            console.log('Datos a enviar:', {
                nombre: form.values.nombre,
                apellidos: form.values.apellidos,
                correo: form.values.correo,
                telefono: form.values.telefono,
                nro_ci: form.values.nro_ci,
                id_escuela: form.values.id_escuela,
                contrasenia: form.values.contrasenia,
                pin: form.values.pin,
            });
            
            const response = await axios.post("/api/registrar-profesor", {
                nombre: form.values.nombre,
                apellidos: form.values.apellidos,
                correo: form.values.correo,
                telefono: form.values.telefono,
                nro_ci: form.values.nro_ci,
                id_escuela: form.values.id_escuela,
                contrasenia: form.values.contrasenia,
                pin: form.values.pin,
            });
        
            form.reset();
            
            // Notificación de éxito CON BORDE
            notifications.show({
                title: 'Registro exitoso',
                message: 'Solicitud de profesor enviada con éxito',
                color: 'teal',
                icon: <IconCheck size={18} />,
                withBorder: true,  // 👈 Esto añade el borde
                styles: (theme) => ({
                root: {
                    borderWidth: 2,
                    borderColor: theme.colors.teal[6],
                },
                }),
                onClose: () => {
                    // Recargar la página cuando se cierre la notificación
                    window.location.reload();
                }
            });
            navigate('/'); // Redirigir al inicio 
        
            } catch (error) {
            console.error('Error completo:', error);
            let errorMessage = 'Error inesperado. Por favor, inténtalo de nuevo.';
        
            if (axios.isAxiosError(error)) {
                console.error('Error del servidor:', error.response?.data);
                if (error.response?.status === 400 || error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    errorMessage = Object.values(errors).flat().join(', ');
                } else {
                    errorMessage = error.response?.data?.message || 'Error al registrar profesor';
                }
            }
        
            // Notificación de error CON BORDE
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconX size={18} />,
                withBorder: true,  // 👈 Esto añade el borde
                styles: (theme) => ({
                root: {
                    borderWidth: 2,
                    borderColor: theme.colors.red[6],
                },
                }),
            });
        
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Container size='md' mt={50}>
            <Title ta={'center'} order={1} mb={5}>Solicitar registro como profesor</Title>
            <Card>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {/* Inicio del Card Datos Personales */}
                    <Card shadow="sm" withBorder>
                        <Title fw={700} order={4}>
                            Datos Personales
                        </Title>
                        <Text mb={10} c={'gray'} size='sm'>Verifique si los datos están correctos</Text>
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput 
                                    label='Nombre(s)' 
                                    mb={10} 
                                    placeholder="Digite su nombre(s)" 
                                    withAsterisk
                                    {...form.getInputProps('nombre')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput 
                                    label='Apellidos' mb={10} 
                                    placeholder="Digite sus apellidos" 
                                    withAsterisk
                                    {...form.getInputProps('apellidos')}
                                />
                            </Grid.Col>
                        </Grid>
                        <TextInput 
                            withAsterisk 
                            label='Correo electrónico' 
                            mb={10} placeholder="Correo electrónico" 
                            leftSection={<IconAt size={16} />} 
                            {...form.getInputProps('correo')}
                        />
                        <Grid>
                            <Grid.Col span={6}>    
                                <InputBase
                                    withAsterisk
                                    leftSection={<IconPhone size={16} />}
                                    label="Su Teléfono"
                                    component={IMaskInput}
                                    mask="+53 00000000"
                                    placeholder="Digite aqui su número de teléfono"
                                    // description="Escribe +53 primero y luego los demas numeros"
                                    {...form.getInputProps('telefono')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <InputBase
                                    withAsterisk
                                    leftSection={<IconNumber size={16} />}
                                    label="Su Carnet"
                                    component={IMaskInput}
                                    mask="00000000000"
                                    placeholder="Digite aqui su número de carnet"
                                    {...form.getInputProps('nro_ci')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Card>
                    {/* Inicio del card datos de la escuela */}
                    <Card shadow="sm" withBorder mt={10}>
                        <Title fw={700} order={4}>
                            Datos de la Escuela
                        </Title>
                        <Text c={'gray'} size='sm'>Seleccione las opciones correctas</Text>
                        <Grid mt={10}>
                            <Grid.Col span={6}>
                                {provinces.length > 0 ? (
                                    <Select
                                        label="Província"
                                        withAsterisk
                                        leftSection={<IconMapPin size={16} />}
                                        clearable
                                        placeholder="Seleccione la província"
                                        data={provinces}
                                        onChange={handleProvinceChange}
                                    />
                                ) : (
                                    <Text color="red">Error al cargar provincias</Text>
                                )}
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Município"
                                    withAsterisk
                                    leftSection={<IconMapPin size={16} />}
                                    clearable
                                    placeholder="Seleccione el munícipio"
                                    data={municipios}
                                    onChange={handleMunicipioChange}
                                    disabled={!selectedProvinceCode}  // Deshabilitar si no hay provincia seleccionada
                                />
                            </Grid.Col>
                        </Grid>
                        
                        <Grid mt={10}>
                            <Grid.Col span={12}>
                                <Select
                                    label="Escuela"
                                    withAsterisk 
                                    {...form.getInputProps('id_escuela')}
                                    leftSection={<IconSchool size={16} />}
                                    description="La escuela esta listado por ( nombre de la escuela / subsistema / poblado)"
                                    clearable
                                    placeholder="Seleccione la escuela"
                                    data={escuelas} // Opciones en formato [{ label, value }]
                                    disabled={!schoolSelectDisabled}  // Deshabilitado según municipio
                                />
                                
                            </Grid.Col>
                        </Grid>
                        {/* <Text mt={10} color='red'>
                            No encuentras su escuela ?
                        </Text> */}
                        {/* <Checkbox  
                            mt={10}  
                            label="Solicitar registro de mi escuela"  
                            onChange={handleCheckboxChange}   
                        />  */}
                        {/* Solicitar registro escuela */}
                        {/* {showSchoolRegistration && (  
                            <>  
                                <Grid>  
                                    <Grid.Col span={8}>  
                                        <TextInput 
                                            mt={10} 
                                            description="Nombre de tu escuela" 
                                            withAsterisk label='Escuela' mb={10} 
                                            placeholder="Escribe nombre su escuela aqui" 
                                            leftSection={<IconSchool size={16} />} 
                                            // key={form.key('lastname')}
                                            // {...form.getInputProps('lastname')}
                                            value={id_escuela}
                                            // onChange={setIdEscuela}
                                            error={errors.id_escuela} // Mostrar error
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4}>  
                                        <Input.Wrapper mt={10} withAsterisk label="Teléfono" description="Numero de telefono de tu escuela">
                                            <Input
                                                leftSection={<IconPhone size={16} />}  
                                                component={IMaskInput}  
                                                mask="+00 00000000"  
                                                placeholder="Digite el numero aqui"
                                                {...form.getInputProps('schoolPhone')}  
                                            />
                                        </Input.Wrapper>      
                                    </Grid.Col>  
                                </Grid>  
                            </>  
                            )} */}
                    </Card>
                    {/* Inicio del card datos de la cuenta */}
                    <Card shadow="sm" withBorder mt={10} mb={10}>
                        <Title fw={700} order={4}>
                            Datos de la Cuenta
                        </Title>
                        <Grid mt={10}>
                            <Grid.Col span={6}>
                                <PasswordInput
                                    label='Contraseña'
                                    leftSection={<IconLock size={16} />}
                                    placeholder="Digite aqui la contraseña"
                                    withAsterisk
                                    {...form.getInputProps('contrasenia')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <PasswordInput
                                    label='Confirme la contraseña'
                                    withAsterisk
                                    leftSection={<IconLockCheck  size={16} />}
                                    placeholder="Confirme aqui la contraseña"
                                    {...form.getInputProps('confirmContrasenia')}
                                />
                            </Grid.Col>
                        </Grid>
                        <Grid mt={10}>
                            <Grid.Col span={6}>
                                <Input.Wrapper withAsterisk label="Ingrese el PIN" description="El pin debe tener al menos 4 números">
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
                            <Grid.Col span={6}>
                                <Input.Wrapper withAsterisk label="Confirme el PIN" description="El pin debe coencidir con el anterior">
                                    <PinInput
                                        mask={!showConfPin} 
                                        type="number" 
                                        key={form.key('confirmPin')}
                                        {...form.getInputProps('confirmPin')}
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
                        </Grid>
                    </Card>
                    <Text>{error}</Text>
                    {/* Botón de enviar solicitud de registro */}
                    <Button
                        type="submit"
                        fullWidth
                        loading={loading} // Botón en estado de carga
                        rightSection={<IconSend size={16} />}
                        // onClick={openModal}
                    >
                        Enviar solicitud de registro
                    </Button>
                </form>
            </Card>
        </Container>
    );
}