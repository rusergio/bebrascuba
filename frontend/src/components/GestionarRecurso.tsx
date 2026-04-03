import { Container, Title, Button, Group, rem, Grid, Text, Card, FileInputProps, Pill, FileInput, Table, Checkbox, ActionIcon, TextInput, Anchor, Modal} from '@mantine/core';
import { IconUpload, IconPencil, IconTrash, IconCheck, IconX, IconAlertCircle, IconFileTypePdf } from '@tabler/icons-react';
import { useState } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDataContext } from '../context/DataContext';

// Tipo para el formulario (con archivo para subir)
interface RecursoFormData {  
    id: number;
    nombre: string;  
    descripcion: string;  
    archivo: File | null;  
}

// Tipo del contexto (sin archivo, solo path)
type RecursoFromContext = {
    id: number;
    nombre: string;
    descripcion: string;
    archivo_path: string;
}
export function GestionarRecurso() {
    // Usar datos del contexto en lugar de hacer fetch
    const { recursos, refreshRecursos } = useDataContext();
    
    const [selection, setSelection] = useState<number[]>([]); 
    const [selectedCount, setSelectedCount] = useState(0);
    const [cargar, setCargar] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Estados para el modal de edición
    const [editModalOpen, setEditModalOpen] = useState(false);
    
    // Formulario para edición
    const editForm = useForm<RecursoFormData>({  
        initialValues: {  
            id: 0,
            nombre: '',  
            descripcion: '',  
            archivo: null,  
        },  
        validate: {  
            nombre: (value) => (value.length < 2 ? 'El nombre debe tener al menos 2 letras' : null),  
            descripcion: (value) => (value.length < 10 ? 'La descripción debe tener al menos 10 caracteres' : null),  
        },  
    });
    
    // Formulario para subir un recurso
    const form = useForm<RecursoFormData>({  
        initialValues: {  
            id: 0,
            nombre: '',  
            descripcion: '',  
            archivo: null,  
        },  
        validate: {  
            nombre: (value) => (value.length < 2 ? 'El nombre debe tener al menos 2 letras' : null),  
            descripcion: (value) => (value.length < 10 ? 'La descripción debe tener al menos 10 caracteres' : null),  
            archivo: (value) => (value === null ? 'Debes seleccionar un archivo' : null),  
        },  
    });

    // Función para extraer el nombre del archivo de la ruta completa
    const getFileNameFromPath = (filePath: string): string => {
        if (!filePath) return '';
        // Si la ruta contiene 'recursos/', extraer solo el nombre del archivo
        if (filePath.includes('recursos/')) {
            return filePath.split('recursos/')[1];
        }
        return filePath;
    };  

    // Función para subir un recurso
    const handleSubmit = async (values: RecursoFormData) => { 
        setCargar(true);
        // Validación del archivo PDF
        if (!values.archivo || !values.archivo.type.endsWith('pdf')) {
            notifications.show({
                title: 'Formato incorrecto',
                message: 'Debes seleccionar un archivo PDF',
                color: 'red',
                icon: <IconX size={20} />,
            });
            setCargar(false);
            return;
            }
        try {  
            const formData = new FormData();
            formData.append('nombre', values.nombre);
            formData.append('descripcion', values.descripcion);
            formData.append('archivo', values.archivo);
        
            const response = await axios.post('api/recursos', formData, {
                headers: {
                'Content-Type': 'multipart/form-data', 
                },
            });
            
            // Notificación de éxito
            notifications.show({
                title: '¡Éxito!',
                message: 'Archivo subido correctamente',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            
            console.log('Recurso creado:', response.data);
            await refreshRecursos();
            form.reset();
        
        } catch (error) {  
            let errorMessage = 'Error al subir el archivo';
            
            if (axios.isAxiosError(error)) {
                console.error('Error del servidor:', error.response?.data);
                errorMessage = error.response?.data?.message || errorMessage;
            } else {
                console.error('Error inesperado:', error);
            }
            
            // Notificación de error
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
        
        } finally {
            setCargar(false);
        }
    }; 
    
    // Función para mostrar el nombre del archivo en el FileInput
    const ValueComponent: FileInputProps['valueComponent'] = ({ value }) => {
        if (value === null) {
            return null;
        }
        if (Array.isArray(value)) {
            return (
                <Pill.Group>
                {value.map((file, index) => (
                    <Pill key={index}>{file.name}</Pill>
                ))}
                </Pill.Group>
            );
        }
        return <Pill>{value.name}</Pill>;
    };

    // Función para seleccionar un recurso individual
    const toggleRow = (id: number) => {  
        setSelection((current) => {  
            if (current.includes(id)) {  
                setSelectedCount(selectedCount - 1);  
                return current.filter((recurso) => recurso !== id);  
            } else {  
                setSelectedCount(selectedCount + 1);  
                return [...current, id];  
            }  
        });  
    };  

    // Función para seleccionar todos los recursos
    const toggleAll = () => {  
        if (selection.length === recursos.length) {  
            setSelectedCount(0);  
            setSelection([]);  
        } else {  
            setSelectedCount(recursos.length);  
            setSelection(recursos.map((recurso) => recurso.id));  
        }  
    };

    // Función para mostrar los recursos en la tabla
    const rows = recursos.map((recurso) => (
        <Table.Tr
            key={recurso.id}
            bg={selection.includes(recurso.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox checked={selection.includes(recurso.id)} onChange={() => toggleRow(recurso.id)} />  
            </Table.Td>
            <Table.Td>{recurso.nombre}</Table.Td>
            <Table.Td>{recurso.descripcion}</Table.Td>
            <Table.Td>
                <Anchor 
                    href={`http://localhost:8000/api/ver-recurso/${getFileNameFromPath(recurso.archivo_path || '')}`} 
                    target="_blank"
                    size="sm"
                >
                    Ver archivo
                </Anchor> 
            </Table.Td>
            <Table.Td>
                <Group gap={0} justify="flex-end">
                <ActionIcon 
                    variant="subtle" 
                    color="gray"
                    onClick={() => openEditModal(recurso)}
                >
                    <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                </ActionIcon>
                <ActionIcon 
                    variant="subtle" 
                    color="red"
                    onClick={() => eliminarRecursoIndividual(recurso)}
                >
                    <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    // 
    const eliminarRecursos = async () => {
        setLoading(true);
        try {
          // Iterar sobre cada id del recurso seleccionado
          for (const recursoId of selection) {
            await axios.delete(`/api/eliminar-recurso/${recursoId}`);
          }
          
          // Mostrar notificación de éxito
          notifications.show({
            title: 'Éxito',
            message: selection.length > 1 
              ? `${selection.length} archivos eliminados con éxito` 
              : 'Archivo eliminado con éxito',
            color: 'green',
            icon: <IconCheck size={18} />,
          });
      
          // Limpiar selección y contador
          setSelectedCount(0);
          setSelection([]);
          // Volver a cargar los recursos
          await refreshRecursos();
      
        } catch (error) {
          // Notificación de error
          notifications.show({
            title: 'Error',
            message: 'No se pudieron eliminar los archivos',
            color: 'red',
            icon: <IconX size={18} />,
          });
      
          console.error('Error al eliminar:', error);
          if (axios.isAxiosError(error)) {
            console.error('Detalles:', error.response?.data);
          }
        } finally {
          setLoading(false);
        }
    };

    // Función para abrir el modal de edición
    const openEditModal = (recurso: RecursoFromContext) => {
        // Asegurarse de que nombre y descripcion tengan valores válidos
        const nombreValido = recurso.nombre && recurso.nombre.trim().length > 0 
            ? recurso.nombre.trim() 
            : 'Sin nombre';
        const descripcionValida = recurso.descripcion && recurso.descripcion.trim().length > 0 
            ? recurso.descripcion.trim() 
            : '';
        
        editForm.setValues({
            id: recurso.id,
            nombre: nombreValido,
            descripcion: descripcionValida,
            archivo: null
        });
        setEditModalOpen(true);
    };

    // Función para cerrar el modal de edición
    const closeEditModal = () => {
        setEditModalOpen(false);
        editForm.reset();
    };

    // Función para manejar la edición de recursos
    const handleEditSubmit = async (values: RecursoFormData) => {
        // Validar que el nombre no esté vacío
        if (!values.nombre || values.nombre.trim().length === 0) {
            notifications.show({
                title: 'Error de validación',
                message: 'El nombre es requerido',
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
            return;
        }

        // Validar el formulario antes de enviar
        if (!editForm.isValid()) {
            notifications.show({
                title: 'Error de validación',
                message: 'Por favor, complete todos los campos requeridos correctamente',
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
            return;
        }

        try {
            const formData = new FormData();
            
            // Asegurarse de que el nombre tenga un valor válido (no puede estar vacío)
            const nombreValido = values.nombre && values.nombre.trim().length > 0 
                ? values.nombre.trim() 
                : 'Sin nombre';
            
            formData.append('nombre', nombreValido);
            
            // La descripción puede ser opcional según el backend
            const descripcionValida = values.descripcion ? values.descripcion.trim() : '';
            formData.append('descripcion', descripcionValida);
            
            // Solo agregar archivo si se seleccionó uno nuevo
            if (values.archivo) {
                formData.append('archivo', values.archivo);
            }

            // Debug: verificar que el FormData tenga los valores correctos
            console.log('Enviando FormData:', {
                nombre: nombreValido,
                descripcion: descripcionValida,
                tieneArchivo: !!values.archivo,
                id: values.id
            });

            const response = await axios.put(`/api/recursos/${values.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                },
            });
            
            // Notificación de éxito
            notifications.show({
                title: '¡Éxito!',
                message: 'Recurso actualizado correctamente',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            
            console.log('Recurso actualizado:', response.data);
            await refreshRecursos();
            closeEditModal();
        
        } catch (error) {  
            let errorMessage = 'Error al actualizar el recurso';
            
            if (axios.isAxiosError(error)) {
                console.error('Error del servidor:', error.response?.data);
                
                // Manejar errores de validación específicos
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    if (errors && errors.nombre) {
                        errorMessage = Array.isArray(errors.nombre) ? errors.nombre[0] : errors.nombre;
                    } else {
                        errorMessage = error.response.data.message || 'Error de validación';
                    }
                } else {
                    errorMessage = error.response?.data?.message || errorMessage;
                }
            } else {
                console.error('Error inesperado:', error);
            }
            
            // Notificación de error
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
        }
    };

    // Función para eliminar un recurso individual
    const eliminarRecursoIndividual = (recurso: RecursoFromContext) => {
        modals.openConfirmModal({
            title: 'Confirmar eliminación',
            children: (
                <Text size="sm">
                    ¿Estás seguro de que quieres eliminar el recurso "{recurso.nombre}"? 
                    Esta acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/eliminar-recurso/${recurso.id}`);
                    
                    // Mostrar notificación de éxito
                    notifications.show({
                        title: 'Éxito',
                        message: 'Archivo eliminado con éxito',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                
                    // Volver a cargar los recursos
                    await refreshRecursos();
                
                } catch (error) {
                    // Notificación de error
                    notifications.show({
                        title: 'Error',
                        message: 'No se pudo eliminar el archivo',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                
                    console.error('Error al eliminar:', error);
                    if (axios.isAxiosError(error)) {
                        console.error('Detalles:', error.response?.data);
                    }
                }
            },
        });
    };

    return (
        <Container size='lg' mt={40}>
            <Title order={1} ta="center" mb='sm'>
                Administrar Recurso
            </Title>
            
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Grid>
                        <Grid.Col span={12}>
                            <Card
                                shadow="sm"
                                padding="xl"
                                component="a"
                                target="_blank"
                                withBorder
                            >
                                <Title order={3}>Formulario de Subida de Recurso</Title>
                                <Text fw={400} size="lg" c="gray" mb={10} >
                                    Sube archivo de apoyo al concurso
                                </Text>
                                <Grid mb={10}>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <TextInput
                                            {...form.getInputProps('nombre')}  
                                            withAsterisk  
                                            label="Titulo del documento"  
                                            placeholder="Digite el titulo del documento"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <TextInput
                                            {...form.getInputProps('descripcion')}  
                                            withAsterisk  
                                            label="Descripción"  
                                            placeholder="Digite el subtitulo del documento" 
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid mb={20}>
                                    <Grid.Col span={{ base: 12, md: 7 }}>
                                        <FileInput
                                            {...form.getInputProps('archivo')}  
                                            withAsterisk  
                                            label="Cargue el fichero"  
                                            placeholder="Cargue el fichero aqui"  
                                            valueComponent={ValueComponent}  
                                            clearable  
                                            leftSection={<IconFileTypePdf size={16} />} 
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                                        <Group ml={{ base: 0, md: 10 }} mt={{ base: 10, md: 25 }}>
                                            <Button 
                                                variant="light"  
                                                rightSection={<IconUpload size={15} />}  
                                                type="submit" 
                                                loading={cargar}
                                            >
                                                Subir archivo
                                            </Button>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                        <Group mt={{ base: 10, md: 25 }}>
                                        <Button 
                                        leftSection={<IconTrash size={17} />} 
                                            onClick={eliminarRecursos}
                                            color="red"
                                            loading={loading}
                                            disabled={selection.length === 0}
                                            >
                                            {selection.length > 1 ? `Eliminar ${selection.length} archivos` : 'Eliminar archivo'}
                                        </Button>
                                        </Group>
                                    </Grid.Col>
                                </Grid>
                                {/* Tabla de archivos */}
                                <Title order={3}>Listado de Recursos</Title>
                                <Text fw={400} size="" c="gray" >
                                    Listado de recursos subidos al sistema
                                </Text> 
                                
                                <Table.ScrollContainer minWidth={500} type="native">
                                    <Table mt={20} highlightOnHover >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th style={{ width: rem(40) }}>
                                                    <Checkbox
                                                        onChange={toggleAll}
                                                        checked={selection.length === recursos.length}
                                                        indeterminate={selection.length > 0 && selection.length !== recursos.length}
                                                    />
                                                </Table.Th>
                                                <Table.Th>Titulo</Table.Th>
                                                <Table.Th>Descripción</Table.Th>
                                                <Table.Th>Archivo</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>{rows}</Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                            </Card>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                        </Grid.Col>
                    </Grid>
                </form>

            {/* Modal para editar recurso */}
            <Modal
                opened={editModalOpen}
                onClose={closeEditModal}
                title="Editar Recurso"
                size="lg"
                fullScreen
            >
                <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
                    <Grid>
                        <Grid.Col span={12}>
                            <TextInput
                                {...editForm.getInputProps('nombre')}  
                                withAsterisk  
                                label="Título del documento"  
                                placeholder="Digite el título del documento"
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                {...editForm.getInputProps('descripcion')}  
                                withAsterisk  
                                label="Descripción"  
                                placeholder="Digite la descripción del documento" 
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <FileInput
                                {...editForm.getInputProps('archivo')}  
                                label="Nuevo archivo (opcional)"  
                                placeholder="Seleccione un nuevo archivo si desea cambiarlo"  
                                valueComponent={ValueComponent}  
                                clearable  
                                leftSection={<IconFileTypePdf size={16} />}
                                description="Si no selecciona un archivo, se mantendrá el actual"
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group justify="flex-end" mt="md">
                                <Button variant="outline" onClick={closeEditModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" leftSection={<IconPencil size={16} />}>
                                    Actualizar
                                </Button>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </form>
            </Modal>
        </Container>
    );
}
