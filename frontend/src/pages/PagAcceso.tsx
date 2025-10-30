import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { LoginLinks } from '../components/LoginLinks';
import { useState } from 'react'; // Asegúrate de importar useState

export default function PagAcceso() {
    const [userRole, setUserRole] = useState(''); // Define el estado para userRole

    return (
        <MantineProvider>
            <LoginLinks />
        </MantineProvider>
    );
}
