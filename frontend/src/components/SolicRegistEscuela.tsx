import { Container, Input, Button, CloseButton } from '@mantine/core';
import { Grid, Select } from '@mantine/core';
import { IconPhone, IconSchool, IconSend2 } from '@tabler/icons-react';
import { useState } from 'react';
import { IMaskInput } from 'react-imask';


export function SolicRegistEscuela() {
    const [value, setValue] = useState('Clear me');

    return (
        <Container >
            {/* Solicitar registro escuela */}
            <Grid mt={10}>
                <Grid.Col span={6}>
                    <Select
                        // label="Your favorite library"
                        clearable
                        placeholder="Seleccione la provincia"
                        data={['React', 'Angular', 'Vue', 'Svelte']}
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <Select
                        // label="Your favorite library"
                        clearable
                        placeholder="Seleccione el municipio"
                        data={['React', 'Angular', 'Vue', 'Svelte']}
                    />
                </Grid.Col>
            </Grid>

            <Input mt={10} placeholder="Nombre de escuela" leftSection={<IconSchool size={16} />} />
            <Grid mt={10}>
                <Grid.Col span={6}>
                    <Input 
                        leftSection={<IconPhone size={16} />}
                        component={IMaskInput}
                        mask="+00 00000000" 
                        placeholder="Numero de telefono de la escuela" 
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                <Input
                    leftSection={<IconPhone size={16} />}
                    placeholder="Contacto del solicitante"
                    component={IMaskInput} 
                    mask="00 000000"
                    value={value}
                    onChange={(event) => setValue(event.currentTarget.value)}
                    rightSectionPointerEvents="all"
                    rightSection={
                    <CloseButton
                        aria-label="Clear input"
                        onClick={() => setValue('')}
                        style={{ display: value ? undefined : 'none' }}
                    />
                    }
                />
                </Grid.Col>
                
                <Button ml={8} variant="filled" rightSection={<IconSend2 size={16} />} >Enviar solicitud</Button>
            </Grid>
        </Container>
    );
}