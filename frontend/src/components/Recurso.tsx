import { useMemo, useState } from 'react';
import {
  Paper,
  Text,
  Title,
  Button,
  Container,
  Group,
  Stack,
  SimpleGrid,
  Alert,
  rem,
  useMantineTheme,
  Box,
  Badge,
  Select,
  TextInput,
  useComputedColorScheme,
} from '@mantine/core';
import {
  IconDownload,
  IconFileDescription,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconFileSpreadsheet,
  IconBooks,
  IconSearch,
} from '@tabler/icons-react';
import axios from 'axios';
import { useDataContext } from '../context/DataContext';

// ─── helpers ────────────────────────────────────────────────────────────────

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

const FILE_ICON_SIZE = 40;

function fileIconForPath(path: string, color: string) {
  const lower = path.toLowerCase();
  const props = { size: FILE_ICON_SIZE, stroke: 1.5, color };
  if (lower.endsWith('.pdf')) return <IconFileTypePdf {...props} />;
  if (lower.match(/\.(doc|docx|odt)$/)) return <IconFileTypeDoc {...props} />;
  if (lower.match(/\.(xls|xlsx|ods|csv)$/)) return <IconFileSpreadsheet {...props} />;
  return <IconFileDescription {...props} />;
}

// ─── inline styles ──────────────────────────────────────────────────────────

const heroStyles: React.CSSProperties = {
  background: 'linear-gradient(135deg, #e8f0fb 0%, #f0f5fc 45%, #dce9f7 100%)',
  borderRadius: rem(16),
  padding: `${rem(40)} ${rem(48)}`,
  marginBottom: rem(24),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
  minHeight: rem(200),
};

const heroDecorDot: React.CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(43,87,151,0.07)',
};

// ─── component ──────────────────────────────────────────────────────────────

