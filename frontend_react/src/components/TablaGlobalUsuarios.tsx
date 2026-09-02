import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Grid,
  Group,
  Loader,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  UnstyledButton,
  rem,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconMapPin,
  IconPhone,
  IconSchool,
  IconSearch,
  IconSelector,
  IconShield,
  IconUserCheck,
  IconUserShare,
  IconUsers,
} from '@tabler/icons-react';
import classes from '../styles/AsignarRol.module.css';
import tableClasses from '../styles/TableSort.module.css';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { MaskInputField } from './ui/MaskInputField';
import { SearchableAsyncCombobox, type ComboboxOption } from './ui/SearchableAsyncCombobox';

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
    <Table.Th className={tableClasses.th}>
      <UnstyledButton onClick={onSort} className={tableClasses.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={tableClasses.icon}>
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

interface Rol {
  id: number;
  rol: string;
  descripcion: string;
  estado: boolean;
}

const ROLE_HINTS: Record<string, string> = {
  Profesor: 'Requiere provincia, municipio y escuela (o registrar una nueva).',
  'Coordinador Provincial MINED': 'Asigna responsabilidad territorial provincial.',
  'Coordinador Municipal MINED': 'Requiere provincia y municipio de responsabilidad.',
  'Colaborador Bebras': 'Colaborador institucional del concurso.',
  'Colaborador Universitario Bebras': 'Colaborador estudiantil universitario (FEU).',
};

export function TablaGlobalUsuarios() {
  const [search, setSearch] = useState('');  
  const [data, setData] = useState<RowData[]>([]);
  const [sortedData, setSortedData] = useState<RowData[]>([]);  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);  
  const [reverseSortDirection, setReverseSortDirection] = useState(false);  
  const [selection, setSelection] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);  
  const [rowsPerPage] = useState(8);

  // Estados para roles, provincias, municipios y escuelas
  const [roles, setRoles] = useState<Rol[]>([]);
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

  // Cargar roles al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const rolesRes = await axios.get('/api/listar-roles');

        if (rolesRes.data.success) {
          setRoles(rolesRes.data.data || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  // Limpiar municipio y escuelas cuando cambia el rol
  useEffect(() => {
    if (rolSeleccionado !== 'Profesor') {
          setProvinciaSeleccionada(null);
          setMunicipioSeleccionado(null);
          setEscuelaSeleccionada(null);
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

  const loadProvincias = useCallback(async (): Promise<ComboboxOption[]> => {
    const response = await axios.get<Array<{ codigo: number; nombre: string }>>('/api/provincias');
    return response.data.map((p) => ({ value: String(p.codigo), label: p.nombre }));
  }, []);

  const loadMunicipios = useCallback(async (): Promise<ComboboxOption[]> => {
    if (!provinciaSeleccionada) return [];
    const response = await axios.get<Array<{ codigo: number; nombre: string }>>(
      `/api/municipios/${provinciaSeleccionada}`,
    );
    return response.data.map((m) => ({ value: String(m.codigo), label: m.nombre }));
  }, [provinciaSeleccionada]);

  const loadEscuelasOptions = useCallback(async (): Promise<ComboboxOption[]> => {
    if (!municipioSeleccionado) return [];
    const response = await axios.get<ComboboxOption[]>(`/api/escuelas/${municipioSeleccionado}`);
    const filtered = response.data
      .filter((e) => e.value && String(e.value).trim() !== '')
      .map((e) => ({ ...e, value: String(e.value) }));
    return filtered.reduce((acc: ComboboxOption[], current) => {
      if (!acc.some((item) => item.value === current.value)) acc.push(current);
      return acc;
    }, []);
  }, [municipioSeleccionado]);

  const usuariosSeleccionados = data.filter((row) => selection.includes(row.name));
  const roleHint = rolSeleccionado ? ROLE_HINTS[rolSeleccionado] : null;

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
      const usuariosSeleccionadosSubmit = data.filter((row) => selection.includes(row.name));
      if (usuariosSeleccionadosSubmit.length === 0) {
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
      const userIds: number[] = usuariosSeleccionadosSubmit
        .map((usuario: RowData) => usuario.id)
        .filter((id): id is number => id !== undefined && id !== null);

      if (userIds.length === 0) {
        throw new Error('No se pudo encontrar el ID de ningún usuario seleccionado');
      }

      // Si se está registrando una nueva escuela, registrarla primero
      if (rolSeleccionado === 'Profesor' && mostrarRegistroEscuela && nombreNuevaEscuela.trim() && municipioSeleccionado) {
        try {
          const escuelaResponse = await axios.post('/api/registrar-escuela', {
            nombre_escuela: nombreNuevaEscuela.trim(),
            cdgo_municipio: municipioSeleccionado,
            codigo_escuela: '',
            telefono: telefonoNuevaEscuela.trim() || '',
            poblado: '',
            subsistema: null,
          });

          if (escuelaResponse.data?.id) {
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
      className={selection.includes(row.name) ? classes.rowSelected : undefined}
    >
      <Table.Td>
        <Checkbox
          checked={selection.includes(row.name)}
          onChange={() => toggleRow(row.name)}
          aria-label={`Seleccionar ${row.name}`}
        />
      </Table.Td>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar size={32} radius="xl" color="indigo">
            {getInitials(row.name)}
          </Avatar>
          <div>
            <Text fz="sm" fw={600} lineClamp={1}>
              {row.name}
            </Text>
            <Text fz="xs" c="dimmed" lineClamp={1}>
              {row.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td visibleFrom="sm">
        <Group gap={4} wrap="wrap">
          {row.roles.length > 0 ? (
            row.roles.map((rol) => (
              <Badge key={rol} size="xs" variant="light" color="indigo">
                {rol}
              </Badge>
            ))
          ) : (
            <Text size="xs" c="dimmed">
              Sin roles
            </Text>
          )}
        </Group>
      </Table.Td>
      <Table.Td visibleFrom="md">
        <Group gap={6} wrap="nowrap">
          <IconPhone size={14} stroke={1.5} color="var(--mantine-color-dimmed)" />
          <Text size="sm">{row.telefono}</Text>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return (
      <Center py={80}>
        <Stack align="center" gap="md">
          <Loader color="indigo" size="lg" type="dots" />
          <Text c="dimmed">Cargando usuarios del sistema…</Text>
        </Stack>
      </Center>
    );
  }

  const totalFiltrados = filterData(data, search).length;
  const totalPaginas = Math.ceil(totalFiltrados / rowsPerPage);

  return (
    <Box>
      <Alert
        className={classes.introBanner}
        variant="light"
        color="indigo"
        icon={<IconUserShare size={18} />}
        mb="lg"
        radius="md"
      >
        Marque los usuarios en la tabla, configure el rol en el panel derecho y pulse{' '}
        <Text span fw={600}>
          Asignar rol
        </Text>
        . Si el rol es Profesor, deberá indicar provincia, municipio y escuela.
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
        <Paper className={classes.statCard} radius="md" withBorder>
          <ThemeIcon size={36} radius="md" variant="light" color="indigo" mb="xs">
            <IconUsers size={18} />
          </ThemeIcon>
          <Text className={classes.statNumber}>{data.length}</Text>
          <Text size="sm" c="dimmed" mt={4}>
            Usuarios en el sistema
          </Text>
        </Paper>
        <Paper
          className={`${classes.statCard} ${selection.length > 0 ? classes.statCardActive : ''}`}
          radius="md"
          withBorder
        >
          <ThemeIcon size={36} radius="md" variant="light" color="violet" mb="xs">
            <IconUserCheck size={18} />
          </ThemeIcon>
          <Text className={classes.statNumber}>{selection.length}</Text>
          <Text size="sm" c="dimmed" mt={4}>
            Seleccionados en esta página
          </Text>
        </Paper>
        <Paper className={classes.statCard} radius="md" withBorder>
          <ThemeIcon size={36} radius="md" variant="light" color="teal" mb="xs">
            <IconShield size={18} />
          </ThemeIcon>
          <Text className={classes.statNumber}>
            {roles.filter((r) => r.estado).length}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Roles disponibles
          </Text>
        </Paper>
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Paper className={classes.tableSection} radius="lg" withBorder>
            <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="sm">
              <div>
                <Title order={4}>Usuarios</Title>
                <Text size="sm" c="dimmed">
                  {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''}
                </Text>
              </div>
            </Group>

            <TextInput
              className={classes.toolbar}
              placeholder="Buscar por nombre, correo, teléfono o rol…"
              leftSection={<IconSearch size={16} stroke={1.5} />}
              value={search}
              onChange={handleSearchChange}
              radius="md"
            />

            <ScrollArea>
              <Table.ScrollContainer minWidth={520} type="native">
                <Table verticalSpacing="sm" highlightOnHover striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: rem(40) }}>
                        <Checkbox
                          onChange={toggleAll}
                          checked={
                            selection.length === sortedData.length && sortedData.length > 0
                          }
                          indeterminate={
                            selection.length > 0 && selection.length < sortedData.length
                          }
                          aria-label="Seleccionar todos"
                        />
                      </Table.Th>
                      <Th
                        sorted={sortBy === 'name'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('name')}
                      >
                        Usuario
                      </Th>
                      <Table.Th visibleFrom="sm">
                        <Text fw={500} fz="sm">
                          Roles
                        </Text>
                      </Table.Th>
                      <Table.Th visibleFrom="md">
                        <Text fw={500} fz="sm">
                          Teléfono
                        </Text>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rows.length > 0 ? (
                      rows
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={4}>
                          <Box className={classes.emptyState}>
                            <Text fw={500} c="dimmed">
                              No se encontraron usuarios
                            </Text>
                          </Box>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </ScrollArea>

            {totalPaginas > 1 && (
              <Pagination.Root
                mt="md"
                onChange={handlePageChange}
                total={totalPaginas}
                value={page}
              >
                <Group gap={5} justify="center">
                  <Pagination.First />
                  <Pagination.Previous />
                  <Pagination.Items />
                  <Pagination.Next />
                  <Pagination.Last />
                </Group>
              </Pagination.Root>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Paper className={classes.assignPanel} radius="lg" withBorder>
            <div className={classes.sectionHeader}>
              <ThemeIcon size={40} radius="md" variant="light" color="indigo">
                <IconUserShare size={20} />
              </ThemeIcon>
              <div>
                <Title order={4}>Configurar asignación</Title>
                <Text size="sm" c="dimmed">
                  Rol y datos adicionales según el tipo de usuario
                </Text>
              </div>
            </div>

            <Stack gap="md">
              <Box>
                <Text size="sm" fw={600} mb={6}>
                  Usuarios seleccionados
                </Text>
                {usuariosSeleccionados.length > 0 ? (
                  <Stack gap={4} className={classes.selectedList}>
                    {usuariosSeleccionados.map((u) => (
                      <Group key={u.id} gap="xs" wrap="nowrap">
                        <Avatar size={24} radius="xl" color="indigo">
                          {getInitials(u.name)}
                        </Avatar>
                        <Text size="sm" lineClamp={1}>
                          {u.name}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">
                    Ningún usuario seleccionado en la tabla
                  </Text>
                )}
              </Box>

              <Select
                label="Rol a asignar"
                placeholder="Seleccione un rol"
                leftSection={<IconShield size={16} />}
                data={roles
                  .filter((r) => r.estado)
                  .map((r) => ({
                    value: r.rol,
                    label: r.rol,
                    description: r.descripcion,
                  }))}
                searchable
                clearable
                value={rolSeleccionado}
                onChange={setRolSeleccionado}
                radius="md"
              />

              {roleHint && (
                <Alert
                  className={classes.roleHint}
                  color="indigo"
                  variant="light"
                  radius="md"
                >
                  {roleHint}
                </Alert>
              )}

              {rolSeleccionado === 'Profesor' && (
                <Stack gap="sm">
                  <Text size="sm" fw={600}>
                    Ubicación del profesor
                  </Text>
                  <SearchableAsyncCombobox
                    label="Provincia"
                    withAsterisk
                    leftSection={<IconMapPin size={16} />}
                    placeholder="Buscar provincia…"
                    value={provinciaSeleccionada}
                    onChange={(v) => {
                      setProvinciaSeleccionada(v);
                      setMunicipioSeleccionado(null);
                      setEscuelaSeleccionada(null);
                    }}
                    loadOptions={loadProvincias}
                    cacheKey="provincias-asignar"
                  />
                  <SearchableAsyncCombobox
                    label="Municipio"
                    withAsterisk
                    leftSection={<IconMapPin size={16} />}
                    placeholder={
                      provinciaSeleccionada
                        ? 'Buscar municipio…'
                        : 'Seleccione provincia primero'
                    }
                    value={municipioSeleccionado}
                    onChange={(v) => {
                      setMunicipioSeleccionado(v);
                      setEscuelaSeleccionada(null);
                    }}
                    loadOptions={loadMunicipios}
                    disabled={!provinciaSeleccionada}
                    cacheKey={provinciaSeleccionada}
                  />
                  <SearchableAsyncCombobox
                    label="Centro educativo"
                    withAsterisk={!mostrarRegistroEscuela}
                    leftSection={<IconSchool size={16} />}
                    description="Formato: nombre / subsistema / poblado"
                    placeholder={
                      municipioSeleccionado
                        ? 'Buscar escuela…'
                        : 'Seleccione municipio primero'
                    }
                    value={escuelaSeleccionada}
                    onChange={setEscuelaSeleccionada}
                    loadOptions={loadEscuelasOptions}
                    disabled={!municipioSeleccionado || mostrarRegistroEscuela}
                    cacheKey={municipioSeleccionado}
                  />

                  <Checkbox
                    label="Mi escuela no aparece en la lista"
                    checked={mostrarRegistroEscuela}
                    onChange={(event) => {
                      setMostrarRegistroEscuela(event.currentTarget.checked);
                      if (event.currentTarget.checked) {
                        setEscuelaSeleccionada(null);
                      }
                    }}
                    disabled={!municipioSeleccionado}
                  />

                  {mostrarRegistroEscuela && (
                    <Stack gap="sm">
                      <TextInput
                        label="Nombre de la escuela no registrada"
                        withAsterisk
                        leftSection={<IconSchool size={16} />}
                        placeholder="Ingrese el nombre de la escuela"
                        value={nombreNuevaEscuela}
                        onChange={(event) =>
                          setNombreNuevaEscuela(event.currentTarget.value)
                        }
                        radius="md"
                      />
                      <MaskInputField
                        label="Teléfono de la escuela"
                        leftSection={<IconPhone size={16} />}
                        mask="9999-9999"
                        placeholder="________"
                        value={telefonoNuevaEscuela}
                        onAccept={(value: string) => setTelefonoNuevaEscuela(value)}
                        radius="md"
                      />
                      <Text size="xs" c="dimmed">
                        Número de contacto del centro educativo
                      </Text>
                    </Stack>
                  )}
                </Stack>
              )}

              <Button
                fullWidth
                size="md"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'violet' }}
                leftSection={<IconUserShare size={18} />}
                onClick={handleAsignarRol}
                loading={loadingAsignacion}
                disabled={selection.length === 0 || !rolSeleccionado}
                radius="md"
              >
                Asignar rol
                {selection.length > 0 ? ` (${selection.length})` : ''}
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}