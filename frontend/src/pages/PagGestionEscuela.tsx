import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { GestionarEscuela } from '../components/GestionarEscuela';
import { TableOfContentsFloating } from '../components/TableOfContentsFloating';
export default function PagGestionEscuela() {
    return (
        <MantineProvider>
            <GestionarEscuela />
        </MantineProvider>
    );
}