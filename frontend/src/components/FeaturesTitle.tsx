import { IconCalendarDue, IconCalendarEvent, IconCalendarMonth, IconCalendarStats, IconCalendarWeek } from '@tabler/icons-react';  
import { Container, Grid, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';  
import classes from '../styles/FeaturesTitle.module.css';  
import { useEffect, useState } from 'react';  
import axios from 'axios';  
axios.defaults.baseURL = 'http://localhost:8000';  

interface Edicion {  
  fecha_convocatoria: string;  
  fecha_inic_preinscrip: string;  
  fecha_fin_preinscrip: string;  
  fecha_inic_inscripVille: string;  
  fecha_inic_realiz: string;  
  fecha_fin_realiz: string;  
  fecha_resultados: string;  
}  

export function FeaturesTitle() {  
  const [edicion, setEdicion] = useState<Edicion[]>([]);  
  const [loading, setLoading] = useState(true);  

  useEffect(() => {  
    const fechEdicion = async () => {  
      try {  
        const response = await axios.get('api/listar-edicion-actual');  
        setEdicion([response.data]); // Asegúrate de que sea un arreglo  
        console.log('Datos de la edición:', response.data);  
      } catch (error) {  
        console.error('Error al obtener los recursos:', error);  
      } finally {  
        setLoading(false);  
      }  
    };  
    fechEdicion();  
  }, []);  

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Fecha no disponible'; // Maneja null/undefined
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? 'Fecha no disponible' 
      : date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
  }; 

  const features = [  
    {  
      icon: IconCalendarDue,  
      title: 'Fecha de Convocatoria',  
      description: edicion.length > 0 ? formatDate(edicion[0].fecha_convocatoria) : 'Fecha no disponible',  
    },  
    {  
      icon: IconCalendarEvent,  
      title: 'Fecha de inscripción en Ville',  
      description: edicion.length > 0 ? formatDate(edicion[0].fecha_inic_inscripVille) : 'Fecha no disponible',  
    },  
    {  
      icon: IconCalendarWeek,  
      title: 'Periodo de inscripción en BebrasCuba',  
      description:  
        edicion.length > 0  
          ? `${formatDate(edicion[0].fecha_inic_preinscrip)} – ${formatDate(edicion[0].fecha_fin_preinscrip)}`  
          : 'Fechas no disponibles',  
    },  
    {  
      icon: IconCalendarStats,  
      title: 'Fecha de resultados',  
      description: edicion.length > 0 ? formatDate(edicion[0].fecha_resultados) : 'Fecha no disponible',  
    },  
    {  
      icon: IconCalendarMonth,  
      title: 'Periodo de realización del concurso',  
      description:  
        edicion.length > 0  
          ? `${formatDate(edicion[0].fecha_inic_realiz)} – ${formatDate(edicion[0].fecha_fin_realiz)}`  
          : 'Fechas no disponibles',  
    },  
  ];  

  const items = features.map((feature) => (  
    <div key={feature.title}>  
      <ThemeIcon  
        size={44}  
        radius="md"  
        variant="gradient"  
        gradient={{ deg: 133, from: 'blue', to: 'cyan' }}  
      >  
        <feature.icon size={26} stroke={1.5} />  
      </ThemeIcon>  
      <Text fz="lg" mt="sm" fw={500}>  
        {feature.title}  
      </Text>  
      <Text c="dimmed" fz="sm">  
        {feature.description}  
      </Text>  
    </div>  
  ));  

  // if (loading) {  
  //   return <div>Cargando...</div>;  
  // }  

  return (  
    <Container size={'xl'}>  
      <div className={classes.wrapper}>  
        <Grid gutter={80}>  
          <Grid.Col span={{ base: 12, md: 5 }}>  
            <Title className={classes.title} order={2}>  
              Almanaque de las actividades  
            </Title>  
            <Text c="dimmed">  
              Fechas de actividades – Distintas fechas o encuentros durante el periodo del concurso 
            </Text>  
          </Grid.Col>  
          <Grid.Col span={{ base: 12, md: 7 }}>  
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={30}>  
              {items}  
            </SimpleGrid>  
          </Grid.Col>  
        </Grid>  
      </div>  
    </Container>  
  );  
}