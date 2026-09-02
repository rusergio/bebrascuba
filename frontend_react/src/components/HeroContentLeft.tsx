import { Container } from '@mantine/core';
import {
  IconArrowDown,
  IconArrowRight,
  IconSparkles,
} from '@tabler/icons-react';
import { useDataContext } from '../context/DataContext';
import logoBebras from '../assets/logobebrascuba.png';
import classes from '../styles/HeroContentLeft.module.css';

export function HeroContentLeft() {
  const {
    estadoEdicion,
    numeroEdicion,
    anioEdicion,
    ultimaEdicionCerrada,
    anioUltimaEdicionCerrada,
  } = useDataContext();

  const edicionAbierta = estadoEdicion === 'Abierto' && numeroEdicion > 0 && anioEdicion != null;
  const edicionMostrar = edicionAbierta
    ? { n: numeroEdicion, a: anioEdicion as number, enCurso: true }
    : ultimaEdicionCerrada > 0 && anioUltimaEdicionCerrada != null
      ? { n: ultimaEdicionCerrada, a: anioUltimaEdicionCerrada, enCurso: false }
      : null;

  return (
    <section className={classes.hero} aria-label="BebrasCuba — inicio">
      <div className={classes.bg} />
      <div className={classes.mesh} aria-hidden />
      <div className={`${classes.orb} ${classes.orbA}`} aria-hidden />
      <div className={`${classes.orb} ${classes.orbB}`} aria-hidden />

      <Container className={classes.inner} size="lg">
        <div className={classes.copy}>
          <div className={classes.brandRow}>
            <img src={logoBebras} alt="" className={classes.logo} />
            <div>
              <div className={classes.brandName}>BebrasCuba</div>
              <div className={classes.brandTag}>Pensamiento computacional</div>
            </div>
          </div>

          <span className={classes.eyebrow}>
            <IconSparkles size={14} />
            Concurso nacional
          </span>

          <h1 className={classes.heading}>
            El espacio donde Cuba{' '}
            <span className={classes.accent}>piensa en código</span>
          </h1>

          <p className={classes.lead}>
            Retos de lógica para estudiantes de toda la isla. Los profesores inscriben,
            los coordinadores organizan y los resultados se publican por provincia y
            categoría.
          </p>

          <div className={classes.actions}>
            <a href="#resultados" className={classes.primaryBtn}>
              Ver resultados
              <IconArrowRight size={18} />
            </a>
          </div>
        </div>

        <aside className={classes.panel} aria-label="Estado de la edición">
          <div className={classes.card}>
            <div className={classes.cardTop}>
              <div>
                <div className={classes.cardKicker}>Edición actual</div>
                <div className={classes.cardEdition}>
                  {edicionMostrar
                    ? `${edicionMostrar.n}ª · ${edicionMostrar.a}`
                    : 'BebrasCuba'}
                </div>
              </div>
              <span
                className={`${classes.status} ${edicionAbierta ? classes.statusOpen : classes.statusClosed}`}
              >
                <span className={classes.dot} />
                {edicionAbierta ? 'Inscripción abierta' : 'Edición cerrada'}
              </span>
            </div>

            <p className={classes.cardLead}>
              {edicionAbierta
                ? 'Los profesores ya pueden crear su cuenta e inscribir estudiantes.'
                : 'Puedes consultar resultados, recursos y las cuentas activas siguen entrando desde la barra superior.'}
            </p>
          </div>
        </aside>
      </Container>

      <a href="#conoce" className={classes.scrollHint}>
        Seguir explorando
        <IconArrowDown size={14} />
      </a>
    </section>
  );
}
