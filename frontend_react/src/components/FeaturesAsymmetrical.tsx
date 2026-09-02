import { Container } from '@mantine/core';
import {
    IconArrowRight,
    IconCertificate,
    IconCheck,
    IconDeviceLaptop,
    IconMailShare,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from '../styles/FeaturesAsymmetrical.module.css';

const STEPS = [
    {
        number: '01',
        title: 'Solicitud de registro',
        body: 'Si eres profesor o educador, solicita tu cuenta en BebrasCuba. Debe estar vinculada a una escuela o institución educativa.',
        points: [
            'Completa el formulario de registro de profesor',
            'El coordinador revisa y activa tu cuenta',
            'Con el acceso activo ya puedes gestionar alumnos',
        ],
        icon: IconMailShare,
        accent: classes.stepBlue,
        delay: '0ms',
    },
    {
        number: '02',
        title: 'Inscripción de alumnos',
        body: 'Cuando la edición esté abierta, registra a tus estudiantes con sus datos básicos para la preinscripción.',
        points: [
            'Nombre, sexo, grado y carné de identidad',
            'Puedes incluir alumnos de tu centro u otros autorizados',
            'Revisa el almanaque para no perder las fechas',
        ],
        icon: IconDeviceLaptop,
        accent: classes.stepTeal,
        delay: '90ms',
    },
    {
        number: '03',
        title: 'Examen y certificado',
        body: 'Los estudiantes realizan la prueba en la plataforma internacional. Tras la evaluación reciben su reconocimiento.',
        points: [
            'El examen se aplica en la web internacional de Bebras',
            'Se clasifica por categoría y resultados',
            'Los participantes obtienen certificado de la edición',
        ],
        icon: IconCertificate,
        accent: classes.stepCyan,
        delay: '180ms',
    },
] as const;

export function FeaturesAsymmetrical() {
    return (
        <section className={classes.section} aria-labelledby="proceso-participacion-title">
            <Container size="lg">
                <header className={classes.header}>
                    <span className={classes.eyebrow}>Cómo participar</span>
                    <h2 id="proceso-participacion-title" className={classes.title}>
                        Proceso de participación
                    </h2>
                    <p className={classes.description}>
                        Tres pasos claros para unirte a BebrasCuba: desde el registro del profesor
                        hasta el certificado de tus estudiantes.
                    </p>
                </header>

                <ol className={classes.steps}>
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        return (
                            <li
                                key={step.number}
                                className={`${classes.step} ${step.accent}`}
                                style={{ ['--delay' as string]: step.delay }}
                            >
                                <div className={classes.topRow}>
                                    <div className={classes.iconWrap} aria-hidden="true">
                                        <Icon size={26} stroke={1.6} />
                                    </div>
                                    <span className={classes.stepNumber} aria-hidden="true">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className={classes.stepTitle}>{step.title}</h3>
                                <p className={classes.stepBody}>{step.body}</p>

                                <ul className={classes.points}>
                                    {step.points.map((point) => (
                                        <li key={point} className={classes.point}>
                                            <span className={classes.bullet} aria-hidden="true">
                                                <IconCheck size={12} stroke={3} />
                                            </span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ol>

                <div className={classes.cta}>
                    <p className={classes.ctaText}>
                        ¿Listo para empezar? Solicita tu registro como profesor y forma parte de la
                        próxima edición.
                    </p>
                    <Link to="/registro" className={classes.ctaLink}>
                        Ir al registro de profesor
                        <IconArrowRight size={16} stroke={2} />
                    </Link>
                </div>
            </Container>
        </section>
    );
}
