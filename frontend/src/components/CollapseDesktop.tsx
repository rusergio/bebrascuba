import { AppShell, Burger, Group, Skeleton, rem, Container, Menu, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import PagInicial from '../pages/PagInicial';
import { PiePagina } from './PiePagina';
import { NavbarSegmented } from './NavbarSegmented';
// import { MantineLogo } from '@mantinex/mantine-logo';
import { IconBrandMantine, IconUsersGroup, IconUser, IconChevronDown } from '@tabler/icons-react';
import classes from '../styles/BarNavInicial.module.css';

import { Link, NavLink } from 'react-router-dom';

const links = [
  { link: '/', label: 'Inicio' },
  { link: '/about', label: 'Recurso' },
  {
      link: '#1', 
      label: 'Solicitar Registro',
      links: [
          { link: '/docs', label: <><IconUsersGroup size="0.7rem" /> Colaborador</> },  
          { link: '/resources', label: <><IconUser size="0.7rem" /> Profesor</> }, 
      ],
  },
  { link: '/about', label: 'GeoBebras' },
  { link: '/acceso', label: 'Iniciar Sección' },
  
  ];

export function CollapseDesktop() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [opened, { toggle }] = useDisclosure(false);

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
        <Menu.Label>Registrar como</Menu.Label>
        <Menu.Item disabled leftSection={<IconUsersGroup style={{ width: rem(14), height: rem(14) }} />}>
            Colaborador  
        </Menu.Item>
        <Menu.Item style={{marginRight: rem(50)}} leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />} component={Link} to="/registro">
            Profesor   
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
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 316,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          {/* <MantineLogo size={30} /> */}
          
          <header className={classes.header}>
            <Container size="md">
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
                
                <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
                </div>
            </Container>
        </header>
          
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavbarSegmented />
        
      </AppShell.Navbar>
      <AppShell.Main>
        <PagInicial />
        <PiePagina />
      </AppShell.Main>
      
    </AppShell>
  );
}