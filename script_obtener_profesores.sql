-- Script SQL para obtener user_id de profesores para probar listarEstudiantes
-- Ejecutar en tu base de datos para obtener los IDs de profesores disponibles

-- 1. Listar todos los profesores con su user_id
SELECT 
    u.id as user_id,
    u.nro_ci,
    u.nombre,
    u.apellidos,
    u.correo,
    p.id as profesor_id,
    p.esta_activo,
    p.es_nuevo
FROM users u
INNER JOIN profesores p ON u.id = p.user_id
ORDER BY u.id;

-- 2. Obtener un profesor específico por CI
SELECT 
    u.id as user_id,
    u.nro_ci,
    u.nombre,
    u.apellidos,
    u.correo,
    p.id as profesor_id,
    p.esta_activo
FROM users u
INNER JOIN profesores p ON u.id = p.user_id
WHERE u.nro_ci = 'TU_CI_AQUI'; -- Reemplaza con el CI del profesor

-- 3. Ver profesores con estudiantes en la edición actual
SELECT DISTINCT
    u.id as user_id,
    u.nombre,
    u.apellidos,
    u.correo,
    COUNT(DISTINCT pe.id_estudiante) as cantidad_estudiantes
FROM users u
INNER JOIN profesores p ON u.id = p.user_id
INNER JOIN profesor_estudiante pe ON p.id = pe.id_profesor
INNER JOIN ediciones ed ON pe.edicion = ed.id
WHERE pe.deleted_at IS NULL
  AND (ed.abierto = true OR ed.id = (SELECT id FROM ediciones ORDER BY n_edicion DESC LIMIT 1))
GROUP BY u.id, u.nombre, u.apellidos, u.correo
ORDER BY cantidad_estudiantes DESC;

-- 4. Ver detalles de estudiantes de un profesor específico
-- Reemplaza {user_id} con el user_id del profesor
SELECT 
    e.id,
    e.nombre as nombre_estudiante,
    esc.nombre as nombre_escuela,
    e.sexo,
    ee.grado,
    c.nombre_cuba as categoria,
    ed.n_edicion as edicion_numero,
    ed.abierto as edicion_abierta
FROM profesores p
INNER JOIN profesor_estudiante pe ON p.id = pe.id_profesor
INNER JOIN estudiantes e ON pe.id_estudiante = e.id
INNER JOIN estudiante_escuela ee ON e.id = ee.id_estudiante
INNER JOIN escuelas esc ON ee.id_escuela = esc.id
INNER JOIN categorias c ON ee.grado >= c.grado_inferior AND ee.grado <= c.grado_superior
INNER JOIN ediciones ed ON pe.edicion = ed.id
WHERE p.user_id = {user_id}  -- Reemplaza con el user_id del profesor
  AND pe.deleted_at IS NULL
  AND ee.deleted_at IS NULL
  AND e.deleted_at IS NULL
ORDER BY ed.n_edicion DESC, e.nombre;

-- 5. Verificar la edición actual
SELECT 
    id,
    n_edicion,
    abierto,
    fecha_inicio,
    fecha_fin
FROM ediciones
ORDER BY n_edicion DESC
LIMIT 1;

