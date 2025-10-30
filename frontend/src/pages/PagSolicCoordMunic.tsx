import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { SolicParaCoordMunic } from '../components/SolicParaCoordMunic';



export default function PagSolicCoodMunic() {
    return (
        <MantineProvider>
            <SolicParaCoordMunic />
        </MantineProvider>
    );
}