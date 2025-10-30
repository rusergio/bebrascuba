import { Group, Burger, Container, rem, Menu, UnstyledButton, Avatar, Text, Center, Title, Button, ActionIcon, Indicator } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../styles/BarNavInicial.module.css';
import classe from '../styles/headerTabs.module.css';
import {
    IconAdjustments,
    IconBrandMantine, IconChevronDown, IconClipboardList, IconFileTypeDoc, IconLogout, IconMessage, IconMessageFilled, IconNotification, IconStar, IconTemplate, IconUser,
    IconUsersGroup
} from '@tabler/icons-react';
import { Link, NavLink } from 'react-router-dom';
import { ActionToggle } from './ActionToggle';
import { useState } from 'react';
import cx from 'clsx';
// import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../context/UserContext';
import { ActionSolic } from './ActionSolic';

// Enlaces de barra de navegación de coordinador nacional
const links = [
    { link: '/', label: 'Inicio' },
    { link: '/recurso', label: 'Recursos'},
    { 
        link: '#1', 
        label: 'Gestionar Concurso',
        links: [
            { link: '/docs', label: <><IconUsersGroup size="0.7rem" />Gestionar Edicion</> },  
            { link: '/resources', label: <><IconUser size="0.7rem" />Gestionar Recursos</> }, 
            { link: '/resources', label: <><IconUser size="0.7rem" />Gestionar Solicitudes</> }, 
        ], 
    },
    { link: '/geobebras', label: 'GeoBebras' },
    ];
// Datos de usuario
// const user = {
//     name: 'Robert Wolfkisser',
//     email: 'janspoon@fighter.dev',
//     // image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png',
// };

export function BarNavCoordNac() {
    const [opened, { toggle }] = useDisclosure(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    // const { setUser } = useUserContext();
    const navigate = useNavigate();
    const { user } = useUserContext(); // Obtener el usuario del contexto
    const logout = async () => {
        try {
            // const token = localStorage.getItem('token'); // Obtén el token del almacenamiento local
            // if (!token) {
            //     throw new Error('Token no encontrado');
            // }
            console.log('Aqui estoy antes de logout')
            // Realiza la petición POST al backend para cerrar sesión
            // await axios.post(
            //     'api/auth/logout', // Cambia según la URL de tu backend
            //     {},
            //     {
            //         headers: {
            //             // Authorization: `Bearer ${token}`, // Autorización con el token
            //         },
            //     }
            // );
            console.log('Logout en execusion')
            // Limpia datos del almacenamiento local
            localStorage.removeItem('token');  // Borra el token
            localStorage.removeItem('userRole'); // Borra el rol del usuario
    
            // Opcional: Si deseas borrar todo el almacenamiento local
            // localStorage.clear();
    
            // Redirige al usuario a la página de inicio o login
            navigate('/');
            window.location.reload();  
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un problema al cerrar sesión. Inténtalo nuevamente.');
        }
    };
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
            <Menu.Label>Gestionar</Menu.Label>
            <Menu.Item leftSection={<IconClipboardList style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/gestionar_concurso">
                Edición
            </Menu.Item>
            <Menu.Item style={{marginRight: rem(50)}} leftSection={<IconFileTypeDoc style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/gestor-recurso">
                Recursos
            </Menu.Item>
            <Menu.Item style={{marginRight: rem(50)}} leftSection={<IconMessage style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/solicitudes">
                Solicitudes
            </Menu.Item>
            <Menu.Item style={{marginRight: rem(50)}} leftSection={<IconAdjustments style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/configuracion">
                Configuración
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

    return (
        <header className={classes.header}>
            <Container size="md">
                <div className={classes.inner}>
                {/* <MantineLogo size={28} /> */}
                <Title order={4}>BEBRAS<IconStar color='red' size={20} />CUBA</Title>
                <Group gap={5} visibleFrom="sm" ml={20} mr={20}>
                    {items}
                </Group>
                <Group>
                    {/* <Indicator inline label="158" size={16}>
                        <ActionSolic />
                    </Indicator> */}
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
                                    radius="xl" size={25}
                                    // color='dark'
                                />
                                {/* <Avatar color="dark" radius="xl" size={30} fw={600}>D</Avatar> */}
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
                                // disabled
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
                                // component={Link} to="/acceso"
                                onClick={logout} // Llama a la función de logout
                            >
                                Cerrar sección
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