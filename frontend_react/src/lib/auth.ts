const TOKEN_KEY = 'auth_token';
const RESET_TOKEN_KEY = 'password_reset_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    return Boolean(getToken());
}

export function setResetToken(token: string): void {
    localStorage.setItem(RESET_TOKEN_KEY, token);
}

export function getResetToken(): string | null {
    return localStorage.getItem(RESET_TOKEN_KEY);
}

export function clearResetToken(): void {
    localStorage.removeItem(RESET_TOKEN_KEY);
}

/** Rutas accesibles sin sesión; un 401 aquí no debe redirigir al login. */
const PUBLIC_PATH_PREFIXES = [
    '/',
    '/acceso',
    '/registro',
    '/recurso',
    '/confirmar-email',
    '/recuperar-senia',
    '/cambiar-clave',
    '/cambiar-contrasenia',
    '/solic_coord_provinc',
    '/solic_coord_munic',
];

export function isPublicPath(pathname: string): boolean {
    if (pathname === '/') return true;
    return PUBLIC_PATH_PREFIXES.some(
        (prefix) => prefix !== '/' && (pathname === prefix || pathname.startsWith(`${prefix}/`)),
    );
}

export function clearAuthStorage(): void {
    const keys = [
        TOKEN_KEY,
        RESET_TOKEN_KEY,
        'token',
        'userRole',
        'activeRole',
        'allUserRoles',
        'allUserRolesData',
        'userName',
        'userLastName',
        'userEmail',
        'userId',
        'profesorId',
        'profesorTableId',
        'userSchoolId',
        'userSchoolName',
        'userPhoto',
        'userFotoPerfil',
        'userProvincia',
        'userMunicipio',
        'userCI',
        'userTelefono',
    ];
    keys.forEach((key) => localStorage.removeItem(key));
}
