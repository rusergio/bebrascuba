import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Route, Routes } from 'react-router-dom';
import { P_InscribirAlumno } from '../components/P_InscribirAlumno';
import { P_Reinscribir_Alumno } from '../components/P_ReinscribirAlumno';
import { P_GenerarListaVille } from '../components/P_GenerarListaVille';
export default function PagGestionAlumnos() {
    return (
        <MantineProvider>
            <Routes>  
                <Route path="/pag_reinsc-estudiant" element={<P_Reinscribir_Alumno />} /> 
                <Route path="/pag_insc_estudiant" element={<P_InscribirAlumno />} /> 
                <Route path="/pag_gen_list_ville" element={<P_GenerarListaVille/>} /> 
            </Routes> 
        </MantineProvider>
    );
}