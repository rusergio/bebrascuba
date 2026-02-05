import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { AsignarRol } from '../components/AsignarRol';

export default function PagAsignarRol() {
    return (
        <MantineProvider>
            <AsignarRol />
        </MantineProvider>
    );
}
