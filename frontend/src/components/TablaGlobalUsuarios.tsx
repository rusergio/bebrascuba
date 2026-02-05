import { useEffect, useState } from 'react';
import {
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  Pagination,
  Container,
  Fieldset,
  Checkbox,
  Grid,
  Card,
  Title,
  Select,
  Button,
  ActionIcon,
  Menu,
  Divider,
  Badge,
  Avatar,
  Anchor,
  Tooltip,
  Input,
} from '@mantine/core';
import { IMaskInput } from 'react-imask';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch, IconMapPin, IconSchool, IconUserShare, IconCheck, IconAlertCircle, IconDots, IconPhone, IconUser, IconShield } from '@tabler/icons-react';
import classes from '../styles/TableSort.module.css';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

axios.defaults.baseURL = 'http://localhost:8000';

interface RowData {
  id: number;
  name: string;
  email: string;
  telefono: string;
  roles: string[];
  codigo_escuela: string | null;
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data: RowData[], search: string) {
  if (!search.trim()) {
    return data;
  }
  
  const query = search.toLowerCase().trim();
  return data.filter((item) => {
    // Buscar en todos los campos del objeto
    const rolesStr = item.roles.join(' ').toLowerCase();
    const telefonoStr = item.telefono ? item.telefono.toString().toLowerCase() : '';
    return (
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      telefonoStr.includes(query) ||
      rolesStr.includes(query)
    );
  });
}

function sortData(  
  data: RowData[],  
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string; page: number; rowsPerPage: number }  
) {  
  const { sortBy, page, rowsPerPage } = payload;  

  const filteredData = filterData(data, payload.search);  

  if (!sortBy) {  
    return filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);  
  }  

  const sortedData = [...filteredData].sort((a, b) => {  
    if (payload.reversed) {
      // Manejar arrays (roles) y valores null
      if (Array.isArray(a[sortBy]) && Array.isArray(b[sortBy])) {
        return b[sortBy].join(', ').localeCompare(a[sortBy].join(', '));
      }
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return String(bVal).localeCompare(String(aVal));
    }

    // Manejar arrays (roles) y valores null
    if (Array.isArray(a[sortBy]) && Array.isArray(b[sortBy])) {
      return a[sortBy].join(', ').localeCompare(b[sortBy].join(', '));
    }
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    return String(aVal).localeCompare(String(bVal));
  });  

  return sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);  
}

// Los datos se cargarán desde la API

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
  value: string;
  label: string;
}

interface Rol {
  id: number;
  rol: string;
  descripcion: string;
  estado: boolean;
}

