import { Combobox, Input, InputBase, Loader, Text, useCombobox } from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface SearchableAsyncComboboxProps {
    label: string;
    placeholder?: string;
    value: string | null;
    onChange: (value: string | null, option?: ComboboxOption) => void;
    loadOptions: () => Promise<ComboboxOption[]>;
    disabled?: boolean;
    withAsterisk?: boolean;
    leftSection?: React.ReactNode;
    description?: string;
    error?: string;
    /** Al cambiar, se invalida la caché y se recargan opciones al abrir */
    cacheKey?: string | number | null;
}

export function SearchableAsyncCombobox({
    label,
    placeholder = 'Seleccionar…',
    value,
    onChange,
    loadOptions,
    disabled = false,
    withAsterisk,
    leftSection,
    description,
    error,
    cacheKey,
}: SearchableAsyncComboboxProps) {
    const combobox = useCombobox({
        onDropdownClose: () => {
            combobox.resetSelectedOption();
            const selected = data.find((o) => o.value === value);
            setSearch(selected?.label ?? '');
        },
    });

    const [data, setData] = useState<ComboboxOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const loadedCacheKey = useRef<string | number | null | undefined>(undefined);

    const selectedLabel = useMemo(
        () => data.find((o) => o.value === value)?.label ?? '',
        [data, value],
    );

    useEffect(() => {
        if (!value) {
            setSearch('');
            return;
        }
        if (selectedLabel) {
            setSearch(selectedLabel);
        }
    }, [value, selectedLabel]);

    useEffect(() => {
        if (cacheKey !== loadedCacheKey.current) {
            setData([]);
            loadedCacheKey.current = undefined;
            if (!value) setSearch('');
        }
    }, [cacheKey, value]);

    const fetchData = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const options = await loadOptions();
            setData(options);
            loadedCacheKey.current = cacheKey;
        } finally {
            setLoading(false);
            combobox.resetSelectedOption();
        }
    }, [loadOptions, loading, cacheKey, combobox]);

    const openDropdown = () => {
        if (disabled) return;
        combobox.openDropdown();
        if (data.length === 0 || loadedCacheKey.current !== cacheKey) {
            void fetchData();
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data;
        const exactInList = data.some((o) => o.label.toLowerCase() === q);
        if (exactInList) return data;
        return data.filter((o) => o.label.toLowerCase().includes(q));
    }, [data, search]);

    const options = filtered.map((item) => (
        <Combobox.Option value={item.value} key={item.value}>
            {item.label}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal
            onOptionSubmit={(val) => {
                const option = data.find((o) => o.value === val);
                onChange(val, option);
                setSearch(option?.label ?? '');
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    label={label}
                    description={description}
                    error={error}
                    withAsterisk={withAsterisk}
                    leftSection={leftSection}
                    disabled={disabled}
                    component="input"
                    pointer={!disabled}
                    rightSection={loading ? <Loader size={16} /> : <Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.currentTarget.value);
                        openDropdown();
                        combobox.updateSelectedOptionIndex();
                        if (!event.currentTarget.value) {
                            onChange(null);
                        }
                    }}
                    onClick={openDropdown}
                    onFocus={openDropdown}
                    placeholder={placeholder}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options mah={220} style={{ overflowY: 'auto' }}>
                    {loading ? (
                        <Combobox.Empty>
                            <Text size="sm" c="dimmed">
                                Cargando…
                            </Text>
                        </Combobox.Empty>
                    ) : options.length > 0 ? (
                        options
                    ) : (
                        <Combobox.Empty>
                            <Text size="sm" c="dimmed">
                                Sin coincidencias
                            </Text>
                        </Combobox.Empty>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
