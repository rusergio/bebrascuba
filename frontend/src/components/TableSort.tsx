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
  keys,
  Pagination,
  Container,
  Fieldset,
} from '@mantine/core';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import classes from '../styles/TableSort.module.css';

interface RowData {
  name: string;
  email: string;
  company: string;
  municipio: string;
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
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
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
      return b[sortBy].localeCompare(a[sortBy]);  
    }  

    return a[sortBy].localeCompare(b[sortBy]);  
  });  

  return sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);  
}

const data = [
  {
    name: 'Athena Weissnat',
    company: 'Little - Rippin',
    email: 'Elouise.Prohaska@yahoo.com',
    municipio: 'Elouise.Prohaska@yahoo.com',
  },
  {
    name: 'Deangelo Runolfsson',
    company: 'Greenfelder - Krajcik',
    email: 'Kadin_Trantow87@yahoo.com',
    municipio: 'Kadin_Trantow87@yahoo.com',
  },
  {
    name: 'Danny Carter',
    company: 'Kohler and Sons',
    email: 'Marina3@hotmail.com',
    municipio: 'Marina3@hotmail.com',
  },
  {
    name: 'Trace Tremblay PhD',
    company: 'Crona, Aufderhar and Senger',
    email: 'Antonina.Pouros@yahoo.com',
    municipio: 'Antonina.Pouros@yahoo.com',
  },
  {
    name: 'Derek Dibbert',
    company: 'Gottlieb LLC',
    email: 'Abagail29@hotmail.com',
    municipio: 'Abagail29@hotmail.com',
  },
  {
    name: 'Viola Bernhard',
    company: 'Funk, Rohan and Kreiger',
    email: 'Jamie23@hotmail.com',
    municipio: 'Jamie23@hotmail.com',
  },
  {
    name: 'Austin Jacobi',
    company: 'Botsford - Corwin',
    email: 'Genesis42@yahoo.com',
    municipio: 'Genesis42@yahoo.com',
  },
  {
    name: 'Hershel Mosciski',
    company: 'Okuneva, Farrell and Kilback',
    email: 'Idella.Stehr28@yahoo.com',
    municipio: 'Idella.Stehr28@yahoo.com',
  },
  {
    name: 'Mylene Ebert',
    company: 'Kirlin and Sons',
    email: 'Hildegard17@hotmail.com',
    municipio: 'Hildegard17@hotmail.com',
  },
  {
    name: 'Lou Trantow',
    company: 'Parisian - Lemke',
    email: 'Hillard.Barrows1@hotmail.com',
    municipio: 'Hillard.Barrows1@hotmail.com',
  },
  {
    name: 'Dariana Weimann',
    company: 'Schowalter - Donnelly',
    email: 'Colleen80@gmail.com',
    municipio: 'Colleen80@gmail.com',
  },
  {
    name: 'Dr. Christy Herman',
    company: 'VonRueden - Labadie',
    email: 'Lilyan98@gmail.com',
    municipio: 'Lilyan98@gmail.com',
  },
  {
    name: 'Katelin Schuster',
    company: 'Jacobson - Smitham',
    email: 'Erich_Brekke76@gmail.com',
    municipio: 'Erich_Brekke76@gmail.com',
  },
  {
    name: 'Melyna Macejkovic',
    company: 'Schuster LLC',
    email: 'Kylee4@yahoo.com',
    municipio: 'Kylee4@yahoo.com',
  },
  {
    name: 'Pinkie Rice',
    company: 'Wolf, Trantow and Zulauf',
    email: 'Fiona.Kutch@hotmail.com',
    municipio: 'Fiona.Kutch@hotmail.com',
  },
  {
    name: 'Brain Kreiger',
    company: 'Lueilwitz Group',
    email: 'Rico98@hotmail.com',
    municipio: 'Rico98@hotmail.com',
  },
];

export function TableSort() {
  const [search, setSearch] = useState('');  
  const [sortedData, setSortedData] = useState(data);  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);  
  const [reverseSortDirection, setReverseSortDirection] = useState(false);  

  const [page, setPage] = useState(1);  
  const [rowsPerPage, setRowsPerPage] = useState(8);   

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
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value, page, rowsPerPage }));  
  };  
  
  const setSorting = (field: keyof RowData) => {  
    const reversed = field === sortBy ? !reverseSortDirection : false;  
    setReverseSortDirection(reversed);  
    setSortBy(field);  
    setSortedData(sortData(data, { sortBy: field, reversed, search, page, rowsPerPage }));  
  };

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.name}>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td>{row.email}</Table.Td>
      <Table.Td>{row.company}</Table.Td>
      <Table.Td>{row.municipio}</Table.Td>
    </Table.Tr>
  ));


  return (
    <Container size='lg' mt={30} >
      <Fieldset legend="">
        <ScrollArea>
          <TextInput
            placeholder="Buscar escuela"
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          <Table verticalSpacing="xs" miw={700} layout="fixed" mb={10}>
            <Table.Tbody>
              <Table.Tr>
                <Th
                  sorted={sortBy === 'name'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('name')}
                >
                  Municipio
                </Th>
                <Th
                  sorted={sortBy === 'email'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('email')}
                >
                  Nombre
                </Th>
                <Th
                  sorted={sortBy === 'email'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('email')}
                >
                  Poblado
                </Th>
                <Th
                  sorted={sortBy === 'company'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('company')}
                >
                  Subsistemas
                </Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={Object.keys(data[0]).length}>
                    <Text fw={500} ta="center">
                      Nothing found
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
    </Container>
  );
}