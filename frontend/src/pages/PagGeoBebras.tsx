import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { GeoPortal } from '../components/GeoPortal';

export default function PagGeoBebras() {
    return (
        <MantineProvider>
            
            <GeoPortal />
            
        </MantineProvider>
    );
}