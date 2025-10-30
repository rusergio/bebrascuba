import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { TablaUsuarios } from '../components/TablaUsuarios';
import { TablaRoles } from '../components/TablaRoles';

export default function PagUsuarios() {
    return (
        <MantineProvider>
            <TablaUsuarios/>
            <TablaRoles/>
            {/* <TableSort/> */}
        </MantineProvider>
    );
}