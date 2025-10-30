import { MantineProvider } from '@mantine/core';
import { GestionarConcurso } from '../components/GestionarConcurso';

export default function PagGestionConcurso() {
    
    return (
        <MantineProvider>
            <GestionarConcurso />
        </MantineProvider>
    );
}