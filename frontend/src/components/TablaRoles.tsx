import { Anchor, Avatar, Badge, Container, Fieldset, Group, Table, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración


interface Coordinador {
  id: number;
  nro_ci: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  es_nuevo: boolean
  perfil_editado: boolean
  esta_activo: boolean
  foto_perfil: string|null;
  rol: string;
}

export function TablaRoles() {
  const [data, setData] =useState<Coordinador[]>([]); 
  const [rolesData, setRolesData] = useState<string[]>([]);

  const listarCoordinadores = async () => {  
      try {  
          const response = await axios.get<Coordinador[]>('api/listar-coordinadores');  
          setData(response.data);
          // console.log(response.data);  
      } catch (error) {  
        console.error('Error al obtener los profesores inactivos:', error);  
      }  
  };

  const listarRoles = async () => {  
    try {  
      const response = await axios.get<string[]>('api/listar-roles');  
      setRolesData(response.data);
      console.log(rolesData);
    } catch (error) {  
      console.error('Error al obtener roles:', error);  
    }  
  };
  useEffect(() => {  
    listarCoordinadores();  
    listarRoles();
  }, []); 
    const rows = data.map((item) => (
        <Table.Tr key={item.nro_ci}>
        <Table.Td>
            <Group gap="sm">
            <Avatar size={40}  radius={40} />
            <div>
                <Text fz="sm" fw={500}>
                {item.nombre} {item.apellidos}
                </Text>
            </div>
            </Group>
        </Table.Td>

        <Table.Td>
            {item.rol}
        </Table.Td>
        <Table.Td>
            <Anchor size="sm">
              {item.correo}
            </Anchor> 
        </Table.Td>
        <Table.Td>
            {item.telefono}
        </Table.Td>
        
        <Table.Td>
            {item.esta_activo ? (
            <Badge fullWidth variant="light">
                Activo
            </Badge>
            ) : (
            <Badge color="gray" fullWidth variant="light">
                Desactivo
            </Badge>
            )}
        </Table.Td>
        </Table.Tr>
    ));

    return (
      <Container size='lg' mt={50}>
        <Fieldset legend="Tabla de los coordinadores">
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                      <Table.Th>Nombre</Table.Th>
                      <Table.Th>Rol</Table.Th>
                      <Table.Th>Correo</Table.Th>
                      <Table.Th>Telefono</Table.Th>
                      <Table.Th>Estado</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Fieldset>
      </Container>
    );
}