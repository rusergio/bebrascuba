import { InputBase, type InputBaseProps } from '@mantine/core';
import { IMaskInput } from 'react-imask';
import type { ComponentPropsWithoutRef } from 'react';

type MaskInputFieldProps = Omit<InputBaseProps, 'component'> & {
    /** Patrón estilo Mantine: `9` = dígito, resto = literales */
    mask: string;
    placeholder?: string;
} & Partial<Pick<ComponentPropsWithoutRef<typeof IMaskInput>, 'onAccept' | 'value' | 'unmask'>>;

/**
 * Campo con máscara compatible con la API de Mantine MaskInput.
 * Usa IMask internamente (MaskInput de @mantine/core requiere v9 + React 19).
 */
export function MaskInputField({ mask, ...props }: MaskInputFieldProps) {
    const imaskPattern = mask.replace(/9/g, '0');
    return <InputBase component={IMaskInput} mask={imaskPattern} {...props} />;
}
