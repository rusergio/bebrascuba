import { Anchor, Box, Container, Text, Tooltip } from '@mantine/core';
import {
    IconBrandFacebook,
    IconBrandTelegram,
    IconBrandWhatsapp,
    IconDeviceMobile,
    IconExternalLink,
    IconMail,
    IconPhone,
} from '@tabler/icons-react'; 
import classes from '../styles/PiePagina.module.css';
import logoBebrasCuba from '../assets/logobebrascuba.png';
import logoUCLV from '../assets/UCLV.png';

const SITIOS = [
    {
        label: 'Bebras',
        hint: 'Sitio internacional',
        href: 'https://www.bebras.org/',
    },
    {
        label: 'MINED',
        hint: 'Ministerio de Educación',
        href: 'https://www.mined.gob.cu/',
    },
    {
        label: 'UCLV',
        hint: 'Universidad Central de Las Villas',
        href: 'https://www.uclv.edu.cu/',
    },
] as const;

const REDES = [
    {
        name: 'WhatsApp',
        href: 'https://wa.me/5352488305',
        icon: IconBrandWhatsapp,
        className: classes.socialBtnWhatsapp,
        ariaLabel: 'Contactar por WhatsApp',
    },
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/bebrascuba',
        icon: IconBrandFacebook,
        className: classes.socialBtnFacebook,
        ariaLabel: 'Seguir en Facebook',
    },
    {
        name: 'Telegram',
        href: 'https://t.me/bebrascuba',
        icon: IconBrandTelegram,
        className: classes.socialBtnTelegram,
        ariaLabel: 'Unirse al canal de Telegram',
    },
] as const;

export function PiePagina() {
    const year = new Date().getFullYear();

    return (
        <footer className={classes.footer}>
            <Box className={classes.footerGlow} aria-hidden />

            <Container size="lg" className={classes.inner}>
                {/* Marca */}
                <div className={classes.brand}>
                    <div className={classes.logos}>
                        <img src={logoBebrasCuba} alt="BebrasCuba" className={classes.logoImg} />
                        <img src={logoUCLV} alt="UCLV" className={classes.logoImg} />
                    </div>
                    <Text className={classes.description}>
                        <span className={classes.highlight}>BebrasCuba</span> — plataforma oficial para la
                        gestión del concurso de pensamiento computacional en Cuba.
                    </Text>
                </div>

                {/* Enlaces */}
                <div>
                    <Text className={classes.columnTitle}>Sitios de interés</Text>
                    <nav className={classes.linkList} aria-label="Sitios de interés">
                        {SITIOS.map((sitio) => (
                            <Anchor
                                key={sitio.href}
                                href={sitio.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={classes.linkItem}
                            >
                                <IconExternalLink size={14} stroke={1.6} />
                                <span>
                                    <span className={classes.linkLabel}>{sitio.label}</span>
                                    {' · '}
                                    {sitio.hint}
                                </span>
                            </Anchor>
                        ))}
                    </nav>
                </div>

                {/* Contacto */}
                <div>
                    <Text className={classes.columnTitle}>Contacto</Text>
                    <div className={classes.contactList}>
                        <div className={classes.contactItem}>
                            <span className={classes.contactIcon}>
                                <IconMail size={16} stroke={1.6} />
                            </span>
                            <Anchor
                                href="mailto:bebrascuba@uclv.cu"
                                className={classes.contactLink}
                            >
                                bebrascuba@uclv.cu
                            </Anchor>
                        </div>
                        <div className={classes.contactItem}>
                            <span className={classes.contactIcon}>
                                <IconPhone size={16} stroke={1.6} />
                            </span>
                            <Text component="span">+53 42281515</Text>
                        </div>
                        <div className={classes.contactItem}>
                            <span className={classes.contactIcon}>
                                <IconDeviceMobile size={16} stroke={1.6} />
                            </span>
                            <Text component="span">+53 52488305</Text>
                        </div>
                    </div>
                </div>

                {/* Redes sociales */}
                <div>
                    <Text className={classes.columnTitle}>Redes sociales</Text>
                    <Text className={classes.socialText}>
                        Síguenos para novedades del concurso, convocatorias y materiales de apoyo.
                    </Text>
                    <div className={classes.socialIcons} role="list" aria-label="Redes sociales">
                        {REDES.map((red) => (
                            <Tooltip key={red.name} label={red.name} withArrow position="top">
                                <Anchor
                                    href={red.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${classes.socialBtn} ${red.className}`}
                                    aria-label={red.ariaLabel}
                                    role="listitem"
                                >
                                    <red.icon size={22} stroke={1.5} />
                                </Anchor>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </Container>

            <Container size="lg" className={classes.afterFooter}>
                <Text className={classes.copyright}>
                    © {year}{' '}
                    <span className={classes.copyrightBrand}>BEBRASCUBA</span>
                    {' · '}Todos los derechos reservados
                </Text>
                <Text className={classes.tagline}>
                    Universidad Central «Marta Abreu» de Las Villas
                </Text>
            </Container>
        </footer>
    );
}
