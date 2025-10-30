import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { RegistrarProfe } from '../components/RegistrarProfe';

export default function PagSolicRegist() {
    return (
        <MantineProvider>
            <RegistrarProfe />
        </MantineProvider>
    );
}
