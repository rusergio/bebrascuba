import { 
    Container, 
    Title, 
    Card, 
    Select, 
    Button, 
    Grid, 
    TextInput, 
    Text, 
    Stack,
    Alert,
    Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle, IconUserShare } from '@tabler/icons-react';
import { TablaGlobalUsuarios } from './TablaGlobalUsuarios';

axios.defaults.baseURL = 'http://localhost:8000';

interface Usuario {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    nro_ci: string;
    telefono: string;
    roles?: Array<{ id: number; rol: string; descripcion: string }>;
}

interface Rol {
    id: number;
    rol: string;
    descripcion: string;
    estado: boolean;
}

interface Provincia {
    codigo: number;
    nombre: string;
}

interface Municipio {
    codigo: number;
    nombre: string;
    cdgo_provincia: number;
}

interface Escuela {
    codigo: number;
    nombre: string;
    cdgo_municipio: number;
}

export function AsignarRol() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [provincias, setProvincias] = useState<Provincia[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [escuelas, setEscuelas] = useState<Escuela[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const form = useForm({
        initialValues: {
            usuarioId: '',
            rol: '',
            provincia: '',
            municipio: '',
            escuela: '',
            institucion: '',
        },
        validate: {
            usuarioId: (value) => (!value ? 'Debe seleccionar un usuario' : null),
            rol: (value) => (!value ? 'Debe seleccionar un rol' : null),
            provincia: (value, values) => {
                if (values.rol === 'Profesor' && !value) {
                    return 'Debe seleccionar una provincia';
                }
                return null;
            },
            municipio: (value, values) => {
                if (values.rol === 'Profesor' && !value) {
                    return 'Debe seleccionar un municipio';
                }
                return null;
            },
            escuela: (value, values) => {
                if (values.rol === 'Profesor' && !value) {
                    return 'Debe seleccionar una escuela';
                }
                return null;
            },
            institucion: (value, values) => {
                if (values.rol === 'Colaborador Bebras' || values.rol === 'Colaborador Universitario Bebras') {
                    if (!value || value.trim().length === 0) {
                        return 'Debe especificar la institución';
                    }
                }
                return null;
            },
        },
    });

    // Cargar usuarios y roles al iniciar
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoadingData(true);
                // Cargar todos los usuarios combinando diferentes endpoints
                const [usuariosMultiplesRes, usuariosNoProfesoresRes, usuariosProfesoresRes, rolesRes, provinciasRes] = await Promise.all([
                    axios.get('/api/usuarios/multiples-roles').catch(() => ({ data: { success: false, usuarios: [] } })),
                    axios.get('/api/usuarios/no-profesores').catch(() => ({ data: { success: false, usuarios: [] } })),
                    axios.get('/api/usuarios/profesores').catch(() => ({ data: { success: false, profesores: [] } })),
                    axios.get('/api/listar-roles'),
                    axios.get('/api/provincias'),
                ]);

                // Combinar todos los usuarios
                const todosUsuarios: Usuario[] = [];
                
                if (usuariosMultiplesRes.data.success && usuariosMultiplesRes.data.usuarios) {
                    todosUsuarios.push(...usuariosMultiplesRes.data.usuarios);
                }
                
                if (usuariosNoProfesoresRes.data.success && usuariosNoProfesoresRes.data.usuarios) {
                    // Agregar solo los que no estén ya en la lista
                    usuariosNoProfesoresRes.data.usuarios.forEach((u: Usuario) => {
                        if (!todosUsuarios.find(existing => existing.id === u.id)) {
                            todosUsuarios.push(u);
                        }
                    });
                }
                
                if (usuariosProfesoresRes.data.success && usuariosProfesoresRes.data.profesores) {
                    // Agregar solo los que no estén ya en la lista
                    usuariosProfesoresRes.data.profesores.forEach((u: Usuario) => {
                        if (!todosUsuarios.find(existing => existing.id === u.id)) {
                            todosUsuarios.push(u);
                        }
                    });
                }

                setUsuarios(todosUsuarios);
                
                if (rolesRes.data.success) {
                    setRoles(rolesRes.data.roles || []);
                }
                setProvincias(provinciasRes.data || []);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Error al cargar los datos iniciales',
                    color: 'red',
                    icon: <IconAlertCircle size={18} />,
                });
            } finally {
                setLoadingData(false);
            }
        };
        cargarDatos();
    }, []);

    // Cargar municipios cuando se selecciona una provincia
    useEffect(() => {
        if (form.values.provincia) {
            const cargarMunicipios = async () => {
                try {
                    const response = await axios.get(`/api/municipios/${form.values.provincia}`);
                    setMunicipios(response.data || []);
                    form.setFieldValue('municipio', '');
                    form.setFieldValue('escuela', '');
                } catch (error) {
                    console.error('Error al cargar municipios:', error);
                }
            };
            cargarMunicipios();
        } else {
            setMunicipios([]);
            form.setFieldValue('municipio', '');
            form.setFieldValue('escuela', '');
        }
    }, [form.values.provincia]);

    // Cargar escuelas cuando se selecciona un municipio
    useEffect(() => {
        if (form.values.municipio) {
            const cargarEscuelas = async () => {
                try {
                    const response = await axios.get(`/api/escuelas/${form.values.municipio}`);
                    setEscuelas(response.data || []);
                    form.setFieldValue('escuela', '');
                } catch (error) {
                    console.error('Error al cargar escuelas:', error);
                }
            };
            cargarEscuelas();
        } else {
            setEscuelas([]);
            form.setFieldValue('escuela', '');
        }
    }, [form.values.municipio]);

    // Resetear campos cuando cambia el rol
    useEffect(() => {
        if (form.values.rol !== 'Profesor') {
            form.setFieldValue('provincia', '');
            form.setFieldValue('municipio', '');
            form.setFieldValue('escuela', '');
        }
        if (form.values.rol !== 'Colaborador Bebras' && form.values.rol !== 'Colaborador Universitario Bebras') {
            form.setFieldValue('institucion', '');
        }
    }, [form.values.rol]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            // Asignar el rol al usuario
            const response = await axios.post(`/api/usuarios/${values.usuarioId}/roles`, {
                rol: values.rol,
            });

            if (response.data.success) {
                notifications.show({
                    title: '✅ Éxito',
                    message: response.data.message,
                    color: 'teal',
                    icon: <IconCheck size={18} />,
                });

                // Si es Profesor, aquí podrías hacer una llamada adicional para asociar provincia/municipio/escuela
                // Por ahora solo asignamos el rol
                if (values.rol === 'Profesor' && values.provincia && values.municipio && values.escuela) {
                    // TODO: Implementar asociación de profesor con escuela si es necesario
                    console.log('Profesor asignado a:', {
                        provincia: values.provincia,
                        municipio: values.municipio,
                        escuela: values.escuela,
                    });
                }

                form.reset();
                setMunicipios([]);
                setEscuelas([]);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al asignar el rol';
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
        } finally {
            setLoading(false);
        }
    };

    const usuarioSeleccionado = usuarios.find(u => u.id.toString() === form.values.usuarioId);
    const rolSeleccionado = roles.find(r => r.rol === form.values.rol);
    const esProfesor = form.values.rol === 'Profesor';
    const esColaborador = form.values.rol === 'Colaborador Bebras' || form.values.rol === 'Colaborador Universitario Bebras';

    return (
        <Container size="lg" mt={40} mb={40}>
            
            <Card shadow="sm" padding="xl" radius="md" withBorder>
                
                <TablaGlobalUsuarios />
                
            </Card>
        </Container>

        
    );
}
