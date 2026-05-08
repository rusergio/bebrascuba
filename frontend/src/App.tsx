import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
// Estructura de la aplicación 
import '@mantine/notifications/styles.css';
import { Outlet } from 'react-router-dom';
import { PiePagina } from './components/PiePagina';
import { BarNavInicial } from './components/BarNavInicial';
import { UnifiedNavbar } from './components/UnifiedNavbar';
import { useState } from 'react';  
import '@mantine/dates/styles.css';
import { LogoImage } from './components/LogoImage';
import { useEffect } from 'react';
import { useUserContext, useUserRoles } from './context/UserContext';
import { Notifications } from '@mantine/notifications';
// import { useUserContext } from './utils/UserContext';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

import { ModalsProvider } from '@mantine/modals';

export default function App() {
  const { user } = useUserContext();
  const { roles: userRoles } = useUserRoles();
  const [userRole, setUserRole] = useState<string>(user?.roles?.[0]?.rol || '');

  useEffect(() => {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
          setUserRole(storedRole);
          console.log(storedRole);
          console.log('Usuario entro en el sistema')
      }
  }, []);

  // Determinar si mostrar la barra de navegación unificada o la inicial
  const showUnifiedNavbar = userRole && userRoles.length > 0;
  const showInitialNavbar = !userRole || userRoles.length === 0;

  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider defaultColorScheme="auto">
      <ModalsProvider>
        <Notifications  position="top-right" />
        <LogoImage src={''} alt={''} />
        
        {/* Encabezado - Barra de navegación unificada */}
        {showUnifiedNavbar && <UnifiedNavbar />}
        {showInitialNavbar && <BarNavInicial />}
        
        {/* Navegación */}
        <Outlet />
        
        {/* Pie de Pagina */}
        <PiePagina />
      </ModalsProvider>
      </MantineProvider>
    </>
  );
}