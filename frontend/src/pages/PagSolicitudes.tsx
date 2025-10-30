import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { SolitudesACoordNac } from '../components/SolicitdesACoordNac';



export default function PagSolicitudes() {
    return (
        <MantineProvider>
            <SolitudesACoordNac />
        </MantineProvider>
    );
}