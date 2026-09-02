import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { EditarCuenta } from '../components/EditarCuenta';


export default function PagEditarCuenta() {
    return (
        <MantineProvider>
            <EditarCuenta />
        </MantineProvider>
    );
}