export function Recurso() {
  const { recursos } = useDataContext();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const palette = {
    pageBg: isDark ? theme.colors.dark[8] : '#f4f7fc',
    heroBg: isDark
      ? 'linear-gradient(135deg, #1f2937 0%, #111827 45%, #0f172a 100%)'
      : 'linear-gradient(135deg, #e8f0fb 0%, #f0f5fc 45%, #dce9f7 100%)',
    heroDot: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(43,87,151,0.07)',
    title: isDark ? theme.white : '#1a2d4e',
    subtitle: isDark ? theme.colors.gray[4] : '#5a7399',
    cardBg: isDark ? theme.colors.dark[6] : '#ffffff',
    cardBorder: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(43,87,151,0.15)',
    iconBg: isDark ? theme.colors.dark[5] : '#edf3fb',
    iconText: isDark ? theme.colors.blue[3] : '#2b5797',
    bodyText: isDark ? theme.colors.gray[3] : '#7a92b0',
  };

  const apiBase = (axios.defaults.baseURL || 'http://localhost:8000').replace(/\/$/, '');

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

  const maxYear = useMemo(() => {
    if (yearsInData.length === 0) return null;
    return Math.max(...yearsInData);
  }, [yearsInData]);

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

  return (
    <Box style={{ background: palette.pageBg, minHeight: '100vh', paddingBottom: rem(48) }}>
      {/* ── HERO ── */}
      <Container size="lg" pt="xl">
        <Box style={{ ...heroStyles, background: palette.heroBg }}>
          {/* decorative dots */}
          <Box style={{ ...heroDecorDot, background: palette.heroDot, width: 120, height: 120, top: -30, right: 280, opacity: 0.5 }} />
          <Box style={{ ...heroDecorDot, background: palette.heroDot, width: 60, height: 60, bottom: -10, left: '40%', opacity: 0.4 }} />

          {/* text */}
          <Box style={{ maxWidth: '52%', zIndex: 1 }}>
            <Title
              order={1}
              style={{
                fontSize: rem(28),
                fontWeight: 700,
                color: palette.title,
                lineHeight: 1.3,
                marginBottom: rem(12),
              }}
            >
              Recursos de apoyo al concurso BebrasCuba
            </Title>
            <Text
              style={{ fontSize: rem(14), color: palette.subtitle, lineHeight: 1.6 }}
            >
              Documentos de apoyo y guía de cada convocatoria, eso incluye los llamados.
            </Text>
          </Box>

          {/* illustration placeholder — replace with your <img> */}
          <Box
            style={{
              width: rem(220),
              height: rem(160),
              flexShrink: 0,
              zIndex: 1,
              borderRadius: rem(12),
              background:
                'url("/hero-illustration.png") center/contain no-repeat',
              // fallback gradient when image is absent
              backgroundImage:
                isDark
                  ? 'linear-gradient(135deg,#334155 0%,#1f2937 100%)'
                  : 'linear-gradient(135deg,#dbe9f8 0%,#c3d9f3 100%)',
            }}
          />
        </Box>

        {/* ── SEARCH BAR ── */}
        <Paper
          shadow="xs"
          radius="md"
          style={{
            padding: `${rem(14)} ${rem(20)}`,
            marginBottom: rem(28),
            border: `0.5px solid ${palette.cardBorder}`,
            background: palette.cardBg,
          }}
        >
          <Group align="center" wrap="wrap" gap="sm">
            <Select
              data={yearOptions}
              value={yearFilter}
              onChange={setYearFilter}
              clearable
              placeholder="Todos"
              nothingFoundMessage="Sin años"
              styles={{
                input: {
                  backgroundColor: isDark ? theme.colors.blue[8] : '#2b5797',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: rem(12),
                  fontWeight: 600,
                  minHeight: rem(44),
                  paddingLeft: rem(16),
                  cursor: 'pointer',
                },
                placeholder: {
                  color: isDark ? '#e2e8f0' : '#ffffff',
                  opacity: 1,
                },
                section: { color: '#ffffff' },
                option: { color: isDark ? theme.colors.gray[2] : theme.colors.dark[7] },
              }}
              style={{ minWidth: rem(160) }}
            />
            <TextInput
              placeholder="Buscar convocatoria..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              leftSection={<IconSearch size={18} stroke={1.5} color="#2b5797" />}
              radius="md"
              size="md"
              style={{ flex: 1, minWidth: rem(200) }}
              styles={{
                input: {
                  borderRadius: rem(12),
                  border: `1px solid ${palette.cardBorder}`,
                  background: palette.cardBg,
                  color: palette.title,
                  minHeight: rem(44),
                },
              }}
            />
          </Group>
        </Paper>

        {/* ── SECTION TITLE ── */}
        <Title
          order={2}
          style={{
            fontSize: rem(17),
            fontWeight: 600,
            color: palette.title,
            marginBottom: rem(16),
          }}
        >
          Concurso BebrasCuba – Ediciones anteriores
        </Title>

        {/* ── CARDS ── */}
        {recursos.length === 0 ? (
          <Alert
            variant="light"
            color="blue"
            title="No hay recursos publicados"
            icon={<IconBooks size={22} />}
            mt="lg"
          >
            Cuando el equipo coordinador suba archivos, aparecerán aquí para descarga.
          </Alert>
        ) : filtered.length === 0 ? (
          <Text c="dimmed" mt="xl" ta="center">
            No hay resultados para los filtros seleccionados.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {filtered.map((recurso) => {
              const filename = recurso.archivo_path.split('/').pop() ?? '';
              const href = `${apiBase}/api/descargar-recurso/${encodeURIComponent(filename)}`;
              const year = extractYear(
                `${recurso.nombre} ${recurso.descripcion} ${recurso.archivo_path}`,
              );
              const yearLabel = year != null ? String(year) : '—';
              const { sub, body } = splitDescription(recurso.descripcion);
              const isNovo = maxYear != null && year === maxYear;

              return (
                <Paper
                  key={recurso.id}
                  radius="md"
                  style={{
                    border: `0.5px solid ${palette.cardBorder}`,
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(43,87,151,0.07)',
                    padding: rem(16),
                    position: 'relative',
                    background: palette.cardBg,
                  }}
                >
                  {/* year badge */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: rem(14),
                      left: rem(14),
                        background: isDark ? theme.colors.blue[8] : '#2b5797',
                      color: 'white',
                      fontSize: rem(12),
                      fontWeight: 600,
                      borderRadius: rem(6),
                      padding: `${rem(3)} ${rem(9)}`,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {yearLabel}
                  </Box>

                  {/* novo badge */}
                  {isNovo && (
                    <Badge
                      style={{
                        position: 'absolute',
                        top: rem(14),
                        right: rem(14),
                      }}
                      color="blue"
                      variant="light"
                      size="sm"
                      radius="sm"
                    >
                      Novo
                    </Badge>
                  )}

                  {/* card body — pushed below badges */}
                  <Group
                    align="flex-start"
                    wrap="nowrap"
                    gap="md"
                    mt={rem(38)}
                  >
                    {/* file icon */}
                    <Box
                      style={{
                        flexShrink: 0,
                        width: rem(42),
                        height: rem(48),
                        background: palette.iconBg,
                        borderRadius: rem(6),
                        border: `1px solid ${palette.cardBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {fileIconForPath(filename, palette.iconText)}
                    </Box>

                    {/* text + button */}
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: rem(13),
                          fontWeight: 600,
                          color: palette.title,
                          lineHeight: 1.4,
                        }}
                        lineClamp={3}
                      >
                        {recurso.nombre}
                      </Text>

                      {sub && (
                        <Text
                          style={{
                            fontSize: rem(12),
                            fontWeight: 500,
                            color: palette.subtitle,
                            letterSpacing: '0.01em',
                          }}
                          lineClamp={2}
                        >
                          {sub}
                        </Text>
                      )}

                      <Text
                        style={{ fontSize: rem(12), color: palette.bodyText, lineHeight: 1.5 }}
                        lineClamp={5}
                      >
                        {body}
                      </Text>

                      <Group justify="flex-end" mt="sm">
                        <Button
                          size="sm"
                          radius="md"
                          rightSection={<IconDownload size={15} />}
                          component="a"
                          href={href}
                          download
                          style={{
                            background: isDark ? theme.colors.blue[8] : '#2b5797',
                            borderRadius: rem(10),
                            fontWeight: 600,
                            fontSize: rem(13),
                          }}
                        >
                          Descargar
                        </Button>
                      </Group>
                    </Stack>
                  </Group>
                </Paper>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}