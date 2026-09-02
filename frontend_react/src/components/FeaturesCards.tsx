import { Container, Text } from '@mantine/core';
import {
    IconBuildingCommunity,
    IconCheck,
    IconFriends,
    IconHelpOctagon,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from '../styles/FeaturesCards.module.css';

const FEATURES = [
    {
        title: '¿Qué es Bebras?',
        body: 'Bebras es un concurso internacional que acerca el pensamiento computacional a estudiantes de forma lúdica, con retos cortos y sin necesidad de programar.',
        points: [
            'Promueve lógica, patrones y resolución de problemas',
            'Formato amigable: retos claros y de corta duración',
            'Participación desde la escuela, con acompañamiento docente',
        ],
        icon: IconHelpOctagon,
        accent: classes.cardBlue,
        delay: '0ms',
    },
    {
        title: '¿Quiénes pueden participar?',
        body: 'En BebrasCuba pueden participar alumnos desde 1.º hasta 12.º grado, agrupados en categorías según la edad o el nivel escolar.',
        points: [
            'Desde primaria hasta preuniversitario',
            'Categorías: SuperPeque, Peque, Benjamín, Cadete, Junior y Senior',
            'La inscripción la gestiona el profesor de la escuela',
        ],
        icon: IconFriends,
        accent: classes.cardTeal,
        delay: '90ms',
    },
    {
        title: '¿Dónde se realiza?',
        body: 'Se celebra en escuelas e instituciones educativas de todo el país. Solo se necesita un espacio adecuado y acceso a equipos de cómputo.',
        points: [
            'En el centro escolar o institución autorizada',
            'Coordinación municipal y provincial de apoyo',
            'Resultados publicados por provincia y categoría',
        ],
        icon: IconBuildingCommunity,
        accent: classes.cardCyan,
        delay: '180ms',
    },
] as const;

export function FeaturesCards() {
    return (
        <section id="conoce" className={classes.section} aria-labelledby="features-bebras-title">
            <Container size="lg">
                <header className={classes.header}>
                    <span className={classes.eyebrow}>Conoce el concurso</span>
                    <h2 id="features-bebras-title" className={classes.title}>
                        Tres claves para entender BebrasCuba
                    </h2>
                    <p className={classes.description}>
                        Una guía rápida para familias, profesores y centros: qué es el concurso, quién
                        participa y dónde se organiza.
                    </p>
                </header>

                <div className={classes.grid}>
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <article
                                key={feature.title}
                                className={`${classes.card} ${feature.accent}`}
                                style={{ ['--delay' as string]: feature.delay }}
                            >
                                <div className={classes.topRow}>
                                    <div className={classes.iconWrap} aria-hidden="true">
                                        <Icon size={26} stroke={1.6} />
                                    </div>
                                    <span className={classes.step}>Paso {index + 1}</span>
                                </div>

                                <h3 className={classes.cardTitle}>{feature.title}</h3>
                                <p className={classes.cardBody}>{feature.body}</p>

                                <ul className={classes.points}>
                                    {feature.points.map((point) => (
                                        <li key={point} className={classes.point}>
                                            <span className={classes.bullet} aria-hidden="true">
                                                <IconCheck size={12} stroke={3} />
                                            </span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
