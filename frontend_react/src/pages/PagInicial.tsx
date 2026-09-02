import {
  Container,
  Card,
  Table,
  Title,
  Select,
  Stack,
  Text,
  Group,
  Paper,
  ThemeIcon,
  Badge,
  SegmentedControl,
  Box,
} from '@mantine/core';
import { IconChartHistogram, IconMap2 } from '@tabler/icons-react';
import { HeroContentLeft } from '../components/HeroContentLeft';
import { FeaturesCards } from '../components/FeaturesCards';
import { FeaturesAsymmetrical } from '../components/FeaturesAsymmetrical';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { FeaturesTitle } from '../components/FeaturesTitle';
import { useDataContext } from '../context/DataContext';
import classes from '../styles/PagInicialResultados.module.css';
import animClasses from '../styles/animations.module.css';
import { AnimatedSection } from '../components/AnimatedSection';

export default function PagInicial() {
  const {
    resultados: resultsData,
    totalPorCategoria,
    edicionesConResultados,
    aEdicionResultados,
    selectEdicionResultados,
  } = useDataContext();

  const edicionActiva =
    edicionesConResultados.find((e) => e.a_edicion === aEdicionResultados) ??
    edicionesConResultados[0];

  const segmentData = edicionesConResultados.map((e) => ({
    value: String(e.a_edicion),
    label: `${e.n_edicion}ª · ${e.a_edicion}`,
  }));

  /** Más de esto, el segmented se ve apretado en móvil; a partir de aquí usamos Select (escala a 10+). */
  const maxEdicionesSegmented = 4;

  const rows = resultsData.map((element, index) => (
    <Table.Tr
      key={element.provincia}
      className={animClasses.staggerRow}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <Table.Td fw={500}>{element.provincia}</Table.Td>
      <Table.Td ta="center">{element.superpegues}</Table.Td>
      <Table.Td ta="center">{element.peque}</Table.Td>
      <Table.Td ta="center">{element.benjamin}</Table.Td>
      <Table.Td ta="center">{element.cadete}</Table.Td>
      <Table.Td ta="center">{element.junior}</Table.Td>
      <Table.Td ta="center">{element.senior}</Table.Td>
      <Table.Td ta="center" fw={600}>
        {element.total}
      </Table.Td>
    </Table.Tr>
  ));

  const ths = (
    <Table.Tr>
      <Table.Th>Provincia</Table.Th>
      <Table.Th ta="center">SuperPeque</Table.Th>
      <Table.Th ta="center">Peque</Table.Th>
      <Table.Th ta="center">Benjamín</Table.Th>
      <Table.Th ta="center">Cadete</Table.Th>
      <Table.Th ta="center">Junior</Table.Th>
      <Table.Th ta="center">Senior</Table.Th>
      <Table.Th ta="center">Total</Table.Th>
    </Table.Tr>
  );

  const totalRow = (
    <Table.Tr>
      <Table.Th>Total por categoría</Table.Th>
      <Table.Th ta="center">{totalPorCategoria?.superpegues ?? 0}</Table.Th>
      <Table.Th ta="center">{totalPorCategoria?.peques ?? 0}</Table.Th>
      <Table.Th ta="center">{totalPorCategoria?.benjamin ?? 0}</Table.Th>
      <Table.Th ta="center">{totalPorCategoria?.cadete ?? 0}</Table.Th>
      <Table.Th ta="center">{totalPorCategoria?.junior ?? 0}</Table.Th>
      <Table.Th ta="center">{totalPorCategoria?.senior ?? 0}</Table.Th>
      <Table.Th ta="center">{totalPorCategoria?.total ?? 0}</Table.Th>
    </Table.Tr>
  );

  const picker =
    edicionesConResultados.length > 1 ? (
      edicionesConResultados.length <= maxEdicionesSegmented ? (
        <Stack gap={6} align="stretch" maw={520} w="100%">
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.6}>
            Edición
          </Text>
          <SegmentedControl
            fullWidth
            size="md"
            radius="md"
            data={segmentData}
            value={
              aEdicionResultados != null
                ? String(aEdicionResultados)
                : edicionesConResultados[0]
                  ? String(edicionesConResultados[0].a_edicion)
                  : undefined
            }
            onChange={(v) => {
              void selectEdicionResultados(v ? Number(v) : null);
            }}
            aria-label="Elegir año de la edición para ver resultados"
          />
          <Text size="xs" c="dimmed" ta={{ base: 'center', sm: 'right' }}>
            Pocos años: cambio rápido. Con más ediciones se usa lista desplegable.
          </Text>
        </Stack>
      ) : (
        <Select
          label="Edición"
          description="Lista todas las ediciones con datos; escribe el año para filtrar."
          placeholder="Buscar o elegir…"
          searchable
          nothingFoundMessage="Sin coincidencias"
          maxDropdownHeight={280}
          data={edicionesConResultados.map((e) => ({
            value: String(e.a_edicion),
            label: `${e.n_edicion}ª edición · ${e.a_edicion}`,
          }))}
          value={
            aEdicionResultados != null
              ? String(aEdicionResultados)
              : edicionesConResultados[0]
                ? String(edicionesConResultados[0].a_edicion)
                : null
          }
          onChange={(v) => {
            void selectEdicionResultados(v ? Number(v) : null);
          }}
          radius="md"
          size="md"
          w={{ base: '100%', sm: 340 }}
          comboboxProps={{ withinPortal: true }}
        />
      )
    ) : edicionesConResultados.length === 1 ? (
      <Badge size="lg" variant="light" color="blue" radius="md" leftSection={<IconMap2 size={14} />}>
        {edicionesConResultados[0].n_edicion}ª edición · {edicionesConResultados[0].a_edicion}
      </Badge>
    ) : (
      <Text size="sm" c="dimmed" ta="right" maw={280}>
        Datos de la última edición disponible en el sistema.
      </Text>
    );

  return (
    <>
      <HeroContentLeft />
      <AnimatedSection delay={40}>
        <FeaturesCards />
      </AnimatedSection>
      <AnimatedSection delay={120}>
        <FeaturesTitle />
      </AnimatedSection>
      <AnimatedSection delay={160}>
        <FeaturesAsymmetrical />
      </AnimatedSection>
      <AnimatedSection delay={200}>
        <FeaturesGrid />
      </AnimatedSection>
      <AnimatedSection delay={240}>
      <Box component="section" id="resultados" className={classes.section}>
        <Container size="lg">
          <Paper
            className={classes.headerPaper}
            shadow="sm"
            radius="lg"
            p={{ base: 'md', sm: 'lg' }}
            mb="xl"
            withBorder
          >
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
              <Stack gap="xs" maw={520}>
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={48} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 120 }}>
                    <IconChartHistogram size={28} stroke={1.5} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.8}>
                      Resultados públicos
                    </Text>
                    <Title order={2} fz={{ base: 'xl', sm: 'h2' }} lh={1.2}>
                      Por provincia y categoría
                    </Title>
                  </div>
                </Group>
                <Text size="sm" c="dimmed" lh={1.55}>
                  Vista resumida del concurso. Puedes comparar cómo se distribuyeron las participaciones
                  {edicionesConResultados.length > 1 ? ' y cambiar de edición cuando lo necesites.' : '.'}
                </Text>
                {edicionActiva && (
                  <Group gap="xs">
                    <Badge variant="dot" color="blue" size="lg" radius="sm">
                      {edicionActiva.n_edicion}ª edición
                    </Badge>
                    <Text size="sm" c="dimmed">
                      Año calendario {edicionActiva.a_edicion}
                    </Text>
                  </Group>
                )}
              </Stack>
              {picker}
            </Group>
          </Paper>

          <Card
            key={aEdicionResultados ?? 'default'}
            className={`${classes.tableCard} ${animClasses.scaleIn}`}
            shadow="md"
            radius="lg"
            padding={0}
            withBorder
            mb={40}
          >
            <Box px={{ base: 'sm', sm: 'md' }} py="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
              <Group justify="space-between" wrap="wrap" gap="xs">
                <Text fw={600} size="sm">
                  Tabla de provincias
                </Text>
                <Text size="xs" c="dimmed">
                  Categorías BebrasCuba
                </Text>
              </Group>
            </Box>
            {resultsData.length === 0 ? (
              <Box py="xl" px="md">
                <Text ta="center" c="dimmed" size="sm">
                  No hay filas de resultados para esta edición. Prueba otra edición o vuelve más tarde.
                </Text>
              </Box>
            ) : (
              <Table.ScrollContainer minWidth={800} type="native" className={classes.tableWrap}>
                <Table
                  verticalSpacing="sm"
                  horizontalSpacing="md"
                  striped
                  highlightOnHover
                  captionSide="bottom"
                >
                  <Table.Caption style={{ padding: 'var(--mantine-spacing-md)', color: 'var(--mantine-color-dimmed)' }}>
                    Fila inferior: suma por categoría en todas las provincias.
                  </Table.Caption>
                  <Table.Thead>{ths}</Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                  <Table.Tfoot>{totalRow}</Table.Tfoot>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>
        </Container>
      </Box>
      </AnimatedSection>
    </>
  );
}
