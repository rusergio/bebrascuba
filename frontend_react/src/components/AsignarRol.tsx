import { Box, Container, Paper } from '@mantine/core';
import { ModuleHero } from './panel/ModuleHero';
import { TablaGlobalUsuarios } from './TablaGlobalUsuarios';
import panelClasses from '../styles/PanelModules.module.css';
import classes from '../styles/AsignarRol.module.css';

export function AsignarRol() {
    return (
        <Box className={classes.page}>
            <Container size="xl" py="xl">
                <ModuleHero
                    badge="Administración"
                    title="Asignar rol a usuarios"
                    subtitle="Seleccione uno o más usuarios, elija el rol a asignar y complete la ubicación cuando el rol lo requiera."
                    backTo="/mi_perfil"
                    backLabel="Volver al perfil"
                    gradient="indigo"
                />

                <Paper
                    radius="lg"
                    p="xl"
                    shadow="sm"
                    withBorder
                    className={`${panelClasses.mainPanel} ${classes.mainPanel}`}
                >
                    <TablaGlobalUsuarios />
                </Paper>
            </Container>
        </Box>
    );
}
