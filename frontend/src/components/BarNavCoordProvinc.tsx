import { Group, Burger, Container, rem, Menu, UnstyledButton, Avatar, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {  } from '@tabler/icons-react';
import classes from '../styles/BarNavInicial.module.css';
import classe from '../styles/headerTabs.module.css';
import {
    IconBrandMantine, IconChevronDown, IconLogout, IconUser
} from '@tabler/icons-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ActionToggle } from './ActionToggle';
import { useState } from 'react';
import cx from 'clsx';

// Enlaces de barra de navegación
const links = [
{ link: '/', label: 'Inicio' },
{ link: '/recurso', label: 'Recurso' },
{ link: '/gestionar_municipios', label: 'Gestionar Municipio'},
{ link: '/geobebras', label: 'GeoBebras' },
{ link: '/solic_coord_provinc', label: 'Solicitudes' },
];

// Datos de usuario
const user = {
    name: 'Jeremy Footviewer',
    email: 'janspoon@fighter.dev',
    image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
};

export function BarNavCoordProvinc() {
    const [opened, { toggle }] = useDisclosure(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const navigate = useNavigate();

    const items = links.map((link) => {   
        return (  
        <NavLink key={link.label} to={link.link} className={classes.link}>  
            {link.label}  
        </NavLink>  
        );  
    });

    const logout = async () => {
        try {
            // Limpia datos del almacenamiento local
            localStorage.removeItem('token');  // Borra el token
            localStorage.removeItem('userRole'); 
            localStorage.removeItem('userName'); 
            localStorage.removeItem('userLastName'); 
            localStorage.removeItem('userEmail'); 
            localStorage.removeItem('userId'); 
            // Redirige al usuario a la página de inicio o login
            navigate('/');
            window.location.reload();  
        } catch (error) {
            // console.error('Error al cerrar sesión:', error);
            alert('Hubo un problema al cerrar sesión. Inténtalo nuevamente.');
        }
    };

    return (
        <header className={classes.header}>
            <Container size="md" >
                <div className={classes.inner}>
                    {/* <MantineLogo size={28} /> */}
                    <IconBrandMantine
                        style={{ width: rem(50), height: rem(50) }}
                        stroke={1.5}
                        color="var(--mantine-color-blue-filled)"
                    />
                    <Group gap={5} visibleFrom="sm">
                        {items}
                    </Group>
                    
                    <Group>
                        <ActionToggle />
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
                                className={cx(classe.user, { [classe.userActive]: userMenuOpened })}
                            >
                                <Group gap={7}>
                                <Avatar src={user.image} alt={user.name} radius="xl" size={20} />
                                <Text fw={500} size="sm" lh={1} mr={3}>
                                    {user.name}
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
                                component={Link} to="mi-perfil/coordinador-provincial"
                            >
                                Mi Perfil
                            </Menu.Item>
                            
                            <Menu.Item
                                color='blue'
                                leftSection={
                                <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                }
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