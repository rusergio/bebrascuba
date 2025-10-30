import { Table, Container, Title, Checkbox, Fieldset, Group, rem, Avatar, Text, Button, useMantineTheme, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
// import classes from '../styles/FeaturesCards.module.css';
import { IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

interface Profesor {  
    id: number;  
    nro_ci: string;  
    nombre: string;  
    apellidos: string;  
    correo: string;  
    telefono: string;  
    es_nuevo: boolean;  
    perfil_editado: boolean;  
    esta_activo: boolean;  
    nombre_escuela: string;  
    subsistema: string;  
    poblado: string;  
    telefono_escuela: string | null;  
}  
export function SolitudesACoordNac() {
    const [data, setData] = useState<Profesor[]>([]); 
    const theme = useMantineTheme();
    const [selection, setSelection] = useState<number[]>([]); 
    const [selectedCount, setSelectedCount] = useState(0);  
    
    // Método para listar los profesores inactivos 
    const listarProfesoresInactivos = async () => {  
      try {  
        const response = await axios.get<Profesor[]>('api/profesores-inactivos');  
        setData(response.data);  
        console.log(response.data);  
      } catch (error) {  
        console.error('Error al obtener los profesores inactivos:', error);  
      }  
    };
    // Método para aceptar un o mas solicitudes 
    const aceptarSolicitudes = async () => {  
        try {  
            for (const profesorId of selection) {  
              await axios.put(`/api/aceptar-solicitud/${profesorId}`, null, {  
                headers: {  
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),  
                },  
              });  
            }  
            setSelectedCount(0);  
            setSelection([]);  
            listarProfesoresInactivos();  
        } catch (error) {  
          console.error('Error al aceptar la solicitud:', error);  
          if (axios.isAxiosError(error)) {  
              console.error('Respuesta del servidor:', error.response?.data);  
          }  
        }  
    };

    useEffect(() => {  
        listarProfesoresInactivos();  
    }, []); 
    // 
    const toggleRow = (id: number) => {  
      setSelection((current) => {  
        if (current.includes(id)) {  
          setSelectedCount(selectedCount - 1);  
          return current.filter((item) => item !== id);  
        } else {  
          setSelectedCount(selectedCount + 1);  
          return [...current, id];  
        }  
      });  
    };  
    // 
    const toggleAll = () => {  
      if (selection.length === data.length) {  
        setSelectedCount(0);  
        setSelection([]);  
      } else {  
        setSelectedCount(data.length);  
        setSelection(data.map((item) => item.id));  
      }  
    }; 
    // 
    const row = data.map((item) => (  
      <Table.Tr 
        key={item.id}
        bg={selection.includes(item.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >  
        <Table.Td>  
          <Checkbox checked={selection.includes(item.id)} onChange={() => toggleRow(item.id)} />  
        </Table.Td>  
        <Table.Td>  
          <Group gap="sm">  
            <Avatar size={40} radius={40} />  
            <div>  
              <Text fz="sm" fw={500}>  
                {item.nombre} {item.apellidos}  
              </Text>  
              <Text fz="xs" c="dimmed">  
                {item.correo}  
              </Text>  
            </div>  
          </Group>  
        </Table.Td>  
        <Table.Td>{item.telefono}</Table.Td>  
        <Table.Td>{item.nombre_escuela}</Table.Td>  
        <Table.Td>{item.subsistema}</Table.Td>  
        <Table.Td>  
          {item.poblado} 
        </Table.Td>  
        <Table.Td>  
          {item.esta_activo ? (  
              <Badge color="teal">Activo</Badge>  
          ) : (  
              <Badge color="red">Pendiente</Badge>  
          )}  
          </Table.Td>   
      </Table.Tr>  
    ));
    return (
      <Container size='lg' mt={50}>
          <Title order={1} ta={'center'}>Solicitudes de <Text span c="blue" inherit>registro </Text></Title>
          <Fieldset legend="Solicitudes de Registro como profesor">
            <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm" highlightOnHover>
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
                        <Table.Th>Telefono</Table.Th>
                        <Table.Th>Escuela</Table.Th>
                        <Table.Th>Subsistema</Table.Th>
                        <Table.Th>Poblado</Table.Th>
                        <Table.Th>Estado</Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{row}</Table.Tbody>
                </Table>
            </Table.ScrollContainer>
            <Group>  
                <Button  
                  variant="gradient"  
                  rightSection={<IconCheck style={{ width: rem(18) }} />}  
                  onClick={aceptarSolicitudes}  
                  disabled={selectedCount === 0}  
                >  
                    Aceptar  
                </Button>
                <Button variant='gradient' bg={'red'} rightSection={<IconX style={{ width: rem(18) }} />}>
                  Denegar
                </Button>
            </Group>  
          </Fieldset>
      </Container>
    );
}