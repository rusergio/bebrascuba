import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from '../../styles/PanelModules.module.css';

interface ModuleHeroProps {
    badge: string;
    title: string;
    subtitle: string;
    backTo?: string;
    backLabel?: string;
    gradient?: 'blue' | 'violet' | 'teal' | 'orange' | 'yellow' | 'indigo';
}

export function ModuleHero({
    badge,
    title,
    subtitle,
    backTo,
    backLabel = 'Volver al panel',
    gradient = 'blue',
}: ModuleHeroProps) {
    return (
        <Paper radius="lg" p="xl" mb="lg" className={`${classes.hero} ${classes[`hero_${gradient}`]}`}>
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <Stack gap="xs" maw={560}>
                    <Text size="xs" tt="uppercase" fw={700} c="white" opacity={0.85} lts={1}>
                        {badge}
                    </Text>
                    <Title order={2} c="white">
                        {title}
                    </Title>
                    <Text c="white" opacity={0.92} size="sm">
                        {subtitle}
                    </Text>
                </Stack>
                {backTo && (
                    <Button
                        component={Link}
                        to={backTo}
                        variant="white"
                        color="blue"
                        leftSection={<IconArrowLeft size={16} />}
                        radius="md"
                    >
                        {backLabel}
                    </Button>
                )}
            </Group>
        </Paper>
    );
}
