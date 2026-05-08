import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { GestionarEscuela } from '../components/GestionarEscuela';

export default function PagGestionEscuela() {
    return (
        <MantineProvider>
            <GestionarEscuela />
        </MantineProvider>
    );
}