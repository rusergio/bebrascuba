import { Text, Container, Group, Title, Anchor, Menu, UnstyledButton, useMantineTheme } from '@mantine/core';
import { Image } from '@mantine/core';
import { IconBrandFacebook, IconBrandTelegram, IconBrandWhatsapp, IconDeviceMobile, IconMail, IconPhone, IconChevronDown, IconShare } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from '../styles/PiePagina.module.css';
import logoBebrasCuba from '../assets/logobebrascuba.png';
import logoUCLV from '../assets/UCLV.png';
export function PiePagina() {
    const theme = useMantineTheme();
    const [socialMenuOpened, { open: openSocialMenu, close: closeSocialMenu }] = useDisclosure(false);

    return (
        <footer className={classes.footer}>
            <Container className={classes.inner}>
                <div className={classes.logo}>
                    <Group>
                        <Image
                            h={50}
                            w="auto"
                            fit="contain"
                            src={logoBebrasCuba}
                        />
                        <Image
                            h={50}
                            w="auto"
                            fit="contain"
                            src={logoUCLV}
                        />
                    </Group>
                    
                    <Text size="sm" c="dimmed" className={classes.description}>
                        <span className={classes.highlight}>BebrasCuba</span>
                        plataforma web para gestión del concurso, rápido y facil de usar.
                    </Text>
                </div>
                <div className={classes.groups}>
                    <div>  
                        <Title order={3} mb={5}>Sitios</Title>  
                        <Group align="center">  
                            <Anchor href="https://www.bebras.org/" target="_blank" underline="hover">
                            <span className={classes.highlight}>Bebras</span> - Sitio internacional de Bebras
                            </Anchor>
                        </Group>  
                        <Group align="center">  
                            <Anchor href="https://www.mined.gob.cu/" target="_blank" underline="hover">
                            <span className={classes.highlight}>MINED</span> - Sitio de ministerio de educacion cubano
                            </Anchor> 
                        </Group>  
                        <Group align="center">  
                            <Anchor href="https://www.uclv.edu.cu/" target="_blank" underline="hover">
                            <span className={classes.highlight}>UCLV</span> - Sitio de Universidad Central de Las Villas 
                            </Anchor>  
                        </Group>    
                    </div>  
                </div>
                <div className={classes.groups}>
                    <div>  
                    <Title order={3} mb={5}>Contacto</Title>  
                    <Group align="center" style={{ gap: '4px', alignItems: 'center' }}>  
                        <IconMail color='gray' size={18} style={{ marginRight: '4px' }}/>
                        <Text size="md" c="dimmed" > dgalvez@uclv.edu.cu</Text>  
                    </Group>  
                    <Group align="center" style={{ gap: '4px', alignItems: 'center' }}>  
                        <IconPhone color='gray'  size={18} />
                        <Text size="md" c="dimmed"> +53 42281156</Text>  
                    </Group>  
                    <Group align="center" style={{ gap: '4px', alignItems: 'center' }}>  
                        <IconDeviceMobile color='gray'  size={18} /> 
                        <Text size="md" c="dimmed">+53 59945580</Text>  
                    </Group>    
                    </div>  
                </div>
            </Container>
            <Container className={classes.afterFooter}>
                <Text fw={700} size="sm" c={'gray'}>
                    © {new Date().getFullYear()} BEBRASCUBA
                </Text>
                <Menu
                    width={260}
                    position="top-end"
                    transitionProps={{ transition: 'pop-top-right' }}
                    onClose={closeSocialMenu}
                    onOpen={openSocialMenu}
                    withinPortal
                >
                    <Menu.Target>
                        <UnstyledButton className={classes.social}>
                            <Group gap={7}>
                                <IconShare size={18} stroke={1.5} />
                                <Text fw={500} size="sm" lh={1}>
                                    Redes Sociales
                                </Text>
                                <IconChevronDown size={12} stroke={1.5} />
                            </Group>
                        </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Síguenos en</Menu.Label>
                        <Menu.Item
                            leftSection={<IconBrandWhatsapp size={16} color={theme.colors.green[6]} stroke={1.5} />}
                            component="a"
                            href="https://wa.me/5359945580"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            WhatsApp
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconBrandFacebook size={16} color={theme.colors.blue[6]} stroke={1.5} />}
                            component="a"
                            href="https://www.facebook.com/bebrascuba"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Facebook
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconBrandTelegram size={16} color={theme.colors.cyan[6]} stroke={1.5} />}
                            component="a"
                            href="https://t.me/bebrascuba"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Telegram
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Container>
        </footer>
    );
}