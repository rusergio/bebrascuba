import { Badge, Button, Group, Select, Stack, Table, Text } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { ModulePageShell } from '../../components/panel/ModulePageShell';

const mockHistoricos = [
    { estudiante: 'Carlos Méndez', edicion: '2021', tipo: 'Participación', verificado: true },
    { estudiante: 'Elena Torres', edicion: '2020', tipo: 'Medalla Oro', verificado: false },
];

export default function PagCertificadosHistoricos() {
    return (
        <ModulePageShell
            badge="Coordinador Nacional"
            title="Certificados históricos"
            subtitle="Gestionar y consultar certificados históricos importados al sistema."
            backTo="/coordinador/dashboard"
            gradient="violet"
        >
            <Stack gap="lg">
                <Group wrap="wrap" align="flex-end">
                    <Select label="Edición histórica" data={['2021', '2020', '2019']} w={180} />
                    <Button leftSection={<IconUpload size={16} />} variant="light" disabled>
                        Importar históricos
                    </Button>
                </Group>

                <Text size="sm" c="dimmed">
                    Registros históricos de ejemplo:
                </Text>

                <Table withTableBorder striped>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Estudiante</Table.Th>
                            <Table.Th>Edición</Table.Th>
                            <Table.Th>Tipo</Table.Th>
                            <Table.Th>Verificado</Table.Th>
                            <Table.Th>Acciones</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {mockHistoricos.map((h) => (
                            <Table.Tr key={`${h.estudiante}-${h.edicion}`}>
                                <Table.Td>{h.estudiante}</Table.Td>
                                <Table.Td>{h.edicion}</Table.Td>
                                <Table.Td>{h.tipo}</Table.Td>
                                <Table.Td>
                                    <Badge color={h.verificado ? 'teal' : 'gray'} variant="light">
                                        {h.verificado ? 'Sí' : 'No'}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Button size="xs" variant="subtle">
                                        Ver PDF
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
