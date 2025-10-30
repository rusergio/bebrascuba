import { useEffect, useState } from 'react';
import {
  Table,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  Pagination,
  Container,
  Fieldset,
  Title,
  Badge,
  ActionIcon,
  Menu,
  Anchor,
  Divider,
  Select,
  Avatar
} from '@mantine/core';
import { 
  IconSelector, 
  IconChevronDown, 
  IconChevronUp, 
  IconSearch,
  IconDots,
  IconPencil,
  IconTrash,
  IconMapPin,
  IconPhone,
  IconSchool,
  IconUsers,
  IconCalendar,
  IconMail,
  IconBriefcase,
  IconUser
} from '@tabler/icons-react';

// Interfaces
interface Profesor {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  lastParticipation: number;
  status: 'active' | 'inactive';
  municipio: string;
  school?: string;
  yearsExperience?: number;
}

interface Escuela {
  id: string;
  name: string;
  poblado: string;
  subsistema: string;
  contacto: string;
  status: 'active' | 'inactive';
  municipio: string;
  director?: string;
  totalProfesores?: number;
  yearFounded?: number;
  address?: string;
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
    <Table.Th>
      <UnstyledButton onClick={onSort} style={{ width: '100%' }}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

// Municipios de Villa Clara
const municipios = [
  { value: 'todos', label: 'Todos los Municipios' },
  { value: 'santa-clara', label: 'Santa Clara' },
  { value: 'manicaragua', label: 'Manicaragua' },
  { value: 'placetas', label: 'Placetas' },
  { value: 'remedios', label: 'Remedios' },
  { value: 'caibarien', label: 'Caibarién' },
  { value: 'sagua', label: 'Sagua la Grande' },
  { value: 'ranchuelo', label: 'Ranchuelo' },
  { value: 'camajuani', label: 'Camajuaní' },
  { value: 'encrucijada', label: 'Encrucijada' },
  { value: 'santo-domingo', label: 'Santo Domingo' }
];

// Datos de profesores
const profesoresData: Profesor[] = [
  {
    id: '1',
    name: 'María',
    lastName: 'García Rodríguez',
    email: 'maria.garcia@educacion.cu',
    phone: '+53 5234-5678',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'santa-clara',
    school: 'Escuela Primaria Abel Santamaría',
    yearsExperience: 15
  },
  {
    id: '2',
    name: 'Carlos',
    lastName: 'Fernández López',
    email: 'carlos.fernandez@educacion.cu',
    phone: '+53 5345-6789',
    lastParticipation: 2023,
    status: 'active',
    municipio: 'manicaragua',
    school: 'Secundaria Básica José Martí',
    yearsExperience: 8
  },
  {
    id: '3',
    name: 'Ana',
    lastName: 'Martínez Pérez',
    email: 'ana.martinez@educacion.cu',
    phone: '+53 5456-7890',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'santa-clara',
    school: 'Instituto Preuniversitario Osvaldo Herrera',
    yearsExperience: 12
  },
  {
    id: '4',
    name: 'José',
    lastName: 'Hernández Silva',
    email: 'jose.hernandez@educacion.cu',
    phone: '+53 5567-8901',
    lastParticipation: 2022,
    status: 'inactive',
    municipio: 'placetas',
    school: 'Escuela Vocacional Lenin',
    yearsExperience: 20
  },
  {
    id: '5',
    name: 'Laura',
    lastName: 'Díaz González',
    email: 'laura.diaz@educacion.cu',
    phone: '+53 5678-9012',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'remedios',
    school: 'Escuela Primaria Camilo Cienfuegos',
    yearsExperience: 6
  },
  {
    id: '6',
    name: 'Pedro',
    lastName: 'Sánchez Morales',
    email: 'pedro.sanchez@educacion.cu',
    phone: '+53 5789-0123',
    lastParticipation: 2023,
    status: 'active',
    municipio: 'caibarien',
    school: 'Secundaria Básica Ignacio Agramonte',
    yearsExperience: 10
  },
  {
    id: '7',
    name: 'Carmen',
    lastName: 'Ramírez Torres',
    email: 'carmen.ramirez@educacion.cu',
    phone: '+53 5890-1234',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'sagua',
    school: 'Instituto Preuniversitario Ernesto Guevara',
    yearsExperience: 14
  },
  {
    id: '8',
    name: 'Miguel',
    lastName: 'Castro Vargas',
    email: 'miguel.castro@educacion.cu',
    phone: '+53 5901-2345',
    lastParticipation: 2023,
    status: 'active',
    municipio: 'ranchuelo',
    school: 'Escuela Primaria Máximo Gómez',
    yearsExperience: 9
  },
  {
    id: '9',
    name: 'Isabel',
    lastName: 'Ortiz Ruiz',
    email: 'isabel.ortiz@educacion.cu',
    phone: '+53 5012-3456',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'santa-clara',
    school: 'Secundaria Básica Antonio Maceo',
    yearsExperience: 11
  },
  {
    id: '10',
    name: 'Roberto',
    lastName: 'Jiménez Mendoza',
    email: 'roberto.jimenez@educacion.cu',
    phone: '+53 5123-4567',
    lastParticipation: 2022,
    status: 'inactive',
    municipio: 'camajuani',
    school: 'Instituto Politécnico Industrial',
    yearsExperience: 7
  }
];

// Datos de escuelas
const escuelasData: Escuela[] = [
  {
    id: '1',
    name: 'Escuela Primaria Abel Santamaría',
    poblado: 'Santa Clara',
    subsistema: 'Primaria',
    contacto: '+53 42-20-1234',
    status: 'active',
    municipio: 'santa-clara',
    director: 'Lic. María González Pérez',
    totalProfesores: 25,
    yearFounded: 1965,
    address: 'Calle Colón #45, Santa Clara'
  },
  {
    id: '2',
    name: 'Secundaria Básica José Martí',
    poblado: 'Manicaragua',
    subsistema: 'Secundaria Básica',
    contacto: '+53 42-54-3456',
    status: 'active',
    municipio: 'manicaragua',
    director: 'Lic. Carlos Fernández Silva',
    totalProfesores: 32,
    yearFounded: 1970,
    address: 'Ave. Libertad #102, Manicaragua'
  },
  {
    id: '3',
    name: 'Instituto Preuniversitario Osvaldo Herrera',
    poblado: 'Santa Clara',
    subsistema: 'Preuniversitario',
    contacto: '+53 42-20-5678',
    status: 'active',
    municipio: 'santa-clara',
    director: 'Lic. Ana Rodríguez Torres',
    totalProfesores: 45,
    yearFounded: 1975,
    address: 'Carretera Central Km 2.5, Santa Clara'
  },
  {
    id: '4',
    name: 'Escuela Primaria Camilo Cienfuegos',
    poblado: 'Placetas',
    subsistema: 'Primaria',
    contacto: '+53 42-36-2345',
    status: 'active',
    municipio: 'placetas',
    director: 'Lic. Laura Díaz Martínez',
    totalProfesores: 20,
    yearFounded: 1968,
    address: 'Calle Maceo #78, Placetas'
  },
  {
    id: '5',
    name: 'Secundaria Básica Ignacio Agramonte',
    poblado: 'Remedios',
    subsistema: 'Secundaria Básica',
    contacto: '+53 42-39-4567',
    status: 'active',
    municipio: 'remedios',
    director: 'Lic. Pedro Sánchez Castro',
    totalProfesores: 28,
    yearFounded: 1972,
    address: 'Ave. Camilo Cienfuegos #23, Remedios'
  },
  {
    id: '6',
    name: 'Escuela Primaria Máximo Gómez',
    poblado: 'Caibarién',
    subsistema: 'Primaria',
    contacto: '+53 42-35-8901',
    status: 'active',
    municipio: 'caibarien',
    director: 'Lic. Miguel Castro Ruiz',
    totalProfesores: 22,
    yearFounded: 1967,
    address: 'Calle Real #156, Caibarién'
  },
  {
    id: '7',
    name: 'Instituto Preuniversitario Ernesto Guevara',
    poblado: 'Sagua la Grande',
    subsistema: 'Preuniversitario',
    contacto: '+53 42-32-7890',
    status: 'active',
    municipio: 'sagua',
    director: 'Lic. Carmen Ramírez Vega',
    totalProfesores: 42,
    yearFounded: 1976,
    address: 'Calle Independencia #45, Sagua la Grande'
  },
  {
    id: '8',
    name: 'Escuela Primaria Frank País',
    poblado: 'Ranchuelo',
    subsistema: 'Primaria',
    contacto: '+53 42-55-1234',
    status: 'active',
    municipio: 'ranchuelo',
    director: 'Lic. Francisco Molina García',
    totalProfesores: 19,
    yearFounded: 1969,
    address: 'Ave. Independencia #89, Ranchuelo'
  },
  {
    id: '9',
    name: 'Secundaria Básica Antonio Maceo',
    poblado: 'Camajuaní',
    subsistema: 'Secundaria Básica',
    contacto: '+53 42-79-3456',
    status: 'active',
    municipio: 'camajuani',
    director: 'Lic. Antonio Navarro Cruz',
    totalProfesores: 26,
    yearFounded: 1973,
    address: 'Calle Martí #45, Camajuaní'
  },
  {
    id: '10',
    name: 'Escuela Primaria Serafín Sánchez',
    poblado: 'Encrucijada',
    subsistema: 'Primaria',
    contacto: '+53 42-63-4567',
    status: 'active',
    municipio: 'encrucijada',
    director: 'Lic. Rosa Medina López',
    totalProfesores: 21,
    yearFounded: 1966,
    address: 'Calle Principal #12, Encrucijada'
  }
];

const subsistemaColors: Record<string, string> = {
  'Primaria': 'blue',
  'Secundaria Básica': 'green',
  'Preuniversitario': 'violet',
  'Politécnico': 'orange',
  'Especial': 'pink',
  'Vocacional': 'cyan'
};

function filterData<T extends { municipio: string }>(data: T[], search: string, municipio: string) {
  let filtered = data;
  
  if (municipio !== 'todos') {
    filtered = filtered.filter(item => item.municipio === municipio);
  }
  
  if (search) {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      )
    );
  }
  
  return filtered;
}

