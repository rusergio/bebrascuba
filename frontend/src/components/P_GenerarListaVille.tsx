import { Container, Title, Button, Group, Grid, Text, Card, Checkbox, MultiSelect, Flex, Table } from '@mantine/core';
import { Fieldset } from '@mantine/core';
import { IconTableFilled } from '@tabler/icons-react';
import classes from '../styles/FeaturesCards.module.css';

import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

const elements = [
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
];
export function P_GenerarListaVille() {

    const rows = elements.map((element) => (
        <Table.Tr key={element.name}>
            <Table.Td>{element.position}</Table.Td>
            <Table.Td>{element.name}</Table.Td>
            <Table.Td>{element.symbol}</Table.Td>
            <Table.Td>{element.mass}</Table.Td>
        </Table.Tr>
    ));
    return (
        <Container size='lg' mt={40}>
            <Title order={1}  ta="center" mb='sm'>
                Generar lista para Ville
            </Title>
            <Fieldset mt={20} legend="Configuración">
            <Card withBorder mt={'md'}>
                        <Title order={3}>Configurar datos para examen</Title>
                        <Text c="dimmed" >Configure los datos según el orden de la organización internacional</Text>
                        <Grid mt={15}>
                            <Grid.Col span={5}>
                                <MultiSelect
                                    label="Seleccione las columnas"
                                    placeholder="Seleccione las columnas a generar"
                                    data={['Nombre', 'Escuela', 'Grado']}
                                    clearable
                                />
                            </Grid.Col>
                            <Grid.Col span={5}>
                                <Text fw={400} ml={30} size="sm">Agrupar por ...</Text>
                                <Flex
                                mih={50}
                                gap="md"
                                justify="flex-start"
                                align="flex-start"
                                direction="row"
                                >
                                    <Checkbox ml={20} label="Categoria" mt={10} />
                                    <Checkbox label="Sexo" mt={10} />
                                    <Group mt={5} ml={20}>  
                                        <Button  variant="filled" rightSection={<IconTableFilled size={16} />} >Generar tabla</Button>
                                    </Group>
                                </Flex>
                            </Grid.Col>
                        </Grid>
                    </Card>

                    <Card withBorder mt={10}>
                        <Title order={3}>Tabla Generada</Title>
                        <Table stickyHeader stickyHeaderOffset={60}>
                                <Table.Thead>
                                    <Table.Tr>
                                    <Table.Th>Element position</Table.Th>
                                    <Table.Th>Element name</Table.Th>
                                    <Table.Th>Symbol</Table.Th>
                                    <Table.Th>Atomic mass</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rows}</Table.Tbody>
                                <Table.Caption>Scroll page to see sticky thead</Table.Caption>
                        </Table>
                        
                    </Card>
            </Fieldset>
        </Container>
    );
}
