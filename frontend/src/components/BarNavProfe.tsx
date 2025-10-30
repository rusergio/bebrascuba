import { Group, Burger, Container, rem, Menu, UnstyledButton, Text, Title, Avatar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconStar } from '@tabler/icons-react';
import classes from '../styles/BarNavInicial.module.css';
// import classe from '../styles/headerTabs.module.css';
import {
    IconChevronDown, IconLogout, IconUser
} from '@tabler/icons-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useState } from 'react';
import cx from 'clsx';
import axios from 'axios'; 
import { ActionToggle } from './ActionToggle';
// import { useUserContext } from '../context/UserContext';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

// Enlaces de Barra de navegacion
const links = [
{ link: '/', label: 'Inicio' },
{ link: '/recurso', label: 'Recurso' },
{ link: '/gestionar_alumnos', label: 'Gestionar Alumnos'},
{ link: '/geobebras', label: 'GeoBebras' },
// { link: '/geobebras', label: 'Certificado' , disabled: true },
];


export function BarNavProfe() {
    const [opened, { toggle }] = useDisclosure(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const navigate = useNavigate();
    // const {user, setUser} = useUserContext();

    const logout = async () => {
        try {
            console.log('Aqui estoy antes de logout')
            console.log('Logout en execusion')
            // Limpia datos del almacenamiento local
            // localStorage.removeItem('token');  // Borra el token
            localStorage.removeItem('userRole'); 
            localStorage.removeItem('userName'); 
            localStorage.removeItem('userLastName'); 
            localStorage.removeItem('userEmail'); 
            localStorage.removeItem('userId'); 
            // setUser(null);
            // Redirige al usuario a la página de inicio o login
            navigate('/');
            window.location.reload();  
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un problema al cerrar sesión. Inténtalo nuevamente.');
        }
    };
    
    const items = links.map((link) => {   
        return (  
        <NavLink key={link.label} to={link.link} className={classes.link}>  
            {link.label}  
        </NavLink>  
        );  
    });

    return (
        <header className={classes.header}>
            <Container size="md" >
                <div className={classes.inner}>
                    <Title order={4}>BEBRAS<IconStar color='red' size={20} />CUBA</Title>
                    <Group gap={5} visibleFrom="sm">
                        {items}
                    </Group>
                    {/* Grupo de usuario */}
                    <Group>
                        <ActionToggle />
                        {/* Menu de usuario */}
                        <Menu
                            width={260}
                            position="bottom-end"
                            transitionProps={{ transition: 'pop-top-right' }}
                            onClose={() => setUserMenuOpened(false)}
                            onOpen={() => setUserMenuOpened(true)}
                            withinPortal
                        >
                            <Menu.Target>
                            <UnstyledButton
                                className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                            >
                                <Group gap={7}>
                                <Avatar  radius="xl" size={'sm'} />
                                <Text fw={500} size="sm" lh={1} mr={3}>
                                    {localStorage.getItem('userName')}
                                </Text>
                                <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                                </Group>
                            </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                            <Menu.Label>Mi cuenta</Menu.Label>
                            <Menu.Item
                                leftSection={
                                <IconUser style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                }
                                component={Link} to="mi-perfil/profesor"
                            >
                                Mi Perfil
                            </Menu.Item>
                            
                            <Menu.Item
                                color='blue'
                                leftSection={
                                <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                }
                                // component={Link} to='/acceso'
                                onClick={logout}
                            >
                                Cerrar sección
                            </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                    {/*  */}
                    <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
                </div>
            </Container>
        </header>
    );
}