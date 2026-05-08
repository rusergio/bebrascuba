import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { SolicParaCoordProvinc } from '../components/SolicParaCoordProvinc';

export default function PagSolicCoordProvinc() {
    return (
        <MantineProvider>
            <SolicParaCoordProvinc />
        </MantineProvider>
    );
}