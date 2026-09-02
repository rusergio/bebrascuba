import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconBooks,
  IconCalendar,
  IconDownload,
  IconFileDescription,
  IconFileSpreadsheet,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconFilter,
  IconSearch,
} from '@tabler/icons-react';
import axios from 'axios';
import { useDataContext } from '../context/DataContext';
import classes from '../styles/Recurso.module.css';

function extractYear(text: string): number | null {
  const m = text.match(/\b(20[12]\d)\b/);
  return m ? parseInt(m[1], 10) : null;
}

function splitDescription(desc: string): { sub: string; body: string } {
  const trimmed = desc.trim();
  if (!trimmed) return { sub: '', body: '' };
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length >= 2) {
    return { sub: lines[0], body: lines.slice(1).join(' ') };
  }
  return { sub: '', body: trimmed };
}

const FILE_ICON_SIZE = 32;

function fileIconForPath(path: string) {
  const lower = path.toLowerCase();
  const props = { size: FILE_ICON_SIZE, stroke: 1.5 };
  if (lower.endsWith('.pdf')) return <IconFileTypePdf {...props} />;
  if (lower.match(/\.(doc|docx|odt)$/)) return <IconFileTypeDoc {...props} />;
  if (lower.match(/\.(xls|xlsx|ods|csv)$/)) return <IconFileSpreadsheet {...props} />;
  return <IconFileDescription {...props} />;
}

