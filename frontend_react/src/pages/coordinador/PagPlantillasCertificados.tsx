import { Badge, Stack, Table, Text } from '@mantine/core';
import { ModulePageShell } from '../../components/panel/ModulePageShell';

const mockPlantillas = [
    { nombre: 'Participación 2024', tipo: 'Participación', estado: 'Activa', edicion: '2024' },
    { nombre: 'Medalla Oro 2024', tipo: 'Medalla', estado: 'Activa', edicion: '2024' },
    { nombre: 'Medalla Plata 2024', tipo: 'Medalla', estado: 'Activa', edicion: '2024' },
    { nombre: 'Colaborador 2024', tipo: 'Colaborador', estado: 'Borrador', edicion: '2024' },
];

export default function PagPlantillasCertificados() {
    return (
        <ModulePageShell
            badge="Coordinador Nacional"
            title="Plantillas de certificados"
            subtitle="Consulta las plantillas activas para certificados de participación y medallas."
            backTo="/coordinador/dashboard"
            gradient="violet"
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    Plantillas registradas en el sistema para la generación de certificados PDF.
                </Text>
                <Table.ScrollContainer minWidth={600}>
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Nombre</Table.Th>
                                <Table.Th>Tipo</Table.Th>
                                <Table.Th>Edición</Table.Th>
                                <Table.Th>Estado</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {mockPlantillas.map((p) => (
                                <Table.Tr key={p.nombre}>
                                    <Table.Td>{p.nombre}</Table.Td>
                                    <Table.Td>{p.tipo}</Table.Td>
                                    <Table.Td>{p.edicion}</Table.Td>
                                    <Table.Td>
                                        <Badge color={p.estado === 'Activa' ? 'teal' : 'gray'} variant="light">
                                            {p.estado}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Stack>
        </ModulePageShell>
    );
}
