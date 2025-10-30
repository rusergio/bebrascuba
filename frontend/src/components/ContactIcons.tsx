import { Text, Box, Stack, rem } from '@mantine/core';
import { IconSun, IconPhone, IconMapPin, IconAt } from '@tabler/icons-react';
import classes from '../styles/ContactIcons.module.css';

interface ContactIconProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
    icon: typeof IconSun;
    title: React.ReactNode;
    description: React.ReactNode;
}

function ContactIcon({ icon: Icon, title, description, ...others }: ContactIconProps) {
    return (
        <div className={classes.wrapper} {...others}>
        <Box mr="md">
            <Icon style={{ width: rem(24), height: rem(24) }} />
        </Box>

        <div>
            <Text size="xs" className={classes.title}>
            {title}
            </Text>
            <Text className={classes.description}>{description}</Text>
        </div>
        </div>
    );
}

const MOCKDATA = [
    { title: 'Correo electrónico', description: 'hello@mantine.dev', icon: IconAt },
    { title: 'Teléfono', description: '+49 (800) 335 35 35', icon: IconPhone },
    { title: 'Dirección', description: '844 Morris Park avenue', icon: IconMapPin },
    { title: 'Horas de trabajo', description: '8 a.m. – 11 p.m.', icon: IconSun },
];

export function ContactIconsList() {
    const items = MOCKDATA.map((item, index) => <ContactIcon key={index} {...item} />);
    return <Stack>{items}</Stack>;
}