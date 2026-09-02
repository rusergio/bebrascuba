import { Container } from '@mantine/core';
import {
    IconAugmentedReality2,
    IconDeviceGamepad2,
    IconDevicesPc,
    IconHorseToy,
    IconMan,
    IconPlayHandball,
} from '@tabler/icons-react';
import classes from '../styles/FeaturesGrid.module.css';

const GROUPS = [
    {
        group: 'Grupo I',
        category: 'SuperPeque',
        alias: 'PrePrimary',
        grades: 'Grados 1.º y 2.º de Primaria',
        level: 'Primaria',
        icon: IconHorseToy,
        accent: classes.cardBlue,
        delay: '0ms',
    },
    {
        group: 'Grupo II',
        category: 'Peque',
        alias: 'Primary',
        grades: 'Grados 3.º y 4.º de Primaria',
        level: 'Primaria',
        icon: IconMan,
        accent: classes.cardCyan,
        delay: '60ms',
    },
    {
        group: 'Grupo III',
        category: 'Benjamín',
        alias: 'Benjamins',
        grades: 'Grados 5.º y 6.º de Primaria',
        level: 'Primaria',
        icon: IconPlayHandball,
        accent: classes.cardTeal,
        delay: '120ms',
    },
    {
        group: 'Grupo IV',
        category: 'Cadete',
        alias: 'Cadets',
        grades: 'Grados 7.º y 8.º de Secundaria Básica',
        level: 'Secundaria',
        icon: IconDeviceGamepad2,
        accent: classes.cardGreen,
        delay: '180ms',
    },
    {
        group: 'Grupo V',
        category: 'Junior',
        alias: 'Juniors',
        grades: '9.º de Secundaria Básica y 10.º de Preuniversitario (o 1.er año de ETP)',
        level: 'Sec. / Pre',
        icon: IconAugmentedReality2,
        accent: classes.cardIndigo,
        delay: '240ms',
    },
    {
        group: 'Grupo VI',
        category: 'Senior',
        alias: 'Seniors',
        grades: '11.º y 12.º de Preuniversitario (o 2.º a 4.º año de ETP)',
        level: 'Preuniversitario',
        icon: IconDevicesPc,
        accent: classes.cardViolet,
        delay: '300ms',
    },
] as const;

export function FeaturesGrid() {
    return (
        <section className={classes.section} aria-labelledby="grupos-competicion-title">
            <Container size="lg">
                <header className={classes.header}>
                    <span className={classes.eyebrow}>Categorías BebrasCuba</span>
                    <h2 id="grupos-competicion-title" className={classes.title}>
                        Grupos de competición
                    </h2>
                    <p className={classes.description}>
                        El desafío está organizado en seis categorías según el grado escolar, para
                        que cada estudiante compita con retos acordes a su nivel.
                    </p>
                </header>

                <div className={classes.grid}>
                    {GROUPS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article
                                key={item.group}
                                className={`${classes.card} ${item.accent}`}
                                style={{ ['--delay' as string]: item.delay }}
                            >
                                <div className={classes.topRow}>
                                    <div className={classes.iconWrap} aria-hidden="true">
                                        <Icon size={24} stroke={1.6} />
                                    </div>
                                    <span className={classes.groupTag}>{item.group}</span>
                                </div>

                                <h3 className={classes.category}>{item.category}</h3>
                                <p className={classes.alias}>{item.alias}</p>
                                <p className={classes.grades}>{item.grades}</p>
                                <span className={classes.level}>{item.level}</span>
                            </article>
                        );
                    })}
                </div>

                <p className={classes.note}>
                    El profesor asigna la categoría correcta al inscribir a cada estudiante según su
                    grado escolar.
                </p>
            </Container>
        </section>
    );
}
