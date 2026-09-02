import { Avatar, Container, Fieldset, Grid, Paper, PasswordInput, TextInput, Title } from '@mantine/core';
import { Card, Text, Button } from '@mantine/core';
import { IconAt, IconLock, IconLockCheck } from '@tabler/icons-react';

export function CuentaCoordMunic() {
    
    return (
        <Container size={'lg'}>
            <Card >
                <Grid>
                    <Grid.Col span={5}>
                        <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
                            <Avatar
                                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-7.png"
                                size={120}
                                radius={120}
                                mx="auto"
                            />
                            <Text ta="center" fz="h4" fw={500} mt="md">
                                Helena Gomez Medina
                            </Text>
                            <Text ta="center" size="md">Coordinadora Municipal</Text>
                            <Text size='sm' ta="center" c="dimmed">Caibarien</Text>
                            <Text size='sm' ta="center" c="dimmed">gomezmedina@uclv.edu.cu</Text>
                            
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={7}>
                        <Paper radius="sm" withBorder p="lg" bg="var(--mantine-color-body)">
                            <Title ta="center" order={3} mb={10}>Editar Cuenta</Title>
                            <Fieldset legend="Datos personal">
                                <Grid>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="Nombre"
                                            withAsterisk
                                            // description="Input description"
                                            placeholder="Input placeholder"
                                            value={'Helena'}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="Apellidos"
                                            withAsterisk
                                            // description="Input description"
                                            placeholder="Input placeholder"
                                            value={'Gomez Medina'}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <TextInput 
                                    withAsterisk 
                                    label='Correo electronico'
                                    mb={10} 
                                    value={'gomezmedina@uclv.edu.cu'}
                                    placeholder="Correo electronico"
                                    leftSection={<IconAt size={16} />} 
                                />
                                <Button fullWidth>Cambiar datos</Button>
                            </Fieldset>
                            {/* Nueva Contraseña */}

                            <Fieldset legend="Nueva contraseña">
                                <Grid mt={10} mb={10}>
                                    <Grid.Col span={6}>
                                        <PasswordInput
                                            label='Nueva contraseña'
                                            leftSection={<IconLock size={16} />}
                                            placeholder="Digite aqui la contraseña"
                                            withAsterisk
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <PasswordInput
                                            label='Confirme la contraseña'
                                            withAsterisk
                                            leftSection={<IconLockCheck  size={16} />}
                                            placeholder="Confirme aqui la contraseña"
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Button fullWidth>Cambiar contraseña</Button>
                            </Fieldset>
                        
                        </Paper>
                    </Grid.Col>
                    
                </Grid>
            </Card>
        </Container>
    );
}