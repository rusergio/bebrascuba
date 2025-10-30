import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: number;
    nombre: string;
    apellidos: string;
    image?: string; // Opcional, en caso de que el usuario tenga un avatar
    nro_ci: string;
    telefono: string;
    correo: string;
    pin: string;
    roles: Array<{
        id: number;
        rol: string;
        descripcion: string;
        estado: boolean;
    }>;
}

// 
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    activeRole: string | null;
    setActiveRole: (role: string | null) => void;
}

// Crear el contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Proveedor del contexto
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [activeRole, setActiveRole] = useState<string | null>(() => {
        // Inicializar con el rol del localStorage si existe
        return localStorage.getItem('activeRole') || localStorage.getItem('userRole') || null;
    });

    return (
        <UserContext.Provider value={{ user, setUser, activeRole, setActiveRole }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook para usar el contexto
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext debe usarse dentro de UserProvider');
    }
    return context;
};

// Hook helper para verificar si el usuario tiene un rol específico
export const useUserRoles = () => {
    const { user, activeRole } = useUserContext();
    
    const getUserRoles = (): string[] => {
        if (user?.roles) {
            return user.roles.map(role => role.rol);
        }
        
        // Fallback a localStorage si el contexto no está disponible
        const allUserRoles = localStorage.getItem('allUserRoles');
        if (allUserRoles) {
            try {
                return JSON.parse(allUserRoles);
            } catch (error) {
                console.error('Error parsing allUserRoles:', error);
            }
        }
        
        // Fallback al rol individual si no hay roles múltiples
        const userRole = localStorage.getItem('userRole');
        return userRole ? [userRole] : [];
    };

    const getActiveRole = (): string | null => {
        return activeRole || localStorage.getItem('activeRole') || localStorage.getItem('userRole') || null;
    };

    const getAllUserRoles = (): string[] => {
        return getUserRoles();
    };

    const hasRole = (role: string): boolean => {
        const userRoles = getUserRoles();
        return userRoles.includes(role);
    };

    const hasAnyRole = (roles: string[]): boolean => {
        const userRoles = getUserRoles();
        return roles.some(role => userRoles.includes(role));
    };

    const hasAllRoles = (roles: string[]): boolean => {
        const userRoles = getUserRoles();
        return roles.every(role => userRoles.includes(role));
    };

    return {
        roles: getUserRoles(),
        activeRole: getActiveRole(),
        allRoles: getAllUserRoles(),
        hasRole,
        hasAnyRole,
        hasAllRoles,
        user
    };
};