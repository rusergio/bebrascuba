import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconCheck, IconShieldLock } from '@tabler/icons-react';
import logoBebras from '../assets/logobebrascuba.png';
import classes from '../styles/CambiarClave.module.css';

const STEPS = [
    { title: 'Identidad', hint: 'Tu carnet de 11 dígitos' },
    { title: 'PIN de seguridad', hint: 'El código que registraste' },
    { title: 'Nueva contraseña', hint: 'Elige una clave más segura' },
] as const;

type RecoveryAccessLayoutProps = {
    activeStep: 1 | 2 | 3;
    headline: ReactNode;
    lead: string;
    icon: ReactNode;
    title: string;
    subtitle: ReactNode;
    backTo: string;
    backLabel: string;
    note?: ReactNode;
    children: ReactNode;
};

export function RecoveryAccessLayout({
    activeStep,
    headline,
    lead,
    icon,
    title,
    subtitle,
    backTo,
    backLabel,
    note,
    children,
}: RecoveryAccessLayoutProps) {
    return (
        <div className={classes.page}>
            <aside className={classes.visual} aria-label="Recuperar acceso a BebrasCuba">
                <div className={classes.visualBg} />
                <div className={classes.visualMesh} aria-hidden />
                <div className={`${classes.orb} ${classes.orbA}`} aria-hidden />
                <div className={`${classes.orb} ${classes.orbB}`} aria-hidden />

                <div className={classes.visualContent}>
                    <div className={classes.brandRow}>
                        <img src={logoBebras} alt="" className={classes.logo} />
                        <div>
                            <div className={classes.brandName}>BebrasCuba</div>
                            <div className={classes.brandTag}>Pensamiento computacional</div>
                        </div>
                    </div>

                    <div className={classes.heroCopy}>
                        <span className={classes.eyebrow}>
                            <IconShieldLock size={14} />
                            Recuperación de acceso
                        </span>
                        <h1 className={classes.headline}>{headline}</h1>
                        <p className={classes.lead}>{lead}</p>

                        <div className={classes.steps}>
                            {STEPS.map((step, index) => {
                                const number = (index + 1) as 1 | 2 | 3;
                                const done = number < activeStep;
                                const active = number === activeStep;
                                return (
                                    <div
                                        key={step.title}
                                        className={`${classes.step} ${active ? classes.stepActive : ''} ${done ? classes.stepDone : ''}`}
                                    >
                                        <span className={classes.stepIndex}>
                                            {done ? <IconCheck size={14} stroke={2.4} /> : number}
                                        </span>
                                        <div>
                                            <div className={classes.stepTitle}>{step.title}</div>
                                            <div className={classes.stepHint}>{step.hint}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={classes.footerMeta}>
                        <span className={classes.chip}>Privado y rápido</span>
                        <span className={classes.chip}>Sin correo de espera</span>
                        <span className={classes.chip}>Solo tú puedes continuar</span>
                    </div>
                </div>
            </aside>

            <main className={classes.panel}>
                <div className={classes.panelInner}>
                    <Link to={backTo} className={classes.backLink}>
                        <IconArrowLeft size={16} />
                        {backLabel}
                    </Link>

                    <div className={classes.formCard}>
                        <div className={classes.iconBadge} aria-hidden>
                            {icon}
                        </div>
                        <h2 className={classes.formTitle}>{title}</h2>
                        <p className={classes.formSubtitle}>{subtitle}</p>

                        <div className={classes.progress} aria-hidden>
                            {[1, 2, 3].map((step) => (
                                <span
                                    key={step}
                                    className={`${classes.progressDot} ${step <= activeStep ? classes.progressDotOn : ''}`}
                                />
                            ))}
                        </div>

                        {children}

                        {note ? <div className={classes.note}>{note}</div> : null}
                    </div>
                </div>
            </main>
        </div>
    );
}
