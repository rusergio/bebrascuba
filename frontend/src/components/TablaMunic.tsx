import { Avatar, Badge, Table, Group, Text, ActionIcon, Anchor, rem } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

const data = [
    {
        
        
        name: 'Robert Wolfkisser',
        job: 'Engineer',
        email: 'rob_wolf@gmail.com',
        phone: '+44 (452) 886 09 12',
    },
    {
        name: 'Jill Jailbreaker',
        job: 'Engineer',
        email: 'jj@breaker.com',
        phone: '+44 (934) 777 12 76',
    },
    {
        name: 'Henry Silkeater',
        job: 'Designer',
        email: 'henry@silkeater.io',
        phone: '+44 (901) 384 88 34',
    },
    {
        name: 'Bill Horsefighter',
        job: 'Designer',
        email: 'bhorsefighter@gmail.com',
        phone: '+44 (667) 341 45 22',
    },
    {
        name: 'Jeremy Footviewer',
        job: 'Manager',
        email: 'jeremy@foot.dev',
        phone: '+44 (881) 245 65 65',
    },
    ];

    const jobColors: Record<string, string> = {
    engineer: 'blue',
    manager: 'cyan',
    designer: 'pink',
    };

    export function TablaMunic() {
    const rows = data.map((item) => (
        <Table.Tr key={item.name}>
        <Table.Td>
            <Group gap="sm">
            
            <Text fz="sm" fw={500}>
                {item.name}
            </Text>
            </Group>
        </Table.Td>

        <Table.Td>
            <Badge color={jobColors[item.job.toLowerCase()]} variant="light">
            {item.job}
            </Badge>
        </Table.Td>
        <Table.Td>
            <Anchor component="button" size="sm">
            {item.email}
            </Anchor>
        </Table.Td>
        <Table.Td>
            <Text fz="sm">{item.phone}</Text>
        </Table.Td>
        <Table.Td>
            <Group gap={0} justify="flex-end">
            <ActionIcon variant="subtle" color="gray">
                <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red">
                <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
            </Group>
        </Table.Td>
        </Table.Tr>
    ));

    return (
        <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
            <Table.Thead>
            <Table.Tr>
                <Table.Th>Municipio</Table.Th>
                <Table.Th>Ubicacion</Table.Th>
                <Table.Th>Escuela</Table.Th>
                <Table.Th>Contacto</Table.Th>
                <Table.Th />
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        </Table.ScrollContainer>
    );
}