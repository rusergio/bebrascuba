import { Button, Group, Select, Stack, Table, Text } from '@mantine/core';
import { IconDownload, IconFileCertificate } from '@tabler/icons-react';
import { ModulePageShell } from '../../components/panel/ModulePageShell';

const mockColaboradores = [
    { nombre: 'Dr. Juan Pérez', rol: 'Coordinador Provincial', provincia: 'Villa Clara' },
    { nombre: 'Lic. Rosa Díaz', rol: 'Profesor colaborador', provincia: 'Villa Clara' },
];

export default function PagCertificadosColaboradores() {
    return (
        <ModulePageShell
            badge="Coordinador Nacional"
            title="Certificados colaboradores"
            subtitle="Generar certificados para profesores y colaboradores del concurso."
            backTo="/coordinador/dashboard"
            gradient="violet"
        >
            <Stack gap="lg">
                <Group wrap="wrap">
                    <Select
                        label="Edición"
                        data={['2024', '2023']}
                        defaultValue="2024"
                        w={180}
                    />
                    <Select
                        label="Tipo"
                        data={['Profesor', 'Colaborador universitario', 'Coordinador']}
                        defaultValue="Profesor"
                        w={220}
                    />
                </Group>

                <Group>
                    <Button leftSection={<IconFileCertificate size={16} />} disabled>
                        Generar certificados
                    </Button>
                    <Button leftSection={<IconDownload size={16} />} variant="light" disabled>
                        Descargar ZIP
                    </Button>
                </Group>

                <Text size="sm" c="dimmed">
                    Colaboradores de ejemplo (datos reales al conectar API):
                </Text>

                <Table withTableBorder striped>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th>Rol</Table.Th>
                            <Table.Th>Provincia</Table.Th>
                            <Table.Th>Acción</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {mockColaboradores.map((c) => (
                            <Table.Tr key={c.nombre}>
                                <Table.Td>{c.nombre}</Table.Td>
                                <Table.Td>{c.rol}</Table.Td>
                                <Table.Td>{c.provincia}</Table.Td>
                                <Table.Td>
                                    <Button size="xs" variant="subtle">
                                        Ver certificado
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Stack>
        </ModulePageShell>
    );
}
