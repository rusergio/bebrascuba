import { IconAugmentedReality2, IconDeviceGamepad2, IconDevicesPc, IconHorseToy, IconMan, IconPlayHandball } from '@tabler/icons-react';
import { Container, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import classes from '../styles/FeaturesGrid.module.css';

export const MOCKDATA = [
    {
    icon: IconHorseToy,
    title: 'Grupo I',
    description:
    'SuperPeques (PrePrimary) – Estudiantes de los Grados 1º y 2º de Primaria',
    },
    {
        icon: IconMan,
        title: 'Grupo II',
        description:
        'Peques (Primary) – Estudiantes de los Grados 3º y 4º de Primaria',
    },
    {
        icon: IconPlayHandball,
        title: 'Grupo III',
        description:
        'Benjamín – Estudiantes de Grados 5º y 6º de Primaria',
    },
    {
        icon: IconDeviceGamepad2,
        title: 'Grupo VI',
        description:
        ' Cadete – Estudiantes de Grados 7º y 8º de Secundaria Básica',
    },
    {
        icon: IconAugmentedReality2,
        title: 'Grupo V',
        description:
        'Junior – Estudiantes de Grados 9º de Secundaria Básica y 10º de Pre universitario o 1er año de ETP',
    },
    {
        icon: IconDevicesPc,
        title: 'Grupo VI',
        description:
        ' Senior– Estudiantes de Grados 11º y 12º de Pre universitario o de 2do, 3ero y 4to año de ETP',
    },
];

interface FeatureProps {
    icon: React.FC<any>;
    title: React.ReactNode;
    description: React.ReactNode;
}

export function Feature({ icon: Icon, title, description }: FeatureProps) {
    return (
        <div>
            <ThemeIcon variant="light" size={50} radius={40}>
                <Icon size={25} stroke={1.5} />
            </ThemeIcon>
            <Text mt="sm" mb={7} fw={700}>
                {title}
            </Text>
            <Text size="md" c="dimmed" lh={1.6}>
                {description}
            </Text>
        </div>
    );
}

export function FeaturesGrid() {
    const features = MOCKDATA.map((feature, index) => <Feature {...feature} key={index} />);

    return (
        <Container className={classes.wrapper}>
        <Title className={classes.title}>Grupos de competición </Title>
        <Container size={580} p={0}>
            <Text size="sm" className={classes.description} fz={'md'}>
                El desafío Bebras Cuba esta diseñado para los siguientes grupos de competición
            </Text>
        </Container>
        <SimpleGrid
            mt={60}
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing={{ base: 'xl', md: 50 }}
            verticalSpacing={{ base: 'xl', md: 50 }}
        >
            {features}
        </SimpleGrid>
        </Container>
    );
}