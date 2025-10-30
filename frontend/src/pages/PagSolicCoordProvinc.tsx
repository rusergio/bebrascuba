import '@mantine/core/styles.css';
import { MantineProvider, Title } from '@mantine/core';
import { TablaDeSolicitudes } from '../components/TablaDeSolicitudes';
import { SolitudesACoordNac } from '../components/SolicitdesACoordNac';
import { MiPerfil } from '../components/MiPerfil';
import { SolicParaCoordProvinc } from '../components/SolicParaCoordProvinc';


export default function PagSolicCoordProvinc() {
    return (
        <MantineProvider>
            <SolicParaCoordProvinc />
        </MantineProvider>
    );
}