import { Route, Routes } from 'react-router-dom';
import { TablaEscuelaProvinc } from '../components/TablaEscuelaProvinc';
import { TablaProfesProvinc } from '../components/TablaProfesProvinc';
import { SolicitudesCoordProvincial } from '../components/solicitudes/GestionSolicitudesProfesor';
import PagNotFound from './PagNotFound';

export default function PagTablasProvinc() {
    return (
        <Routes>
            <Route path="/tabla-esc-prov" element={<TablaEscuelaProvinc />} />
            <Route path="/tabla-prof-prov" element={<TablaProfesProvinc />} />
            <Route path="/tabla-solic-prof" element={<SolicitudesCoordProvincial />} />
            <Route path="*" element={<PagNotFound />} />
        </Routes>
    );
}
