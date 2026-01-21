import { Container, Card, Modal, Button, Group, Input, Grid, Select, Checkbox, 
    Text, Title,Table,TextInput} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowUp, IconDeviceFloppy, IconWritingSign } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';
import axios from 'axios';
import { useForm } from '@mantine/form';
import { useDataContext } from '../context/DataContext';
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export function P_InscribirAlumno() {
    // Usar datos del contexto en lugar de hacer fetch
    const { 
        estudiantes: data, 
        totalEstudiantes, 
        refreshEstudiantes 
    } = useDataContext();

    const [opened, { open, close }] = useDisclosure(false);   
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const [selection, setSelection] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [schoolName, setSchoolName] = useState<string | null>(localStorage.getItem('userSchoolName'));
    const provincia = localStorage.getItem('userProvincia');
    const municipio = localStorage.getItem('userMunicipio');
    const [editionNotice, setEditionNotice] = useState<string | null>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    
    // Derivar escuela si no existe en localStorage usando datos del contexto
    useEffect(() => {
        if (!schoolName && data.length > 0 && data[0].nombre_escuela) {
            setSchoolName(data[0].nombre_escuela);
            localStorage.setItem('userSchoolName', data[0].nombre_escuela);
        }
    }, [data, schoolName]);
    
    // Verificar si la edición está abierta antes de abrir el modal
    const handleOpenInscribir = async () => {
        try {
            setEditionNotice(null);
            const resp = await axios.get('/api/is-open');
            if (resp.data && resp.data.is_open) {
                open();
            } else {
                setEditionNotice('La edición está cerrada. No se puede inscribir estudiante(s).');
            }
        } catch (e) {
            setEditionNotice('No se pudo verificar el estado de la edición.');
        }
    };
    
    // Solicitud para inscribir un estudiante
    const handleSubmit = async () => {
        setLoading(true);
        setMessage("");
        setSubmitError(null);
        if(!form.isValid()) {
            setLoading(false);
            return;
        }
        
        const profesorIdFromStorage = localStorage.getItem('profesorId');
        const escuelaIdFromStorage = localStorage.getItem('userSchoolId');
        
        if(!profesorIdFromStorage){
            setLoading(false);
            console.error('❌ No se encontró profesorId en localStorage al intentar inscribir estudiante');
            setSubmitError('No se encontró el ID del profesor. Por favor, inicia sesión nuevamente.');
            return;
        }
        if(!escuelaIdFromStorage){
            setLoading(false);
            console.error('❌ No se encontró userSchoolId en localStorage al intentar inscribir estudiante');
            setSubmitError('No se encontró la escuela del profesor. Inicia sesión de nuevo o configura tu escuela.');
            return;
        }
        
        try {
            const profesorId = parseInt(profesorIdFromStorage);
            const escuelaId = parseInt(escuelaIdFromStorage);
            
            console.log('🔍 Enviando inscripción de estudiante:', {
                nro_ci: form.values.nro_ci.replace(/\D/g, ''),
                nombre: form.values.nombre,
                sexo: form.values.sexo,
                grado: parseInt(form.values.grado),
                id_escuela: escuelaId,
                id_profesor: profesorId,
            });
            
            const response = await axios.post('/api/estudiantes/inscribir', {
                nro_ci: form.values.nro_ci.replace(/\D/g, ''),
                nombre: form.values.nombre,
                sexo: form.values.sexo,
                grado: parseInt(form.values.grado),
                id_escuela: escuelaId,
                id_profesor: profesorId,
            });
            
            console.log("✅ Respuesta del servidor:", response.data);
            setMessage('Alumno inscrito con éxito!');
            form.reset();
            setSubmitError(null);
            
            // Refrescar datos del contexto después de agregar
            await refreshEstudiantes();
            
            // Cerrar el modal después de 1.5 segundos
            setTimeout(() => {
                close();
                setMessage('');
            }, 1500);
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setSubmitError(errorMessage);
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al inscribir estudiante';
                    setSubmitError(errorMessage);
                }
            } else {
                setSubmitError('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    }
    
    const form = useForm({
        initialValues: {nro_ci: '', nombre: '', sexo: '', grado: ''},
        validate:{
            nro_ci: (value) => {  
                const digits = value.replace(/\D/g, '');
                return digits.length !== 11 ? 'Número de carnet inválido' : null;  
            },
            nombre: (value) =>  
            value.length < 3 ? 'El nombre debe tener al menos 3 letras' :  
            /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value) ? 'El nombre solo puede contener letras' : null,
            sexo: (value) => (!value ? 'Seleccione el sexo' : null),
            grado: (value) => (!value ? 'Seleccione el grado' : null),
        }
    });
    
    const toggleRow = (id: number) => {  
        setSelection((current) => {  
            const newSelection = current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id];
            setSelectedCount(newSelection.length);
            return newSelection;
        });  
    };  
    
    const toggleAll = () => {  
        if (selection.length === data.length) {  
            setSelectedCount(0);  
            setSelection([]);  
        } else {  
            setSelectedCount(data.length);  
            setSelection(data.map((item) => item.id));  
        }  
    }; 
    
    const filteredData = data.filter((alumno) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
            alumno.nombre_estudiante.toLowerCase().includes(query) ||
            (alumno.nombre_escuela && alumno.nombre_escuela.toLowerCase().includes(query)) ||
            alumno.sexo.toLowerCase().includes(query) ||
            (alumno.grado && String(alumno.grado).toLowerCase().includes(query)) ||
            (alumno.categoria && alumno.categoria.toLowerCase().includes(query)) ||
            alumno.nro_ci.includes(query)
        );
    });

    const rows = filteredData.map((alumno) => (
        <Table.Tr
            key={alumno.id}
            bg={selection.includes(alumno.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Seleccionar fila"
                    checked={selection.includes(alumno.id)}
                    onChange={() => toggleRow(alumno.id)}
                />
            </Table.Td>
            <Table.Td>{alumno.nombre_estudiante}</Table.Td>
            <Table.Td>{alumno.nombre_escuela || '—'}</Table.Td>
            <Table.Td>{alumno.sexo}</Table.Td>
            <Table.Td>{alumno.grado !== null ? alumno.grado : '—'}</Table.Td>
            <Table.Td>{alumno.categoria || '—'}</Table.Td>
        </Table.Tr>
    ));

    return (
        <Container size="lg">
            <Card withBorder mt={20}>
                <Title order={1} mb={0}>Tabla de inscripción</Title>
                <Text fw={600} mt={2}>Escuela - {schoolName || '—'}</Text>
                <Text c="dimmed" mb={10}>
                    Provincia - {provincia || '—'} | Municipio - {municipio || '—'}
                </Text>
                <Text c="dimmed" size="sm" mb={10}>
                    Total de estudiantes: {totalEstudiantes}
                </Text>
                <Group justify='space-between' mb={10}>
                    <Text c="dimmed">Administre sus estudiantes según las necesidades</Text>
                    <TextInput
                        placeholder="Buscar estudiante..."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                    />
                    <Button 
                        mt={5} 
                        rightSection={<IconArrowUp size={15}/>}
                        disabled={selectedCount===0}
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'teal', deg: 90 }}
                    >
                        Subir grado
                    </Button>
                </Group>
                
                {/* Tabla de alumnos */}
                {data.length === 0 ? (
                    <Text c="dimmed" ta="center" py={40}>
                        No hay estudiantes inscritos. Haz clic en "Inscribir alumno" para agregar uno.
                    </Text>
                ) : (
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>
                                    <Checkbox
                                        onChange={toggleAll}
                                        checked={selection.length === data.length && data.length > 0}
                                        indeterminate={selection.length > 0 && selection.length < data.length}
                                        aria-label="Seleccionar todos"
                                    />
                                </Table.Th>
                                <Table.Th>Nombre</Table.Th>
                                <Table.Th>Escuela</Table.Th>
                                <Table.Th>Sexo</Table.Th>
                                <Table.Th>Grado</Table.Th>
                                <Table.Th>Categoría</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                )}
                
                {/* Modal para registrar alumno */}
                <Modal opened={opened} onClose={close} title="Registrar Alumno">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Input.Wrapper mb={10} label="Número de CI" withAsterisk>
                            <Input 
                                component={IMaskInput} 
                                mask="00000000000" 
                                placeholder="Digite el numero de CI" 
                                {...form.getInputProps('nro_ci')}
                            />
                        </Input.Wrapper>
                        <Input.Wrapper label="Nombre Completo" withAsterisk>
                            <Input 
                                placeholder="Digite el nombre del alumno" 
                                {...form.getInputProps('nombre')}
                            />
                        </Input.Wrapper>
                        <Grid mt={10}>
                            <Grid.Col span={6}>
                                <Select
                                    label="Sexo"
                                    withAsterisk
                                    placeholder="Seleccione el sexo"
                                    clearable
                                    data={['Masculino', 'Femenino']}
                                    {...form.getInputProps('sexo')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Grado"
                                    withAsterisk
                                    placeholder="Seleccione el grado"
                                    clearable
                                    data={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
                                    {...form.getInputProps('grado')}
                                />
                            </Grid.Col>
                        </Grid>
                        {message && (
                            <Text c={'green'} fw={500} mt={10}>{message}</Text>
                        )}
                        {submitError && (
                            <Text c={'red'} fw={500} mt={10}>{submitError}</Text>
                        )}
                        <Button 
                            rightSection={<IconDeviceFloppy size={18}/>}
                            mt={10} 
                            loading={loading}
                            type="submit"
                            variant="gradient"
                            disabled={loading}
                        >
                            Registrar
                        </Button>
                    </form>
                </Modal>

                <Grid>
                    <Grid.Col span={5}>
                        <Group>
                            <Button 
                                mt={20} 
                                variant="gradient" 
                                onClick={handleOpenInscribir}
                                gradient={{ from: 'blue', to: 'teal', deg: 90 }}
                                leftSection={<IconWritingSign size={16} />}
                            >
                                Inscribir alumno
                            </Button>
                        </Group>
                        {editionNotice && (
                            <Text c="red" mt={6}>{editionNotice}</Text>
                        )}
                    </Grid.Col>
                </Grid>
            </Card>
        </Container>
    );
}