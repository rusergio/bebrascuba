import { Container, Grid, Group, Loader, Paper, SimpleGrid, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ModuleHero } from '../../components/panel/ModuleHero';
import { ActionCard } from '../../components/panel/ActionCard';
import { FlujoResultadosPanel } from '../../components/resultados/FlujoResultadosPanel';
import { coordinadorModules } from '../../config/panelModules';
import { labelEstadoValidacion } from '../../config/flujoResultados';
import { useDataContext } from '../../context/DataContext';
import { fetchRevisionResumen } from '../../lib/api/resultados';
import type { RevisionResumen } from '../../types/resultadosPendientes';
import classes from '../../styles/PanelModules.module.css';

export default function PagDashboardCoordinador() {
    const { numeroEdicion, anioEdicion } = useDataContext();
    const [resumen, setResumen] = useState<RevisionResumen | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (numeroEdicion <= 0) return;
        setLoading(true);
        fetchRevisionResumen(numeroEdicion)
            .then(setResumen)
            .catch(() => setResumen(null))
            .finally(() => setLoading(false));
    }, [numeroEdicion]);

    return (
        <Container size="lg" py="xl">
            <ModuleHero
                badge="Coordinador Nacional"
                title="Panel del coordinador nacional"
                subtitle="Flujo: importar → resultados_pendientes → revisar → estudiante_escuela (oficial)."
                gradient="violet"
            />
            <Paper radius="lg" p="xl" withBorder shadow="sm" className={classes.mainPanel}>
                <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">
                        Edición activa:{' '}
                        <strong>
                            {numeroEdicion > 0 ? `${numeroEdicion}${anioEdicion ? ` (${anioEdicion})` : ''}` : '—'}
                        </strong>
                    </Text>
                    <Text component={Link} to="/coordinador/resultados-pendientes" size="sm" c="blue">
                        Ir a revisión de resultados →
                    </Text>
                </Group>

                <FlujoResultadosPanel compacto titulo="Flujo general de resultados (10 pasos)" />

                {loading ? (
                    <Group justify="center" py="md">
                        <Loader size="sm" />
                    </Group>
                ) : resumen ? (
                    <>
                        <Title order={5} mb="sm">
                            Resumen de revisión (resultados_pendientes)
                        </Title>
                        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} mb="lg">
                            <Paper withBorder p="md" radius="md">
                                <Text size="xs" c="dimmed">
                                    Total importados
                                </Text>
                                <Text fw={700} size="xl">
                                    {resumen.total}
                                </Text>
                            </Paper>
                            {Object.entries(resumen.por_estado).map(([estado, total]) => (
                                <Paper key={estado} withBorder p="md" radius="md">
                                    <Text size="xs" c="dimmed" lineClamp={2}>
                                        {labelEstadoValidacion(estado)}
                                    </Text>
                                    <Text fw={700} size="xl">
                                        {total}
                                    </Text>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    </>
                ) : (
                    <Text size="sm" c="dimmed" mb="lg">
                        Aún no hay datos de revisión para esta edición. Importa el Excel de Ville para comenzar.
                    </Text>
                )}

                <Grid>
                    {coordinadorModules.map((mod) => (
                        <Grid.Col key={mod.to} span={{ base: 12, sm: 6, lg: 4 }}>
                            <ActionCard
                                {...mod}
                                soon={mod.to.includes('plantillas') || mod.to.includes('certificados-historicos')}
                                buttonVariant={
                                    mod.color === 'orange' || mod.color === 'yellow'
                                        ? 'gradient'
                                        : mod.color === 'dark'
                                          ? 'filled'
                                          : 'light'
                                }
                            />
                        </Grid.Col>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}
