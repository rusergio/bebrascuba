import cx from 'clsx';
import { ActionIcon, useMantineColorScheme, useComputedColorScheme, Group } from '@mantine/core';
import { IconSun, IconMoon, IconBellFilled, IconBell } from '@tabler/icons-react';
import classes from '../styles/ActionToggle.module.css';

export function ActionSolic() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    return (
        <Group justify="center" >
            <ActionIcon
                // onClick={}
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
                radius={10}
            >
                
                <IconBellFilled className={cx(classes.icon, classes.dark)} stroke={1.5} />
            </ActionIcon>
        </Group>
    );
}