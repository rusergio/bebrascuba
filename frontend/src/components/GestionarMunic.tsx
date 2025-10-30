
import { Container, Card, Text, Title } from '@mantine/core';
import { TablaMunic } from './TablaMunic';
import { TablaDeSolicitudes } from './TablaDeSolicitudes';

export function GestionarMunic() { 
    
    return (
        
        <Container size="lg">
            
            <Card withBorder>
                <Title order={3}>Tabla de Municipios</Title>
                <Text c="dimmed">Administre los municipios </Text>
                
                <TablaMunic />
                
            </Card>

            <Card withBorder mt={10}>
                <Title order={3}>Mensajes de solicitud</Title>
                <Text c="dimmed">Solicitudes por parte de profesor</Text>
                <TablaDeSolicitudes />
                
            </Card>
            
        </Container>
        
    );
}

