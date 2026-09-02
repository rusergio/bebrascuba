import { LoginLinks } from '../components/LoginLinks';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';

export default function PagAcceso() {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    return <LoginLinks />;
}