// Componente Tabla de Profesores Provincial
export function TablaProfesProvinc() {
  const [selectedMunicipio, setSelectedMunicipio] = useState('todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const filteredData = filterData(profesoresData, search, selectedMunicipio);
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMunicipioLabel = (value: string) => {
    return municipios.find(m => m.value === value)?.label || value;
  };

  const rows = paginatedData.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} radius={30} color="blue">
            {getInitials(item.name, item.lastName)}
          </Avatar>
          <Text fz="sm" fw={500}>{item.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td><Text fz="sm">{item.lastName}</Text></Table.Td>
      <Table.Td><Anchor component="button" size="sm">{item.email}</Anchor></Table.Td>
      <Table.Td><Center><Text fz="sm">{item.phone}</Text></Center></Table.Td>
      <Table.Td>
        <Center>
          <Badge color={item.lastParticipation === 2024 ? 'green' : item.lastParticipation === 2023 ? 'blue' : 'gray'} variant="light" size="lg">
            {item.lastParticipation}
          </Badge>
        </Center>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
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
                    {getInitials(item.name, item.lastName)}
                  </Avatar>
                  <div>
                    <Text fw={500}>{item.name} {item.lastName}</Text>
                    <Text size="xs" c="dimmed">{item.email}</Text>
                  </div>
                </Group>
              </Menu.Item>
              <Divider />
              <Menu.Label>Información Personal</Menu.Label>
              <Menu.Item leftSection={<IconPhone size={16} stroke={1.5} />}>
                <div>
                  <Text size="xs" c="dimmed">Teléfono</Text>
                  <Text size="sm">{item.phone}</Text>
                </div>
              </Menu.Item>
              <Menu.Item leftSection={<IconMapPin size={16} stroke={1.5} />}>
                <div>
                  <Text size="xs" c="dimmed">Municipio</Text>
                  <Text size="sm">{getMunicipioLabel(item.municipio)}</Text>
                </div>
              </Menu.Item>
              {item.school && (
                <Menu.Item leftSection={<IconSchool size={16} stroke={1.5} />}>
                  <div>
                    <Text size="xs" c="dimmed">Escuela</Text>
                    <Text size="sm">{item.school}</Text>
                  </div>
                </Menu.Item>
              )}
              <Menu.Item leftSection={<IconCalendar size={16} stroke={1.5} />}>
                <div>
                  <Text size="xs" c="dimmed">Última Participación</Text>
                  <Badge color={item.lastParticipation === 2024 ? 'green' : item.lastParticipation === 2023 ? 'blue' : 'gray'} variant="light" size="sm">
                    {item.lastParticipation}
                  </Badge>
                </div>
              </Menu.Item>
              {item.yearsExperience && (
                <Menu.Item leftSection={<IconBriefcase size={16} stroke={1.5} />}>
                  <div>
                    <Text size="xs" c="dimmed">Experiencia</Text>
                    <Text size="sm">{item.yearsExperience} años</Text>
                  </div>
                </Menu.Item>
              )}
              <Divider />
              <Menu.Label>Estado</Menu.Label>
              <Menu.Item>
                <Badge variant="light" color={item.status === 'active' ? 'green' : 'gray'} fullWidth>
                  {item.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <ActionIcon variant="subtle" color="gray"><IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} /></ActionIcon>
          <ActionIcon variant="subtle" color="red"><IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" mt={30}>
      <Fieldset legend="">
        <Title order={1} mb={5}>Tabla de Profesores</Title>
        <Text c="dimmed" mb={20}>Provincia Villa Clara</Text>
        
        <Select
          label="Seleccionar Municipio"
          placeholder="Escoge un municipio"
          data={municipios}
          value={selectedMunicipio}
          onChange={(value) => { setSelectedMunicipio(value || 'todos'); setPage(1); }}
          mb={20}
          leftSection={<IconMapPin size={16} />}
        />
        
        <Table.ScrollContainer minWidth={800}>
          <TextInput
            placeholder="Buscar profesor..."
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          />
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th><Text fw={500} fz="sm">Nombre</Text></Table.Th>
                <Table.Th><Text fw={500} fz="sm">Apellidos</Text></Table.Th>
                <Table.Th><Text fw={500} fz="sm">Correo</Text></Table.Th>
                <Table.Th><Center><Text fw={500} fz="sm">Teléfono</Text></Center></Table.Th>
                <Table.Th><Center><Text fw={500} fz="sm">Última Participación</Text></Center></Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text fw={500} ta="center" c="dimmed">No se encontraron profesores</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Group justify="center" mt="xl">
            <Pagination value={page} onChange={setPage} total={Math.ceil(filteredData.length / rowsPerPage)} />
          </Group>
        </Table.ScrollContainer>
      </Fieldset>
    </Container>
  );
}

