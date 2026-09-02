-- Diagnóstico de vínculos profesor_estudiante (BebrasCuba)
-- Ejecutar en MySQL/phpMyAdmin. Reemplazar @edicion_id con el ID de la edición actual.

SET @edicion_id = (SELECT id FROM ediciones WHERE abierto = 1 LIMIT 1);

-- 1) Estudiantes inscritos en escuela pero SIN vínculo profesor_estudiante
SELECT
    e.id AS estudiante_id,
    e.nro_ci,
    e.nombre,
    esc.nombre AS escuela
FROM estudiante_escuela ee
JOIN estudiantes e ON e.id = ee.id_estudiante
JOIN escuelas esc ON esc.id = ee.id_escuela
LEFT JOIN profesor_estudiante pe ON pe.id_estudiante = e.id
    AND pe.edicion = ee.edicion
    AND pe.deleted_at IS NULL
WHERE ee.edicion = @edicion_id
  AND pe.id IS NULL
ORDER BY esc.nombre, e.nombre;

-- 2) Vínculos sospechosos: profesor no está en la escuela del estudiante
SELECT
    e.id AS estudiante_id,
    e.nro_ci,
    e.nombre AS estudiante,
    u.nombre AS profesor_vinculado,
    esc_est.nombre AS escuela_estudiante,
    pe.id AS vinculo_id,
    pe.id_profesor
FROM profesor_estudiante pe
JOIN estudiantes e ON e.id = pe.id_estudiante
JOIN profesores p ON p.id = pe.id_profesor
JOIN users u ON u.id = p.user_id
JOIN estudiante_escuela ee ON ee.id_estudiante = e.id AND ee.edicion = pe.edicion
JOIN escuelas esc_est ON esc_est.id = ee.id_escuela
LEFT JOIN profesor_escuela pe_esc ON pe_esc.id_profesor = p.id
    AND pe_esc.edicion = pe.edicion
    AND pe_esc.deleted_at IS NULL
WHERE pe.edicion = @edicion_id
  AND pe.deleted_at IS NULL
  AND (pe_esc.id_escuela IS NULL OR pe_esc.id_escuela != ee.id_escuela)
ORDER BY esc_est.nombre, e.nombre;
