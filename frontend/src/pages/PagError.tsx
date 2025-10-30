import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { NotFoundImage } from '../components/NotFoundImage';

export default function PagError() {
    return (
        <MantineProvider>
            <NotFoundImage></NotFoundImage>
        </MantineProvider>
    );
}