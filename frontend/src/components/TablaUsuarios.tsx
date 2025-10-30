import { Table, Container, Title, Fieldset, Group, Avatar, Text, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
// import classes from '../styles/FeaturesCards.module.css';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

interface Profesor {  
    id: number;  
    nro_ci: string;  
    nombre: string;  
    apellidos: string;  
    correo: string;  
    telefono: string;  
    es_nuevo: boolean;  
    perfil_editado: boolean;  
    esta_activo: boolean;  
    nombre_escuela: string;  
    subsistema: string;  
    poblado: string;  
    telefono_escuela: string | null;  
}  
export function TablaUsuarios() {
    const [data, setData] = useState<Profesor[]>([]);  
    
    const listarProfesoresNuevos = async () => {  
        try {  
            const response = await axios.get<Profesor[]>('api/listar-usuarios');  
            setData(response.data);  
            console.log(response.data);  
        } catch (error) {  
            console.error('Error al obtener los profesores inactivos:', error);  
        }  
    };

    useEffect(() => {  
        listarProfesoresNuevos();  
    }, []); 
    
    const row = data.map((item) => (  
        <Table.Tr key={item.id}>  
        <Table.Td>  
            <Group gap="sm">  
            <Avatar size={40} radius={40} />  
            <div>  
                <Text fz="sm" fw={500}>  
                    {item.nombre} {item.apellidos}  
                </Text>  
                <Text fz="xs" c="dimmed">  
                    {item.correo}  
                </Text>  
                </div>  
            </Group>  
        </Table.Td>  
        <Table.Td>{item.telefono}</Table.Td>  
        <Table.Td>{item.nombre_escuela}</Table.Td>  
        <Table.Td>{item.telefono_escuela}</Table.Td>  
        <Table.Td>  
            {item.poblado} 
        </Table.Td>  
        <Table.Td>  
            {item.esta_activo ? (  
                <Badge fullWidth variant="light">Activo</Badge>  
            ) : (  
                <Badge color="gray" fullWidth variant="light">Desactivo</Badge>  
            )}  
            </Table.Td>   
        </Table.Tr>  
    ));
    return (
        <Container size='lg' mt={50}>
            <Title order={1} ta={'center'}>Usuarios <Text span c="blue" inherit>registrados </Text></Title>
            <Fieldset legend="Tabla de profesores registrados en esta edición">
                <Table.ScrollContainer minWidth={800}>
                    <Table verticalSpacing="sm">
                        <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th>Telefono</Table.Th>
                            <Table.Th>Escuela</Table.Th>
                            <Table.Th>Teléfono escuela</Table.Th>
                            <Table.Th>Poblado</Table.Th>
                            <Table.Th>Estado cuenta</Table.Th>
                        </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{row}</Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Fieldset>
        </Container>
    );
}