import {
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Group,
    Paper,
    Select,
    Stack,
    Text,
    ThemeIcon,
    Title,
    UnstyledButton,
} from '@mantine/core';
import {
    IconAt,
    IconBuilding,
    IconChevronRight,
    IconEyeSearch,
    IconId,
    IconMapPin,
    IconPhone,
    IconSchool,
    IconSettings,
    IconShieldLock,
    IconUser,
    IconUserCheck,
    IconUserPlus,
    IconUserShare,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useUserContext, useUserRoles } from '../context/UserContext';
import classes from '../styles/MiPerfil.module.css';

const formatTelefono = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length === 10 && digits.startsWith('53')) {
        const local = digits.slice(2);
        return `${local.slice(0, 4)}-${local.slice(4)}`;
    }
    return digits;
};

interface RoleData {
    id: number;
    rol: string;
    descripcion?: string;
    estado?: boolean;
}

interface SectionHeaderProps {
    icon: typeof IconAt;
    color: string;
    title: string;
    subtitle: string;
}

function SectionHeader({ icon: Icon, color, title, subtitle }: SectionHeaderProps) {
    return (
        <Group gap="sm" mb="lg" wrap="nowrap" className={classes.sectionHeader}>
            <ThemeIcon size={40} radius="md" variant="light" color={color}>
                <Icon size={20} />
            </ThemeIcon>
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Title order={4} lh={1.2}>
                    {title}
                </Title>
                <Text size="sm" c="dimmed" lh={1.3}>
                    {subtitle}
                </Text>
            </Stack>
        </Group>
    );
}

interface InfoRowProps {
    icon: typeof IconAt;
    color: string;
    label: string;
    value: string;
}

function InfoRow({ icon: Icon, color, label, value }: InfoRowProps) {
    return (
        <Box className={classes.infoRow}>
            <ThemeIcon size={36} radius="md" variant="light" color={color} className={classes.infoIcon}>
                <Icon size={18} />
            </ThemeIcon>
            <Stack gap={2} className={classes.infoContent}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
                    {label}
                </Text>
                <Text size="sm" fw={500} lh={1.4}>
                    {value}
                </Text>
            </Stack>
        </Box>
    );
}

interface ActionLinkProps {
    icon: typeof IconAt;
    color: string;
    label: string;
    description: string;
    to: string;
}

function ActionLink({ icon: Icon, color, label, description, to }: ActionLinkProps) {
    return (
        <UnstyledButton component={Link} to={to} className={classes.actionLink}>
            <ThemeIcon size={36} radius="md" variant="light" color={color}>
                <Icon size={18} />
            </ThemeIcon>
            <Stack gap={2} className={classes.infoContent}>
                <Text size="sm" fw={600} lh={1.3}>
                    {label}
                </Text>
                <Text size="xs" c="dimmed" lh={1.35}>
                    {description}
                </Text>
            </Stack>
            <IconChevronRight size={18} className={classes.actionChevron} />
        </UnstyledButton>
    );
}

const ADMIN_ACTIONS: ActionLinkProps[] = [
    {
        icon: IconUserPlus,
        color: 'grape',
        label: 'Registrar nuevo usuario',
        description: 'Crear cuentas de coordinadores y personal',
        to: '/admin_concurso',
    },
    {
        icon: IconUserShare,
        color: 'grape',
        label: 'Asignar rol',
        description: 'Gestionar permisos de usuarios existentes',
        to: '/asignar-rol',
    },
    {
        icon: IconEyeSearch,
        color: 'grape',
        label: 'Ver usuarios registrados',
        description: 'Consultar el listado completo del sistema',
        to: '/usuarios',
    },
];

