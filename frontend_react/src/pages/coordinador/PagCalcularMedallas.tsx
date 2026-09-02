import { Button, FileInput, Group, Stack, Table, Text, Title } from '@mantine/core';
import { IconCalculator } from '@tabler/icons-react';
import { ModulePageShell } from '../../components/panel/ModulePageShell';

const mockCategorias = [
    { categoria: 'Superpegues', participantes: 120, validos: 118, oro: 12, plata: 24, bronce: 36 },
    { categoria: 'Benjamín', participantes: 450, validos: 440, oro: 44, plata: 88, bronce: 132 },
];

export default function PagCalcularMedallas() {
    return (
        <ModulePageShell
            badge="Coordinador Nacional"
            title="Calcular medallas"
            subtitle="Cálculo automático de medallas a partir del Excel oficial de resultados."
            backTo="/coordinador/dashboard"
            gradient="orange"
        >
            <Stack gap="xl">
                <div>
                    <Title order={4} mb="sm">
                        Subir Excel para cálculo
                    </Title>
                    <FileInput
                        label="Archivo Excel"
                        placeholder="Seleccionar archivo"
                        accept=".xlsx,.xls"
                        mb="md"
                    />
                    <Button leftSection={<IconCalculator size={16} />} disabled>
                        Calcular medallas
                    </Button>
                </div>

                <div>
                    <Title order={4} mb="md">
                        Vista previa del resultado (ejemplo)
                    </Title>
                    {mockCategorias.map((cat) => (
                        <Stack key={cat.categoria} gap="sm" mb="lg">
                            <Text fw={600}>{cat.categoria}</Text>
                            <Group gap="lg">
                                <Text size="sm">Participantes: {cat.participantes}</Text>
                                <Text size="sm">Válidos: {cat.validos}</Text>
                            </Group>
                            <Table withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Oro</Table.Th>
                                        <Table.Th>Plata</Table.Th>
                                        <Table.Th>Bronce</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Td>{cat.oro}</Table.Td>
                                        <Table.Td>{cat.plata}</Table.Td>
                                        <Table.Td>{cat.bronce}</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Stack>
                    ))}
                </div>
            </Stack>
        </ModulePageShell>
    );
}
