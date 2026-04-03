import { Container, Title, Button, Group, rem, Grid, Text, Card, Select, Badge} from '@mantine/core';
import { Fieldset } from '@mantine/core';
import { IconCalendarMonth, IconCaretDownFilled, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import classes from '../styles/FeaturesCards.module.css';
import { DateInput, DatePickerInput } from '@mantine/dates';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import { useState } from 'react';
import axios from 'axios';
import { useForm } from '@mantine/form';
import { useDataContext } from '../context/DataContext';
import { notifications } from '@mantine/notifications';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

dayjs.extend(customParseFormat);

export function GestionarConcurso() {
    // Usar datos del contexto en lugar de hacer fetch
    const { numeroEdicion, estadoEdicion, refreshNumeroEdicion, refreshEstadoEdicion } = useDataContext();
    
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState<String | null>('');
    const [loading, setLoading] = useState(false);
    const [cargar, setCargar] = useState(false);
    
    // Método para cambiar el estado de la edición
    const handleStatusChange = async (value: string | null) => {
        if (value === null) return;
    
        try {
            setLoading(true);
            setStatusMessage('');
            
            const response = value === 'Abierto'
                ? await axios.post('api/ediciones/abrir')
                : await axios.post('api/ediciones/cerrar');
            
            // Actualizar el contexto después de cambiar el estado
            await Promise.all([
                refreshNumeroEdicion(),
                refreshEstadoEdicion()
            ]);
            
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
    // Método para marcar fechas importantes 
    const handleEditionDate =  async() => {
        setLoading(true); // Iniciar el estado de carga
        setError(null);
        setStatusMessage('');
        if(!formE.isValid()) return;
        try {
            // Realiza la solicitud PUT para actualizar las fechas
            const response = await axios.put("api/actualizar-fecha", {
                fecha_convocatoria: dayjs(formE.values.fecha_conv).format('YYYY-MM-DD'),
                fecha_inic_preinscrip: dayjs(formE.values.periodo_insc[0]).format('YYYY-MM-DD'),
                fecha_fin_preinscrip: dayjs(formE.values.periodo_insc[1]).format('YYYY-MM-DD'),
                fecha_inic_inscripVille: dayjs(formE.values.fecha_insc_ville).format('YYYY-MM-DD'),
            });
            
            // Mostrar notificación de éxito
            notifications.show({
                title: '✅ Éxito',
                message: response.data.message || 'Fechas actualizadas correctamente',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            
            // Limpiar el formulario después de éxito
            formE.reset();
            setStatusMessage('');
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setError(errorMessage);
                    notifications.show({
                        title: 'Error de validación',
                        message: errorMessage,
                        color: 'red',
                        icon: <IconAlertCircle size={18} />,
                    });
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al actualizar las fechas';
                    setError(errorMessage);
                    notifications.show({
                        title: 'Error',
                        message: errorMessage,
                        color: 'red',
                        icon: <IconAlertCircle size={18} />,
                    });
                }
            } else {
                const errorMsg = 'Error inesperado. Por favor, inténtalo de nuevo.';
                setError(errorMsg);
                notifications.show({
                    title: 'Error',
                    message: errorMsg,
                    color: 'red',
                    icon: <IconAlertCircle size={18} />,
                });
            }
        } finally {
            setLoading(false);
        }
    }
    // Método para marcar fechas de convocatorias 
    const handleConvocatoria =  async() => {
        setCargar(true); // Iniciar el estado de carga
        setError(null);
        setStatusMessage('');
        if(!formC.isValid()) return;

        try {
            const response = await axios.put("api/actualizar-fecha-import", {
                fecha_resultados: dayjs(formC.values.fecha_result).format('YYYY-MM-DD'),
                fecha_inic_realiz: dayjs(formC.values.fecha_realz_concurs[0]).format('YYYY-MM-DD'),
                fecha_fin_realiz: dayjs(formC.values.fecha_realz_concurs[1]).format('YYYY-MM-DD'),
            });
            
            // Mostrar notificación de éxito
            notifications.show({
                title: '✅ Éxito',
                message: response.data.message || 'Fechas de convocatoria publicadas correctamente',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            
            // Limpiar el formulario después de éxito
            formC.reset();
            setError(null);
            setStatusMessage('');
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setError(errorMessage);
                    notifications.show({
                        title: 'Error de validación',
                        message: errorMessage,
                        color: 'red',
                        icon: <IconAlertCircle size={18} />,
                    });
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al publicar las fechas';
                    setError(errorMessage);
                    notifications.show({
                        title: 'Error',
                        message: errorMessage,
                        color: 'red',
                        icon: <IconAlertCircle size={18} />,
                    });
                }
            } else {
                const errorMsg = 'Error inesperado. Por favor, inténtalo de nuevo.';
                setError(errorMsg);
                notifications.show({
                    title: 'Error',
                    message: errorMsg,
                    color: 'red',
                    icon: <IconAlertCircle size={18} />,
                });
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
                            <Title order={3}> {numeroEdicion > 0 ? numeroEdicion - 1 : ''}ª Edición de BebrasCuba </Title>
                            <Text c={'gray'} mb={5} fw={300} size='sm'>Planifique la edición</Text>
                            
                            <Grid>
                                <Grid.Col span={8}>
                                <Group align="center" mb="sm" gap="xs">
                                    <Text fw={500}>Estado de la edición:</Text>
                                    <Badge
                                        color={estadoEdicion === "Abierto" ? "blue" : "red"}
                                        leftSection={estadoEdicion === "Abierto" ? <IconCheck size={14}  /> : <IconX size={14} />}
                                    >
                                        {estadoEdicion}
                                    </Badge>
                                </Group>
                                <Select
                                    data={[
                                        { value: 'Abierto', label: 'Abrir edición' },
                                        { value: 'Cerrado', label: 'Cerrar edición' }
                                    ]}
                                    value={estadoEdicion} // Muestra el estado actual del contexto
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
