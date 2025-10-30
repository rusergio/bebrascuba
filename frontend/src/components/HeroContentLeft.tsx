import { Overlay, Container, Title, Text } from '@mantine/core';
import classes from '../styles/HeroContentLeft.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';  

export function HeroContentLeft() {
  const [numeroEdicion, setNumeroEdicion] = useState<number>(0);

  useEffect(() => {  
    const fetchNumeroEdicion = async () => {
        try {
            const response = await axios.get('api/nro_edicion'); // Asegúrate de que la ruta coincida con tu backend
            setNumeroEdicion(response.data.n_edicion);
        } catch (error) {
            console.error("Error al obtener el número de edición:", error);
            setNumeroEdicion(0); // Valor por defecto si falla
        }
    };
    fetchNumeroEdicion();
  }, []);  

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