import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { GestionarMunic } from '../components/GestionarMunic';

export default function PagGestionMunic() {
    return (
        <MantineProvider>
            <GestionarMunic />
        </MantineProvider>
    );
}