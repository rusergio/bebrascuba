import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { AdminConcurso } from '../components/AdminConcurso';

export default function PagAdmin() {
    return (
        <MantineProvider>
            <AdminConcurso />
        </MantineProvider>
    );
}