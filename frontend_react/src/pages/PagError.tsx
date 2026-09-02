import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { NotFoundImage } from '../components/NotFoundImage';

/**
 * errorElement de React Router.
 * Contenido sin Mantine para que nunca quede en blanco si falla el provider.
 */
export default function PagError() {
    return <PagErrorBody />;
}

function PagErrorBody() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <NotFoundImage
                    codeLabel="Error 404"
                    title="No encontramos esta página"
                    lead="La dirección no coincide con ninguna pantalla de BebrasCuba. Revisa el enlace o vuelve al inicio."
                />
            );
        }

        return (
            <NotFoundImage
                codeLabel={`Error ${error.status}`}
                title="Algo no salió bien"
                lead={
                    error.statusText ||
                    'Ocurrió un problema al cargar esta vista. Puedes volver e intentarlo de nuevo.'
                }
            />
        );
    }

    return <NotFoundImage />;
}
