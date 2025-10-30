import { Text, Container, ActionIcon, Group, rem, Title, Anchor, Tooltip, Image  } from '@mantine/core';
import { IconBrandFacebook, IconBrandTelegram, IconBrandWhatsapp, IconDeviceMobile, IconMail, IconPhone } from '@tabler/icons-react';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from '../styles/PiePagina.module.css';
import logoBebrasCuba from '../assets/logobebrascuba.png';
import logoUCLV from '../assets/UCLV.png';
export function PiePagina() {
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
                            <Anchor href="https://mantine.dev/" target="_blank" underline="hover">
                            <span className={classes.highlight}>Geobebras</span> - Sitio geo-espacial de BebrasCuba
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
                    © 2024 BEBRASCUBA
                </Text>
                <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
                    <Tooltip arrowOffset={25} arrowSize={8} label="WhatsApp" withArrow position="top-start" transitionProps={{ transition: 'skew-up', duration: 300 }}>
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandWhatsapp style={{ width: rem(20), height: rem(20) }} stroke={1.7} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip arrowOffset={25} arrowSize={8} label="Facebook" withArrow position="top-start" transitionProps={{ transition: 'skew-up', duration: 300 }}>
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandFacebook style={{ width: rem(20), height: rem(20) }} stroke={1.7} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip arrowOffset={25} arrowSize={8} label="Telegram" withArrow position="top-start" transitionProps={{ transition: 'skew-up', duration: 300 }}>
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandTelegram style={{ width: rem(20), height: rem(20) }} stroke={1.7} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Container>
        </footer>
    );
}