import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Recurso } from '../components/Recurso';

export default function PagRecurso() {
    return (
        <MantineProvider>
            <Recurso />
        </MantineProvider>
    );
}