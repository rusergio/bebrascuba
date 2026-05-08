import { Avatar, Container, Grid, Input, Paper, PasswordInput, PinInput, Switch, Tabs, TextInput, Title, Select, Group, Badge, FileButton, ActionIcon, Modal, Slider, Stack } from '@mantine/core';
import { Card, Text, Button } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { IconAt, IconDeviceMobile, IconEyeClosed, IconEyeFilled, IconLock, IconLockCheck, IconLockCog, IconPasswordMobilePhone, IconPasswordUser, IconRefresh, IconUserCheck, IconPhoto, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios'; 
import { IMaskInput } from 'react-imask';
import { useUserContext, useUserRoles } from '../context/UserContext';
import Cropper, { Area } from 'react-easy-crop';
axios.defaults.baseURL = 'http://localhost:8000'; // <--- Ajusta según tu configuración


export function MiPerfil() {
    const { setActiveRole } = useUserContext();
    const { activeRole, allRoles } = useUserRoles();
    
    const [showPin, setShowPin] = useState(false);  
    const [showConfPin, setShowConfPin] = useState(false);
    const [updateRol, setUpdateRol] = useState<string>(() => localStorage.getItem('userRole') || ''); 
    const [errorCorreo, setErrorCorreo] = useState<string | null>(null); // Estado para mensajes de error
    const [errorTelefono, setErrorTelefono] = useState<string | null>(null); // Estado para mensajes de error
    const [errorContrasenia, setErrorContrasenia] = useState<string | null>(null); // Estado para mensajes de error
    const [errorPin, setErrorPin] = useState<string | null>(null); // Estado para mensajes de error
    const [loadingContrasenia, setLoadingContrasenia] = useState(false);
    const [loadingTelefono, setLoadingTelefono] = useState(false);
    const [loadingCorreo, setLoadingCorreo] = useState(false);
    const [loadingPin, setLoadingPin] = useState(false);
    const [loadingPhoto, setLoadingPhoto] = useState(false);
    // Preferir id de la tabla profesores si está disponible
    const id_profesor = localStorage.getItem('profesorId') || localStorage.getItem('userId');
    const userId = localStorage.getItem('userId');
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(localStorage.getItem('userPhoto') || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    useEffect(() => {
        // Obtener el rol del localStorage dinámicamente
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          setUpdateRol(storedRole);
        }
        
        // Modo liviano temporal: avatar solo con iniciales (sin foto remota)
        setCurrentPhoto(null);
        localStorage.removeItem('userPhoto');
    }, [userId]);

    // Debug: Log cuando cambia currentPhoto
    useEffect(() => {
        if (currentPhoto) {
            console.log('🔍 currentPhoto actualizado:', currentPhoto);
        }
    }, [currentPhoto]);

    // Función para manejar la selección de archivo
    const handleFileSelect = (file: File | null) => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImageToCrop(previewUrl);
            setCropModalOpen(true);
        }
    };

    // Función para crear la imagen recortada
    const createImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });
    };

    // Función para obtener la imagen recortada como blob
    const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No se pudo obtener el contexto 2d');
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                }
            }, 'image/jpeg', 0.9);
        });
    };

    // Función para manejar el cambio de crop
    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Función para aplicar el recorte
    const handleApplyCrop = async () => {
        if (!imageToCrop || !croppedAreaPixels) {
            return;
        }

        try {
            const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const file = new File([croppedImage], 'profile-photo.jpg', { type: 'image/jpeg' });
            
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(croppedImage);
            setPreview(previewUrl);
            
            // Cerrar modal y limpiar
            setCropModalOpen(false);
            if (imageToCrop) {
                URL.revokeObjectURL(imageToCrop);
            }
            setImageToCrop(null);
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Error al procesar la imagen',
                color: 'red',
            });
        }
    };

    // Función para cancelar el recorte
    const handleCancelCrop = () => {
        setCropModalOpen(false);
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
        }
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    // Función para subir la foto
    const handleUploadPhoto = async () => {
        if (!selectedFile || !userId) {
            notifications.show({
                title: 'Error',
                message: 'Por favor selecciona una imagen',
                color: 'red',
            });
            return;
        }

        setLoadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('foto_perfil', selectedFile);

            const response = await axios.post(`/api/usuarios/${userId}/foto-perfil`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                console.log('✅ Respuesta del servidor:', response.data);
                
                // Obtener la URL de la foto (usar photo_url si está disponible, sino path)
                let photoUrl = response.data.photo_url || response.data.path;
                
                console.log('📸 URL recibida:', photoUrl);
                
                // Si no hay URL completa, construirla
                if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('/storage')) {
                    photoUrl = photoUrl.startsWith('storage/') 
                        ? `http://localhost:8000/${photoUrl}` 
                        : `http://localhost:8000/storage/${photoUrl}`;
                }
                
                // Si la URL viene con /storage/storage/, corregirla
                if (photoUrl && photoUrl.includes('/storage/storage/')) {
                    photoUrl = photoUrl.replace('/storage/storage/', '/storage/');
                }
                
                console.log('📸 URL final:', photoUrl);
                
                // Actualizar estado y localStorage
                setCurrentPhoto(photoUrl);
                localStorage.setItem('userPhoto', photoUrl);
                localStorage.setItem('userFotoPerfil', response.data.foto_perfil);
                
                console.log('💾 Guardado en localStorage:', photoUrl);
                
                // Notificar a otros componentes que la foto cambió
                window.dispatchEvent(new Event('userPhotoUpdated'));

                notifications.show({
                    title: 'Éxito',
                    message: response.data.message || 'Foto de perfil actualizada correctamente',
                    color: 'green',
                });

                // Limpiar preview y archivo seleccionado
                setSelectedFile(null);
                if (preview) {
                    URL.revokeObjectURL(preview);
                }
                setPreview(null);
            }
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Error al subir la foto',
                color: 'red',
            });
        } finally {
            setLoadingPhoto(false);
        }
    };

    // Función para cancelar la selección
    const handleCancelPhoto = () => {
        setSelectedFile(null);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
    };

    // Función para manejar el cambio de rol
    const handleRoleChange = (newRole: string | null) => {
        if (!newRole) return;

        // Actualizar contexto y localStorage para el rol activo
        setActiveRole(newRole);
        setUpdateRol(newRole);
        localStorage.setItem('activeRole', newRole);

        // Intentar sincronizar profesorId u otra metadata asociada al rol
        try {
            const rolesDataRaw = localStorage.getItem('allUserRolesData');
            if (rolesDataRaw) {
                const rolesData = JSON.parse(rolesDataRaw);
                const roleObj = Array.isArray(rolesData) ? rolesData.find((r: any) => r.rol === newRole) : null;
                if (roleObj) {
                    // Soportar distintas formas: roleObj.profesorId o roleObj.profesor?.id
                    const profId = roleObj.profesorId ?? (roleObj.profesor ? roleObj.profesor.id : null);
                    if (profId) {
                        localStorage.setItem('profesorId', String(profId));
                    }
                }
            }
        } catch (e) {
            // Si falló parseo o no existe metadata, ignorar y continuar (no crítico)
            console.warn('No se pudo procesar allUserRolesData al cambiar rol', e);
        }

        // Notificar a otros componentes/pestañas que el localStorage cambió
        window.dispatchEvent(new Event('localStorageUpdate'));

        // La barra de navegación se actualizará automáticamente a través del contexto
        // No es necesario recargar la página
    };

    // Preparar datos para el selector de roles
    const roleOptions = allRoles.map(role => ({
        value: role,
        label: role,
    }));

    // Método para mostrar el pin
    const handleToggleShowPin = () => {  
        setShowPin((prevShowPin) => !prevShowPin);  
    }; 

    // Método para mostrar el confirmar pin
    const handleToggleShowConfPin = () => {  
        setShowConfPin((prevShowConfPin) => !prevShowConfPin);  
    };

    // Formulário para el correo
    const formCorreo = useForm({
        initialValues: { correo: ''},
        // 
        validate: {
            correo: isEmail('Correo electrónico inválido'),
        },
    });

    // Método para cambiar el correo 
    const handleSubmitCorreo = async () => {
        if(!formCorreo.isValid()) return ;
        setErrorCorreo(null); // Limpiar errores previos
        setLoadingCorreo(true); // Iniciar el estado de carga
        
        try {
            const response = await axios.put(`/api/cambiar-correo/${id_profesor}`, {
                correo: formCorreo.values.correo,
            });
            formCorreo.reset();
            setErrorCorreo('Correo cambiado con suceso');
            console.log("Respuesta del servidor:", response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setErrorCorreo(errorMessage);
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
                    setErrorCorreo(errorMessage);
                }
            } else {
                setErrorCorreo('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingCorreo(false);
        }
    };

    // Formulário para la contraseña
    const formContrasenia = useForm({
        initialValues: { contrasenia: '', confirmContrasenia: ''},
            
        // functions will be used to validate values at corresponding key
        validate: {
            contrasenia: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
            confirmContrasenia: (value, values) => value !== values.contrasenia ? 'Passwords did not match' : null,
        },
    });

    // Método para cambiar o guardar la contraseña
    const handleSubmitContrasenia = async () => {
        if(!formContrasenia.isValid()) return ;
        setLoadingContrasenia(true); // Iniciar el estado de carga
        setErrorContrasenia(null); // Limpiar errores previos
        
        try {
            const response = await axios.put(`/api/cambiar-contrasenia/${id_profesor}`, {
                contrasenia: formContrasenia.values.contrasenia,
            });
            formContrasenia.reset();
            setErrorContrasenia('Contraseña modificado con suceso');
            console.log("Respuesta del servidor:", response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setErrorContrasenia(errorMessage);
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
                    setErrorContrasenia(errorMessage);
                }
            } else {
                setErrorContrasenia('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingContrasenia(false);
        }
    };

    // Formulário para el número de telefono 
    const formTelefono = useForm({
        initialValues: { telefono: '', confirmTelefono: ''},
            
        // functions will be used to validate values at corresponding key
        validate: {
            telefono: (value) => {  
                const digits = value.replace(/\D/g, ''); // Solo números  
                return digits.length !== 10 ? 'Número de teléfono inválido' : null;  
            },
            confirmTelefono: (value, values) => value !== values.telefono ? 'Los números de telefonos no coenciden' : null,
        },
    });

    // Método para cambiar o guardar nuevo número de teléfono 
    const handleSubmitTelefono = async () => {
        if(!formTelefono.isValid()) return ;
        setLoadingTelefono(true); // Iniciar el estado de carga
        setErrorTelefono(null); // Limpiar errores previos
        
        try {
            const response = await axios.put(`/api/cambiar-telefono/${id_profesor}`, {
                telefono: formTelefono.values.telefono,
            });
            formTelefono.reset();
            setErrorTelefono('Numero de telefono cambiado con suceso');
            console.log("Respuesta del servidor:", response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setErrorTelefono(errorMessage);
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
                    setErrorTelefono(errorMessage);
                }
            } else {
                setErrorTelefono('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingTelefono(false);
        }
    };

    // Formulário para el pin
    const formPin = useForm({
        initialValues: { pin: '', confirmPin: ''},
            
        // functions will be used to validate values at corresponding key
        validate: {
            pin: (value) => (value.length < 3 ? 'El pin tiene que ser al menos 4 numeros' : null),
            confirmPin: (value, values) => {
                if(value !== values.pin) {
                    return 'Los pines no coenciden';
                }
                return null;
            }
        },
    });

    // Método para guardar el pin
    const handleSubmitPin = async () => {
        if(!formPin.isValid()) return ;
        setLoadingPin(true); // Iniciar el estado de carga
        setErrorPin(null); // Limpiar errores previos
        
        try {
            const response = await axios.put(`/api/cambiar-pin/${id_profesor}`, {
                pin: formPin.values.pin,
            });
            formPin.reset();
            setErrorPin('Pin cambiado con suceso');
            console.log("Respuesta del servidor:", response.data);
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if(error.response?.status === 422){
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setErrorPin(errorMessage);
                }
                else {
                    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
                    setErrorPin(errorMessage);
                }
            } else {
                setErrorPin('Error inesperado. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoadingPin(false);
        }
    };

    return (
        <Container size={'lg'}>
            {/* <Text mt={20} ml={500} fw={600} size='xl'>Mi Perfil</Text> */}
            <Card >
                <Grid>
                    <Grid.Col span={5}>
                        <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
                            <Avatar
                                size={120}
                                radius={120}
                                mx="auto"
                                alt="Foto de perfil"
                                onError={(e) => {
                                    console.error('❌ Error al cargar imagen del Avatar:', e);
                                    console.log('📸 URL que falló:', preview || currentPhoto);
                                }}
                            >
                                {!preview && !currentPhoto && (
                                    <Text size="xl" fw={700}>
                                        {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'}
                                        {localStorage.getItem('userLastName')?.charAt(0).toUpperCase() || ''}
                                    </Text>
                                )}
                            </Avatar>
                            <Text ta="center" fz="h4" fw={500} mt="md">{localStorage.getItem('userName')} {localStorage.getItem('userLastName')}</Text>
                            <Text size='sm' ta="center" c="dimmed" >{localStorage.getItem('userEmail')}</Text>
                            {/* Selector de rol dinámico */}
                            {allRoles.length > 1 ? (
                                <Group justify="center" mt="sm">
                                    <Select
                                        w="70%"
                                        maw={340}
                                        description="Rol activo"
                                        placeholder="Selecciona un rol"
                                        value={activeRole || updateRol}
                                        onChange={handleRoleChange}
                                        data={roleOptions}
                                        leftSection={<IconUserCheck size={16} />}
                                    />
                                </Group>
                            ) : (
                                <Text ta="center" size="md" mt="sm">{updateRol}</Text>
                            )}
                            
                            {/* Mostrar badges de todos los roles */}
                            {allRoles.length > 1 && (
                                <Stack align="center" gap="xs" mt="xs">
                                    <Text size="xs" c="dimmed" ta="center">Roles disponibles:</Text>
                                    <Group gap="xs" justify="center">
                                        {allRoles.map((role, index) => (
                                            <Badge 
                                                key={index} 
                                                size="xs" 
                                                variant={role === (activeRole || updateRol) ? "filled" : "outline"}
                                                color={role === (activeRole || updateRol) ? "blue" : "gray"}
                                            >
                                                {role}
                                            </Badge>
                                        ))}
                                    </Group>
                                </Stack>
                            )}
                            
                            <Text size="xs" c="dimmed" ta="center" mt={10}>
                                Avatar temporal por iniciales (imagen de perfil desactivada por rendimiento)
                            </Text>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={7}>
                        <Paper radius="sm" withBorder p="lg" bg="var(--mantine-color-body)">
                            <Title ta="center" order={3} mb={40}>Editar Cuenta</Title>
                            <Tabs defaultValue="contacto">
                                <Tabs.List>
                                    <Tabs.Tab value="contacto" leftSection={<IconPasswordMobilePhone size={16} />}>
                                        Cambiar Contactos
                                    </Tabs.Tab>
                                    <Tabs.Tab value="contrasenia" leftSection={<IconPasswordUser size={16} />}>
                                        Cambiar contraseña
                                    </Tabs.Tab>
                                    <Tabs.Tab value="pin" leftSection={<IconLockCog size={16} />}>
                                        Cambiar pin
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="contacto">
                                    <Text mt={10} c={'gray'} fw={300} size='sm'>Cambie su contacto en caso que tengas otro </Text>
                                    <form onSubmit={formCorreo.onSubmit(handleSubmitCorreo)}>
                                        <Grid mt={10}>
                                            <Grid.Col span={12}>
                                                <TextInput 
                                                    withAsterisk 
                                                    label='Correo electronico'
                                                    mb={10} 
                                                    placeholder="Introduzca su nuevo correo"
                                                    leftSection={<IconAt size={16} />} 
                                                    {...formCorreo.getInputProps('correo')}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Text c={'blue'} >{errorCorreo}</Text>
                                        <Button type="submit" loading={loadingCorreo} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar Correo</Button>
                                    </form>
                                    <form onSubmit={formTelefono.onSubmit(handleSubmitTelefono)}>
                                        <Grid mt={10}>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Número de teléfono" mb={10}>
                                                    <Input 
                                                        leftSection={<IconDeviceMobile size={16} />}
                                                        component={IMaskInput} mask="+53 00000000"
                                                        placeholder="Digite aqui su número de teléfono"
                                                        key={formTelefono.key('telefono')}
                                                        {...formTelefono.getInputProps('telefono')}
                                                    />
                                                </Input.Wrapper> 
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Confirmar número" mb={5}>
                                                    <Input 
                                                        leftSection={<IconDeviceMobile size={16} />}
                                                        component={IMaskInput} mask="+53 00000000"
                                                        placeholder="Confirme aqui su número de teléfono"
                                                        key={formTelefono.key('confirmTelefono')}
                                                        {...formTelefono.getInputProps('confirmTelefono')}
                                                    />
                                                </Input.Wrapper> 
                                            </Grid.Col>
                                        </Grid>
                                        <Text c={'blue'} >{errorTelefono}</Text>
                                        <Button type="submit" loading={loadingTelefono} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar nro de telefono</Button>
                                    </form>
                                </Tabs.Panel>

                                {/* Nueva Contraseña */}
                                <Tabs.Panel value="contrasenia">
                                    <Text mt={10} c={'gray'} fw={300} size='sm'>Cree una nueva contraseña</Text>
                                    <form onSubmit={formContrasenia.onSubmit(handleSubmitContrasenia)}>   
                                        <Grid mt={10} mb={10}>
                                            <Grid.Col span={6}>
                                                <PasswordInput
                                                    label='Nueva contraseña'
                                                    leftSection={<IconLock size={16} />}
                                                    placeholder="Digite aqui la contraseña"
                                                    withAsterisk
                                                    {...formContrasenia.getInputProps('contrasenia')}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <PasswordInput
                                                    label='Confirme la contraseña'
                                                    withAsterisk
                                                    leftSection={<IconLockCheck  size={16} />}
                                                    placeholder="Confirme aqui la contraseña"
                                                    {...formContrasenia.getInputProps('confirmContrasenia')}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Text c={'blue'} >{errorContrasenia}</Text>
                                        <Button type="submit" loading={loadingContrasenia} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar contraseña</Button>
                                    </form> 
                                </Tabs.Panel>
                                {/* Nuevo PIN */}
                                <Tabs.Panel value="pin">
                                    <Text mt={10} c={'gray'} fw={300} >Cree una nuevo PIN</Text>
                                    <form onSubmit={formPin.onSubmit(handleSubmitPin)}>
                                        <Grid mt={10}>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Ingrese el PIN" description="El pin debe tener al menos 4 números">
                                                    <PinInput
                                                        mask={!showPin}
                                                        type="number" 
                                                        key={formPin.key('pin')}
                                                        {...formPin.getInputProps('pin')}
                                                    />
                                                </Input.Wrapper>
                                                <Switch
                                                    size="md"
                                                    mt={'xs'}
                                                    color="dark.4"
                                                    // label='Ver el PIN'
                                                    checked={showPin}  
                                                    onChange={handleToggleShowPin}
                                                    onLabel={<IconEyeFilled size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
                                                    offLabel={<IconEyeClosed size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <Input.Wrapper withAsterisk label="Confirme el PIN" description="El pin debe coencidir con el anterior">
                                                    <PinInput
                                                        mask={!showConfPin} 
                                                        type="number" 
                                                        key={formPin.key('confirmPin')}
                                                        {...formPin.getInputProps('confirmPin')}
                                                    />
                                                </Input.Wrapper>
                                                    <Switch
                                                        size="md"
                                                        mt={'xs'}
                                                        color="dark.4"
                                                        // label='Ver el PIN'
                                                        checked={showConfPin}  
                                                        onChange={handleToggleShowConfPin}  
                                                        onLabel={<IconEyeFilled size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
                                                        offLabel={<IconEyeClosed size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
                                                    />
                                            </Grid.Col>
                                            <Text c={'blue'} >{errorPin}</Text>
                                            <Button type='submit' loading={loadingPin} rightSection={<IconRefresh size={16} />} fullWidth>Cambiar PIN</Button>
                                        </Grid>
                                    </form>
                                </Tabs.Panel>
                            </Tabs>
                        </Paper>
                    </Grid.Col>
                    
                </Grid>
            </Card>

            {/* Modal para recortar imagen */}
            <Modal
                opened={cropModalOpen}
                onClose={handleCancelCrop}
                title="Recortar y ajustar imagen de perfil"
                size="lg"
                centered
            >
                <Stack gap="md">
                    {imageToCrop && (
                        <div 
                            style={{ 
                                position: 'relative', 
                                width: '100%', 
                                height: 400, 
                                background: '#333',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>
                    )}
                    <div>
                        <Text size="sm" mb="xs" fw={500}>Zoom</Text>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={setZoom}
                            label={(value) => value.toFixed(1)}
                            marks={[
                                { value: 1, label: '1x' },
                                { value: 2, label: '2x' },
                                { value: 3, label: '3x' },
                            ]}
                        />
                    </div>
                    <Text size="xs" c="dimmed" ta="center">
                        Arrastra la imagen para ajustar la posición y usa el zoom para acercar o alejar
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={handleCancelCrop}>
                            Cancelar
                        </Button>
                        <Button onClick={handleApplyCrop} leftSection={<IconCheck size={16} />}>
                            Aplicar recorte
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}