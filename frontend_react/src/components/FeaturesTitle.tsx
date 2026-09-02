import { Container, Loader, ThemeIcon } from '@mantine/core';
import {
    IconCalendarDue,
    IconCalendarEvent,
    IconCalendarMonth,
    IconCalendarOff,
    IconCalendarStats,
    IconCalendarWeek,
} from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useDataContext } from '../context/DataContext';
import classes from '../styles/FeaturesTitle.module.css';

interface EdicionActual {
    n_edicion?: number;
    a_edicion?: number;
    fecha_convocatoria?: string | null;
    fecha_inic_preinscrip?: string | null;
    fecha_fin_preinscrip?: string | null;
    fecha_inic_inscripVille?: string | null;
    fecha_inic_realiz?: string | null;
    fecha_fin_realiz?: string | null;
    fecha_resultados?: string | null;
}

type PhaseStatus = 'done' | 'active' | 'upcoming' | 'pending';

interface Phase {
    id: string;
    title: string;
    hint: string;
    icon: typeof IconCalendarDue;
    start: Date | null;
    end: Date | null;
    dateLabel: string;
}

function parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | Date | null): string {
    if (!value) return 'Por confirmar';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'Por confirmar';
    return date.toLocaleDateString('es-CU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getStatus(start: Date | null, end: Date | null, today: Date): PhaseStatus {
    if (!start) return 'pending';
    const from = startOfDay(start);
    const to = startOfDay(end ?? start);
    const now = startOfDay(today);

    if (now > to) return 'done';
    if (now >= from && now <= to) return 'active';

    const daysUntil = Math.ceil((from.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 14) return 'upcoming';
    return 'pending';
}

const STATUS_META: Record<
    PhaseStatus,
    { label: string; className: string }
> = {
    done: { label: 'Completado', className: classes.statusDone },
    active: { label: 'En curso', className: classes.statusActive },
    upcoming: { label: 'Próximo', className: classes.statusUpcoming },
    pending: { label: 'Pendiente', className: classes.statusPending },
};

export function FeaturesTitle() {
    const { numeroEdicion, anioEdicion, estadoEdicion } = useDataContext();
    const [edicion, setEdicion] = useState<EdicionActual | null>(null);
    const [loading, setLoading] = useState(true);
    const [unavailable, setUnavailable] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get<EdicionActual>('/api/listar-edicion-actual');
                setEdicion(data);
                setUnavailable(false);
            } catch {
                setEdicion(null);
                setUnavailable(true);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const today = useMemo(() => new Date(), []);

    const phases: Phase[] = useMemo(() => {
        if (!edicion) return [];

        const convocatoria = parseDate(edicion.fecha_convocatoria);
        const preIni = parseDate(edicion.fecha_inic_preinscrip);
        const preFin = parseDate(edicion.fecha_fin_preinscrip);
        const ville = parseDate(edicion.fecha_inic_inscripVille);
        const realizIni = parseDate(edicion.fecha_inic_realiz);
        const realizFin = parseDate(edicion.fecha_fin_realiz);
        const resultados = parseDate(edicion.fecha_resultados);

        return [
            {
                id: 'convocatoria',
                title: 'Convocatoria',
                hint: 'Se publica la convocatoria oficial de la edición.',
                icon: IconCalendarDue,
                start: convocatoria,
                end: convocatoria,
                dateLabel: formatDate(convocatoria),
            },
            {
                id: 'preinscripcion',
                title: 'Preinscripción en BebrasCuba',
                hint: 'Los profesores registran e inscriben a sus estudiantes.',
                icon: IconCalendarWeek,
                start: preIni,
                end: preFin,
                dateLabel:
                    preIni || preFin
                        ? `${formatDate(preIni)} – ${formatDate(preFin)}`
                        : 'Por confirmar',
            },
            {
                id: 'ville',
                title: 'Inscripción en Ville',
                hint: 'Inicio de la inscripción en la plataforma internacional.',
                icon: IconCalendarEvent,
                start: ville,
                end: ville,
                dateLabel: formatDate(ville),
            },
            {
                id: 'realizacion',
                title: 'Realización del concurso',
                hint: 'Periodo en que los estudiantes resuelven las pruebas.',
                icon: IconCalendarMonth,
                start: realizIni,
                end: realizFin,
                dateLabel:
                    realizIni || realizFin
                        ? `${formatDate(realizIni)} – ${formatDate(realizFin)}`
                        : 'Por confirmar',
            },
            {
                id: 'resultados',
                title: 'Publicación de resultados',
                hint: 'Se difunden los resultados por provincia y categoría.',
                icon: IconCalendarStats,
                start: resultados,
                end: resultados,
                dateLabel: formatDate(resultados),
            },
        ];
    }, [edicion]);

    const edicionLabel =
        edicion?.n_edicion != null
            ? `${edicion.n_edicion}ª edición`
            : numeroEdicion > 0
              ? `${numeroEdicion}ª edición`
              : 'Edición actual';

    const anioLabel =
        edicion?.a_edicion != null
            ? String(edicion.a_edicion)
            : anioEdicion != null
              ? String(anioEdicion)
              : '—';

    const abierta = estadoEdicion === 'Abierto' || (!unavailable && !!edicion);

    return (
        <section className={classes.section} aria-labelledby="almanaque-title">
            <Container size="lg">
                <div className={classes.layout}>
                    <aside className={classes.intro}>
                        <span className={classes.eyebrow}>Calendario oficial</span>
                        <h2 id="almanaque-title" className={classes.title}>
                            Almanaque de actividades
                        </h2>
                        <p className={classes.description}>
                            Sigue el ciclo completo de la edición: de la convocatoria a la publicación
                            de resultados. Las fases se actualizan según las fechas configuradas.
                        </p>

                        <div className={classes.metaCard}>
                            <div className={classes.metaItem}>
                                <span className={classes.metaLabel}>Edición</span>
                                <span className={classes.metaValue}>{edicionLabel}</span>
                            </div>
                            <div className={classes.metaItem}>
                                <span className={classes.metaLabel}>Año</span>
                                <span className={classes.metaValue}>{anioLabel}</span>
                            </div>
                            <div className={classes.metaItem}>
                                <span className={classes.metaLabel}>Estado</span>
                                <span className={classes.metaValue}>
                                    {abierta ? 'Abierta' : 'Cerrada / sin fechas'}
                                </span>
                            </div>
                        </div>
                    </aside>

                    <div>
                        {loading ? (
                            <div className={classes.skeleton} aria-busy="true" aria-live="polite">
                                <div className={classes.skeletonRow} />
                                <div className={classes.skeletonRow} />
                                <div className={classes.skeletonRow} />
                                <Loader size="sm" color="cyan" mx="auto" mt="sm" />
                            </div>
                        ) : unavailable || phases.length === 0 ? (
                            <div className={classes.empty}>
                                <ThemeIcon size={52} radius="xl" variant="light" color="gray">
                                    <IconCalendarOff size={26} />
                                </ThemeIcon>
                                <p className={classes.emptyTitle}>Calendario no disponible</p>
                                <p className={classes.emptyText}>
                                    No hay una edición abierta con fechas publicadas. Cuando el
                                    coordinador configure el almanaque, aparecerá aquí.
                                </p>
                            </div>
                        ) : (
                            <ol className={classes.timeline}>
                                {phases.map((phase, index) => {
                                    const status = getStatus(phase.start, phase.end, today);
                                    const meta = STATUS_META[status];
                                    const Icon = phase.icon;
                                    return (
                                        <li
                                            key={phase.id}
                                            className={`${classes.item} ${meta.className}`}
                                            style={{ ['--delay' as string]: `${index * 70}ms` }}
                                        >
                                            <div className={classes.rail} aria-hidden="true">
                                                <div className={classes.dot}>
                                                    <Icon size={22} stroke={1.6} />
                                                </div>
                                                <div className={classes.line} />
                                            </div>
                                            <article className={classes.card}>
                                                <div className={classes.cardHeader}>
                                                    <h3 className={classes.cardTitle}>{phase.title}</h3>
                                                    <span className={classes.badge}>{meta.label}</span>
                                                </div>
                                                <p className={classes.cardDate}>{phase.dateLabel}</p>
                                                <p className={classes.cardHint}>{phase.hint}</p>
                                            </article>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}
