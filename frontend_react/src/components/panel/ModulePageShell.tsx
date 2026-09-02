import { Alert, Container, Paper } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { ModuleHero } from './ModuleHero';
import classes from '../../styles/PanelModules.module.css';

interface ModulePageShellProps {
    badge: string;
    title: string;
    subtitle: string;
    backTo?: string;
    backLabel?: string;
    gradient?: 'blue' | 'violet' | 'teal' | 'orange' | 'yellow' | 'indigo';
    children: React.ReactNode;
    showApiNotice?: boolean;
}

export function ModulePageShell({
    badge,
    title,
    subtitle,
    backTo,
    backLabel,
    gradient,
    children,
    showApiNotice = true,
}: ModulePageShellProps) {
    return (
        <Container size="lg" py="xl">
            <ModuleHero
                badge={badge}
                title={title}
                subtitle={subtitle}
                backTo={backTo}
                backLabel={backLabel}
                gradient={gradient}
            />
            <Paper radius="lg" p="xl" withBorder shadow="sm" className={classes.mainPanel}>
                {showApiNotice && (
                    <Alert
                        icon={<IconInfoCircle size={18} />}
                        title="Interfaz en React"
                        color="blue"
                        variant="light"
                        mb="lg"
                    >
                        Diseño basado en las vistas de prueba del backend. La vinculación con la API se
                        implementará en la siguiente fase.
                    </Alert>
                )}
                {children}
            </Paper>
        </Container>
    );
}
