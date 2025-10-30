import { Paper, Stack, Text, Button, Group, Badge, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';

/**
 * Componente de demostración que simula usuarios con múltiples roles
 * para mostrar cómo funciona la barra de navegación unificada
 */
export function MultiRoleDemo() {
    const [demoUser, setDemoUser] = useState<string>('');
    
    const demoUsers = [
        {
            name: 'Usuario con un solo rol',
            roles: ['profesor'],
            description: 'Ve solo los enlaces de profesor: Inicio, Recurso, Gestionar Alumnos, GeoBebras'
        },
        {
            name: 'Coordinador Nacional + Profesor',
            roles: ['coordinador_nacional', 'profesor'],
            description: 'Ve enlaces de ambos roles: Inicio, Recurso, Gestionar Alumnos, Gestionar Concurso, GeoBebras'
        },
        {
            name: 'Administrador + Coordinador Nacional',
            roles: ['administrador', 'coordinador_nacional'],
            description: 'Ve enlaces de ambos roles: Inicio, Recurso, Administrar concurso, Gestionar Concurso, GeoBebras'
        },
        {
            name: 'Usuario sin roles',
            roles: [],
            description: 'Ve la barra de navegación inicial (sin enlaces específicos)'
        }
    ];

    const simulateUser = (userIndex: number) => {
        const user = demoUsers[userIndex];
        setDemoUser(user.name);
        
        // Simular en localStorage
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userRole', user.roles[0] || '');
        
        // Simular roles múltiples en el contexto (esto sería manejado por el backend)
        console.log('Simulando usuario:', user);
        console.log('Roles:', user.roles);
        
        // Recargar la página para que se aplique el cambio
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const resetDemo = () => {
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setDemoUser('');
        window.location.reload();
    };

    return (
        <Paper p="lg" shadow="sm" radius="md" m="md">
            <Stack gap="md">
                <Alert
                    icon={<IconInfoCircle size={16} />}
                    title="Demostración de Múltiples Roles"
                    color="blue"
                >
                    Este componente simula diferentes tipos de usuarios para demostrar 
                    cómo la barra de navegación unificada se adapta a múltiples roles.
                </Alert>

                <Text size="lg" fw={600}>
                    Usuarios de demostración:
                </Text>

                <Stack gap="sm">
                    {demoUsers.map((user, index) => (
                        <Paper key={index} p="md" withBorder radius="sm">
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text fw={500}>{user.name}</Text>
                                    <Group gap="xs">
                                        {user.roles.map((role, roleIndex) => (
                                            <Badge key={roleIndex} color="blue" variant="light" size="sm">
                                                {role}
                                            </Badge>
                                        ))}
                                        {user.roles.length === 0 && (
                                            <Badge color="gray" variant="outline" size="sm">
                                                Sin roles
                                            </Badge>
                                        )}
                                    </Group>
                                </Group>
                                
                                <Text size="sm" c="dimmed">
                                    {user.description}
                                </Text>
                                
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => simulateUser(index)}
                                    disabled={demoUser === user.name}
                                >
                                    {demoUser === user.name ? 'Activo' : 'Simular este usuario'}
                                </Button>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>

                {demoUser && (
                    <Alert color="green" title="Usuario simulado activo">
                        <Text size="sm">
                            Usuario actual: <strong>{demoUser}</strong>
                        </Text>
                        <Button
                            size="xs"
                            variant="outline"
                            color="red"
                            mt="xs"
                            onClick={resetDemo}
                        >
                            Restablecer
                        </Button>
                    </Alert>
                )}

                <Paper p="md" bg="gray.0" radius="sm">
                    <Text size="sm" fw={600} mb="xs">
                        Instrucciones:
                    </Text>
                    <Text size="sm" c="dimmed">
                        1. Selecciona un tipo de usuario para simular<br/>
                        2. Observa cómo cambia la barra de navegación<br/>
                        3. Los usuarios con múltiples roles verán enlaces de todos sus roles<br/>
                        4. Usa "Restablecer" para volver al estado inicial
                    </Text>
                </Paper>
            </Stack>
        </Paper>
    );
}
