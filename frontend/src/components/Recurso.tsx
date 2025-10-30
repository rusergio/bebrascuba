import { Paper, Text, Title, Button, Container, Group } from '@mantine/core';  
import { IconDownload } from '@tabler/icons-react';  
import { useEffect, useState } from 'react';  
import axios from 'axios';  
axios.defaults.baseURL = 'http://localhost:8000';  

interface RecursoData {  
    id: number;  
    nombre: string;  
    descripcion: string;  
    archivo_path: string;  
}  

export function Recurso() {  
    const [recursos, setRecursos] = useState<RecursoData[]>([]);  

    useEffect(() => {  
        const fetchRecursos = async () => {  
        try {  
            const response = await axios.get('api/listar-recursos');  
            setRecursos(response.data);  
            console.log('Recursos', response.data);  
        } catch (error) {  
            console.error('Error al obtener los recursos:', error);  
        }  
        };  
        fetchRecursos();  
    }, []);  

    return (  
        <Container mt={50}>  
        <Title order={2} size={40} ta="center">  
            Recursos de apoyo al concurso BebrasCuba  
        </Title>  
        <Text c="dimmed" ta="center" mb={30}>  
            Documentos de apoyo y guía de cada convocatoria, eso incluye los llamados  
        </Text>  

        {recursos.map((recurso) => (  
            <Paper key={recurso.id} shadow="lg" p="lg" withBorder mb={10}>  
            <Text>{recurso.nombre}</Text>  
            <Group mr={10} justify="space-between">  
                <Group>  
                <Text c="dimmed">{recurso.descripcion}</Text>  
                </Group>  
                <Group>  
                <Button  
                    variant="default"  
                    rightSection={<IconDownload size={15} />}  
                    component="a"  
                    href={`http://localhost:8000/api/descargar-recurso/${recurso.archivo_path.split('/').pop()}`} // Ruta para descargar  
                    download // Forzar la descarga  
                >  
                    Descargar  
                </Button>  
                </Group>  
            </Group>  
            </Paper>  
        ))}  
        </Container>  
    );  
}