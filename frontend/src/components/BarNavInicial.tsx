import { Menu, Group, Center, Burger, Container, rem, Button, Title, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconUsersGroup, IconUser, IconLogin2, IconStar } from '@tabler/icons-react';
import classes from '../styles/NavbarStyles.module.css';
import { Link, NavLink } from 'react-router-dom';
import { ActionToggle } from './ActionToggle';
import { useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';

const links = [
    { link: '/', label: 'Inicio' },
    { link: '/recurso', label: 'Recursos' },
    {
        link: '#1',
        label: 'Solicitar Registro',
        links: [
            { link: '/docs', label: 'Colaborador', icon: IconUsersGroup },
            { link: '/resources', label: 'Profesor', icon: IconUser },
        ],
    },
    { link: '/geobebras', label: 'GeoBebras' },
];

export function BarNavInicial() {
    const [isEditionOpen, setIsEditionOpen] = useState(false);
    const [opened, { toggle, close }] = useDisclosure(false);

    useEffect(() => {
        const checkEditionState = async () => {
            try {
                const response = await axios.get('api/edicion/esta-abierta');
                setIsEditionOpen(response.data.is_open);
            } catch (error) {
                console.error("Error al verificar el estado de la edición:", error);
            }
        }
        checkEditionState();
    }, []);

    const renderDesktopItems = () => {
        return links.map((link) => {
            if (link.links) {
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
                            <Menu.Label>Registrar como</Menu.Label>
                            <Menu.Item disabled leftSection={<IconUsersGroup style={{ width: rem(14), height: rem(14) }} />}>
                                Colaborador
                            </Menu.Item>
                            {isEditionOpen ? (
                                <Menu.Item
                                    leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                                    component={Link}
                                    to="/registro"
                                >
                                    Profesor
                                </Menu.Item>
                            ) : (
                                <Menu.Item
                                    leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                                    disabled
                                >
                                    Profesor
                                </Menu.Item>
                            )}
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

    const renderMobileItems = () => {
        return links.map((link) => {
            if (link.links) {
                return (
                    <div key={link.label}>
                        <div className={classes.mobileSubmenuLabel}>{link.label}</div>
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

    return (
        <header className={classes.header}>
            <Container size="lg">
                <div className={classes.inner}>
                    <Title order={3}>BEBRAS<IconStar color='blue' size={24} />CUBA</Title>
                    
                    <Group gap={5} visibleFrom="sm">
                        {renderDesktopItems()}
                    </Group>
                    
                    <Group justify="center">
                        <ActionToggle />
                        <Button 
                            radius={6} 
                            rightSection={<IconLogin2 size={16} />} 
                            size='sm' 
                            variant='outline' 
                            component={Link} 
                            to="/acceso"
                            visibleFrom="sm"
                        >
                            Iniciar Sesión
                        </Button>
                        <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
                    </Group>
                </div>

                {/* Mobile Menu */}
                <Collapse in={opened} className={classes.dropdown}>
                    <div className={classes.dropdownInner}>
                        {renderMobileItems()}
                        <Button 
                            fullWidth
                            radius={6} 
                            rightSection={<IconLogin2 size={16} />} 
                            size='sm' 
                            variant='outline' 
                            component={Link} 
                            to="/acceso"
                            onClick={close}
                            mt="md"
                        >
                            Iniciar Sesión
                        </Button>
                    </div>
                </Collapse>
            </Container>
        </header>
    );
}