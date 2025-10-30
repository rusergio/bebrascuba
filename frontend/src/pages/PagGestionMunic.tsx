import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { GeoPortal } from '../components/GeoPortal';
import { GestionarMunic } from '../components/GestionarMunic';

export default function PagGestionMunic() {
    return (
        <MantineProvider>
            <GestionarMunic />
        </MantineProvider>
    );
}