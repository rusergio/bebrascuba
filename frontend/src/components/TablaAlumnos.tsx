import { useState } from 'react';
import { Table, Checkbox } from '@mantine/core';
import { useDataContext } from '../context/DataContext';

interface Alumno {
  id: number;
  nombre_estudiante: string;
  sexo: string;
  nombre_escuela: string | null;
  grado: number | null;
  categoria: string | null;
}

export function TablaAlumnos() {
  // Usar datos del contexto en lugar de hacer fetch
  const { estudiantes: data } = useDataContext();
  const [selection, setSelection] = useState<number[]>([]);

  const toggleRow = (id: number) => {
  setSelection((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  );
};


  const toggleAll = () => {
    if (selection.length === data.length) {
      setSelection([]);
    } else {
      setSelection(data.map((alumno) => alumno.id));
    }
  };

  const rows = data.map((alumno) => (
    <Table.Tr
      key={alumno.id}
      bg={selection.includes(alumno.id) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          aria-label="Seleccionar fila"
          checked={selection.includes(alumno.id)} // ✅ Este es el punto clave
          onChange={() => toggleRow(alumno.id)}   // ✅ Alterna solo ese alumno
        />
      </Table.Td>
      <Table.Td>{alumno.nombre_estudiante}</Table.Td>
      <Table.Td>{alumno.nombre_escuela || '—'}</Table.Td>
      <Table.Td>{alumno.sexo}</Table.Td>
      <Table.Td>{alumno.grado !== null ? alumno.grado : '—'}</Table.Td>
      <Table.Td>{alumno.categoria || '—'}</Table.Td>
      <Table.Td>{alumno.id}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Checkbox
              onChange={toggleAll}
              checked={selection.length === data.length && data.length > 0}
              indeterminate={selection.length > 0 && selection.length < data.length}
              aria-label="Seleccionar todos"
            />
          </Table.Th>
          <Table.Th>Nombre</Table.Th>
          <Table.Th>Escuela</Table.Th>
          <Table.Th>Sexo</Table.Th>
          <Table.Th>Grado</Table.Th>
          <Table.Th>Categoria</Table.Th>
          <Table.Th>Id</Table.Th>

        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
