import { Container, Stack, Group, Text } from '@mantine/core';
import { IconUsers, IconChartLine, IconShieldCheck } from '@tabler/icons-react';
import classes from '../styles/HeroContentLeft.module.css';
import { useDataContext } from '../context/DataContext';

const features = [
  { label: 'Participantes', Icon: IconUsers },
  { label: 'Seguimiento', Icon: IconChartLine },
  { label: 'Resultados', Icon: IconShieldCheck },
] as const;

export function HeroContentLeft() {
  const { numeroEdicion } = useDataContext();
  const edicionMostrada = numeroEdicion > 0 ? numeroEdicion - 1 : null;
  const year = new Date().getFullYear();

  return (
    <section className={classes.hero} aria-label="BebrasCuba — inicio">
      <Container className={classes.inner} size="lg">
        <div className={classes.content}>
          <Stack gap={0}>
            <h1 className={classes.heading}>
              Gestiona con éxito el Concurso
              <span className={classes.brand}>BebrasCuba</span>
            </h1>
            <Text className={classes.subtitle} component="p">
              Organiza, supervisa y potencia el talento en Pensamiento Computacional en Cuba.
              {edicionMostrada != null && (
                <>
                  {' '}
                  <Text span fw={600} c="rgba(255,255,255,0.95)">
                    {edicionMostrada}ª Edición — {year}
                  </Text>
                </>
              )}
            </Text>
          </Stack>

          <Group className={`${classes.features} ${classes.featuresRow}`} gap="xl" wrap="wrap">
            {features.map(({ label, Icon }) => (
              <div key={label} className={classes.featureItem}>
                <div className={classes.featureIconWrap}>
                  <Icon size={40} stroke={1.35} />
                </div>
                <span className={classes.featureLabel}>{label}</span>
              </div>
            ))}
          </Group>
        </div>
      </Container>
    </section>
  );
}
