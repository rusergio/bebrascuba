import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import PagError from '../pages/PagError';
import PagNotFound from '../pages/PagNotFound';
import PagMiPerfil from '../pages/PagMiPerfil';
import PagAcceso from '../pages/PagAcceso';
import PagGestionarCuenta from '../pages/PagGestionarCuenta';
import PagGeoBebras from '../pages/PagGeoBebras';
import PagGestionAlumnos from '../pages/PagGestionAlumnos';
import PagGestionConcurso from '../pages/PagGestionConcurso';
import PagGestionEscuela from '../pages/PagGestionEscuela';
import PagGestionMunic from '../pages/PagGestionMunic';
import PagInicial from '../pages/PagInicial';
import PagRecurso from '../pages/PagRecurso';
import PagSolicCoodMunic from '../pages/PagSolicCoordMunic';
import PagSolicCoordProvinc from '../pages/PagSolicCoordProvinc';
import PagSolicitudes from '../pages/PagSolicitudes';
import PagSolicRegist from '../pages/PagSolicRegist';
import { ConfirmEmail } from '../components/ConfirmEmail';
import { RecuperarContrasenia } from '../components/RecuperarContrasenia';
import PagAdmin from '../pages/PagAdmin';
import { GestionarRecurso } from '../components/GestionarRecurso';
import { CambiarClave } from '../components/CambiarClave';
import { CambiarContrasenia } from '../components/CambiarContrasenia';
import PagUsuarios from '../pages/PagUsuarios';
import PagTablasMunic from '../pages/PagTablasMunic';
import PagTablasProvinc from '../pages/PagTablasProvinc';
import PagAsignarRol from '../pages/PagAsignarRol';
import PagDashboardProfesor from '../pages/profesor/PagDashboardProfesor';
import PagMisCertificados from '../pages/profesor/PagMisCertificados';
import PagResultadosProfesor from '../pages/profesor/PagResultadosProfesor';
import PagDashboardCoordinador from '../pages/coordinador/PagDashboardCoordinador';
import PagImportarResultados from '../pages/coordinador/PagImportarResultados';
import PagCalcularMedallas from '../pages/coordinador/PagCalcularMedallas';
import PagPlantillasCertificados from '../pages/coordinador/PagPlantillasCertificados';
import PagResultadosPendientes from '../pages/coordinador/PagResultadosPendientes';
import PagCertificadosColaboradores from '../pages/coordinador/PagCertificadosColaboradores';
import PagCertificadosHistoricos from '../pages/coordinador/PagCertificadosHistoricos';

export const router = createBrowserRouter([  
    {  
        path: "/",  
        element: <App />,  
        errorElement: <PagError />,  
        children: [  
            { path: "/", element: <PagInicial /> },
            { path: "/acceso", element: <PagAcceso /> },
            { path: "/registro", element: <PagSolicRegist /> },
            { path: "/gestionar_escuela", element: <PagGestionEscuela /> },
            { path: "/gestionar_concurso", element: <PagGestionConcurso /> },
            { path: "/recurso", element: <PagRecurso /> },
            { path: "/gestionar_alumnos", element: <PagGestionAlumnos /> },
            { path: "/geobebras", element: <PagGeoBebras /> },
            { path: "/gestionar_municipios", element: <PagGestionMunic /> },
            { path: "/mi_perfil", element: <PagMiPerfil /> },
            { path: "/gestionar_cuenta", element: <PagGestionarCuenta /> },
            { path: "/editar_cuenta", element: <PagGestionarCuenta /> },
            { path: "/solicitudes", element: <PagSolicitudes /> },
            { path: "/solic_coord_provinc", element: <PagSolicCoordProvinc /> },
            { path: "/solic_coord_munic", element: <PagSolicCoodMunic /> },
            { path: "/confirmar-email", element: <ConfirmEmail /> },  
            { path: "/recuperar-senia", element: <RecuperarContrasenia /> },  
            { path: "/admin_concurso", element: <PagAdmin /> },
            { path: "/gestor-recurso", element: <GestionarRecurso /> },
            { path: "/cambiar-clave", element: <CambiarClave /> },
            { path: "/cambiar-contrasenia", element: <CambiarContrasenia /> },
            { path: "/usuarios", element: <PagUsuarios /> },
            { path: "/asignar-rol", element: <PagAsignarRol /> },
            { path: "/pag-munic/*", element: <PagTablasMunic /> },
            { path: "/pag-provinc/*", element: <PagTablasProvinc /> },
            { path: "/pag-gest-alumnos/*", element: <PagGestionAlumnos />},
            { path: "/profesor/dashboard", element: <PagDashboardProfesor /> },
            { path: "/profesor/resultados", element: <PagResultadosProfesor /> },
            { path: "/profesor/mis-certificados", element: <PagMisCertificados /> },
            { path: "/coordinador/dashboard", element: <PagDashboardCoordinador /> },
            { path: "/coordinador/importar-resultados", element: <PagImportarResultados /> },
            { path: "/importar-resultados", element: <PagImportarResultados /> },
            { path: "/coordinador/calcular-medallas", element: <PagCalcularMedallas /> },
            { path: "/calcular-medallas", element: <PagCalcularMedallas /> },
            { path: "/coordinador/plantillas-certificados", element: <PagPlantillasCertificados /> },
            { path: "/plantillas-certificados", element: <PagPlantillasCertificados /> },
            { path: "/coordinador/resultados-pendientes", element: <PagResultadosPendientes /> },
            { path: "/coordinador/certificados-colaboradores", element: <PagCertificadosColaboradores /> },
            { path: "/coordinador/certificados-historicos", element: <PagCertificadosHistoricos /> },
            { path: "*", element: <PagNotFound />, handle: { isNotFound: true } },
        ],  
    },  
    
]);