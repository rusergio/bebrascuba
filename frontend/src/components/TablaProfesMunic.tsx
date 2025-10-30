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
  Avatar,
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
  IconMail,
  IconPhone,
  IconCalendar,
  IconUser,
  IconSchool,
  IconBriefcase
} from '@tabler/icons-react';

interface RowData {
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

const data: RowData[] = [
  {
    id: '1',
    name: 'María',
    lastName: 'García Rodríguez',
    email: 'maria.garcia@educacion.cu',
    phone: '+53 5234-5678',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
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
    municipio: 'Santa Clara',
    school: 'Instituto Politécnico Industrial',
    yearsExperience: 7
  },
  {
    id: '11',
    name: 'Elena',
    lastName: 'Vega Cruz',
    email: 'elena.vega@educacion.cu',
    phone: '+53 5234-5670',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'Santa Clara',
    school: 'Escuela Primaria Frank País',
    yearsExperience: 13
  },
  {
    id: '12',
    name: 'Francisco',
    lastName: 'Molina Reyes',
    email: 'francisco.molina@educacion.cu',
    phone: '+53 5345-6781',
    lastParticipation: 2023,
    status: 'active',
    municipio: 'Santa Clara',
    school: 'Secundaria Básica Rubén Martínez Villena',
    yearsExperience: 16
  },
  {
    id: '13',
    name: 'Lucía',
    lastName: 'Romero Flores',
    email: 'lucia.romero@educacion.cu',
    phone: '+53 5456-7892',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'Santa Clara',
    school: 'Instituto Preuniversitario Félix Varela',
    yearsExperience: 5
  },
  {
    id: '14',
    name: 'Antonio',
    lastName: 'Navarro Soto',
    email: 'antonio.navarro@educacion.cu',
    phone: '+53 5567-8903',
    lastParticipation: 2023,
    status: 'active',
    municipio: 'Santa Clara',
    school: 'Escuela Primaria Serafín Sánchez',
    yearsExperience: 18
  },
  {
    id: '15',
    name: 'Rosa',
    lastName: 'Medina Castro',
    email: 'rosa.medina@educacion.cu',
    phone: '+53 5678-9014',
    lastParticipation: 2024,
    status: 'active',
    municipio: 'Santa Clara',
    school: 'Secundaria Básica Mártires de Barbados',
    yearsExperience: 12
  },
  {
    id: '16',
    name: 'Manuel',
    lastName: 'Gutiérrez Herrera',
    email: 'manuel.gutierrez@educacion.cu',
    phone: '+53 5789-0125',
    lastParticipation: 2022,
    status: 'inactive',
    municipio: 'Santa Clara',
    school: 'Instituto Preuniversitario Comandante Ernesto Che Guevara',
    yearsExperience: 22
  }
];

export function TablaProfesMunic() {
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

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const rows = sortedData.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} radius={30} color="blue">
            {getInitials(item.name, item.lastName)}
          </Avatar>
          <Text fz="sm" fw={500}>
            {item.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{item.lastName}</Text>
      </Table.Td>
      <Table.Td>
        <Anchor component="button" size="sm">
          {item.email}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Center>
          <Text fz="sm">{item.phone}</Text>
        </Center>
      </Table.Td>
      <Table.Td>
        <Center>
          <Badge 
            color={item.lastParticipation === 2024 ? 'green' : item.lastParticipation === 2023 ? 'blue' : 'gray'}
            variant="light"
            size="lg"
          >
            {item.lastParticipation}
          </Badge>
        </Center>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <Menu
            withArrow
            width={280}
            position="bottom-end"
            transitionProps={{ transition: 'pop' }}
            withinPortal
          >
            <Menu.Target>
              <ActionIcon variant="default" >
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
                    <Text size="xs" c="dimmed">
                      {item.email}
                    </Text>
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
                  <Badge 
                    color={item.lastParticipation === 2024 ? 'green' : item.lastParticipation === 2023 ? 'blue' : 'gray'}
                    variant="light"
                    size="sm"
                  >
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
          
          
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const filteredDataLength = filterData(data, search).length;

  return (
    <Container size="lg" mt={30}>
      <Fieldset legend="">
        <Title order={1} mb={5}>Tabla de Profesores</Title>
        <Text c="dimmed" mb={30}>Municipio de <b>Villa Clara</b> </Text>
        
        <Table.ScrollContainer minWidth={800}>
          <TextInput
            placeholder="Buscar profesor..."
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
                  sorted={sortBy === 'lastName'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('lastName')}
                >
                  <b>Apellidos</b>
                </Th>
                <Th
                  sorted={sortBy === 'email'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('email')}
                >
                  <b>Correo</b>
                </Th>
                <Table.Th>
                  <Center>
                    <Text fw={700} fz="sm">Teléfono</Text>
                  </Center>
                </Table.Th>
                <Table.Th>
                  <Center>
                    <Text fw={700} fz="sm">Última Participación</Text>
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