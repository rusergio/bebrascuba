import { Overlay, Container, Title } from '@mantine/core';
import classes from '../styles/HeroContentLeft.module.css';
import { useDataContext } from '../context/DataContext';

export function HeroContentLeft() {
  // Usar datos del contexto en lugar de hacer fetch
  const { numeroEdicion } = useDataContext();  

  return (
    <div className={classes.hero}>
      <Overlay
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.75) 40%)"
        opacity={5}
        zIndex={0}
      />
      <Container className={classes.container} size="lg">
        <Title className={classes.title} mb={40}>Bienvenido a la Plataforma de Gestión y Apoyo al Concurso Bebras en Cuba</Title>

        <Title className={classes.subtitle} mt={10} c={'gray'}> {numeroEdicion-1}ª Edición</Title>
        <Title className={classes.title} mt={5} c={'blue'}>CONCURSO BEBRASCUBA - 2025</Title>
        
      </Container>
    </div>
  );
}