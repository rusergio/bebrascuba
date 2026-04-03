import '@mantine/core/styles.css';
import { MantineProvider, Container, Card, Table, Title } from '@mantine/core';
import { HeroContentLeft } from '../components/HeroContentLeft';
import { FeaturesCards } from '../components/FeaturesCards';
import { FeaturesAsymmetrical } from '../components/FeaturesAsymmetrical';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { FeaturesTitle } from '../components/FeaturesTitle';
import { useDataContext } from '../context/DataContext';

export default function PagInicial() { 
    // Usar datos del contexto en lugar de hacer fetch
    const { resultados: resultsData, totalPorCategoria } = useDataContext();    
    // Los resultados del concurso categoria y provincia
    const rows = resultsData.map((element) => (  
        <Table.Tr key={element.provincia}>  
            <Table.Td>{element.provincia}</Table.Td>  
            <Table.Td>{element.superpegues}</Table.Td>  
            <Table.Td>{element.peque}</Table.Td>  
            <Table.Td>{element.benjamin}</Table.Td>  
            <Table.Td>{element.cadete}</Table.Td>  
            <Table.Td>{element.junior}</Table.Td>  
            <Table.Td>{element.senior}</Table.Td>  
            <Table.Td>{element.total}</Table.Td>  
        </Table.Tr>  
    ));
    // El encabezado de la tabla
    const ths =  (
        <Table.Tr  >
        <Table.Th>Provincias</Table.Th>
        <Table.Th>SuperPeque</Table.Th>
        <Table.Th>Peque</Table.Th>
        <Table.Th>Benjamín</Table.Th>
        <Table.Th>Cadete</Table.Th>
        <Table.Th>Junior</Table.Th>
        <Table.Th>Senior</Table.Th>
        <Table.Th>Total por Provincia</Table.Th>
        </Table.Tr>
    );
    // Resultado total por categoria 
    const totalRow = (  
        <Table.Tr>  
            <Table.Th>Total por categoría</Table.Th>  
            <Table.Th>{totalPorCategoria?.superpegues || 0}</Table.Th>  
            <Table.Th>{totalPorCategoria?.peques || 0}</Table.Th>  
            <Table.Th>{totalPorCategoria?.benjamin || 0}</Table.Th>  
            <Table.Th>{totalPorCategoria?.cadete || 0}</Table.Th>  
            <Table.Th>{totalPorCategoria?.junior || 0}</Table.Th>  
            <Table.Th>{totalPorCategoria?.senior || 0}</Table.Th>  
            <Table.Th>{totalPorCategoria?.total || 0}</Table.Th>  
        </Table.Tr>  
    );  

    return (
        <MantineProvider>
            <HeroContentLeft  />
            <FeaturesCards />
            <FeaturesTitle />
            <FeaturesAsymmetrical />
            <FeaturesGrid />
            <Container size="lg">
                <Title order={1} ta={"center"} mb={30}>Resultados de la última edición</Title>
                <Card withBorder shadow="sm" radius="md" mb={40}>
                    <Title order={4} mb={5}> Tabla de resultados de las provincias por categoria  </Title>
                    <Table.ScrollContainer minWidth={800} type="native">
                        <Table verticalSpacing="sm" >
                            <Table.Caption>Resultados total por categoria</Table.Caption>
                            <Table.Thead>{ths}</Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                            <Table.Tfoot>{totalRow}</Table.Tfoot>
                        </Table>
                    </Table.ScrollContainer>
                </Card>
            </Container>
        </MantineProvider>
    );
}