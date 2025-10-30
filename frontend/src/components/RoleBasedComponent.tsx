import { Text, Paper, Group, Badge, Stack } from '@mantine/core';
import { useUserRoles } from '../context/UserContext';

/**
 * Componente de ejemplo que demuestra cómo usar el hook useUserRoles
 * para mostrar contenido basado en los roles del usuario
 */
export function RoleBasedComponent() {
    const { roles, hasRole, hasAnyRole, user } = useUserRoles();

    return (
        <Paper p="md" shadow="sm" radius="md" m="md">
            <Stack gap="md">
                <Text size="lg" fw={600}>
                    Información del Usuario y Roles
                </Text>
                
                <Group>
                    <Text size="sm" c="dimmed">Usuario:</Text>
                    <Text fw={500}>{user?.nombre || localStorage.getItem('userName') || 'No disponible'}</Text>
                </Group>

                <Group>
                    <Text size="sm" c="dimmed">Roles actuales:</Text>
                    <Group gap="xs">
                        {roles.length > 0 ? (
                            roles.map((role, index) => (
                                <Badge key={index} color="blue" variant="light">
                                    {role}
                                </Badge>
                            ))
                        ) : (
                            <Badge color="gray" variant="outline">
                                Sin roles asignados
                            </Badge>
                        )}
                    </Group>
                </Group>

                {/* Ejemplos de verificación de roles */}
                <Stack gap="xs">
                    <Text size="sm" fw={600}>Verificaciones de permisos:</Text>
                    
                    <Group>
                        <Text size="sm">¿Es Profesor?</Text>
                        <Badge color={hasRole('profesor') ? 'green' : 'red'} variant="light">
                            {hasRole('profesor') ? 'Sí' : 'No'}
                        </Badge>
                    </Group>

                    <Group>
                        <Text size="sm">¿Es Coordinador Nacional?</Text>
                        <Badge color={hasRole('coordinador_nacional') ? 'green' : 'red'} variant="light">
                            {hasRole('coordinador_nacional') ? 'Sí' : 'No'}
                        </Badge>
                    </Group>

                    <Group>
                        <Text size="sm">¿Es Administrador?</Text>
                        <Badge color={hasRole('administrador') ? 'green' : 'red'} variant="light">
                            {hasRole('administrador') ? 'Sí' : 'No'}
                        </Badge>
                    </Group>

                    <Group>
                        <Text size="sm">¿Tiene algún rol de coordinador?</Text>
                        <Badge color={hasAnyRole(['coordinador_nacional', 'coordinador_provincial', 'coordinador_municipal']) ? 'green' : 'red'} variant="light">
                            {hasAnyRole(['coordinador_nacional', 'coordinador_provincial', 'coordinador_municipal']) ? 'Sí' : 'No'}
                        </Badge>
                    </Group>
                </Stack>

                {/* Contenido condicional basado en roles */}
                <Stack gap="xs">
                    <Text size="sm" fw={600}>Contenido específico por rol:</Text>
                    
                    {hasRole('profesor') && (
                        <Paper p="xs" bg="blue.0" radius="sm">
                            <Text size="sm" c="blue">
                                🎓 Contenido visible solo para profesores
                            </Text>
                        </Paper>
                    )}

                    {hasRole('coordinador_nacional') && (
                        <Paper p="xs" bg="green.0" radius="sm">
                            <Text size="sm" c="green">
                                🏛️ Contenido visible solo para coordinadores nacionales
                            </Text>
                        </Paper>
                    )}

                    {hasRole('administrador') && (
                        <Paper p="xs" bg="red.0" radius="sm">
                            <Text size="sm" c="red">
                                ⚙️ Contenido visible solo para administradores
                            </Text>
                        </Paper>
                    )}

                    {hasAnyRole(['coordinador_nacional', 'coordinador_provincial']) && (
                        <Paper p="xs" bg="orange.0" radius="sm">
                            <Text size="sm" c="orange">
                                📊 Contenido visible para coordinadores (nacional o provincial)
                            </Text>
                        </Paper>
                    )}

                    {/* Ejemplo de usuario con múltiples roles */}
                    {hasAnyRole(['profesor', 'coordinador_nacional']) && (
                        <Paper p="xs" bg="purple.0" radius="sm">
                            <Text size="sm" c="purple">
                                🎯 Este usuario tiene permisos de profesor Y coordinador nacional
                            </Text>
                        </Paper>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
