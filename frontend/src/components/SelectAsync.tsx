import { Combobox, Input, InputBase, Loader, useCombobox } from '@mantine/core';
import { useState } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración

interface Provincia {
    value: string;
    label: string;
}

export function SelectAsync() {
  const [value, setValue] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (provinces.length === 0 && !loading) {
        setLoading(true);
        const fetchProvinces = async () => {
          try {
            const response = await axios.get('/api/provincias');
            const provincesData = response.data.map((provincia: { codigo: number; nombre: string }) => ({
              value: String(provincia.codigo),
              label: provincia.nombre,
            }));
            setProvinces(provincesData);
          } catch (error) {
            console.error("Error al cargar las provincias", error);
          } finally {
            setLoading(false);
            combobox.resetSelectedOption();
          }
        };
        fetchProvinces();
      }
    },
  });

  const options = provinces.map((provincia) => (
    <Combobox.Option value={provincia.value} key={provincia.value}>
      {provincia.label}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        setValue(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={loading ? <Loader size={18} /> : <Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
        >
          {provinces.find((p) => p.value === value)?.label || (
            <Input.Placeholder>Selecciona una provincia</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {loading ? <Combobox.Empty>Cargando provincias...</Combobox.Empty> : options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}