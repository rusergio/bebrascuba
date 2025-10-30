import { Button, MantineProvider, Text } from '@mantine/core';
// Estructura de la aplicación 
import '@mantine/notifications/styles.css';
import { Outlet } from 'react-router-dom';
import { PiePagina } from './components/PiePagina';
import { BarNavInicial } from './components/BarNavInicial';
import { UnifiedNavbar } from './components/UnifiedNavbar';
import { useState } from 'react';  
import '@mantine/dates/styles.css';
import { LogoImage } from './components/LogoImage';
import { BarNavProfe } from './components/BarNavProfe';
import { BarNavCoordNac } from './components/BarNavCoordNac';
import { BarNavAdmin } from './components/BarNavAdmin';
import { useEffect } from 'react';
import { NavbarSegmented } from './components/NavbarSegmented';
import { useUserContext, useUserRoles } from './context/UserContext';
import { Notifications } from '@mantine/notifications';
// import { useUserContext } from './utils/UserContext';
import axios from 'axios';
import { MobileNavbar } from './components/MobileNavBar';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

interface RecursoData {  
  id: number;
  nombre: string;  
  descripcion: string;  
  archivo: File | null;  
}

import { ModalsProvider } from '@mantine/modals';
import { useModals } from '@mantine/modals';
import { DeleteAccountButton } from './components/DeleteAccountButton';
import { BarNavCoordProvinc } from './components/BarNavCoordProvinc';
import { BarNavCoordMunic } from './components/BarNavCoordMunic';

function TestModalButton() {
  const modals = useModals();

  const openTestModal = () => {
    modals.openConfirmModal({
      title: 'Prueba de Modal',
      children: (
        <Text size="sm">¡El modal de Mantine está funcionando correctamente!</Text>
      ),
      labels: { confirm: 'Aceptar', cancel: 'Cancelar' },
      onConfirm: () => console.log('Modal confirmado'),
    });
  };

  return (
    <Button onClick={openTestModal} m="md">
      Abrir Modal de Prueba
    </Button>
  );
}


export default function App() {
  const { user } = useUserContext();
  const { roles: userRoles } = useUserRoles();
  const [userRole, setUserRole] = useState<string>(user?.roles?.[0]?.rol || '');
  const [recursos, setRecursos] = useState<RecursoData[]>([]);

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
    <MantineProvider>
      <ModalsProvider>
        <Notifications  position="top-right" />
        <LogoImage src={''} alt={''} />
        
        {/* Botón de prueba - puedes quitarlo después */}
        {/* <TestModalButton /> */}
        
        {/* <DeleteAccountButton /> */}
        {/* Encabezado - Barra de navegación unificada */}
        {showUnifiedNavbar && <UnifiedNavbar />}
        {showInitialNavbar && <BarNavInicial />}
        
        {/* Navegación */}
        <Outlet />
        
        {/* Pie de Pagina */}
        <PiePagina />
      </ModalsProvider>
    </MantineProvider>
  );
}