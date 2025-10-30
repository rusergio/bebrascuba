import cx from 'clsx';
import { ActionIcon, Group } from '@mantine/core';
import { IconPaperBag } from '@tabler/icons-react';
import classes from '../styles/ActionToggle.module.css';

export function BotonEdicion() {
    
    return (
        <Group justify="center">
            <ActionIcon
                
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
                radius={6}
            >
                <IconPaperBag className={cx(classes.icon, classes.light)} stroke={1.5} />
                <IconPaperBag className={cx(classes.icon, classes.dark)} stroke={1.5} />
            </ActionIcon>
        </Group>
    );
}