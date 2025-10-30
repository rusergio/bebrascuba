import { Card, Container, Title, Grid, Select, Button, Text, rem, InputBase, TextInput, Fieldset } from '@mantine/core';
import { IconBuildingSkyscraper, IconPhone, IconSchool, IconBooks, IconNumber, IconBuildingEstate, IconMapPin } from '@tabler/icons-react';
import { IMaskInput } from 'react-imask';
import { TableSort } from './TableSort';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

interface Provincia {
    value: string;
    label: string;
}

interface Municipio {
    value: string;
    label: string;
}

export function GestionarEscuela() {
    const [subsistema, setSubsistema] = useState<{value: string, label: string}[]>([]); // Estado para los roles
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
    const [provinces, setProvinces] = useState<Provincia[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);

    const fetchSubsistemas = async () => {
        try {
            const response = await axios.get('api/listar-subsistemas');
            const subsistemasData = response.data.map((subsistema: { id: number; nombre: string }) => ({
                value: String(subsistema.id),
                label: subsistema.nombre,
            }));
            setSubsistema(subsistemasData);
        } catch (error) {
            console.error('Error al cargar los subsistemas', error);
        }
    }
    useEffect(() => {
        fetchSubsistemas();
    }, []);

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

    const handleProvinceChange = (provinciaCodigo: string | null) => {
        setSelectedProvinceCode(provinciaCodigo);
        setSelectedMunicipio(null); // Limpiar el municipio seleccionado al cambiar de provincia
        setMunicipios([]); // Limpiar la lista de municipios  
        if (provinciaCodigo) {
            fetchMunicipios(provinciaCodigo);
        } else {
            setMunicipios([]);  // Limpiar municipios si no hay provincia seleccionada
        }
    };
    // Cambio de Municipio Seleccionado
    const handleMunicipioChange = (municipioCodigo: string | null) => {
        setSelectedMunicipio(municipioCodigo);
        
    };

    const form = useForm({
        initialValues: {
            codigo_escuela: '',
            telefono: '',
            nombre_escuela: '',
            poblado: '',
            subsistema: '',
        },
        validate: {
            codigo_escuela: (value) => {
                const digits = value.replace(/\D/g, 'El codigo es numero no contiene letra ni signos. '); // Solo números
                return digits.length !== 6 ? 'El codigo contiene 6 digitos' : null;
            },
            telefono: (value) => {
                const digits = value.replace(/\D/g, ''); // Solo números
                return digits.length !== 10 ? 'Número de teléfono inválido' : null;
            },
            nombre_escuela: (value) =>
                value.length < 3 ? 'El nombre debe tener al menos 2 letras' :
                /[^a-zA-Z\s]/.test(value) ? 'El nombre solo puede contener letras' : null,
            poblado: (value) =>
                value.length < 3 ? 'El nombre debe tener al menos 2 letras' :
                /[^a-zA-Z\s]/.test(value) ? 'El nombre solo puede contener letras' : null,
            subsistema: (value) => (value.length < 3 ? 'El subsistema debe tener al menos 3 caracteres' : null),
        },
    });
    const handleSubmit = async() => {
        setLoading(true);
        setError(null);
        if(!form.isValid) return;
        try {
            const response = await axios.post('api/registrar-escuela', {
                codigo_escuela: form.values.codigo_escuela,
                telefono: form.values.telefono,
                nombre_escuela: form.values.nombre_escuela,
                poblado: form.values.poblado,
                subsistema: form.values.subsistema,
            });
            console.log('Escuela registrada: ', response.data);
            setError('Escuela registrada con suceso!');
            setLoading(false);

        } catch (error) {
            console.error('Error al registrar la escuela', error);
        }
    }
    return (
        // Contenedor principal 
        <Container size='lg' mt={80}>
            <Title order={1}  ta="center" mb={2}>
                Gestionar escuela a nivel municipal
            </Title>
            <Title order={3} ta="center" mb={20}>Municipio: Santa Clara</Title>
            {/* Contenedor de registrar escuela */}
            <Container size={'md'} mb={20}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {/* Card de registrar escuela */}
                    <Card withBorder>
                        <Text fw={700} size="xl">Registrar escuela</Text>
                        <Text c="dimmed">Registre la escuela de su municipio</Text>
                        {/* Inicio del grid de codigo de escuela y telefono */}
                        <Fieldset legend=" 🏫 Información general de la escuela" mt={5}>
                            <Grid mt={10}>
                                <Grid.Col span={6}>
                                    <InputBase
                                        label="Código"
                                        leftSection={<IconNumber size={16} />}
                                        component={IMaskInput}
                                        mask="000000"
                                        placeholder="Digite aqui el codigo de la escuela"
                                        // description="Escribe +53 primero y luego los demas numeros"
                                        // inputWrapperOrder={['label', 'error', 'input', 'description']}
                                        key={form.key('codigo_escuela')}
                                        {...form.getInputProps('codigo_escuela')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Select
                                        label="Subsistema"
                                        withAsterisk 
                                        {...form.getInputProps('subsistema')}
                                        leftSection={<IconBooks size={16} />}
                                        clearable
                                        placeholder="Seleccione el subsistema"
                                        data={subsistema} // Opciones en formato [{ label, value }]
                                    />
                                    
                                </Grid.Col>
                            </Grid>
                            <Grid mt={5}>
                                <Grid.Col span={12}>
                                    <TextInput 
                                        label='Escuela' 
                                        mb={5} 
                                        placeholder="Digite aqui el nombre de escuela" 
                                        withAsterisk
                                        key={form.key('nombre_escuela')}
                                        {...form.getInputProps('nombre_escuela')}
                                        leftSection={<IconSchool size={16} />}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Fieldset>

                        <Fieldset legend="📍 Ubicación" mt={5}>
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
                            <Grid mt={5}>
                                <Grid.Col span={12}>
                                    <TextInput 
                                        withAsterisk
                                        label='Poblado' 
                                        mb={5} 
                                        placeholder="Digite aqui el nombre del poblado" 
                                        key={form.key('poblado')}
                                        {...form.getInputProps('poblado')}
                                        leftSection={<IconBuildingEstate size={16} />}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Fieldset>
                        
                        <Fieldset legend=" ☎️ Contacto" mt={5}>
                            <Grid >
                                <Grid.Col span={6}>
                                        <InputBase
                                            withAsterisk
                                            label="Teléfono de la escuela"
                                            description='Este campo es obligatorio (ej. 730387474)'
                                            leftSection={<IconPhone size={16} />}
                                            component={IMaskInput}
                                            mask="+53 00000000"
                                            placeholder="Digite el teléfono de la escuela"
                                            // description="Escribe +53 primero y luego los demas numeros"
                                            // inputWrapperOrder={['label', 'error', 'input', 'description']}
                                            key={form.key('telefono')}
                                            {...form.getInputProps('telefono')}
                                        />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                        <InputBase
                                            withAsterisk
                                            label="Contacto del responsable"
                                            leftSection={<IconPhone size={16} />}
                                            description='Este campo es en el caso de que la escuela no tiene telefono'
                                            component={IMaskInput}
                                            mask="+53 00000000"
                                            placeholder="Digite aqui su número de teléfono"
                                            // description="Escribe +53 primero y luego los demas numeros"
                                            // inputWrapperOrder={['label', 'error', 'input', 'description']}
                                            key={form.key('telefono')}
                                            {...form.getInputProps('telefono')}
                                        />
                                </Grid.Col>
                                {/* Boton registrar escuela */}
                            </Grid>
                        </Fieldset>
                        
                        
                        <Button type='submit' loading={loading} mt={10} fullWidth variant="filled" rightSection={<IconBuildingSkyscraper size={16} />}>Registrar escuela</Button>
                    </Card>
                </form>
            </Container>
        </Container>
    );
}

