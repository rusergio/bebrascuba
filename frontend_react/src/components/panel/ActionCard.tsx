import { Badge, Button, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from '../../styles/PanelModules.module.css';

interface ActionCardProps {
    icon: TablerIcon;
    color: string;
    title: string;
    description: string;
    to: string;
    buttonLabel: string;
    buttonVariant?: 'filled' | 'light' | 'gradient';
    soon?: boolean;
}

export function ActionCard({
    icon: Icon,
    color,
    title,
    description,
    to,
    buttonLabel,
    buttonVariant = 'light',
    soon = false,
}: ActionCardProps) {
    return (
        <Paper radius="lg" p="lg" withBorder shadow="sm" className={classes.actionCard}>
            <Stack gap="md" h="100%" justify="space-between">
                <div>
                    <ThemeIcon size={44} radius="md" variant="light" color={color} mb="sm">
                        <Icon size={22} />
                    </ThemeIcon>
                    <GroupTitle title={title} soon={soon} />
                    <Text size="sm" c="dimmed" mt="xs" lh={1.5}>
                        {description}
                    </Text>
                </div>
                <Button
                    component={Link}
                    to={to}
                    variant={buttonVariant === 'gradient' ? 'gradient' : buttonVariant}
                    gradient={buttonVariant === 'gradient' ? { from: color, to: 'indigo', deg: 90 } : undefined}
                    color={buttonVariant === 'light' ? color : undefined}
                    radius="md"
                    fullWidth
                >
                    {buttonLabel}
                </Button>
            </Stack>
        </Paper>
    );
}

function GroupTitle({ title, soon }: { title: string; soon?: boolean }) {
    return (
        <Stack gap={4}>
            <Title order={4} lh={1.3}>
                {title}
            </Title>
            {soon && (
                <Badge size="sm" variant="light" color="gray" w="fit-content">
                    Diseño listo · API pendiente
                </Badge>
            )}
        </Stack>
    );
}
