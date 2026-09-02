import { Container, Grid, Group, Loader, Paper, SimpleGrid, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { ModuleHero } from '../../components/panel/ModuleHero';
import { ActionCard } from '../../components/panel/ActionCard';
import { profesorModules } from '../../config/panelModules';
import { useDataContext } from '../../context/DataContext';
import {
    fetchOficialesResumenProfesor,
    fetchPendientesProfesor,
    getProfesorId,
} from '../../lib/api/resultados';
import classes from '../../styles/PanelModules.module.css';

export default function PagDashboardProfesor() {
    const { numeroEdicion, anioEdicion } = useDataContext();
    const idProfesor = getProfesorId();
    const [loading, setLoading] = useState(true);
    const [pendientesCount, setPendientesCount] = useState(0);
    const [oficialesTotal, setOficialesTotal] = useState(0);
    const [porMedalla, setPorMedalla] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!idProfesor || numeroEdicion <= 0) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const [pend, resumen] = await Promise.all([
                    fetchPendientesProfesor(numeroEdicion, idProfesor),
                    fetchOficialesResumenProfesor(numeroEdicion, idProfesor),
                ]);
                if (cancelled) return;
                setPendientesCount(pend.total ?? pend.data?.length ?? 0);
                setOficialesTotal(resumen.total ?? 0);
                setPorMedalla(resumen.por_medalla ?? {});
            } catch {
                if (!cancelled) {
                    notifications.show({
                        color: 'orange',
                        title: 'Resumen no disponible',
                        message: 'No se pudo cargar el resumen de resultados.',
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [idProfesor, numeroEdicion]);

    return (
        <Container size="lg" py="xl">
            <ModuleHero
                badge="Profesor"
                title="Panel del profesor"
                subtitle={`Edición ${numeroEdicion}${anioEdicion ? ` (${anioEdicion})` : ''}`}
                gradient="blue"
            />
            <Paper radius="lg" p="xl" withBorder shadow="sm" className={classes.mainPanel}>
                <Paper radius="md" p="lg" mb="xl" className={classes.placeholderBox}>
                    <Title order={4} mb="xs">
                        Resumen
                    </Title>
                    {loading ? (
                        <Group justify="center" py="md">
                            <Loader size="sm" />
                        </Group>
                    ) : (
                        <>
                            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
                                <Paper withBorder p="md" radius="md">
                                    <Text size="xs" c="dimmed">
                                        Pendientes por corregir
                                    </Text>
                                    <Text fw={700} size="xl" c={pendientesCount > 0 ? 'orange' : undefined}>
                                        {pendientesCount}
                                    </Text>
                                </Paper>
                                <Paper withBorder p="md" radius="md">
                                    <Text size="xs" c="dimmed">
                                        Resultados oficiales
                                    </Text>
                                    <Text fw={700} size="xl">
                                        {oficialesTotal}
                                    </Text>
                                </Paper>
                                <Paper withBorder p="md" radius="md">
                                    <Text size="xs" c="dimmed">
                                        Medallas (oficiales)
                                    </Text>
                                    <Text size="sm" mt={4}>
                                        {Object.keys(porMedalla).length === 0
                                            ? 'Sin datos aún'
                                            : Object.entries(porMedalla)
                                                  .map(([m, n]) => `${m || 'Participa'}: ${n}`)
                                                  .join(' · ')}
                                    </Text>
                                </Paper>
                            </SimpleGrid>
                            <Text size="sm" c="dimmed" lh={1.6}>
                                Corrige tus pendientes en la revisión de importación; cuando el coordinador los
                                integre al histórico, aparecerán en resultados oficiales. Los certificados siguen
                                en preparación.
                            </Text>
                        </>
                    )}
                </Paper>

                <Grid>
                    {profesorModules.map((mod) => (
                        <Grid.Col key={mod.to} span={{ base: 12, sm: 6, lg: 4 }}>
                            <ActionCard {...mod} />
                        </Grid.Col>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}
