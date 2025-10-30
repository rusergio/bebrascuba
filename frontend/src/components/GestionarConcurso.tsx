import { Container, Title, Button, Group, rem, Grid, Text, Card, Select, Badge} from '@mantine/core';
import { Fieldset } from '@mantine/core';
import { IconCalendarMonth, IconCaretDownFilled, IconCheck, IconX } from '@tabler/icons-react';
import classes from '../styles/FeaturesCards.module.css';
import { DateInput, DatePickerInput } from '@mantine/dates';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from '@mantine/form';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

dayjs.extend(customParseFormat);

export function GestionarConcurso() {
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState<String | null>('');
    const [loading, setLoading] = useState(false);
    const [cargar, setCargar] = useState(false);
    const [estadoActual, setEstadoActual] = useState<string>("Cerrado"); // Inicialmente cerrado
    const [numeroEdicion, setNumeroEdicion] = useState<number>(0);
    
    // Método para cambiar el estado de la edición
    const handleStatusChange = async (value: string | null) => {
        if (value === null) return;
    
        try {
            setLoading(true);
            setStatusMessage('');
            
            const response = value === 'Abierto'
                ? await axios.post('api/ediciones/abrir')
                : await axios.post('api/ediciones/cerrar');
            
            // Solo actualizar el estado si la respuesta es exitosa
            setEstadoActual(value);
            fetchNumeroEdicion();
            setStatusMessage(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Error al cambiar el estado';
                setStatusMessage(errorMessage);
                console.error('Error del servidor:', errorMessage);
            } else {
                setStatusMessage('Error de conexión');
                console.error('Error de red:', error);
            }
        } finally {
            setLoading(false);
        }
    };
    // Método para obtener el número de edición
    const fetchNumeroEdicion = async () => {
        try {
            const response = await axios.get('api/nro_edicion'); // Asegúrate de que la ruta coincida con tu backend
            setNumeroEdicion(response.data.n_edicion);
        } catch (error) {
            console.error("Error al obtener el número de edición:", error);
            setNumeroEdicion(0); // Valor por defecto si falla
        }
    };
    // Método para obtener el estado inicial de la edición
    const fetchEstadoInicial = async () => {
        const response = await axios.get('api/is-open');
        setEstadoActual(response.data.is_open ? 'Abierto' : 'Cerrado');
    };
    useEffect(() => {
        fetchEstadoInicial();
        fetchNumeroEdicion();
    }, []);
    // Método para marcar fechas importantes 
    const handleEditionDate =  async() => {
        setLoading(true); // Iniciar el estado de carga
        setError(null);
        if(!formE.isValid) return;
        try {
            // Realiza la solicitud PUT para actualizar las fechas
            const response = await axios.put("api/actualizar-fecha", {
                fecha_convocatoria: dayjs(formE.values.fecha_conv).add(1, 'day').format('YYYY-MM-DD'),
                fecha_inic_preinscrip: dayjs(formE.values.periodo_insc[0]).add(1, 'day').format('YYYY-MM-DD'),
                fecha_fin_preinscrip: dayjs(formE.values.periodo_insc[1]).add(1, 'day').format('YYYY-MM-DD'),
                fecha_inic_inscripVille: dayjs(formE.values.fecha_insc_ville).add(1, 'day').format('YYYY-MM-DD'),
            });
            setStatusMessage(response.data.message);
            
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
    }
    // Método para marcar fechas de convocatorias 
    const handleConvocatoria =  async() => {
        setCargar(true); // Iniciar el estado de carga
        setError(null);
        if(!formC.isValid) return;

        try {
            const response = await axios.put("api/actualizar-fecha-import", {
                fecha_resultados: dayjs(formC.values.fecha_result).add(1, 'day').format('YYYY-MM-DD'),
                fecha_inic_realiz: dayjs(formC.values.fecha_realz_concurs[0]).add(1, 'day').format('YYYY-MM-DD'),
                fecha_fin_realiz: dayjs(formC.values.fecha_realz_concurs[1]).add(1, 'day').format('YYYY-MM-DD'),
            });
            setStatusMessage(response.data.message); 
            setError("Fechas fueron publicadas");
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
            setCargar(false);
        }
    }
    // Validación para la fechas importantes 
    const formE = useForm({
        initialValues: { fecha_conv: '', fecha_insc_ville: '', periodo_insc: [] },
        validate: {
            fecha_conv: (value) => (!value ? 'Debes marcar la fecha de convocatoria' : null),
            fecha_insc_ville: (value) => (!value ? 'Debes marcar la fecha de inscripción' : null),
            periodo_insc: (value) => (value.length === 0 ? 'Debes marcar el periodo de inscripción' : null),
        }
    });
    // Validación para las fechas de las convocatorias 
    const formC  = useForm({
        initialValues: { fecha_result: '', fecha_realz_concurs: [] },
        validate: {
            fecha_result: (value) => (!value ? 'Debes marcar la fecha de resultados' : null),
            fecha_realz_concurs: (value) => (value.length === 0 ? 'Debes marchar la fecha del concurso' : null),
        }
    });
    const icon = <IconCaretDownFilled style={{ width: rem(16), height: rem(16) }} />;
    return (
        <Container size='lg' mt={40}>
            <Title order={2} className={classes.title} ta="center" mb='sm'>
                Gestionar la edición
            </Title>
            <Fieldset mt={20} legend="Administrar Edición">
                <Grid>
                    <Grid.Col span={6}>
                        <Card
                            shadow="sm"
                            padding="xl"
                            component="a"
                            target="_blank"
                            withBorder
                        >
                            <Title order={3}> {numeroEdicion-1}ª Edición de BebrasCuba </Title>
                            <Text c={'gray'} mb={5} fw={300} size='sm'>Planifique la edición</Text>
                            
                            <Grid>
                                <Grid.Col span={8}>
                                <Group align="center" mb="sm" gap="xs">
                                    <Text fw={500}>Estado de la edición:</Text>
                                    <Badge
                                        color={estadoActual === "Abierto" ? "blue" : "red"}
                                        leftSection={estadoActual === "Abierto" ? <IconCheck size={14}  /> : <IconX size={14} />}
                                    >
                                        {estadoActual}
                                    </Badge>
                                </Group>
                                <Select
                                    data={[
                                        { value: 'Abierto', label: 'Abrir edición' },
                                        { value: 'Cerrado', label: 'Cerrar edición' }
                                    ]}
                                    value={estadoActual} // Muestra el estado actual
                                    rightSectionPointerEvents="none"
                                    rightSection={icon}
                                    label="Cambie el estado de la edición"
                                    description="Seleccione la opción para Abrir o Cerrar edición"
                                    placeholder="Seleccione"
                                    onChange={handleStatusChange}
                                    error={statusMessage}
                                    disabled={loading}
                                />
                                </Grid.Col>
                            </Grid>
                            <form onSubmit={formE.onSubmit(handleEditionDate)}>
                                <Grid mt={5}>
                                    <Grid.Col span={6} >
                                        <DateInput  
                                            valueFormat="YYYY-MM-DD"
                                            minDate={new Date()}  
                                            maxDate={dayjs(new Date()).add(12, 'month').toDate()}  
                                            label="Fecha de Convovatoria"  
                                            description="Fecha de inicio de convocatoria"
                                            placeholder="Marque la fecha"  
                                            clearable  
                                            withAsterisk  
                                            {...formE.getInputProps('fecha_conv')}
                                        />  
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <DateInput  
                                            valueFormat="YYYY-MM-DD"
                                            minDate={new Date()}  
                                            maxDate={dayjs(new Date()).add(12, 'month').toDate()}  
                                            label="Fecha de inscripción en Ville"
                                            description="Fecha de inicio en ville "  
                                            placeholder="Marque la fecha"  
                                            clearable  
                                            withAsterisk  
                                            {...formE.getInputProps('fecha_insc_ville')}
                                        />  
                                    </Grid.Col>
                                </Grid>
                                <Grid>
                                    <Grid.Col span={12}>
                                        <DatePickerInput
                                            type="range"
                                            valueFormat="YYYY-MM-DD" 
                                            minDate={new Date()}  
                                            maxDate={dayjs(new Date()).add(12, 'month').toDate()} 
                                            label="Periodo de Inscripción"
                                            placeholder="Fecha de inscripción"
                                            description="Marque fecha para periodo de inscripción"
                                            clearable
                                            withAsterisk
                                            {...formE.getInputProps('periodo_insc')}
                                            mt={5}
                                        />
                                    </Grid.Col>
                                </Grid>
                                
                                <Group mt={10}>
                                    <Button type='submit' loading={loading}  rightSection={<IconCalendarMonth size={16} />} variant="filled">
                                        Publicar
                                    </Button>
                                </Group>

                            </form>
                        </Card>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                        <Card
                            shadow="sm"
                            padding="xl"
                            component="a"
                            target="_blank"
                            withBorder
                        >
                            <Title order={3}>Convocatoria</Title>
                            <Text fw={500} size="lg" mt="xs">
                                Marque la fecha de las convocatorias
                            </Text>
                            <Text size="xs" c={'gray'}>
                                Fechas importantes
                            </Text>
                            {/* Fecha para realización del concurso */}
                            <form onSubmit={formC.onSubmit(handleConvocatoria)}>
                                <Grid>
                                    <Grid.Col span={8}>
                                        <DateInput
                                            label="Fecha de resultado"
                                            valueFormat="YYYY-MM-DD" 
                                            minDate={new Date()}  
                                            maxDate={dayjs(new Date()).add(12, 'month').toDate()}  
                                            placeholder="Marque la fecha"
                                            description="Marque fecha de publicación de resultado"
                                            mt={20}
                                            clearable
                                            {...formC.getInputProps('fecha_result')}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <DatePickerInput
                                    type="range"
                                    valueFormat="YYYY-MM-DD" 
                                    minDate={new Date()}  
                                    maxDate={dayjs(new Date()).add(12, 'month').toDate()}  
                                    label="Fecha para realización del concurso"
                                    description="Marque fecha de periodo de realización del concurso"
                                    placeholder="Marque la fecha"
                                    mt={10}
                                    clearable
                                    {...formC.getInputProps('fecha_realz_concurs')}
                                />
                                <Text>{error}</Text>
                                <Group mt={10}>
                                    <Button type='submit' mb={27} loading={cargar} rightSection={<IconCalendarMonth size={16} />} variant="filled">
                                        Publicar
                                    </Button>
                                </Group>
                                
                            </form>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Fieldset>
        </Container>
    );
}