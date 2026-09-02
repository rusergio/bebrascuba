import { AspectRatio, Container, Title, Text } from '@mantine/core';

export function GeoPortal() {
    return (
        <Container>
            <Title order={2} size={40} ta="center">Bienvenido a Geobebras</Title>
            <Text c="dimmed" ta="center" mb={30}>Plataforma de Mapas y datos estadisticos</Text>

            <AspectRatio ratio={16 / 9}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.930634062341!2d-77.850485!3d18.4658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8edb8b7e8a9d3b3f%3A0x9c7b9d1b1c9d9b1c!2sUniversidad%20Central%20Marta%20Abreu%20de%20Las%20Villas!5e0!3m2!1sen!2scu!4v1644262070010!5m2!1sen!2scu"
                    title="Mapa de Cuba - Universidad Central de Las Villas"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                />
            </AspectRatio>
        </Container>
    );
}