import { Avatar, Badge, Table, Group, Text, ActionIcon, Anchor, rem } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

    const data = [
    {
        avatar:
        'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png',
        name: 'Robert Wolfkisser',
        job: 'provincial',
        email: 'rob_wolf@gmail.com',
        phone: '+44 (452) 886 09 12',
    },
    {
        avatar:
        'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-7.png',
        name: 'Jill Jailbreaker',
        job: 'Municipal',
        email: 'jj@breaker.com',
        phone: '+44 (934) 777 12 76',
    },
    {
        avatar:
        'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
        name: 'Henry Silkeater',
        job: 'Municipal',
        email: 'henry@silkeater.io',
        phone: '+44 (901) 384 88 34',
    },
    {
        avatar:
        'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
        name: 'Bill Horsefighter',
        job: 'municipal',
        email: 'bhorsefighter@gmail.com',
        phone: '+44 (667) 341 45 22',
    },
    {
        avatar:
        'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
        name: 'Jeremy Footviewer',
        job: 'provincial',
        email: 'jeremy@foot.dev',
        phone: '+44 (881) 245 65 65',
    },
    ];

    const jobColors: Record<string, string> = {
    provincial: 'blue',
    municipal: 'green',
    };

    export function TablaCoord() {
    const rows = data.map((item) => (
        <Table.Tr key={item.name}>
        <Table.Td>
            <Group gap="sm">
            <Avatar size={30} src={item.avatar} radius={30} />
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
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Coordinador</Table.Th>
                <Table.Th>Correo Electronico</Table.Th>
                <Table.Th>Telefono</Table.Th>
                <Table.Th />
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        </Table.ScrollContainer>
    );
}