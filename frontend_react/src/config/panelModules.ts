import {
    IconCertificate,
    IconClipboardList,
    IconFileImport,
    IconFileTypePdf,
    IconHistory,
    IconLayoutDashboard,
    IconMedal,
    IconUser,
    IconUsers,
} from '@tabler/icons-react';

export interface PanelModule {
    icon: typeof IconLayoutDashboard;
    color: string;
    title: string;
    description: string;
    to: string;
    buttonLabel: string;
    soon?: boolean;
}

export const profesorModules: PanelModule[] = [
    {
        icon: IconClipboardList,
        color: 'orange',
        title: 'Mis pendientes',
        description:
            'Revisar y corregir resultados importados que requieren tu atención antes de la aprobación del coordinador.',
        to: '/profesor/resultados?tab=pendientes',
        buttonLabel: 'Ver pendientes',
    },
    {
        icon: IconMedal,
        color: 'yellow',
        title: 'Resultados oficiales',
        description:
            'Consultar los resultados ya integrados al histórico oficial de tus estudiantes en esta edición.',
        to: '/profesor/resultados?tab=oficiales',
        buttonLabel: 'Ver resultados',
    },
    {
        icon: IconUser,
        color: 'teal',
        title: 'Mi certificado',
        description:
            'Generar y descargar tu certificado de participación como profesor del concurso.',
        to: '/profesor/mis-certificados?tab=propio',
        buttonLabel: 'Generar mi certificado',
        soon: true,
    },
    {
        icon: IconCertificate,
        color: 'blue',
        title: 'Certificados de estudiantes',
        description:
            'Consultar, verificar y descargar los certificados de tus estudiantes por edición.',
        to: '/profesor/mis-certificados?tab=estudiantes',
        buttonLabel: 'Ver certificados',
        soon: true,
    },
];

export const coordinadorModules: PanelModule[] = [
    {
        icon: IconFileImport,
        color: 'cyan',
        title: 'Importar resultados',
        description:
            'Cargar el Excel oficial de resultados y procesar estudiantes preinscritos o pendientes.',
        to: '/coordinador/importar-resultados',
        buttonLabel: 'Abrir importación',
    },
    {
        icon: IconMedal,
        color: 'orange',
        title: 'Medallas',
        description: 'Calcular y revisar la propuesta automática de medallas por categoría.',
        to: '/coordinador/calcular-medallas',
        buttonLabel: 'Abrir medallas',
        soon: true,
    },
    {
        icon: IconFileTypePdf,
        color: 'grape',
        title: 'Plantillas',
        description: 'Consultar plantillas activas para certificados de participación y medallas.',
        to: '/coordinador/plantillas-certificados',
        buttonLabel: 'Ver plantillas',
        soon: true,
    },
    {
        icon: IconCertificate,
        color: 'teal',
        title: 'Certificados de estudiantes',
        description: 'Generar certificados por edición y verificación mediante QR.',
        to: '/profesor/mis-certificados?tab=estudiantes',
        buttonLabel: 'Ver certificados',
        soon: true,
    },
    {
        icon: IconHistory,
        color: 'indigo',
        title: 'Certificados históricos',
        description: 'Gestionar y consultar certificados históricos importados al sistema.',
        to: '/coordinador/certificados-historicos',
        buttonLabel: 'Abrir históricos',
        soon: true,
    },
    {
        icon: IconClipboardList,
        color: 'yellow',
        title: 'Revisión de resultados',
        description: 'Revisar importados, aceptar, ajustar medallas e integrar al histórico oficial.',
        to: '/coordinador/resultados-pendientes',
        buttonLabel: 'Abrir revisión',
    },
    {
        icon: IconUsers,
        color: 'dark',
        title: 'Certificados colaboradores',
        description: 'Generar certificados para profesores y colaboradores del concurso.',
        to: '/coordinador/certificados-colaboradores',
        buttonLabel: 'Ver colaboradores',
        soon: true,
    },
];
