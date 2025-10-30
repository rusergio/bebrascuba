import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Route, Routes } from 'react-router-dom';
import { TablaEscuelaProvinc } from '../components/TablaEscuelaProvinc';
import { TablaProfesProvinc } from '../components/TablaProfesProvinc';
import { TablaDeSolicitudes } from '../components/TablaDeSolicitudes';
export default function PagTablasProvinc() {
    return (
        <MantineProvider>
            <Routes>  
                <Route path="/tabla-esc-prov" element={<TablaEscuelaProvinc />} /> 
                <Route path="/tabla-prof-prov" element={<TablaProfesProvinc />} /> 
                <Route path="/tabla-solic-prof" element={<TablaDeSolicitudes/>} /> 
            </Routes>  
        </MantineProvider>
    );
}