import {
    Title,
    Text,
    Card,
    SimpleGrid,
    Container,
    rem,
    useMantineTheme,
} from '@mantine/core';
import { IconHelpOctagon, IconBuildingCommunity, IconFriends } from '@tabler/icons-react';
import classes from '../styles/FeaturesCards.module.css';

const mockdata = [
    {
    title: '¿Que es Bebras?',
    description:
        'Es un concurso internacional que tiene como objetivo promover el pensamiento computacional. ',
    icon: IconHelpOctagon,
    },
    {
    title: '¿Quienes pueden participar?',
    description:
        'Actualmente en el concurso pueden participar alumnos de 1º a 12º grado.',
    icon: IconFriends,
    },
    {
    title: '¿Donde se realiza?',
    description:
        'Se realiza en cualquier escuela o institución educacional que ofrece equipos de computo.',
    icon: IconBuildingCommunity,
    },
];

export function FeaturesCards() {
    const theme = useMantineTheme();
    const features = mockdata.map((feature) => (
        <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
            <feature.icon
            style={{ width: rem(50), height: rem(50) }}
            stroke={2}
            color={theme.colors.blue[6]}
            />
            <Text fz="h3" fw={700} className={classes.cardTitle} mt="md">
                {feature.title}
            </Text>
            <Text fz="lg" c="dimmed" mt="sm">
                {feature.description}
            </Text>
        </Card>
    ));

    return (
        <Container size="lg" py="xl">
            <Title order={1}  ta="center" mt="sm">
                Explicación sobre Bebras
            </Title>
            <Text c="dimmed" className={classes.description} ta="center" mt="md"></Text>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
                {features}
            </SimpleGrid>
        </Container>
    );
}