export function TablaGlobalUsuarios() {
  const [search, setSearch] = useState('');  
  const [data, setData] = useState<RowData[]>([]);
  const [sortedData, setSortedData] = useState<RowData[]>([]);  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);  
  const [reverseSortDirection, setReverseSortDirection] = useState(false);  
  const [selection, setSelection] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);  
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Estados para roles, provincias, municipios y escuelas
  const [roles, setRoles] = useState<Rol[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<string | null>(null);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null);
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState<string | null>(null);
  const [loadingAsignacion, setLoadingAsignacion] = useState(false);
  const [mostrarRegistroEscuela, setMostrarRegistroEscuela] = useState(false);
  const [nombreNuevaEscuela, setNombreNuevaEscuela] = useState<string>('');
  const [telefonoNuevaEscuela, setTelefonoNuevaEscuela] = useState<string>('');

  // Cargar usuarios desde la API
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setLoading(true);
        const usuariosRes = await axios.get('/api/usuarios/todos');
        
        if (usuariosRes.data.success && usuariosRes.data.usuarios) {
          const usuariosTransformados: RowData[] = usuariosRes.data.usuarios.map((usuario: any) => ({
            id: usuario.id,
            name: `${usuario.nombre} ${usuario.apellidos}`,
            email: usuario.correo,
            telefono: usuario.telefono || '-',
            roles: usuario.roles || [],
            codigo_escuela: usuario.codigo_escuela ? usuario.codigo_escuela.toString() : null,
          }));
          
          setData(usuariosTransformados);
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        notifications.show({
          title: 'Error',
          message: 'No se pudieron cargar los usuarios',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, []);

  // Cargar roles y provincias al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rolesRes, provinciasRes] = await Promise.all([
          axios.get('/api/listar-roles'),
          axios.get('/api/provincias'),
        ]);

        console.log('Respuesta de roles:', rolesRes.data); // Para debugging
        
        if (rolesRes.data.success) {
          // El endpoint devuelve los roles en 'data', no en 'roles'
          setRoles(rolesRes.data.data || []);
        } else {
          console.error('Error al cargar roles:', rolesRes.data.message);
        }
        setProvincias(provinciasRes.data || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  // Cargar municipios cuando se selecciona una provincia
  useEffect(() => {
    if (provinciaSeleccionada) {
      const cargarMunicipios = async () => {
        try {
          const response = await axios.get(`/api/municipios/${provinciaSeleccionada}`);
          setMunicipios(response.data || []);
          setMunicipioSeleccionado(null); // Limpiar municipio al cambiar provincia
          setEscuelas([]); // Limpiar escuelas al cambiar provincia
          setEscuelaSeleccionada(null); // Limpiar escuela seleccionada
        } catch (error) {
          console.error('Error al cargar municipios:', error);
        }
      };
      cargarMunicipios();
    } else {
      setMunicipios([]);
      setMunicipioSeleccionado(null);
      setEscuelas([]);
      setEscuelaSeleccionada(null);
    }
  }, [provinciaSeleccionada]);

  // Función para cargar escuelas
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

  // Cargar escuelas cuando se selecciona un municipio
  useEffect(() => {
    if (municipioSeleccionado) {
      fetchEscuelas(municipioSeleccionado);
    } else {
      setEscuelas([]);
      setEscuelaSeleccionada(null);
    }
  }, [municipioSeleccionado]);

  // Limpiar municipio y escuelas cuando cambia el rol
  useEffect(() => {
    if (rolSeleccionado !== 'Profesor') {
          setProvinciaSeleccionada(null);
          setMunicipioSeleccionado(null);
          setEscuelaSeleccionada(null);
          setMunicipios([]);
          setEscuelas([]);
          setMostrarRegistroEscuela(false);
          setNombreNuevaEscuela('');
          setTelefonoNuevaEscuela('');
        }
  }, [rolSeleccionado]);

  // Limpiar el registro de nueva escuela cuando se selecciona una escuela de la lista
  useEffect(() => {
    if (escuelaSeleccionada) {
      setMostrarRegistroEscuela(false);
      setNombreNuevaEscuela('');
      setTelefonoNuevaEscuela('');
    }
  }, [escuelaSeleccionada]);

  // Función para asignar rol a un usuario
  const handleAsignarRol = async () => {
    if (selection.length === 0 || !rolSeleccionado) {
      notifications.show({
        title: 'Error',
        message: 'Por favor, seleccione un usuario y un rol',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

      // Obtener todos los usuarios seleccionados
      const usuariosSeleccionados = sortedData.filter(row => selection.includes(row.name));
      if (usuariosSeleccionados.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'No se encontraron los usuarios seleccionados',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
        return;
      }

    // Validar campos requeridos para Profesor
    if (rolSeleccionado === 'Profesor') {
      if (!provinciaSeleccionada || !municipioSeleccionado) {
        notifications.show({
          title: 'Error',
          message: 'Para asignar el rol de Profesor, debe seleccionar provincia y municipio',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
        return;
      }
      
      // Validar que tenga escuela seleccionada O nombre de nueva escuela
      if (!mostrarRegistroEscuela && !escuelaSeleccionada) {
        notifications.show({
          title: 'Error',
          message: 'Debe seleccionar una escuela de la lista o registrar una nueva escuela',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
        return;
      }
      
      if (mostrarRegistroEscuela && !nombreNuevaEscuela.trim()) {
        notifications.show({
          title: 'Error',
          message: 'Debe ingresar el nombre de la nueva escuela',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
        return;
      }
    }

    setLoadingAsignacion(true);
    try {
      // Obtener los IDs directamente de los usuarios seleccionados (ya los tenemos en RowData)
      const userIds: number[] = usuariosSeleccionados
        .map((usuario: RowData) => usuario.id)
        .filter((id): id is number => id !== undefined && id !== null);

      if (userIds.length === 0) {
        throw new Error('No se pudo encontrar el ID de ningún usuario seleccionado');
      }

      // Si se está registrando una nueva escuela, registrarla primero
      let escuelaIdFinal = escuelaSeleccionada;
      if (rolSeleccionado === 'Profesor' && mostrarRegistroEscuela && nombreNuevaEscuela.trim() && municipioSeleccionado) {
        try {
          // Registrar la nueva escuela
          const escuelaResponse = await axios.post('/api/registrar-escuela', {
            nombre_escuela: nombreNuevaEscuela.trim(),
            cdgo_municipio: municipioSeleccionado,
            // Campos opcionales con valores por defecto
                          codigo_escuela: '', // Se puede generar en el backend
                          telefono: telefonoNuevaEscuela.trim() || '',
                          poblado: '',
            subsistema: null, // Se puede asignar un valor por defecto
          });
          
          if (escuelaResponse.data && escuelaResponse.data.id) {
            escuelaIdFinal = escuelaResponse.data.id.toString();
            notifications.show({
              title: '✅ Escuela registrada',
              message: 'La nueva escuela ha sido registrada correctamente',
              color: 'teal',
              icon: <IconCheck size={18} />,
            });
          }
        } catch (error: any) {
          console.error('Error al registrar la escuela:', error);
          notifications.show({
            title: 'Advertencia',
            message: 'No se pudo registrar la nueva escuela, pero se continuará con la asignación del rol',
            color: 'yellow',
            icon: <IconAlertCircle size={18} />,
          });
        }
      }

      // Asignar el rol a todos los usuarios seleccionados
      const promesas = userIds.map(userId =>
        axios.post(`/api/usuarios/${userId}/roles`, {
          rol: rolSeleccionado,
        })
      );

      const resultados = await Promise.allSettled(promesas);
      
      // Verificar respuestas exitosas
      const exitosos = resultados.filter(r => {
        if (r.status === 'fulfilled') {
          return r.value.data && r.value.data.success === true;
        }
        return false;
      }).length;
      
      const fallidos = resultados.filter(r => {
        if (r.status === 'rejected') {
          return true;
        }
        if (r.status === 'fulfilled') {
          return !r.value.data || r.value.data.success !== true;
        }
        return false;
      });

      // Obtener mensajes de error específicos
      const errores: string[] = [];
      fallidos.forEach((resultado, index) => {
        if (resultado.status === 'rejected') {
          const errorMsg = resultado.reason?.response?.data?.message || resultado.reason?.message || 'Error desconocido';
          errores.push(`Usuario ${index + 1}: ${errorMsg}`);
        } else if (resultado.status === 'fulfilled') {
          const errorMsg = resultado.value.data?.message || 'Error desconocido';
          errores.push(`Usuario ${index + 1}: ${errorMsg}`);
        }
      });

      if (exitosos > 0) {
        notifications.show({
          title: '✅ Éxito',
          message: `Rol asignado correctamente a ${exitosos} usuario(s)${fallidos.length > 0 ? `. ${fallidos.length} fallaron.` : ''}`,
          color: 'teal',
          icon: <IconCheck size={18} />,
        });

        // Mostrar errores si los hay
        if (errores.length > 0) {
          console.error('Errores al asignar roles:', errores);
          notifications.show({
            title: 'Advertencia',
            message: `Algunos usuarios fallaron: ${errores.join('; ')}`,
            color: 'yellow',
            icon: <IconAlertCircle size={18} />,
          });
        }

        // Limpiar selección y formulario solo si todos fueron exitosos
        if (fallidos.length === 0) {
          setSelection([]);
          setRolSeleccionado(null);
          setProvinciaSeleccionada(null);
          setMunicipioSeleccionado(null);
          setEscuelaSeleccionada(null);
          setMunicipios([]);
          setEscuelas([]);
          setMostrarRegistroEscuela(false);
          setNombreNuevaEscuela('');
          setTelefonoNuevaEscuela('');
          
          // Recargar usuarios para mostrar los cambios
          const usuariosRes = await axios.get('/api/usuarios/todos');
          if (usuariosRes.data.success && usuariosRes.data.usuarios) {
            const usuariosTransformados: RowData[] = usuariosRes.data.usuarios.map((usuario: any) => ({
              id: usuario.id,
              name: `${usuario.nombre} ${usuario.apellidos}`,
              email: usuario.correo,
              telefono: usuario.telefono || '-',
              roles: usuario.roles || [],
              codigo_escuela: usuario.codigo_escuela ? usuario.codigo_escuela.toString() : null,
            }));
            setData(usuariosTransformados);
          }
        }
      } else {
        const mensajeError = errores.length > 0 ? errores.join('; ') : 'No se pudo asignar el rol a ningún usuario';
        throw new Error(mensajeError);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al asignar el rol';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoadingAsignacion(false);
    }
  };

  useEffect(() => {  
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search, page, rowsPerPage }));  
  }, [data, sortBy, reverseSortDirection, search, page, rowsPerPage]);

  const handlePageChange = (page: number) => {  
    setPage(page);  
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search, page, rowsPerPage }));  
  }; 
  // 
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {  
    const { value } = event.currentTarget;  
    setSearch(value);
    setPage(1); // Resetear a la primera página cuando se busca
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value, page: 1, rowsPerPage }));  
  };  
  
  const setSorting = (field: keyof RowData) => {  
    const reversed = field === sortBy ? !reverseSortDirection : false;  
    setReverseSortDirection(reversed);  
    setSortBy(field);  
    setSortedData(sortData(data, { sortBy: field, reversed, search, page, rowsPerPage }));  
  };

  // Función para seleccionar/deseleccionar un usuario individual
  const toggleRow = (name: string) => {
    setSelection((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  };

  // Función para seleccionar/deseleccionar todos los usuarios de la página actual
  const toggleAll = () => {
    setSelection((current) =>
      current.length === sortedData.length
        ? []
        : sortedData.map((row) => row.name)
    );
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const rows = sortedData.map((row) => (
    <Table.Tr 
      key={row.id}
      bg={selection.includes(row.name) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          checked={selection.includes(row.name)}
          onChange={() => toggleRow(row.name)}
        />
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} radius={30} color="blue">
            {getInitials(row.name)}
          </Avatar>
          <Text fz="sm" fw={500}>{row.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
          <Anchor component="button" size="sm">{row.email}</Anchor>
      </Table.Td>
      <Table.Td>
        <Center>
          <Menu withArrow width={280} position="bottom-end" transitionProps={{ transition: 'pop' }} withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>
                <Group>
                  <Avatar radius="xl" color="blue" size={40}>
                    {getInitials(row.name)}
                  </Avatar>
                  <div>
                    <Text fw={500}>{row.name}</Text>
                    <Text size="xs" c="dimmed">{row.email}</Text>
                  </div>
                </Group>
              </Menu.Item>
              <Divider />
              <Menu.Label>Contacto</Menu.Label>
              <Menu.Item leftSection={<IconPhone size={16} stroke={1.5} />}>
                <div>
                  <Text size="xs" c="dimmed">Teléfono</Text>
                  <Text size="sm">{row.telefono}</Text>
                </div>
              </Menu.Item>
              <Divider />
              <Menu.Label>Roles</Menu.Label>
              {row.roles.length > 0 ? (
                row.roles.map((rol, index) => (
                  <Menu.Item key={index} leftSection={<IconShield size={16} stroke={1.5} />}>
                    <Badge variant="light" color="blue" size="sm">
                      {rol}
                    </Badge>
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item>
                  <Text size="sm" c="dimmed">Sin roles asignados</Text>
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Center>
      </Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return (
      <Container size='xl' mt={30}>
        <Text ta="center" size="lg">Cargando usuarios...</Text>
      </Container>
    );
  }

  return (
    <Container size='xl' mt={30} >
      <Fieldset legend="">
        <ScrollArea>
          <TextInput
            placeholder="Buscar usuario"
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          <Table verticalSpacing="xs" miw={700} layout="fixed" mb={10}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: rem(40) }}>
                  <Checkbox
                    onChange={toggleAll}
                    checked={selection.length === sortedData.length && sortedData.length > 0}
                    indeterminate={selection.length > 0 && selection.length < sortedData.length}
                  />
                </Table.Th>
                <Th
                  sorted={sortBy === 'name'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('name')}
                >
                  Nombre
                </Th>
                <Th
                  sorted={sortBy === 'email'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('email')}
                >
                  Email
                </Th>
                <Table.Th>
                  <Center><Text fw={500} fz="sm">Datos del usuario</Text></Center>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text fw={500} ta="center" c="dimmed">
                      No se encontraron usuarios
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          <Pagination.Root onChange={handlePageChange} total={Math.ceil(filterData(data, search).length / rowsPerPage)}>  
            <Group gap={5} justify="center">  
              <Pagination.First />  
              <Pagination.Previous />  
              <Pagination.Items />  
              <Pagination.Next />  
              <Pagination.Last />  
            </Group>  
          </Pagination.Root>  
        </ScrollArea>
        
      </Fieldset>
      <Card shadow="sm" withBorder mt={10} padding="xl">
        <Title order={4} fw={700} mb={10}>
          Asignar Rol a Usuario
        </Title>
        
        {/* Select para seleccionar el rol */}
        <Select
          label="Rol a Asignar"
          placeholder="Seleccione un rol"
          data={roles
            .filter(r => r.estado)
            .map(r => ({
              value: r.rol,
              label: r.rol,
              description: r.descripcion,
            }))}
          searchable
          clearable
          value={rolSeleccionado}
          onChange={(value) => {
            console.log('Rol seleccionado:', value);
            setRolSeleccionado(value);
          }}
          mb={rolSeleccionado === 'Profesor' ? 'md' : 0}
        />

        {/* Mostrar selects de Provincia, Municipio y Escuela solo si el rol es Profesor */}
        {rolSeleccionado === 'Profesor' && (
          <>
            <Grid mt="md">
              <Grid.Col span={6}>
                <Select
                  label="Provincia"
                  withAsterisk
                  leftSection={<IconMapPin size={16} />}
                  clearable
                  placeholder="Seleccione la provincia"
                  data={provincias.map(p => ({
                    value: p.codigo.toString(),
                    label: p.nombre,
                  }))}
                  searchable
                  value={provinciaSeleccionada}
                  onChange={setProvinciaSeleccionada}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Municipio"
                  withAsterisk
                  leftSection={<IconMapPin size={16} />}
                  clearable
                  placeholder="Seleccione el municipio"
                  data={municipios.map(m => ({
                    value: m.codigo.toString(),
                    label: m.nombre,
                  }))}
                  searchable
                  value={municipioSeleccionado}
                  onChange={setMunicipioSeleccionado}
                  disabled={!provinciaSeleccionada}
                />
              </Grid.Col>
            </Grid>
            <Grid mt="md">
              <Grid.Col span={12}>
                <Select
                  label="Escuela"
                  withAsterisk={!mostrarRegistroEscuela}
                  leftSection={<IconSchool size={16} />}
                  clearable
                  placeholder="Seleccione la escuela"
                  description="La escuela está listada por (nombre de la escuela / subsistema / poblado)"
                  data={escuelas}
                  searchable
                  value={escuelaSeleccionada}
                  onChange={setEscuelaSeleccionada}
                  disabled={!municipioSeleccionado || mostrarRegistroEscuela}
                />
              </Grid.Col>
            </Grid>
            
            {/* Checkbox y TextInput para registrar nueva escuela */}
            <Grid mt="md">
              <Grid.Col span={12}>
                <Checkbox
                  label="Mi escuela no aparece en la lista"
                  checked={mostrarRegistroEscuela}
                  onChange={(event) => {
                    setMostrarRegistroEscuela(event.currentTarget.checked);
                    if (event.currentTarget.checked) {
                      setEscuelaSeleccionada(null); // Limpiar selección de escuela
                    }
                  }}
                  disabled={!municipioSeleccionado}
                />
              </Grid.Col>
            </Grid>
            
            {mostrarRegistroEscuela && (
              <>
                <Grid mt="md">
                  <Grid.Col span={12}>
                    <TextInput
                      label="Nombre de la escuela no registrada"
                      withAsterisk
                      leftSection={<IconSchool size={16} />}
                      placeholder="Ingrese el nombre de la escuela"
                      value={nombreNuevaEscuela}
                      onChange={(event) => setNombreNuevaEscuela(event.currentTarget.value)}
                      required
                    />
                  </Grid.Col>
                </Grid>
                <Grid mt="md">
                  <Grid.Col span={12}>
                    <Input.Wrapper mt={10} withAsterisk label="Teléfono" description="Número de teléfono de la escuela">
                      <Input
                        leftSection={<IconPhone size={16} />}
                        component={IMaskInput}
                        mask="+53 00000000"
                        placeholder="Digite el número aquí"
                        value={telefonoNuevaEscuela}
                        onChange={(event) => setTelefonoNuevaEscuela(event.currentTarget.value)}
                      />
                    </Input.Wrapper>
                  </Grid.Col>
                </Grid>
              </>
            )}
          </>
        )}

        {/* Botón para asignar rol */}
        <Group justify="flex-end" mt="md">
          <Button
            leftSection={<IconUserShare size={18} />}
            onClick={handleAsignarRol}
            loading={loadingAsignacion}
            disabled={selection.length === 0 || !rolSeleccionado}
            size="md"
          >
            Asignar Rol
          </Button>
        </Group>
      </Card>
    </Container>
  );
}