
import { Container, Card, Modal, Button, Group, Input, Grid, Select, Checkbox, 
    Text, Title,Table,TextInput} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowUp, IconDeviceFloppy, IconWritingSign } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';
import axios from 'axios';
import { useForm } from '@mantine/form';
import { Form } from 'react-router-dom';
axios.defaults.baseURL = 'http://localhost:8000'; // Ajusta según tu configuración
axios.defaults.withCredentials = true;

interface Alumno {
    id: number;
    nombre_estudiante: string;
    sexo: string;
    nombre_escuela: string;
    grado: number;
    categoria: string;
}
export function P_InscribirAlumno() {
    const [data, setData] = useState<Alumno[]>([]);
    const [opened, { open, close }] = useDisclosure(false);   
    const [loading, setLoading] = useState(false);
    // Error visible en el modal de inscripción
    const [submitError, setSubmitError] = useState<string | null>(null);
    const id_teacher = localStorage.getItem('userId');
    const id_school = localStorage.getItem('userSchoolId');
    const [message, setMessage] = useState<String>('');
    const [selection, setSelection] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [schoolName, setSchoolName] = useState<string | null>(localStorage.getItem('userSchoolName'));
    const provincia = localStorage.getItem('userProvincia');
    const municipio = localStorage.getItem('userMunicipio');
    const [editionNotice, setEditionNotice] = useState<string | null>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    // 
    const fetchAlumnos = async () => {
        try {
        const response = await axios.get<Alumno[]>(`/api/listar-estudiantes/${id_teacher}`);
        setData(response.data);
        // Derivar escuela si no existe en localStorage
        if (!schoolName && response.data.length > 0) {
            setSchoolName(response.data[0].nombre_escuela || null);
        }
        } catch (error) {
        console.error("Error al cargar los alumnos", error);
        }
    };
    // 
    useEffect(() => {
        fetchAlumnos();
    },[]);
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
        if(!form.isValid) return ;
        if(!id_school){
            setLoading(false);
            setSubmitError('No se encontró la escuela del profesor. Inicia sesión de nuevo o configura tu escuela.');
            return;
        }
        
        try {
            const response = await axios.post('api/estudiantes/inscribir', {
                nro_ci: form.values.nro_ci,
                nombre: form.values.nombre,
                sexo: form.values.sexo,
                grado: form.values.grado,
                id_escuela: id_school,
                id_profesor: id_teacher,
            });
            console.log("Respuesta del servidor:", response.data);
            fetchAlumnos();
            setMessage('Alumno inscrito con suceso!');
            form.reset();
            
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
    // Método para Validación
    const form = useForm({
        initialValues: {nro_ci: '', nombre: '', sexo: '', grado: ''},
        // Validaciones
        validate:{
            nro_ci: (value) => {  
                const digits = value.replace(/\D/g, ''); // Solo números  
                return digits.length !== 11 ? 'Número de carnet inválido' : null;  
            },
            nombre: (value) =>  
            value.length < 3 ? 'El nombre debe tener al menos 3 letras' :  
            /[^a-zA-Z\s]/.test(value) ? 'El nombre solo puede contener letras' : null,
            sexo: (value) => (!value ? 'Seleccione el sexo' : null),
            grado: (value) => (!value ? 'Seleccione el grado' : null),
        }
    });
    // 
    const toggleRow = (id: number) => {  
        setSelection((current) => {  
            if (current.includes(id)) {  
                setSelectedCount(selectedCount - 1);  
                return current.filter((item) => item !== id);  
            } else {  
                setSelectedCount(selectedCount + 1);  
                return [...current, id];  
            }  
        });  
    };  
    // 
    const toggleAll = () => {  
        if (selection.length === data.length) {  
        setSelectedCount(0);  
        setSelection([]);  
        } else {  
        setSelectedCount(data.length);  
        setSelection(data.map((item) => item.id));  
        }  
    }; 
    // 
    const filteredData = data.filter((alumno) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
            alumno.nombre_estudiante.toLowerCase().includes(query) ||
            alumno.nombre_escuela.toLowerCase().includes(query) ||
            alumno.sexo.toLowerCase().includes(query) ||
            String(alumno.grado).toLowerCase().includes(query) ||
            alumno.categoria.toLowerCase().includes(query)
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
            checked={selection.includes(alumno.id)} // ✅ Este es el punto clave
            onChange={() => toggleRow(alumno.id)}   // ✅ Alterna solo ese alumno
            />
        </Table.Td>
        <Table.Td>{alumno.nombre_estudiante}</Table.Td>
        <Table.Td>{alumno.nombre_escuela}</Table.Td>
        <Table.Td>{alumno.sexo}</Table.Td>
        <Table.Td>{alumno.grado}</Table.Td>
        <Table.Td>{alumno.categoria}</Table.Td>
        {/* <Table.Td>{alumno.id}</Table.Td> */}
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
                <Group justify='space-between' mb={10}>
                    <Text c="dimmed" >Administre sus estudiantes según las necesidades</Text>
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
                        <Table.Th>Categoria</Table.Th>
                        {/* <Table.Th>Id</Table.Th> */}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
                {/* Registrar alumno */}
                <Modal opened={opened} onClose={close} title="Registrar Alumno">
                    <Form onSubmit={form.onSubmit(handleSubmit)}>
                        <Input.Wrapper mb={10} label="Número de ci" withAsterisk>
                            <Input 
                                component={IMaskInput} 
                                mask="00000000000" 
                                placeholder="Digite el numero de ci" 
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
                        <Text c={'green'} fw={500}>{message}</Text>
                        {submitError && (
                            <Text c={'red'} fw={500}>{submitError}</Text>
                        )}
                        {/* <Text size="sm" mb={2} c="red" > El alumno o la alumna no es de tu escuela?</Text>
                        <Text size="xs" mb={5} c="gray" >No seleccione si es de tu escuela!</Text> */}
                        {/* <Checkbox
                            label="Seleccionar su escuela"
                            mb={10}
                            onChange={handleCheckboxChange}
                        />
                        {showSchoolRegistration && (
                            <>
                                <Select
                                    mt={5}
                                    mb={10}
                                    withAsterisk
                                    label="Escuela"
                                    clearable
                                    placeholder="Seleccione la escuela"
                                    data={['React', 'Angular', 'Vue', 'Svelte']}
                                    // disabled={sSexoChecked} 
                                />
                                </>
                            )}
                            <Text c={'red'} fw={'normal'}>{error}</Text> */}
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
                    </Form>
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
                    
                    {/* <Grid.Col span={7}>
                        <FileInput leftSection={<IconCsv size={16} />}  mt={20} clearable placeholder="Upload files" />
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <BotonCargarCSV />
                    </Grid.Col> */}
                </Grid>
                
            </Card>
        </Container>
    );
}