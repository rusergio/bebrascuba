import { Group, Burger, Container, rem, Menu, UnstyledButton, Text, Center, Title, Avatar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../styles/BarNavInicial.module.css';
import classe from '../styles/headerTabs.module.css';
import { IconChevronDown, IconLogout, IconStar, IconUser, IconUserPlus, IconUsersGroup } from '@tabler/icons-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ActionToggle } from './ActionToggle';
import { useState } from 'react';
import cx from 'clsx';
// import axios from 'axios';
import { useUserContext } from '../context/UserContext';

// Enlaces de barra de navegación de coordinador nacional
const links = [
    { link: '/', label: 'Inicio' },
    { link: '/recurso', label: 'Recurso' },
    { 
        link: '#1', 
        label: 'Administrar concurso',
        links: [
            // { link: '/docs', label: <><IconUsersGroup size="0.7rem" />Gestionar Edicion</> },  
            { link: '/resources', label: <><IconUser size="0.7rem" />Gestionar Recursos</> }, 
            { link: '/resources', label: <><IconUser size="0.7rem" />Gestionar Solicitudes</> }, 
        ], 
    },
    { link: '/geobebras', label: 'GeoBebras' },
    ];

export function BarNavAdmin() {
    const [opened, { toggle }] = useDisclosure(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const navigate = useNavigate();

    const { user } = useUserContext(); // Obtener el usuario del contexto
    // 
    const items = links.map((link) => {  
        const menuItems = link.links?.map((item) => (  
        <Menu.Item key={item.link} component={Link} to={item.link}>  
            {item.label}  
        </Menu.Item>  
        ));  
        if (menuItems) {  
        return (  
            <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>  
            <Menu.Target>  
                <NavLink to={link.link} className={classes.link}>  
                <Center>  
                    <span className={classes.linkLabel}>{link.label}</span>  
                    <IconChevronDown size="0.9rem" stroke={1.5} />  
                </Center>  
                </NavLink>  
            </Menu.Target>  
            <Menu.Dropdown>
            <Menu.Label></Menu.Label>
            <Menu.Item leftSection={<IconUserPlus style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/admin_concurso">
                Registrar nuevo usuario
            </Menu.Item>
            <Menu.Item style={{marginRight: rem(50)}} leftSection={<IconUsersGroup style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/usuarios">
                Ver usuarios registrados
            </Menu.Item>
            </Menu.Dropdown>
            </Menu>  
        );  
        }  

        return (  
        <NavLink key={link.label} to={link.link} className={classes.link}>  
            {link.label}  
        </NavLink>  
        );  
    });
    // 
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
            <Container size="md">
                <div className={classes.inner}>
                {/* <MantineLogo size={28} /> */}
                {/* <IconBrandMantine
                    style={{ width: rem(50), height: rem(50) }}
                    stroke={1.5}
                    color="var(--mantine-color-blue-filled)"
                /> */}
                <Title order={4} c={''}>BEBRAS<IconStar color='red' size={20} />CUBA</Title>
                <Group gap={5} visibleFrom="sm" ml={20} mr={20}>
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
                                <Avatar
                                    src=""
                                    size={'sm'}
                                    radius={120}
                                    mx="auto"
                                />
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
                                component={Link} to="/mi_perfil"
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
                                Cerrar sesión
                            </Menu.Item>
                            </Menu.Dropdown>
                    </Menu>
                </Group>
                <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
                </div>
            </Container>
        </header>
    );
}