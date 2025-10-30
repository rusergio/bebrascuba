import '@mantine/core/styles.css';
import { MantineProvider, Container, Card, Table, Title } from '@mantine/core';
import { HeroContentLeft } from '../components/HeroContentLeft';
import { FeaturesCards } from '../components/FeaturesCards';
import axios from 'axios';
import React, { useState } from 'react';
import { FeaturesAsymmetrical } from '../components/FeaturesAsymmetrical';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { FeaturesTitle } from '../components/FeaturesTitle';

axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración
interface ResultadosProvincia {  
    provincia: string;  
    superpegues: number;  
    peque: number;  
    benjamin: number;  
    cadete: number;  
    junior: number;  
    senior: number;  
    total: number;  
}

export default function PagInicial() { 
    const [resultsData, setResultsData] = useState<ResultadosProvincia[]>([]); 
    const [totalPorCategoria, setTotalPorCategoria] = React.useState<any>({});  
    // 
    React.useEffect(() => {  
        const fetchData = async () => {  
            try {  
                const response = await axios.get('/api/resultados');  
                setResultsData(response.data);  
                // Obtener los totales por categoría  
                const totalResponse = await axios.get('/api/total-categorias');  
                setTotalPorCategoria(totalResponse.data);  
            } catch (error) {  
                console.error('Error fetching data:', error);  
            }  
        };  
        fetchData();  
    }, []);    
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
            <Table.Th>Total</Table.Th>  
            <Table.Th>{totalPorCategoria.superpegues}</Table.Th>  
            <Table.Th>{totalPorCategoria.peques}</Table.Th>  
            <Table.Th>{totalPorCategoria.benjamin}</Table.Th>  
            <Table.Th>{totalPorCategoria.cadete}</Table.Th>  
            <Table.Th>{totalPorCategoria.junior}</Table.Th>  
            <Table.Th>{totalPorCategoria.senior}</Table.Th>  
            <Table.Th>{totalPorCategoria.total}</Table.Th>  
        </Table.Tr>  
    );  

    
    return (
        <MantineProvider>
            {/* <HeroBullets /> */}
            <HeroContentLeft  />
            {/* <HeroImageRight /> */}
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