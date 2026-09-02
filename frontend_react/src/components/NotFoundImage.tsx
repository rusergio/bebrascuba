import { Link } from 'react-router-dom';
import logoBebras from '../assets/logobebrascuba.png';

const styles = {
    page: {
        minHeight: '100vh',
        width: '100%',
        overflow: 'auto',
        fontFamily: "'Outfit', system-ui, sans-serif",
        color: '#07222b',
        background:
            'radial-gradient(circle at 12% 18%, rgba(13,115,119,0.12), transparent 34%), radial-gradient(circle at 88% 78%, rgba(224,122,95,0.1), transparent 32%), linear-gradient(180deg, #f7f4ef 0%, #e8f6f4 55%, #eef7f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box' as const,
    },
    shell: {
        width: '100%',
        maxWidth: 720,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
    },
    logo: {
        width: 44,
        height: 44,
        objectFit: 'contain' as const,
    },
    brandName: {
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 22,
        fontWeight: 700,
    },
    code: {
        display: 'inline-block',
        margin: '0 0 12px',
        padding: '6px 12px',
        borderRadius: 999,
        background: 'rgba(13,115,119,0.1)',
        border: '1px solid rgba(13,115,119,0.16)',
        color: '#0d7377',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
    },
    title: {
        margin: '0 0 14px',
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        color: '#07222b',
    },
    lead: {
        margin: '0 0 10px',
        fontSize: 17,
        lineHeight: 1.55,
        color: 'rgba(7,34,43,0.72)',
        maxWidth: 540,
    },
    hint: {
        margin: '0 0 28px',
        fontSize: 15,
        lineHeight: 1.5,
        color: 'rgba(7,34,43,0.55)',
        maxWidth: 520,
    },
    actions: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: 10,
    },
    primary: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: '0 18px',
        borderRadius: 10,
        background: 'linear-gradient(135deg, #0d7377 0%, #14919b 55%, #0a5c61 100%)',
        color: '#fff',
        fontWeight: 600,
        fontSize: 15,
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(13,115,119,0.25)',
    },
    secondary: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: '0 18px',
        borderRadius: 10,
        background: '#fff',
        color: '#07222b',
        fontWeight: 600,
        fontSize: 15,
        textDecoration: 'none',
        border: '1px solid rgba(7,34,43,0.12)',
        cursor: 'pointer',
    },
    ghost: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: '0 18px',
        borderRadius: 10,
        background: 'transparent',
        color: 'rgba(7,34,43,0.65)',
        fontWeight: 600,
        fontSize: 15,
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
    },
};

type NotFoundImageProps = {
    title?: string;
    lead?: string;
    codeLabel?: string;
};

export function NotFoundImage({
    title = 'Esta ruta se perdió en el camino',
    lead = 'La página que buscas no existe o se movió. Puede que la dirección esté mal escrita, o que el enlace ya no esté vigente.',
    codeLabel = 'Error 404',
}: NotFoundImageProps) {
    return (
        <div style={styles.page}>
            <div style={styles.shell}>
                <div style={styles.brand}>
                    <img src={logoBebras} alt="BebrasCuba" style={styles.logo} />
                    <span style={styles.brandName}>BebrasCuba</span>
                </div>

                <p style={styles.code}>{codeLabel}</p>
                <h1 style={styles.title}>{title}</h1>
                <p style={styles.lead}>{lead}</p>
                <p style={styles.hint}>
                    No te preocupes: puedes volver al inicio o entrar a tu cuenta y continuar desde
                    ahí.
                </p>

                <div style={styles.actions}>
                    <Link to="/" style={styles.primary}>
                        Ir al inicio
                    </Link>
                    <Link to="/acceso" style={styles.secondary}>
                        Iniciar sesión
                    </Link>
                    <button type="button" style={styles.ghost} onClick={() => window.history.back()}>
                        Volver atrás
                    </button>
                </div>
            </div>
        </div>
    );
}
