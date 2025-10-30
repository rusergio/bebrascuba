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
  Divider
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
  IconCalendar
} from '@tabler/icons-react';

interface RowData {
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

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(query)
    )
  );
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
      return String(b[sortBy]).localeCompare(String(a[sortBy]));  
    }  

    return String(a[sortBy]).localeCompare(String(b[sortBy]));  
  });  

  return sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);  
}

const subsistemaColors: Record<string, string> = {
  'Primaria': 'blue',
  'Secundaria Básica': 'green',
  'Preuniversitario': 'violet',
  'Politécnico': 'orange',
  'Especial': 'pink',
  'Vocacional': 'cyan'
};

const data: RowData[] = [
  {
    id: '1',
    name: 'Escuela Primaria Abel Santamaría',
    poblado: 'Santa Clara',
    subsistema: 'Primaria',
    contacto: '+53 42-20-1234',
    status: 'active',
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
    director: 'Lic. Ana Rodríguez Torres',
    totalProfesores: 45,
    yearFounded: 1975,
    address: 'Carretera Central Km 2.5, Santa Clara'
  },
  {
    id: '4',
    name: 'Escuela Vocacional Lenin',
    poblado: 'Santa Clara',
    subsistema: 'Vocacional',
    contacto: '+53 42-20-7890',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Dr. José Hernández López',
    totalProfesores: 60,
    yearFounded: 1974,
    address: 'Carretera Maleza Km 3, Santa Clara'
  },
  {
    id: '5',
    name: 'Escuela Primaria Camilo Cienfuegos',
    poblado: 'Placetas',
    subsistema: 'Primaria',
    contacto: '+53 42-36-2345',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Laura Díaz Martínez',
    totalProfesores: 20,
    yearFounded: 1968,
    address: 'Calle Maceo #78, Placetas'
  },
  {
    id: '6',
    name: 'Secundaria Básica Ignacio Agramonte',
    poblado: 'Remedios',
    subsistema: 'Secundaria Básica',
    contacto: '+53 42-39-4567',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Pedro Sánchez Castro',
    totalProfesores: 28,
    yearFounded: 1972,
    address: 'Ave. Camilo Cienfuegos #23, Remedios'
  },
  {
    id: '7',
    name: 'Instituto Preuniversitario Ernesto Guevara',
    poblado: 'Santa Clara',
    subsistema: 'Preuniversitario',
    contacto: '+53 42-20-6789',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Carmen Ramírez Vega',
    totalProfesores: 42,
    yearFounded: 1976,
    address: 'Reparto José Martí, Santa Clara'
  },
  {
    id: '8',
    name: 'Escuela Primaria Máximo Gómez',
    poblado: 'Caibarién',
    subsistema: 'Primaria',
    contacto: '+53 42-35-8901',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Miguel Castro Ruiz',
    totalProfesores: 22,
    yearFounded: 1967,
    address: 'Calle Real #156, Caibarién'
  },
  {
    id: '9',
    name: 'Instituto Politécnico Industrial',
    poblado: 'Santa Clara',
    subsistema: 'Politécnico',
    contacto: '+53 42-20-3456',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Ing. Roberto Jiménez Díaz',
    totalProfesores: 38,
    yearFounded: 1978,
    address: 'Zona Industrial, Santa Clara'
  },
  {
    id: '10',
    name: 'Secundaria Básica Antonio Maceo',
    poblado: 'Sagua la Grande',
    subsistema: 'Secundaria Básica',
    contacto: '+53 42-32-5678',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Isabel Ortiz Morales',
    totalProfesores: 30,
    yearFounded: 1971,
    address: 'Calle Colón #234, Sagua la Grande'
  },
  {
    id: '11',
    name: 'Escuela Especial Solidaridad con Panamá',
    poblado: 'Santa Clara',
    subsistema: 'Especial',
    contacto: '+53 42-20-9012',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Elena Vega Hernández',
    totalProfesores: 18,
    yearFounded: 1980,
    address: 'Reparto Virginia, Santa Clara'
  },
  {
    id: '12',
    name: 'Escuela Primaria Frank País',
    poblado: 'Ranchuelo',
    subsistema: 'Primaria',
    contacto: '+53 42-55-1234',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Francisco Molina García',
    totalProfesores: 19,
    yearFounded: 1969,
    address: 'Ave. Independencia #89, Ranchuelo'
  },
  {
    id: '13',
    name: 'Instituto Preuniversitario Félix Varela',
    poblado: 'Santa Clara',
    subsistema: 'Preuniversitario',
    contacto: '+53 42-20-2345',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Lucía Romero Sánchez',
    totalProfesores: 48,
    yearFounded: 1977,
    address: 'Reparto Sandino, Santa Clara'
  },
  {
    id: '14',
    name: 'Secundaria Básica Rubén Martínez Villena',
    poblado: 'Camajuaní',
    subsistema: 'Secundaria Básica',
    contacto: '+53 42-79-3456',
    status: 'inactive',
    municipio: 'Santa Clara',
    director: 'Lic. Antonio Navarro Cruz',
    totalProfesores: 26,
    yearFounded: 1973,
    address: 'Calle Martí #45, Camajuaní'
  },
  {
    id: '15',
    name: 'Escuela Primaria Serafín Sánchez',
    poblado: 'Encrucijada',
    subsistema: 'Primaria',
    contacto: '+53 42-63-4567',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Rosa Medina López',
    totalProfesores: 21,
    yearFounded: 1966,
    address: 'Calle Principal #12, Encrucijada'
  },
  {
    id: '16',
    name: 'Secundaria Básica Mártires de Barbados',
    poblado: 'Santo Domingo',
    subsistema: 'Secundaria Básica',
    contacto: '+53 42-57-5678',
    status: 'active',
    municipio: 'Santa Clara',
    director: 'Lic. Manuel Gutiérrez Pérez',
    totalProfesores: 29,
    yearFounded: 1976,
    address: 'Ave. Central #67, Santo Domingo'
  }
];

