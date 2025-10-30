import '@mantine/core/styles.css';
import { MantineProvider} from '@mantine/core';
import { MiPerfil } from '../components/MiPerfil';
import { EditarCuenta } from '../components/EditarCuenta';
import { Route, Routes } from 'react-router-dom';

export default function PagMiPerfil() {
    return (
        <MantineProvider>
            <Routes>  
                <Route path="/" element={<MiPerfil />} />  
                <Route path="/editar-cuenta" element={<EditarCuenta />} />  
            </Routes>  
        </MantineProvider>
    );
}