export function Recurso() {
  const { recursos, refreshRecursos } = useDataContext();
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (recursos.length === 0) {
      void refreshRecursos();
    }
  }, [recursos.length, refreshRecursos]);

  const apiBase = (axios.defaults.baseURL || '').replace(/\/$/, '');

  const yearsInData = useMemo(() => {
    const ys = new Set<number>();
    recursos.forEach((r) => {
      const y = extractYear(`${r.nombre} ${r.descripcion} ${r.archivo_path}`);
      if (y) ys.add(y);
    });
    return Array.from(ys).sort((a, b) => b - a);
  }, [recursos]);

  const yearOptions = useMemo(
    () => yearsInData.map((y) => ({ value: String(y), label: String(y) })),
    [yearsInData],
  );

  const maxYear = yearsInData.length > 0 ? yearsInData[0] : null;

  const filtered = useMemo(() => {
    let list = recursos;
    if (yearFilter) {
      const y = Number(yearFilter);
      list = list.filter(
        (r) => extractYear(`${r.nombre} ${r.descripcion} ${r.archivo_path}`) === y,
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q) ||
          r.descripcion.toLowerCase().includes(q),
      );
    }
    return list;
  }, [recursos, yearFilter, search]);

  const hasActiveFilters = Boolean(yearFilter || search.trim());

  return (
    <Box className={classes.page}>
      {/* Hero */}
      <Box className={classes.hero}>
        <Box className={classes.heroGlow} aria-hidden />
        <Box className={classes.heroGlowSecondary} aria-hidden />
        <Container size="lg" className={classes.heroInner}>
          <Group justify="space-between" align="center" wrap="wrap" gap="xl">
            <Stack gap="xs" maw={620}>
              <span className={classes.heroBadge}>Biblioteca pública</span>
              <Title order={1} className={classes.heroTitle}>
                Recursos de apoyo al concurso BebrasCuba
              </Title>
              <Text className={classes.heroSubtitle}>
                Guías, reglamentos y documentos de cada convocatoria. Descargue los materiales
                oficiales publicados por el equipo coordinador.
              </Text>
              <div className={classes.heroStats}>
                <span className={classes.heroStatPill}>
                  <IconBooks size={16} />
                  {recursos.length} documento{recursos.length === 1 ? '' : 's'}
                </span>
                {yearsInData.length > 0 && (
                  <span className={classes.heroStatPill}>
                    <IconCalendar size={16} />
                    {yearsInData.length} edición{yearsInData.length === 1 ? '' : 'es'}
                  </span>
                )}
              </div>
            </Stack>
            <Box className={classes.heroIconWrap} visibleFrom="sm">
              <IconBooks size={44} stroke={1.4} />
            </Box>
          </Group>
        </Container>
      </Box>

      <Container size="lg">
        {/* Barra de búsqueda flotante */}
        <Paper radius="lg" className={classes.searchBar}>
          <Group align="center" wrap="wrap" gap="md">
            <Select
              data={yearOptions}
              value={yearFilter}
              onChange={setYearFilter}
              clearable
              placeholder="Todas las ediciones"
              nothingFoundMessage="Sin años"
              leftSection={<IconCalendar size={16} />}
              allowDeselect
              style={{ minWidth: 180 }}
            />
            <TextInput
              placeholder="Buscar por título o descripción…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              leftSection={<IconSearch size={18} stroke={1.5} />}
              style={{ flex: 1, minWidth: 220 }}
            />
            {hasActiveFilters && (
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => {
                  setYearFilter(null);
                  setSearch('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </Group>
        </Paper>

        {/* Filtros rápidos por año */}
        {yearsInData.length > 1 && (
          <Group gap="xs" className={classes.yearChips} mt="lg">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              Ediciones:
            </Text>
            <Chip.Group
              value={yearFilter ?? 'all'}
              onChange={(v) => setYearFilter(v === 'all' ? null : v)}
            >
              <Group gap="xs">
                <Chip value="all" variant="light" color="blue">
                  Todas
                </Chip>
                {yearsInData.map((y) => (
                  <Chip key={y} value={String(y)} variant="light" color="blue">
                    {y}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </Group>
        )}

        {/* Encabezado de sección */}
        <div className={classes.sectionHeader}>
          <Title order={2} className={classes.sectionTitle}>
            Documentos disponibles
          </Title>
          <Text className={classes.sectionSubtitle}>
            {hasActiveFilters
              ? `Mostrando ${filtered.length} de ${recursos.length} documento${recursos.length === 1 ? '' : 's'}`
              : recursos.length > 0
                ? 'Seleccione un documento para descargarlo en PDF'
                : 'La biblioteca se actualizará cuando se publiquen nuevos materiales'}
          </Text>
        </div>

        {/* Contenido */}
        {recursos.length === 0 ? (
          <Paper radius="lg" className={classes.emptyState}>
            <ThemeIcon size={56} radius="xl" variant="light" color="blue" mx="auto" mb="md">
              <IconBooks size={28} />
            </ThemeIcon>
            <Title order={4} mb="xs">
              No hay recursos publicados
            </Title>
            <Text size="sm" c="dimmed" lh={1.6}>
              Cuando el equipo coordinador suba archivos, aparecerán aquí para descarga pública.
            </Text>
          </Paper>
        ) : filtered.length === 0 ? (
          <Paper radius="lg" className={classes.noResults}>
            <ThemeIcon size={48} radius="xl" variant="light" color="gray" mx="auto" mb="md">
              <IconFilter size={24} />
            </ThemeIcon>
            <Text fw={600} mb={4}>
              Sin coincidencias
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              No hay documentos que coincidan con los filtros seleccionados.
            </Text>
            <Button
              variant="light"
              color="blue"
              onClick={() => {
                setYearFilter(null);
                setSearch('');
              }}
            >
              Ver todos los documentos
            </Button>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" className={classes.grid}>
            {filtered.map((recurso) => {
              const filename = recurso.archivo_path.split('/').pop() ?? '';
              const href = `${apiBase}/api/descargar-recurso/${encodeURIComponent(filename)}`;
              const year = extractYear(
                `${recurso.nombre} ${recurso.descripcion} ${recurso.archivo_path}`,
              );
              const yearLabel = year != null ? String(year) : '—';
              const { sub, body } = splitDescription(recurso.descripcion);
              const isReciente = maxYear != null && year === maxYear;

              return (
                <Paper
                  key={recurso.id}
                  radius="lg"
                  className={`${classes.resourceCard} ${isReciente ? classes.resourceCardHighlight : ''}`}
                >
                  <div className={classes.cardTop}>
                    <span className={classes.yearBadge}>{yearLabel}</span>
                    {isReciente && (
                      <Badge color="blue" variant="light" size="sm" radius="sm">
                        Reciente
                      </Badge>
                    )}
                  </div>

                  <Group align="flex-start" wrap="nowrap" gap="md" mb="sm">
                    <Box className={classes.cardDocIcon}>{fileIconForPath(filename)}</Box>
                    <div className={classes.cardBody}>
                      <Text className={classes.cardTitle} lineClamp={3}>
                        {recurso.nombre}
                      </Text>
                      {sub && (
                        <Text className={classes.cardSub} lineClamp={2}>
                          {sub}
                        </Text>
                      )}
                      {body && (
                        <Text className={classes.cardDesc} lineClamp={4}>
                          {body}
                        </Text>
                      )}
                    </div>
                  </Group>

                  <div className={classes.cardFooter}>
                    <Group justify="flex-end">
                      <Button
                        size="sm"
                        radius="md"
                        color="blue"
                        rightSection={<IconDownload size={16} />}
                        component="a"
                        href={href}
                        download
                      >
                        Descargar PDF
                      </Button>
                    </Group>
                  </div>
                </Paper>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
