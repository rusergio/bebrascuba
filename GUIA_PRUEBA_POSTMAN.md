# Guía para Probar `listarEstudiantes` en Postman

## Información General

La función `listarEstudiantes` en `ProfesorController.php` lista todos los estudiantes inscritos por un profesor en la edición actual.

## Detalles de la Ruta

- **Método HTTP**: `GET`
- **Ruta**: `/api/listar-estudiantes/{id_profesor}`
- **Parámetro**: `{id_profesor}` - Es el **user_id** (ID de la tabla `users`), NO el ID de la tabla `profesores`

## Configuración en Postman

### 1. Crear Nueva Solicitud

1. Abre Postman
2. Crea una nueva solicitud (New Request)
3. Nómbrala: "Listar Estudiantes de Profesor"

### 2. Configurar la Solicitud

**Método HTTP:**
- Selecciona `GET` del menú desplegable

**URL:**
```
http://localhost/api/listar-estudiantes/{id_profesor}
```

**Importante:** 
- Reemplaza `{id_profesor}` con el **user_id** real de un profesor
- Si usas Laragon con dominio personalizado, podría ser: `http://bebrascuba2.test/api/listar-estudiantes/{id_profesor}`
- Si usas otro puerto: `http://localhost:8000/api/listar-estudiantes/{id_profesor}`

**Ejemplo:**
```
http://localhost/api/listar-estudiantes/1
```

### 3. Headers (Opcional)

Generalmente no se requieren headers especiales, pero si tu API requiere autenticación:
- **Accept**: `application/json`
- **Content-Type**: `application/json`
- Si usas Sanctum, agrega: **Authorization**: `Bearer {token}`

### 4. Cómo Obtener el ID del Profesor

Necesitas el `user_id` (ID de la tabla `users`) de un profesor. Tienes varias opciones:

**Opción A: Desde la Base de Datos**
```sql
SELECT u.id, u.nro_ci, u.nombre, u.apellidos, u.correo, p.id as profesor_id
FROM users u
INNER JOIN profesores p ON u.id = p.user_id
WHERE u.id = {id_usuario};
```

**Opción B: Desde el Frontend**
- Cuando un profesor se loguea, el sistema guarda datos en `localStorage`
- Verifica en el navegador (F12 > Application > Local Storage):
  - `profesorId` o `userId` - Este es el `user_id` que necesitas

**Opción C: Probar con un ID conocido**
- Si sabes que el usuario con ID 1 es un profesor, úsalo para probar

## Respuesta Esperada

### Éxito (200 OK)

Retorna un array JSON con los estudiantes:

```json
[
  {
    "id": 1,
    "nombre_estudiante": "Juan Pérez",
    "nombre_escuela": "Escuela Primaria Central",
    "sexo": "Masculino",
    "grado": 5,
    "categoria": "Benjamin"
  },
  {
    "id": 2,
    "nombre_estudiante": "María García",
    "nombre_escuela": "Escuela Primaria Central",
    "sexo": "Femenino",
    "grado": 6,
    "categoria": "Cadete"
  }
]
```

### Profesor No Encontrado (404)

```json
{
  "success": false,
  "message": "Profesor no encontrado"
}
```

### Sin Estudiantes

Si el profesor existe pero no tiene estudiantes inscritos en la edición actual:
```json
[]
```

### Error del Servidor

En caso de error, retorna un array vacío:
```json
[]
```

## Ejemplos de Pruebas

### Prueba 1: Profesor con Estudiantes
- **URL**: `GET http://localhost/api/listar-estudiantes/1`
- **Resultado esperado**: Array con estudiantes o array vacío `[]`

### Prueba 2: Profesor Inexistente
- **URL**: `GET http://localhost/api/listar-estudiantes/99999`
- **Resultado esperado**: `{"success": false, "message": "Profesor no encontrado"}` con status 404

### Prueba 3: Profesor sin Estudiantes
- **URL**: `GET http://localhost/api/listar-estudiantes/{id_profesor_sin_estudiantes}`
- **Resultado esperado**: Array vacío `[]`

## Notas Importantes

1. **El parámetro es user_id**: La función espera el ID de la tabla `users`, no el ID de la tabla `profesores`
2. **Filtrado por Edición**: Solo muestra estudiantes de la edición actual (abierta o la última)
3. **Soft Deletes**: No muestra estudiantes o relaciones eliminadas (soft deletes)
4. **Sin Autenticación**: La ruta actual no tiene middleware de autenticación, pero en producción debería tenerla

## Troubleshooting

### Error: "Profesor no encontrado"
- Verifica que el ID sea el `user_id` correcto
- Verifica que exista un registro en la tabla `profesores` con ese `user_id`

### Retorna array vacío
- El profesor existe pero no tiene estudiantes en la edición actual
- La edición actual podría no tener estudiantes inscritos
- Verifica que existan registros en `profesor_estudiante` para esa edición

### Error de conexión
- Verifica que el servidor Laravel esté corriendo
- Verifica la URL base (podría ser diferente a `localhost`)
- Verifica que la ruta esté correctamente definida en `routes/api.php`

## Verificar en la Base de Datos

Para verificar los datos directamente:

```sql
-- Verificar que el profesor existe
SELECT * FROM profesores WHERE user_id = {id_profesor};

-- Ver estudiantes del profesor en la edición actual
SELECT 
    e.id,
    e.nombre as nombre_estudiante,
    esc.nombre as nombre_escuela,
    e.sexo,
    ee.grado,
    c.nombre_cuba as categoria
FROM profesores p
INNER JOIN profesor_estudiante pe ON p.id = pe.id_profesor
INNER JOIN estudiantes e ON pe.id_estudiante = e.id
INNER JOIN estudiante_escuela ee ON e.id = ee.id_estudiante
INNER JOIN escuelas esc ON ee.id_escuela = esc.id
INNER JOIN categorias c ON ee.grado >= c.grado_inferior AND ee.grado <= c.grado_superior
WHERE p.user_id = {id_profesor}
  AND pe.edicion = (SELECT id FROM ediciones WHERE abierto = true ORDER BY n_edicion DESC LIMIT 1)
  AND ee.edicion = (SELECT id FROM ediciones WHERE abierto = true ORDER BY n_edicion DESC LIMIT 1)
  AND pe.deleted_at IS NULL
  AND ee.deleted_at IS NULL
  AND e.deleted_at IS NULL
ORDER BY e.nombre;
```

