import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { TablaEscuelaMunic } from '../components/TablaEscuelaMunic';
import { Route, Routes } from 'react-router-dom';
import { TablaProfesMunic } from '../components/TablaProfesMunic';
export default function PagTablasMunic() {
    return (
        <MantineProvider>
            <Routes>  
                <Route path="/tabla-esc-munic" element={<TablaEscuelaMunic />} /> 
                <Route path="/tabla-prof-munic" element={<TablaProfesMunic />} /> 
            </Routes>  
        </MantineProvider>
    );
}