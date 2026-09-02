import { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Box, PasswordInput, Popover, Progress, Text, type PasswordInputProps } from '@mantine/core';

const requirements = [
    { re: /[0-9]/, label: 'Incluye un número' },
    { re: /[a-z]/, label: 'Incluye una letra minúscula' },
    { re: /[A-Z]/, label: 'Incluye una letra mayúscula' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Incluye un símbolo especial' },
] as const;

export function passwordMeetsAllRequirements(password: string): boolean {
    return password.length > 5 && requirements.every((req) => req.re.test(password));
}

function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text
            c={meets ? 'teal' : 'red'}
            style={{ display: 'flex', alignItems: 'center' }}
            mt={7}
            size="sm"
        >
            {meets ? <IconCheck size={14} /> : <IconX size={14} />}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}

type PasswordStrengthInputProps = Omit<PasswordInputProps, 'value' | 'onChange'> & {
    value: string;
    onChange: (value: string) => void;
};

export function PasswordStrengthInput({ value, onChange, ...props }: PasswordStrengthInputProps) {
    const [popoverOpened, setPopoverOpened] = useState(false);

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement
            key={index}
            label={requirement.label}
            meets={requirement.re.test(value)}
        />
    ));

    const strength = getStrength(value);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    return (
        <Popover
            opened={popoverOpened}
            position="bottom"
            width="target"
            transitionProps={{ transition: 'pop' }}
        >
            <Popover.Target>
                <div
                    onFocusCapture={() => setPopoverOpened(true)}
                    onBlurCapture={() => setPopoverOpened(false)}
                >
                    <PasswordInput
                        value={value}
                        onChange={(event) => onChange(event.currentTarget.value)}
                        {...props}
                    />
                </div>
            </Popover.Target>
            <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} mb="xs" />
                <PasswordRequirement
                    label="Incluye al menos 6 caracteres"
                    meets={value.length > 5}
                />
                {checks}
            </Popover.Dropdown>
        </Popover>
    );
}
