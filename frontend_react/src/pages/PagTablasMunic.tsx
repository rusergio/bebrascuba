import { Route, Routes } from 'react-router-dom';
import { TablaEscuelaMunic } from '../components/TablaEscuelaMunic';
import { TablaProfesMunic } from '../components/TablaProfesMunic';
import PagNotFound from './PagNotFound';

export default function PagTablasMunic() {
    return (
        <Routes>
            <Route path="/tabla-esc-munic" element={<TablaEscuelaMunic />} />
            <Route path="/tabla-prof-munic" element={<TablaProfesMunic />} />
            <Route path="*" element={<PagNotFound />} />
        </Routes>
    );
}