// Componente Tabla de Escuelas Provincial
export function TablaEscuelaProvinc() {
  const [selectedMunicipio, setSelectedMunicipio] = useState('todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const filteredData = filterData(escuelasData, search, selectedMunicipio);
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getMunicipioLabel = (value: string) => {
    return municipios.find(m => m.value === value)?.label || value;
  };

  const rows = paginatedData.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td><Text fz="sm" fw={500}>{item.name}</Text></Table.Td>
      <Table.Td><Text fz="sm">{item.poblado}</Text></Table.Td>
      <Table.Td>
        <Badge color={subsistemaColors[item.subsistema]} variant="light">{item.subsistema}</Badge>
      </Table.Td>
      <Table.Td><Center><Text fz="sm">{item.contacto}</Text></Center></Table.Td>
      <Table.Td>
        <Center>
          <Badge variant="light" color={item.status === 'active' ? 'green' : 'gray'}>
            {item.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </Center>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <Menu withArrow width={300} position="bottom-end" transitionProps={{ transition: 'pop' }} withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>
                <Group gap="xs">
                  <IconSchool size={24} stroke={1.5} />
                  <div>
                    <Text fw={500} size="sm">{item.name}</Text>
                    <Text size="xs" c="dimmed">{item.subsistema}</Text>
                  </div>
                </Group>
              </Menu.Item>
              <Divider />
              <Menu.Label>Información General</Menu.Label>
              <Menu.Item leftSection={<IconMapPin size={16} stroke={1.5} />}>
                <div>
                  <Text size="xs" c="dimmed">Municipio</Text>
                  <Text size="sm">{getMunicipioLabel(item.municipio)}</Text>
                  <Text size="xs" c="dimmed" mt={2}>Poblado: {item.poblado}</Text>
                  {item.address && <Text size="xs" c="dimmed" mt={2}>{item.address}</Text>}
                </div>
              </Menu.Item>
              <Menu.Item leftSection={<IconPhone size={16} stroke={1.5} />}>
                <div>
                  <Text size="xs" c="dimmed">Contacto</Text>
                  <Text size="sm">{item.contacto}</Text>
                </div>
              </Menu.Item>
              {item.director && (
                <Menu.Item leftSection={<IconUsers size={16} stroke={1.5} />}>
                  <div>
                    <Text size="xs" c="dimmed">Director</Text>
                    <Text size="sm">{item.director}</Text>
                  </div>
                </Menu.Item>
              )}
              <Divider />
              <Menu.Label>Datos Adicionales</Menu.Label>
              {item.totalProfesores && (
                <Menu.Item>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Total de Profesores</Text>
                    <Badge variant="light" size="sm">{item.totalProfesores}</Badge>
                  </Group>
                </Menu.Item>
              )}
              {item.yearFounded && (
                <Menu.Item leftSection={<IconCalendar size={16} stroke={1.5} />}>
                  <div>
                    <Text size="xs" c="dimmed">Año de Fundación</Text>
                    <Text size="sm">{item.yearFounded}</Text>
                  </div>
                </Menu.Item>
              )}
              <Divider />
              <Menu.Label>Estado</Menu.Label>
              <Menu.Item>
                <Badge variant="light" color={item.status === 'active' ? 'green' : 'gray'} fullWidth>
                  {item.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <ActionIcon variant="subtle" color="gray"><IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} /></ActionIcon>
          <ActionIcon variant="subtle" color="red"><IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" mt={30}>
      <Fieldset legend="">
        <Title order={1} mb={5}>Tabla de Escuelas</Title>
        <Text c="dimmed" mb={20}>Provincia Villa Clara</Text>
        
        <Select
          label="Seleccionar Municipio"
          placeholder="Escoge un municipio"
          data={municipios}
          value={selectedMunicipio}
          onChange={(value) => { setSelectedMunicipio(value || 'todos'); setPage(1); }}
          mb={20}
          leftSection={<IconMapPin size={16} />}
        />
        
        <Table.ScrollContainer minWidth={800}>
          <TextInput
            placeholder="Buscar escuela..."
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          />
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th><Text fw={500} fz="sm">Nombre</Text></Table.Th>
                <Table.Th><Text fw={500} fz="sm">Poblado</Text></Table.Th>
                <Table.Th><Text fw={500} fz="sm">Subsistema</Text></Table.Th>
                <Table.Th><Center><Text fw={500} fz="sm">Contacto</Text></Center></Table.Th>
                <Table.Th><Center><Text fw={500} fz="sm">Estado</Text></Center></Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text fw={500} ta="center" c="dimmed">No se encontraron escuelas</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Group justify="center" mt="xl">
            <Pagination value={page} onChange={setPage} total={Math.ceil(filteredData.length / rowsPerPage)} />
          </Group>
        </Table.ScrollContainer>
      </Fieldset>
    </Container>
  );
}