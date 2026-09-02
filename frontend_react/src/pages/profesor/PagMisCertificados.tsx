import {
    Badge,
    Button,
    Checkbox,
    Group,
    Paper,
    Select,
    Stack,
    Table,
    Tabs,
    Text,
    Title,
} from '@mantine/core';
import { IconDownload, IconFileCertificate, IconQrcode, IconUser } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ModulePageShell } from '../../components/panel/ModulePageShell';
import classes from '../../styles/PanelModules.module.css';

interface EstudianteParticipante {
    id: number;
    estudiante: string;
    escuela: string;
    categoria: string;
    puntuacion: number;
    medalla: string;
    estado: string;
    certificadoGenerado: boolean;
}

const mockParticipantes: EstudianteParticipante[] = [
    {
        id: 1,
        estudiante: 'Ana García López',
        escuela: 'EP Camilo Cienfuegos',
        categoria: 'Benjamín',
        puntuacion: 92,
        medalla: 'Oro',
        estado: 'Certificado generado',
        certificadoGenerado: true,
    },
    {
        id: 2,
        estudiante: 'Luis Martínez Pérez',
        escuela: 'EP Camilo Cienfuegos',
        categoria: 'Cadete',
        puntuacion: 78,
        medalla: 'Plata',
        estado: 'Pendiente',
        certificadoGenerado: false,
    },
    {
        id: 3,
        estudiante: 'Sofía Hernández Vega',
        escuela: 'EP Camilo Cienfuegos',
        categoria: 'Junior',
        puntuacion: 85,
        medalla: 'Bronce',
        estado: 'Pendiente',
        certificadoGenerado: false,
    },
];

const mockNoParticiparon = [
    {
        estudiante: 'Carla Ruiz Díaz',
        escuela: 'EP Camilo Cienfuegos',
        categoria: 'Junior',
    },
];

function medallaColor(medalla: string) {
    if (medalla === 'Oro') return 'yellow';
    if (medalla === 'Plata') return 'gray';
    if (medalla === 'Bronce') return 'orange';
    return 'blue';
}

