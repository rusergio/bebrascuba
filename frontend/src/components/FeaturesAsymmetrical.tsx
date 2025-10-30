import { IconCertificate, IconDeviceLaptop, IconMailShare } from '@tabler/icons-react';
import { Container, SimpleGrid, Text, Title } from '@mantine/core';
import classes from '../styles/FeaturesAsymmetrical.module.css';

interface FeatureProps extends React.ComponentPropsWithoutRef<'div'> {
  icon: React.FC<any>;
  title: string;
  description: string;
}

function Feature({ icon: Icon, title, description, className, ...others }: FeatureProps) {
  return (
    <div className={classes.feature} {...others}>
      <div className={classes.overlay} />

      <div className={classes.content}>
        <Icon size={45} className={classes.icon} stroke={1.5} />
        <Text fw={700} fz="h3" mb="xs" mt={5} className={classes.title}>
          {title}
        </Text>
        <Text c="dimmed" fz="lg">
          {description}
        </Text>
      </div>
    </div>
  );
}

const mockdata = [
  {
    icon: IconMailShare,
    title: 'Solicitud de registro',
    description:
      'Para participar tienes que hacer solicitud de registro como profesor, debes pertenecer alguna escuela o institución que te permita participar como educador.',
  },
  {
    icon: IconDeviceLaptop,
    title: 'Inscripción de alumnos',
    description:
      'Para inscribir alumno, se debe tener los siguientes datos, su nombre, sexo, grado y el número de ci, se puede inscribir también estudiantes que no son de tu escuela.',
  },
  {
    icon: IconCertificate,
    title: 'Examen y certificado',
    description:
      'El examen se hace en la página internacional del concurso, después de la evaluación y clasificación se le otorga un cerficado los participantes en esta edición.',
  },
];

export function FeaturesAsymmetrical() {
  const items = mockdata.map((item) => <Feature {...item} key={item.title} />);

  return (
    <Container mt={30} mb={30} size="lg">
      <Title order={1}  ta="center" mt="sm" className={classes.title}>
        Proceso de participación
      </Title>
      <Text c="dimmed" className={classes.description} ta="center" mt="md" mb={30}></Text>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={50}>
        {items}
      </SimpleGrid>
    </Container>
  );
}