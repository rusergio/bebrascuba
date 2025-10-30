import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export function DeleteAccountButton() {
    const openDeleteModal = () => {
        modals.openConfirmModal({
        title: 'Eliminar tu perfil',
        centered: true,
        children: (
            <Text size="sm">
                Verifique primero si todos los datos están correcto antes de enviar la solicitud.
            </Text>
        ),
        labels: { confirm: 'Eliminar cuenta', cancel: 'Cancelar' },
        confirmProps: { color: 'red' },
        onCancel: () => {
            notifications.show({
            title: 'Acción cancelada',
            message: 'Revise bien los datos para evitar errores futuras principalmente los datos personales',
            color: 'blue',
            icon: <IconX size={18} />,
            });
        },
        onConfirm: () => {
            // Aquí iría la lógica real para eliminar la cuenta
            // Por ahora solo mostramos la notificación
            
            notifications.show({
            title: 'Solicitud enviado',
            message: 'Solicitud enviado correctamente.',
            color: 'green',
            icon: <IconCheck size={18} />,
            autoClose: false, // Opcional: para que no se cierre automáticamente
            });
        },
        });
    };

    return (
        <Button onClick={openDeleteModal} color="red">
        Eliminar cuenta
        </Button>
    );
}