function CertificadosEstudiantesPanel() {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const allIds = useMemo(() => mockParticipantes.map((e) => e.id), []);
    const allSelected = selectedIds.size > 0 && selectedIds.size === allIds.length;
    const someSelected = selectedIds.size > 0 && !allSelected;
    const selectedCount = selectedIds.size;

    const toggleAll = () => {
        setSelectedIds(allSelected ? new Set() : new Set(allIds));
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <>
            <Group justify="space-between" mb="lg" wrap="wrap" align="flex-end">
                <Select
                    label="Edición"
                    placeholder="Seleccionar edición"
                    data={['2024', '2023', '2022']}
                    defaultValue="2024"
                    w={200}
                />
                <Stack gap="xs" align="flex-end">
                    <Text size="sm" c={selectedCount > 0 ? 'blue' : 'dimmed'}>
                        {selectedCount > 0
                            ? `${selectedCount} estudiante(s) seleccionado(s)`
                            : 'Selecciona estudiantes o genera para todos'}
                    </Text>
                    <Group>
                        <Button
                            leftSection={<IconFileCertificate size={16} />}
                            variant="light"
                            disabled={selectedCount === 0}
                        >
                            Generar seleccionados ({selectedCount})
                        </Button>
                        <Button leftSection={<IconFileCertificate size={16} />} disabled={allIds.length === 0}>
                            Generar todos
                        </Button>
                        <Button
                            leftSection={<IconDownload size={16} />}
                            color="teal"
                            variant="light"
                            disabled={selectedCount === 0}
                        >
                            ZIP seleccionados
                        </Button>
                        <Button leftSection={<IconDownload size={16} />} color="teal" disabled={allIds.length === 0}>
                            ZIP todos
                        </Button>
                    </Group>
                </Stack>
            </Group>

            <Group gap="xl" mb="lg">
                <Text size="sm">
                    <Text span fw={600}>
                        Estudiantes que participaron:
                    </Text>{' '}
                    {mockParticipantes.length}
                </Text>
                <Text size="sm">
                    <Text span fw={600}>
                        Estudiantes que no participaron:
                    </Text>{' '}
                    {mockNoParticiparon.length}
                </Text>
            </Group>

            <Title order={4} mb="md">
                Estudiantes que participaron
            </Title>
            <Table.ScrollContainer minWidth={860} mb="xl">
                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={44}>
                                <Checkbox
                                    aria-label="Seleccionar todos los estudiantes"
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    onChange={toggleAll}
                                />
                            </Table.Th>
                            <Table.Th>Estudiante</Table.Th>
                            <Table.Th>Escuela</Table.Th>
                            <Table.Th>Categoría</Table.Th>
                            <Table.Th>Puntuación</Table.Th>
                            <Table.Th>Medalla</Table.Th>
                            <Table.Th>Estado</Table.Th>
                            <Table.Th>Certificado</Table.Th>
                            <Table.Th>Verificación</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {mockParticipantes.map((row) => {
                            const isSelected = selectedIds.has(row.id);
                            return (
                                <Table.Tr
                                    key={row.id}
                                    bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
                                >
                                    <Table.Td>
                                        <Checkbox
                                            aria-label={`Seleccionar a ${row.estudiante}`}
                                            checked={isSelected}
                                            onChange={() => toggleOne(row.id)}
                                        />
                                    </Table.Td>
                                    <Table.Td>{row.estudiante}</Table.Td>
                                    <Table.Td>{row.escuela}</Table.Td>
                                    <Table.Td>{row.categoria}</Table.Td>
                                    <Table.Td>{row.puntuacion}</Table.Td>
                                    <Table.Td>
                                        <Badge color={medallaColor(row.medalla)} variant="light">
                                            {row.medalla}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{row.estado}</Table.Td>
                                    <Table.Td>
                                        {row.certificadoGenerado ? (
                                            <Button size="xs" variant="subtle">
                                                Ver PDF
                                            </Button>
                                        ) : (
                                            <Text size="xs" c="dimmed">
                                                —
                                            </Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        {row.certificadoGenerado ? (
                                            <Button size="xs" variant="light" color="gray">
                                                QR
                                            </Button>
                                        ) : (
                                            <Text size="xs" c="dimmed">
                                                —
                                            </Text>
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            <Title order={4} mb="md">
                Estudiantes preinscritos sin participación registrada
            </Title>
            <Text size="sm" c="dimmed" mb="md">
                Estos estudiantes estaban preinscritos pero no aparecen en el Excel oficial de resultados. No
                pueden seleccionarse para certificados de esta edición.
            </Text>
            <Table.ScrollContainer minWidth={600}>
                <Table striped withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Estudiante</Table.Th>
                            <Table.Th>Escuela</Table.Th>
                            <Table.Th>Categoría</Table.Th>
                            <Table.Th>Estado</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {mockNoParticiparon.map((row) => (
                            <Table.Tr key={row.estudiante}>
                                <Table.Td>{row.estudiante}</Table.Td>
                                <Table.Td>{row.escuela}</Table.Td>
                                <Table.Td>{row.categoria}</Table.Td>
                                <Table.Td>
                                    <Badge color="gray" variant="light">
                                        No participó
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </>
    );
}

export default function PagMisCertificados() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'estudiantes' ? 'estudiantes' : 'propio';

    const handleTabChange = (value: string | null) => {
        if (!value) return;
        setSearchParams(value === 'propio' ? {} : { tab: value }, { replace: true });
    };

    return (
        <ModulePageShell
            badge="Profesor"
            title="Mis certificados"
            subtitle="Genera tu certificado de participación como profesor y gestiona los certificados de tus estudiantes."
            backTo="/profesor/dashboard"
            gradient="blue"
        >
            <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
                <Tabs.List mb="lg">
                    <Tabs.Tab value="propio" leftSection={<IconUser size={16} />}>
                        Mi certificado
                    </Tabs.Tab>
                    <Tabs.Tab value="estudiantes" leftSection={<IconFileCertificate size={16} />}>
                        Certificados de estudiantes
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="propio">
                    <Stack gap="lg">
                        <Paper radius="md" p="lg" withBorder className={classes.placeholderBox}>
                            <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
                                <div>
                                    <Title order={4} mb="xs">
                                        Certificado de participación del profesor
                                    </Title>
                                    <Text size="sm" c="dimmed" maw={520} lh={1.6}>
                                        Como profesor participante del concurso Bebras Cuba puedes generar tu
                                        propio certificado de colaboración o participación, verificarlo con QR y
                                        descargarlo en PDF.
                                    </Text>
                                </div>
                                <Select
                                    label="Edición"
                                    data={['2024', '2023', '2022']}
                                    defaultValue="2024"
                                    w={180}
                                />
                            </Group>

                            <Group gap="md" mb="md">
                                <Text size="sm">
                                    <Text span fw={600}>
                                        Profesor:
                                    </Text>{' '}
                                    María López García
                                </Text>
                                <Text size="sm">
                                    <Text span fw={600}>
                                        Escuela:
                                    </Text>{' '}
                                    EP Camilo Cienfuegos
                                </Text>
                                <Text size="sm">
                                    <Text span fw={600}>
                                        Rol en certificado:
                                    </Text>{' '}
                                    Profesor
                                </Text>
                            </Group>

                            <Group gap="sm" mb="md">
                                <Badge color="teal" variant="light">
                                    Edición 2024
                                </Badge>
                                <Badge color="gray" variant="light">
                                    Pendiente de generar
                                </Badge>
                            </Group>

                            <Group>
                                <Button leftSection={<IconFileCertificate size={16} />} disabled>
                                    Generar mi certificado
                                </Button>
                                <Button
                                    leftSection={<IconDownload size={16} />}
                                    variant="light"
                                    color="teal"
                                    disabled
                                >
                                    Descargar PDF
                                </Button>
                                <Button
                                    leftSection={<IconQrcode size={16} />}
                                    variant="light"
                                    color="orange"
                                    disabled
                                >
                                    Verificar con QR
                                </Button>
                            </Group>
                        </Paper>

                        <Text size="xs" c="dimmed">
                            El certificado del profesor es independiente de los certificados de estudiantes. Solo
                            podrás generarlo cuando la edición tenga resultados publicados y tu participación esté
                            registrada en el sistema.
                        </Text>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="estudiantes">
                    <CertificadosEstudiantesPanel />
                </Tabs.Panel>
            </Tabs>
        </ModulePageShell>
    );
}
