import { Accordion, Badge, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconRobot, IconSchool, IconUserCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { FLUJO_RESULTADOS, type ActorFlujo, type PasoFlujoResultados } from '../../config/flujoResultados';
import classes from '../../styles/FlujoResultados.module.css';

const ACTOR_ICON: Record<ActorFlujo, typeof IconUserCheck> = {
    coordinador: IconUserCheck,
    sistema: IconRobot,
    profesor: IconSchool,
};

const ACTOR_COLOR: Record<ActorFlujo, string> = {
    coordinador: 'violet',
    sistema: 'gray',
    profesor: 'blue',
};

const ACTOR_LABEL: Record<ActorFlujo, string> = {
    coordinador: 'Coordinador',
    sistema: 'Sistema',
    profesor: 'Profesor',
};

interface FlujoResultadosPanelProps {
    /** Pasos a resaltar (números 1–10) */
    destacar?: number[];
    /** Solo pasos de cierto actor */
    actor?: ActorFlujo;
    /** Modo compacto: accordion cerrado por defecto */
    compacto?: boolean;
    titulo?: string;
}

function PasoItem({ paso, activo }: { paso: PasoFlujoResultados; activo: boolean }) {
    const Icon = ACTOR_ICON[paso.actor];
    return (
        <div className={`${classes.pasoItem} ${activo ? classes.pasoItemActivo : ''}`}>
            <ThemeIcon size="sm" radius="xl" variant="light" color={ACTOR_COLOR[paso.actor]}>
                <Icon size={14} />
            </ThemeIcon>
            <div className={classes.pasoContent}>
                <Group gap="xs" wrap="wrap">
                    <Text size="sm" fw={600}>
                        {paso.num}. {paso.titulo}
                    </Text>
                    <Badge size="xs" variant="light" color={ACTOR_COLOR[paso.actor]}>
                        {ACTOR_LABEL[paso.actor]}
                    </Badge>
                    {paso.tecnico && (
                        <Text size="xs" c="dimmed" ff="monospace">
                            {paso.tecnico}
                        </Text>
                    )}
                </Group>
                <Text size="xs" c="dimmed" lh={1.5} mt={2}>
                    {paso.descripcion}
                    {paso.ruta && (
                        <>
                            {' '}
                            <Text component={Link} to={paso.ruta} size="xs" c="blue" span inherit>
                                Ir →
                            </Text>
                        </>
                    )}
                </Text>
            </div>
        </div>
    );
}

export function FlujoResultadosPanel({
    destacar = [],
    actor,
    compacto = true,
    titulo = 'Flujo general de resultados',
}: FlujoResultadosPanelProps) {
    const pasos = actor ? FLUJO_RESULTADOS.filter((p) => p.actor === actor) : FLUJO_RESULTADOS;

    const contenido = (
        <Stack gap="xs">
            <Text size="sm" c="dimmed" mb="xs">
                Los resultados pasan por <strong>resultados_pendientes</strong> (revisión) antes de quedar
                oficiales en <strong>estudiante_escuela</strong>.
            </Text>
            {pasos.map((paso) => (
                <PasoItem key={paso.num} paso={paso} activo={destacar.includes(paso.num)} />
            ))}
        </Stack>
    );

    if (compacto) {
        return (
            <Paper withBorder radius="md" p="md" className={classes.panel}>
                <Accordion variant="contained" radius="md" defaultValue={destacar.length ? 'flujo' : null}>
                    <Accordion.Item value="flujo">
                        <Accordion.Control>
                            <Text fw={600} size="sm">
                                {titulo}
                            </Text>
                        </Accordion.Control>
                        <Accordion.Panel>{contenido}</Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Paper>
        );
    }

    return (
        <Paper withBorder radius="md" p="lg" className={classes.panel}>
            <Text fw={600} mb="md">
                {titulo}
            </Text>
            {contenido}
        </Paper>
    );
}
