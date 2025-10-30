import { Group, Burger, Container, rem, Menu, UnstyledButton, Text, Title, Avatar, Center, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconStar, IconChevronDown, IconLogout, IconClipboardText, IconEyeglass, IconUser, IconUserShare, IconEyeSearch, IconUsersGroup, IconBuilding, IconClipboardList, IconFileTypeDoc, IconMessage, IconAdjustments, IconUserPlus, IconUsersPlus, IconFileDescription, IconUserEdit } from '@tabler/icons-react';
import classes from '../styles/NavbarStyles.module.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import cx from 'clsx';
import { ActionToggle } from './ActionToggle';
import { useUserContext, useUserRoles } from '../context/UserContext';

// Definición de tipos para los enlaces
interface SimpleLink {
    link: string;
    label: string;
}

interface LinkWithSubmenu extends SimpleLink {
    links: {
        link: string;
        label: string;
        icon?: React.ComponentType<any>;
    }[];
}

type NavigationLink = SimpleLink | LinkWithSubmenu;

// Enlaces que SIEMPRE deben aparecer
const commonLinks: NavigationLink[] = [
    { link: '/', label: 'Inicio' },
    { link: '/recurso', label: 'Recurso' },
];

// Definición de enlaces específicos por rol
const roleSpecificLinks = {
    'Profesor': [
        {
            link: '#1',
            label: 'Gestionar Alumnos',
            links: [
                { link: '/pag-gest-alumnos/pag_reinsc-estudiant', label: 'Reinscribir Alumno', icon: IconUserEdit },
                { link: '/pag-gest-alumnos/pag_insc_estudiant', label: 'Inscribir nuevo Alumno', icon: IconUsersPlus },
                { link: '/pag-gest-alumnos/pag_gen_list_ville', label: 'Generar listado para Ville', icon: IconFileDescription },
            ],
        }
    ],
    'Coordinador provincial': [
        {
            link: '#1',
            label: 'Gestionar Provincia',
            links: [
                { link: '/pag-provinc/tabla-esc-prov', label: 'Ver escuelas de la provincia', icon: IconBuilding },
                { link: '/pag-provinc/tabla-prof-prov', label: 'Ver profesores de la provincia', icon: IconUsersGroup },
                { link: '/pag-provinc/tabla-solic-prof', label: 'Ver Solicitud de Profesores', icon: IconEyeglass },
            ],
        },
    ],
    'Coordinador Municipal': [
        {
            link: '#1',
            label: 'Gestionar Municipio',
            links: [
                { link: '/gestionar_escuela', label: 'Registrar escuela', icon: IconClipboardText },
                { link: '/pag-munic/tabla-esc-munic', label: 'Ver escuelas del municipio', icon: IconBuilding },
                { link: '/pag-munic/tabla-prof-munic', label: 'Ver profesores del municipio', icon: IconUsersGroup },
            ],
        },
    ],
    'Coordinador Nacional': [
        {
            link: '#1',
            label: 'Gestionar Concurso',
            links: [
                { link: '/gestionar_concurso', label: 'Edición', icon: IconClipboardList },
                { link: '/gestor-recurso', label: 'Recursos', icon: IconFileTypeDoc },
                { link: '/solicitudes', label: 'Solicitudes', icon: IconMessage },
                { link: '/configuracion', label: 'Configuración', icon: IconAdjustments },
            ],
        },
    ],
    'Administrador': [
        {
            link: '#1',
            label: 'Administrar Cuentas',
            links: [
                { link: '/admin_concurso', label: 'Registrar nuevo usuario', icon: IconUserPlus },
                { link: '/admin_concurso', label: 'Asignar rol', icon: IconUserShare },
                { link: '/usuarios', label: 'Ver usuarios registrados', icon: IconEyeSearch },
            ],
        },
    ],
};

const getUserProfilePath = () => {
    return '/mi_perfil';
};

export function UnifiedNavbar() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const navigate = useNavigate();
    const { user } = useUserContext();
    const { roles: userRoles, activeRole } = useUserRoles();

    const getAllUserLinks = (): NavigationLink[] => {
        const currentActiveRole = activeRole;
        let currentRoles = currentActiveRole ? [currentActiveRole] : userRoles;

        if (currentRoles.length === 0) {
            const localStorageRole = localStorage.getItem('userRole');
            if (localStorageRole) {
                currentRoles = [localStorageRole];
            }
        }

        const allLinks = new Map<string, NavigationLink>();

        commonLinks.forEach(link => {
            allLinks.set(link.label, link);
        });

        currentRoles.forEach(role => {
            const roleLinksForRole = roleSpecificLinks[role as keyof typeof roleSpecificLinks];
            if (roleLinksForRole) {
                roleLinksForRole.forEach((link: NavigationLink) => {
                    if (!allLinks.has(link.label)) {
                        allLinks.set(link.label, link);
                    }
                });
            }
        });

        return Array.from(allLinks.values());
    };

    const userLinks = getAllUserLinks();

    const logout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userLastName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');

            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un problema al cerrar sesión. Inténtalo nuevamente.');
        }
    };

    // Renderizar items desktop
    const renderNavItems = () => {
        return userLinks.map((link) => {
            if ('links' in link) {
                const menuItems = link.links.map((item) => (
                    <Menu.Item
                        key={item.link}
                        leftSection={item.icon ? <item.icon style={{ width: rem(16), height: rem(16) }} /> : undefined}
                        component={Link}
                        to={item.link}
                    >
                        {item.label}
                    </Menu.Item>
                ));

                return (
                    <Menu
                        key={link.label}
                        trigger="hover"
                        transitionProps={{ exitDuration: 0 }}
                        withinPortal
                    >
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
                            {menuItems}
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
    };

    // Renderizar items mobile
    const renderMobileItems = () => {
        return userLinks.map((link) => {
            if ('links' in link) {
                return (
                    <div key={link.label}>
                        <Text className={classes.mobileSubmenuLabel}>
                            {link.label}
                        </Text>
                        <div className={classes.mobileSubmenu}>
                            {link.links.map((item) => (
                                <Link
                                    key={item.link}
                                    to={item.link}
                                    className={classes.mobileSubmenuItem}
                                    onClick={close}
                                >
                                    {item.icon && <item.icon style={{ width: rem(18), height: rem(18) }} />}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            }

            return (
                <Link
                    key={link.label}
                    to={link.link}
                    className={classes.mobileLink}
                    onClick={close}
                >
                    {link.label}
                </Link>
            );
        });
    };

    const userName = localStorage.getItem('userName') || user?.nombre || 'Usuario';
    const userProfilePath = getUserProfilePath();

    return (
        <header className={classes.header}>
            <Container size="lg">
                <div className={classes.inner}>
                    <Title order={3}>BEBRAS<IconStar color='red' size={24} />CUBA</Title>

                    <Group gap={5} visibleFrom="sm" ml={20} mr={20}>
                        {renderNavItems()}
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
                                    className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                                    visibleFrom="sm"
                                >
                                    <Group gap={7}>
                                        <Avatar
                                            src=""
                                            radius="xl"
                                            size={'sm'}
                                        />
                                        <Text fw={500} size="sm" lh={1} mr={3}>
                                            {userName}
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
                                    component={Link}
                                    to={userProfilePath}
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

                        <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
                    </Group>
                </div>

                {/* Mobile Menu */}
                <Collapse in={opened} className={classes.dropdown}>
                    <div className={classes.dropdownInner}>
                        {renderMobileItems()}
                    </div>
                </Collapse>
            </Container>
        </header>
    );
}