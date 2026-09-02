import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
// Estructura de la aplicación 
import '@mantine/notifications/styles.css';
import { AnimatedOutlet } from './components/AnimatedOutlet';
import { PiePagina } from './components/PiePagina';
import { BarNavInicial } from './components/BarNavInicial';
import { UnifiedNavbar } from './components/UnifiedNavbar';
import '@mantine/dates/styles.css';
import { useUserRoles } from './context/UserContext';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useLocation, useMatches } from 'react-router-dom';

const IMMERSIVE_AUTH_PATHS = ['/acceso', '/registro', '/cambiar-clave', '/recuperar-senia', '/cambiar-contrasenia'];

export default function App() {
  const { roles: userRoles } = useUserRoles();
  const { pathname } = useLocation();
  const isNotFound = useMatches().some(
    (match) => (match.handle as { isNotFound?: boolean } | undefined)?.isNotFound,
  );
  const isImmersiveAuth = IMMERSIVE_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const hideChrome = isImmersiveAuth || isNotFound;

  const showUnifiedNavbar = userRoles.length > 0 && !hideChrome;
  const showInitialNavbar = userRoles.length === 0 && !hideChrome;

  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider defaultColorScheme="auto">
      <ModalsProvider>
        <Notifications  position="top-right" />
        {showUnifiedNavbar && <UnifiedNavbar />}
        {showInitialNavbar && <BarNavInicial />}
        
        <AnimatedOutlet />
        
        {!hideChrome && <PiePagina />}
      </ModalsProvider>
      </MantineProvider>
    </>
  );
}