export function TablaEscuelaMunic() {
  const [search, setSearch] = useState('');  
  const [sortedData, setSortedData] = useState(data);  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);  
  const [reverseSortDirection, setReverseSortDirection] = useState(false);  
  const [page, setPage] = useState(1);  
  const [rowsPerPage] = useState(8);

  useEffect(() => {  
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search, page, rowsPerPage }));  
  }, [sortBy, reverseSortDirection, search, page, rowsPerPage]);  

  const handlePageChange = (newPage: number) => {  
    setPage(newPage);
  }; 

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {  
    const { value } = event.currentTarget;  
    setSearch(value);
    setPage(1);
  };  
  
  const setSorting = (field: keyof RowData) => {  
    const reversed = field === sortBy ? !reverseSortDirection : false;  
    setReverseSortDirection(reversed);  
    setSortBy(field);
  };

  const rows = sortedData.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text fz="sm" fw={500}>{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{item.poblado}</Text>
      </Table.Td>
      <Table.Td>
        <Badge 
          color={subsistemaColors[item.subsistema]} 
          variant="light"
        >
          {item.subsistema}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Center>
          <Text fz="sm">{item.contacto}</Text>
        </Center>
      </Table.Td>
      <Table.Td>
        <Center>
          <Badge 
            variant="light" 
            color={item.status === 'active' ? 'green' : 'gray'}
          >
            {item.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </Center>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <Menu
            withArrow
            width={300}
            position="bottom-end"
            transitionProps={{ transition: 'pop' }}
            withinPortal
          >
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
                    <Text size="xs" c="dimmed">
                      {item.subsistema}
                    </Text>
                  </div>
                </Group>
              </Menu.Item>
              
              <Divider />
              
              <Menu.Label>Información General</Menu.Label>
              
              <Menu.Item leftSection={<IconMapPin size={16} stroke={1.5} />}>
                <div>
                  <Text size="xs" c="dimmed">Ubicación</Text>
                  <Text size="sm">{item.poblado}</Text>
                  {item.address && (
                    <Text size="xs" c="dimmed" mt={2}>{item.address}</Text>
                  )}
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
                <Badge 
                  variant="light" 
                  color={item.status === 'active' ? 'green' : 'gray'}
                  fullWidth
                >
                  {item.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          
          <ActionIcon variant="subtle" color="gray">
            <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red">
            <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const filteredDataLength = filterData(data, search).length;

  return (
    <Container size="lg" mt={30}>
      <Fieldset legend="">
        <Title order={1} mb={5}>Tabla de Escuelas</Title>
        <Text c="dimmed" mb={30}>Municipio de <b>Villa Clara</b></Text>
        
        <Table.ScrollContainer minWidth={800}>
          <TextInput
            placeholder="Buscar escuela..."
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Th 
                  sorted={sortBy === 'name'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('name')}
                >
                  <b>Nombre</b>
                </Th>
                <Th
                  sorted={sortBy === 'poblado'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('poblado')}
                >
                  <b>Poblado</b>
                </Th>
                <Th
                  sorted={sortBy === 'subsistema'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('subsistema')}
                >
                  <b>Subsistema</b>
                </Th>
                <Table.Th>
                  <Center>
                    <Text fw={700} fz="sm">Contacto</Text>
                  </Center>
                </Table.Th>
                <Table.Th>
                  <Center>
                    <Text fw={700} fz="sm">Estado</Text>
                  </Center>
                </Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text fw={500} ta="center" c="dimmed">
                      No se encontraron resultados
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          <Group justify="center" mt="xl">
            <Pagination 
              withEdges
              value={page}
              onChange={handlePageChange} 
              total={Math.ceil(filteredDataLength / rowsPerPage)}
            />
          </Group>
        </Table.ScrollContainer>
      </Fieldset>
    </Container>
  );
}