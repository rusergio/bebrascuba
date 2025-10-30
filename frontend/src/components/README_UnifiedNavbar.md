# Barra de Navegación Unificada - BebrasCuba

## Descripción

La barra de navegación unificada (`UnifiedNavbar.tsx`) es una solución que reemplaza las múltiples barras de navegación específicas por rol con una sola barra que se adapta dinámicamente según los roles del usuario.

## Características

### ✅ Ventajas de la nueva implementación:

1. **Una sola barra de navegación**: Elimina la duplicación de código
2. **Soporte para múltiples roles**: Un usuario puede tener varios roles simultáneamente
3. **Enlaces dinámicos**: Los enlaces se muestran según los permisos del usuario
4. **Fácil mantenimiento**: Un solo archivo para mantener
5. **Mejor UX**: Los usuarios ven todos los enlaces relevantes a sus roles

### 🔧 Funcionalidades:

- **Detección automática de roles**: Lee roles desde el contexto de usuario y localStorage
- **Enlaces únicos**: Evita duplicados cuando un usuario tiene múltiples roles
- **Menús desplegables**: Para enlaces complejos como "Gestionar Concurso"
- **Perfil dinámico**: El enlace de perfil cambia según el rol principal
- **Logout unificado**: Función de cierre de sesión consistente

## Estructura de Roles

### Roles soportados:
- `profesor`
- `coordinador_provincial`
- `coordinador_municipal`
- `coordinador_nacional`
- `administrador`

### Enlaces por rol:

#### Profesor:
- Inicio
- Recurso
- Gestionar Alumnos
- GeoBebras

#### Coordinador Provincial:
- Inicio
- Recurso
- Gestionar Municipio
- GeoBebras
- Solicitudes

#### Coordinador Municipal:
- Inicio
- Recurso
- Gestionar escuela
- GeoBebras
- Solicitudes

#### Coordinador Nacional:
- Inicio
- Recurso
- Gestionar Concurso (menú desplegable)
  - Edición
  - Recursos
  - Solicitudes
  - Configuración
- GeoBebras

#### Administrador:
- Inicio
- Recurso
- Administrar concurso (menú desplegable)
  - Registrar nuevo usuario
  - Ver usuarios registrados
- GeoBebras

## Uso del Hook useUserRoles

El hook `useUserRoles` proporciona utilidades para verificar roles:

```typescript
import { useUserRoles } from '../context/UserContext';

function MyComponent() {
    const { roles, hasRole, hasAnyRole, hasAllRoles, user } = useUserRoles();

    // Verificar un rol específico
    if (hasRole('profesor')) {
        // Mostrar contenido para profesores
    }

    // Verificar múltiples roles (OR)
    if (hasAnyRole(['coordinador_nacional', 'coordinador_provincial'])) {
        // Mostrar contenido para cualquier coordinador
    }

    // Verificar que tenga todos los roles (AND)
    if (hasAllRoles(['profesor', 'coordinador_nacional'])) {
        // Mostrar contenido solo si tiene ambos roles
    }
}
```

## Implementación

### 1. En App.tsx:
```typescript
import { UnifiedNavbar } from './components/UnifiedNavbar';
import { useUserRoles } from './context/UserContext';

export default function App() {
    const { roles: userRoles } = useUserRoles();
    const showUnifiedNavbar = userRoles.length > 0;
    
    return (
        <MantineProvider>
            {showUnifiedNavbar && <UnifiedNavbar />}
            {/* resto del componente */}
        </MantineProvider>
    );
}
```

### 2. Componente de ejemplo:
Ver `RoleBasedComponent.tsx` para ejemplos de cómo usar el sistema de roles.

## Migración desde las barras antiguas

### Antes (múltiples barras):
```typescript
{userRole === 'Administrador' && <BarNavAdmin />}
{userRole === 'Profesor' && <BarNavProfe />} 
{userRole === 'Coordinador Nacional' && <BarNavCoordNac />}
// ... más barras
```

### Después (barra unificada):
```typescript
{showUnifiedNavbar && <UnifiedNavbar />}
```

## Casos de uso

### Usuario con un solo rol:
- Un profesor ve: Inicio, Recurso, Gestionar Alumnos, GeoBebras

### Usuario con múltiples roles:
- Un usuario que es profesor Y coordinador nacional ve:
  - Inicio, Recurso, Gestionar Alumnos, Gestionar Concurso, GeoBebras
  - Todos los enlaces de ambos roles se combinan sin duplicados

## Personalización

Para agregar nuevos roles o enlaces:

1. **Agregar nuevo rol en `roleLinks`**:
```typescript
const roleLinks = {
    // ... roles existentes
    nuevo_rol: [
        { link: '/nuevo', label: 'Nuevo Enlace' },
    ],
};
```

2. **Actualizar `getUserProfilePath`**:
```typescript
const getUserProfilePath = (roles: string[]) => {
    // ... casos existentes
    if (roles.includes('nuevo_rol')) return 'mi-perfil/nuevo-rol';
    return '/mi_perfil';
};
```

## Beneficios de esta implementación

1. **Mantenibilidad**: Un solo archivo para mantener
2. **Escalabilidad**: Fácil agregar nuevos roles
3. **Flexibilidad**: Soporte nativo para múltiples roles
4. **Consistencia**: UI uniforme para todos los usuarios
5. **Performance**: Menos componentes cargados en memoria
6. **UX mejorada**: Los usuarios ven todos sus permisos de un vistazo

## Próximos pasos

1. ✅ Implementar la barra unificada
2. ✅ Crear el hook de roles
3. ✅ Actualizar App.tsx
4. 🔄 Probar con usuarios de múltiples roles
5. 🔄 Migrar completamente las barras antiguas
6. 🔄 Agregar tests unitarios