export function MiPerfil() {
    const { setActiveRole } = useUserContext();
    const { activeRole, allRoles } = useUserRoles();
    const [updateRol, setUpdateRol] = useState<string>(() => localStorage.getItem('userRole') || '');
    const [userTelefono, setUserTelefono] = useState(
        () => localStorage.getItem('userTelefono') || '',
    );
    const [rolesData, setRolesData] = useState<RoleData[]>([]);

    const userName = localStorage.getItem('userName') || '';
    const userLastName = localStorage.getItem('userLastName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userCI = localStorage.getItem('userCI') || '';
    const userProvincia = localStorage.getItem('userProvincia') || '';
    const userMunicipio = localStorage.getItem('userMunicipio') || '';
    const userSchool = localStorage.getItem('userSchoolName') || '';

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) setUpdateRol(storedRole);
    }, []);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await axios.get<{
                    user: {
                        telefono?: string;
                        nro_ci?: string;
                        roles?: RoleData[];
                    };
                }>('api/user/me');
                if (data.user?.telefono) {
                    setUserTelefono(data.user.telefono);
                    localStorage.setItem('userTelefono', data.user.telefono);
                }
                if (data.user?.nro_ci) {
                    localStorage.setItem('userCI', data.user.nro_ci);
                }
                if (data.user?.roles?.length) {
                    setRolesData(data.user.roles);
                }
            } catch {
                try {
                    const raw = localStorage.getItem('allUserRolesData');
                    if (raw) setRolesData(JSON.parse(raw));
                } catch {
                    // respaldo local
                }
            }
        };
        void loadProfile();
    }, []);

    const handleRoleChange = (newRole: string | null) => {
        if (!newRole) return;

        setActiveRole(newRole);
        setUpdateRol(newRole);
        localStorage.setItem('activeRole', newRole);

        try {
            const rolesDataRaw = localStorage.getItem('allUserRolesData');
            if (rolesDataRaw) {
                const parsed = JSON.parse(rolesDataRaw);
                const roleObj = Array.isArray(parsed)
                    ? parsed.find((r: { rol: string }) => r.rol === newRole)
                    : null;
                if (roleObj) {
                    const profId = roleObj.profesorId ?? (roleObj.profesor ? roleObj.profesor.id : null);
                    if (profId) localStorage.setItem('profesorId', String(profId));
                }
            }
        } catch {
            // metadata opcional
        }

        window.dispatchEvent(new Event('localStorageUpdate'));
    };

    const currentRole = activeRole || updateRol;
    const isAdministrador = currentRole === 'Administrador';
    const hasUbicacion = !!(userProvincia || userMunicipio || userSchool);
    const initials = `${userName.charAt(0).toUpperCase() || 'U'}${userLastName.charAt(0).toUpperCase() || ''}`;
    const telefonoDisplay = formatTelefono(userTelefono) || '—';

    const accentColor = isAdministrador ? 'grape' : 'blue';

    const heroText = useMemo(() => {
        if (isAdministrador) {
            return 'Administra usuarios, roles y cuentas del sistema BebrasCuba. Para cambiar contraseña, correo o teléfono, usa Gestionar cuenta.';
        }
        return 'Consulta tus datos de contacto y ubicación. Para cambiar contraseña, correo o teléfono, usa Gestionar cuenta.';
    }, [isAdministrador]);

    const contactoItems: InfoRowProps[] = [
        { icon: IconAt, color: 'cyan', label: 'Correo electrónico', value: userEmail || '—' },
        { icon: IconPhone, color: 'cyan', label: 'Teléfono de contacto', value: telefonoDisplay },
        { icon: IconId, color: 'cyan', label: 'Carné de identidad', value: userCI || '—' },
    ];

    const ubicacionItems: InfoRowProps[] = [
        { icon: IconMapPin, color: 'teal', label: 'Provincia', value: userProvincia || '—' },
        { icon: IconBuilding, color: 'teal', label: 'Municipio', value: userMunicipio || '—' },
        { icon: IconSchool, color: 'teal', label: 'Centro educativo', value: userSchool || '—' },
    ];

    const adminRoleDesc =
        rolesData.find((r) => r.rol === 'Administrador')?.descripcion ||
        'Administrador del sistema BebrasCuba';

    const adminInfoItems: InfoRowProps[] = [
        {
            icon: IconShieldLock,
            color: 'grape',
            label: 'Nivel de acceso',
            value: adminRoleDesc,
        },
        {
            icon: IconUserCheck,
            color: 'grape',
            label: 'Roles asignados',
            value:
                rolesData.length > 0
                    ? rolesData.map((r) => r.rol).join(', ')
                    : allRoles.length > 0
                      ? allRoles.join(', ')
                      : 'Administrador',
        },
    ];

    return (
        <Container size="lg" py="xl" className={classes.wrapper}>
            <Paper
                radius="lg"
                className={isAdministrador ? classes.heroAdmin : classes.hero}
                p="xl"
                mb={0}
            >
                <Text size="xs" tt="uppercase" fw={700} c="white" opacity={0.85} lts={1}>
                    {isAdministrador ? 'Administración' : 'Cuenta'}
                </Text>
                <Title order={2} c="white" mt={4}>
                    {isAdministrador ? 'Perfil de administrador' : 'Mi perfil'}
                </Title>
                <Text c="white" opacity={0.9} size="sm" mt="xs" maw={520}>
                    {heroText}
                </Text>
            </Paper>

            <Paper radius="lg" shadow="sm" withBorder className={classes.mainPanel}>
                <Grid gutter={0} align="stretch">
                    <Grid.Col
                        span={{ base: 12, md: 4 }}
                        className={`${classes.profileColumn} ${isAdministrador ? classes.profileColumnAdmin : ''}`}
                    >
                        <Stack align="center" gap="sm" className={classes.profileInner}>
                            <Avatar
                                size={96}
                                radius={96}
                                className={isAdministrador ? classes.avatarRingAdmin : classes.avatarRing}
                                color={accentColor}
                            >
                                <Text size="xl" fw={700}>
                                    {initials}
                                </Text>
                            </Avatar>
                            <Title order={3} ta="center" lh={1.25} maw={260}>
                                {userName} {userLastName}
                            </Title>
                            <Text c="dimmed" size="sm" ta="center" lineClamp={2} maw={260}>
                                {userEmail}
                            </Text>
                            {currentRole && (
                                <Badge size="md" variant="light" color={accentColor}>
                                    {currentRole}
                                </Badge>
                            )}

                            {allRoles.length > 1 && (
                                <Select
                                    mt="xs"
                                    size="sm"
                                    label="Rol activo"
                                    placeholder="Selecciona un rol"
                                    value={currentRole}
                                    onChange={handleRoleChange}
                                    data={allRoles.map((role) => ({ value: role, label: role }))}
                                    leftSection={<IconUserCheck size={16} />}
                                    radius="md"
                                    w="100%"
                                    maw={260}
                                />
                            )}

                            <Button
                                component={Link}
                                to="/gestionar_cuenta"
                                variant="light"
                                color={accentColor}
                                leftSection={<IconSettings size={18} />}
                                radius="md"
                                fullWidth
                                mt="xs"
                                maw={260}
                            >
                                Gestionar cuenta
                            </Button>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }} className={classes.infoColumn}>
                        <SectionHeader
                            icon={IconUser}
                            color="cyan"
                            title="Datos de contacto"
                            subtitle="Información para comunicarnos contigo"
                        />
                        <Stack gap="md" className={classes.infoList}>
                            {contactoItems.map((item, i) => (
                                <Box key={item.label}>
                                    <InfoRow {...item} />
                                    {i < contactoItems.length - 1 && (
                                        <Divider mt="md" className={classes.infoDivider} />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }} className={classes.infoColumn}>
                        {isAdministrador ? (
                            <>
                                <SectionHeader
                                    icon={IconShieldLock}
                                    color="grape"
                                    title="Panel de administración"
                                    subtitle="Accesos rápidos y permisos del sistema"
                                />
                                <Stack gap="md" className={classes.infoList}>
                                    {adminInfoItems.map((item, i) => (
                                        <Box key={item.label}>
                                            <InfoRow {...item} />
                                            {i < adminInfoItems.length - 1 && (
                                                <Divider mt="md" className={classes.infoDivider} />
                                            )}
                                        </Box>
                                    ))}
                                    <Divider className={classes.infoDivider} />
                                    {ADMIN_ACTIONS.map((action, i) => (
                                        <Box key={action.to}>
                                            <ActionLink {...action} />
                                            {i < ADMIN_ACTIONS.length - 1 && (
                                                <Divider mt="md" className={classes.infoDivider} />
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            </>
                        ) : (
                            <>
                                <SectionHeader
                                    icon={IconMapPin}
                                    color="teal"
                                    title="Ubicación"
                                    subtitle={
                                        hasUbicacion
                                            ? 'Provincia, municipio y escuela asignada'
                                            : 'Sin datos de ubicación registrados'
                                    }
                                />
                                <Stack gap="md" className={classes.infoList}>
                                    {ubicacionItems.map((item, i) => (
                                        <Box key={item.label}>
                                            <InfoRow {...item} />
                                            {i < ubicacionItems.length - 1 && (
                                                <Divider mt="md" className={classes.infoDivider} />
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            </>
                        )}
                    </Grid.Col>
                </Grid>
            </Paper>
        </Container>
    );
}
