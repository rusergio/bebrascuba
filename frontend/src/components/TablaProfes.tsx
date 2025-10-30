import { Avatar, Badge, Table, Group, Text, Select, Checkbox, rem } from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

const data = [
  {
    id: '1',
    avatar:
      'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png',
    name: 'Robert Wolfkisser',
    job: 'Engineer',
    email: 'rob_wolf@gmail.com',
    role: 'Collaborator',
    phone: '+44 (452) 886 09 12',
    lastActive: '2 days ago',
    active: true,
  },
  {
    id: '2',
    avatar:
      'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-6.png',
    name: 'Jill Jailbreaker',
    job: 'Engineer',
    email: 'jj@breaker.com',
    role: 'Collaborator',
    phone: '+44 (934) 777 12 76',
    lastActive: '6 days ago',
    active: true,
  },
  {
    id: '3',
    avatar:
      'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
    name: 'Henry Silkeater',
    job: 'Designer',
    email: 'henry@silkeater.io',
    role: 'Contractor',
    phone: '+44 (901) 384 88 34',
    lastActive: '2 days ago',
    active: false,
  },
  {
    id: '4',
    avatar:
      'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
    name: 'Bill Horsefighter',
    job: 'Designer',
    email: 'bhorsefighter@gmail.com',
    role: 'Contractor',
    phone: '+44 (667) 341 45 22',
    lastActive: '5 days ago',
    active: true,
  },
  {
    id: '5',
    avatar:
      'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
    name: 'Jeremy Footviewer',
    job: 'Manager',
    email: 'jeremy@foot.dev',
    role: 'Manager',
    phone: '+44 (881) 245 65 65',
    lastActive: '3 days ago',
    active: false,
  },
];

const rolesData = ['Manager', 'Collaborator', 'Contractor'];

export function TablaProfes() {
  
  
  const [selection, setSelection] = useState<string[]>([]);  
  // const [scrolled, setScrolled] = useState(false);  

  const toggleRow = (id: string) =>  
    setSelection((current) =>  
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]  
    );  

  const toggleAll = () =>  
    setSelection((current) => (current.length === data.length ? [] : data.map((item) => item.id))); 

  const rows = data.map((item) => (
    <Table.Tr key={item.name}>
      <Table.Td>
      <Checkbox checked={selection.includes(item.id)} onChange={() => toggleRow(item.id)} /> 
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={40} src={item.avatar} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {item.email}
            </Text>
          </div>
        </Group>
      </Table.Td>

      <Table.Td>
        <Select
          data={rolesData}
          defaultValue={item.role}
          variant="unstyled"
          allowDeselect={false}
        />
      </Table.Td>
      <Table.Td>{item.phone}</Table.Td>
      <Table.Td>{item.lastActive}</Table.Td>
      <Table.Td>
        {item.active ? (
          <Badge fullWidth variant="light">
            Active
          </Badge>
        ) : (
          <Badge color="red" fullWidth variant="light">
            Disabled
          </Badge>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: rem(40) }}>
              <Checkbox
                onChange={toggleAll}
                checked={selection.length === data.length}
                indeterminate={selection.length > 0 && selection.length !== data.length}
              />
            </Table.Th>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Categoria</Table.Th>
            <Table.Th>Telefono</Table.Th>
            <Table.Th>Ultima activación</Table.Th>
            <Table.Th>Estado</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}