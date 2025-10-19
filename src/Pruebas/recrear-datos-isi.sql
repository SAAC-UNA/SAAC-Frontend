-- ============================================
-- Script SQL - RECREAR DATOS COMPLETOS ISI
-- Universidad Nacional - Ingeniería en Sistemas de Información
-- ============================================
-- IMPORTANTE: Este script borra y recrea TODOS los datos de ISI
-- Ejecutar con: Get-Content recrear-datos-isi.sql | docker exec -i saac-una mysql -u root -p12345678 saac
-- ============================================

-- PASO 1: LIMPIAR DATOS EXISTENTES (en orden inverso por dependencias)
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM EVIDENCIA WHERE criterio_id IN (
    SELECT criterio_id FROM CRITERIO WHERE componente_id IN (
        SELECT componente_id FROM COMPONENTE WHERE dimension_id IN (
            SELECT dimension_id FROM DIMENSION
        )
    )
);

DELETE FROM CRITERIO WHERE componente_id IN (
    SELECT componente_id FROM COMPONENTE WHERE dimension_id IN (
        SELECT dimension_id FROM DIMENSION
    )
);

DELETE FROM COMPONENTE WHERE dimension_id IN (SELECT dimension_id FROM DIMENSION);
DELETE FROM DIMENSION;

DELETE FROM PROCESO WHERE ciclo_acreditacion_id IN (
    SELECT ciclo_acreditacion_id FROM CICLO_ACREDITACION WHERE carrera_sede_id IN (
        SELECT carrera_sede_id FROM CARRERA_SEDE WHERE carrera_id = 1
    )
);

DELETE FROM CICLO_ACREDITACION WHERE carrera_sede_id IN (
    SELECT carrera_sede_id FROM CARRERA_SEDE WHERE carrera_id = 1
);

DELETE FROM CARRERA_SEDE WHERE carrera_id = 1;
DELETE FROM CARRERA WHERE carrera_id = 1;
DELETE FROM FACULTAD WHERE facultad_id = 1;
DELETE FROM SEDE WHERE sede_id = 1;
DELETE FROM UNIVERSIDAD WHERE universidad_id = 1;

DELETE FROM COMENTARIO WHERE comentario_id BETWEEN 1 AND 31;
DELETE FROM ESTADO_EVIDENCIA WHERE estado_evidencia_id BETWEEN 1 AND 4;

SET FOREIGN_KEY_CHECKS = 1;

-- PASO 2: INSERTAR ESTRUCTURA ORGANIZACIONAL

-- Universidad
INSERT INTO UNIVERSIDAD (universidad_id, nombre, activo, created_at, updated_at) 
VALUES (1, 'Universidad Nacional de Costa Rica', 1, NOW(), NOW());

-- Sede
INSERT INTO SEDE (sede_id, universidad_id, nombre, activo, created_at, updated_at) 
VALUES (1, 1, 'Campus Omar Dengo', 1, NOW(), NOW());

-- Facultad
INSERT INTO FACULTAD (facultad_id, universidad_id, sede_id, nombre, activo, created_at, updated_at) 
VALUES (1, 1, 1, 'Facultad de Ciencias Exactas y Naturales', 1, NOW(), NOW());

-- Carrera
INSERT INTO CARRERA (carrera_id, facultad_id, nombre, activo, created_at, updated_at) 
VALUES (1, 1, 'Ingenieria en Sistemas de Informacion', 1, NOW(), NOW());

-- PASO 3: DATOS PARA ASIGNAR EVIDENCIAS

-- Estados de Evidencia
INSERT INTO ESTADO_EVIDENCIA (estado_evidencia_id, nombre, created_at, updated_at) VALUES
(1, 'Pendiente', NOW(), NOW()),
(2, 'En proceso', NOW(), NOW()),
(3, 'Completa', NOW(), NOW()),
(4, 'Observada', NOW(), NOW());

-- Relación Carrera-Sede
INSERT INTO CARRERA_SEDE (carrera_sede_id, carrera_id, sede_id, created_at, updated_at) 
VALUES (1, 1, 1, NOW(), NOW());

-- Ciclo de Acreditación
INSERT INTO CICLO_ACREDITACION (ciclo_acreditacion_id, carrera_sede_id, nombre, created_at, updated_at) 
VALUES (1, 1, 'Ciclo 2024-2028', NOW(), NOW());

-- Proceso de Autoevaluación
INSERT INTO PROCESO (proceso_id, ciclo_acreditacion_id, tipo_proceso, created_at, updated_at) 
VALUES (1, 1, 'Autoevaluacion', NOW(), NOW());

-- PASO 4: COMENTARIOS PARA TODA LA ESTRUCTURA SINAES (31)

INSERT INTO COMENTARIO (comentario_id, usuario_id, texto, fecha_creacion, created_at, updated_at) VALUES
-- Dimensiones (5)
(1, 1, 'Dimension 1: Relacion con el Contexto', CURDATE(), NOW(), NOW()),
(2, 1, 'Dimension 2: Recursos', CURDATE(), NOW(), NOW()),
(3, 1, 'Dimension 3: Proceso Educativo', CURDATE(), NOW(), NOW()),
(4, 1, 'Dimension 4: Resultados', CURDATE(), NOW(), NOW()),
(5, 1, 'Dimension 5: Sostenibilidad', CURDATE(), NOW(), NOW()),
-- Componentes (13)
(6, 1, 'Componente 1.1', CURDATE(), NOW(), NOW()),
(7, 1, 'Componente 1.2', CURDATE(), NOW(), NOW()),
(8, 1, 'Componente 1.3', CURDATE(), NOW(), NOW()),
(9, 1, 'Componente 2.1', CURDATE(), NOW(), NOW()),
(10, 1, 'Componente 2.2', CURDATE(), NOW(), NOW()),
(11, 1, 'Componente 2.3', CURDATE(), NOW(), NOW()),
(12, 1, 'Componente 2.4', CURDATE(), NOW(), NOW()),
(13, 1, 'Componente 3.1', CURDATE(), NOW(), NOW()),
(14, 1, 'Componente 3.2', CURDATE(), NOW(), NOW()),
(15, 1, 'Componente 3.3', CURDATE(), NOW(), NOW()),
(16, 1, 'Componente 4.1', CURDATE(), NOW(), NOW()),
(17, 1, 'Componente 4.2', CURDATE(), NOW(), NOW()),
(18, 1, 'Componente 5.1', CURDATE(), NOW(), NOW()),
-- Criterios (13)
(19, 1, 'Criterio 1.1', CURDATE(), NOW(), NOW()),
(20, 1, 'Criterio 1.2', CURDATE(), NOW(), NOW()),
(21, 1, 'Criterio 1.3', CURDATE(), NOW(), NOW()),
(22, 1, 'Criterio 2.1', CURDATE(), NOW(), NOW()),
(23, 1, 'Criterio 2.2', CURDATE(), NOW(), NOW()),
(24, 1, 'Criterio 2.3', CURDATE(), NOW(), NOW()),
(25, 1, 'Criterio 2.4', CURDATE(), NOW(), NOW()),
(26, 1, 'Criterio 3.1', CURDATE(), NOW(), NOW()),
(27, 1, 'Criterio 3.2', CURDATE(), NOW(), NOW()),
(28, 1, 'Criterio 3.3', CURDATE(), NOW(), NOW()),
(29, 1, 'Criterio 4.1', CURDATE(), NOW(), NOW()),
(30, 1, 'Criterio 4.2', CURDATE(), NOW(), NOW()),
(31, 1, 'Criterio S1', CURDATE(), NOW(), NOW());

-- PASO 5: ESTRUCTURA SINAES

-- Dimensiones (5)
INSERT INTO DIMENSION (dimension_id, comentario_id, nomenclatura, nombre, activo, created_at, updated_at) VALUES
(1, 1, 'D1', 'Relacion con el Contexto', 1, NOW(), NOW()),
(2, 2, 'D2', 'Recursos', 1, NOW(), NOW()),
(3, 3, 'D3', 'Proceso Educativo', 1, NOW(), NOW()),
(4, 4, 'D4', 'Resultados', 1, NOW(), NOW()),
(5, 5, 'D5', 'Sostenibilidad', 1, NOW(), NOW());

-- Componentes (13)
INSERT INTO COMPONENTE (componente_id, dimension_id, comentario_id, nomenclatura, nombre, activo, created_at, updated_at) VALUES
(1, 1, 6, 'C1.1', 'Informacion y promocion', 1, NOW(), NOW()),
(2, 1, 7, 'C1.2', 'Admision', 1, NOW(), NOW()),
(3, 1, 8, 'C1.3', 'Contexto laboral', 1, NOW(), NOW()),
(4, 2, 9, 'C2.1', 'Curriculo', 1, NOW(), NOW()),
(5, 2, 10, 'C2.2', 'Personal academico', 1, NOW(), NOW()),
(6, 2, 11, 'C2.3', 'Infraestructura', 1, NOW(), NOW()),
(7, 2, 12, 'C2.4', 'Centro de informacion', 1, NOW(), NOW()),
(8, 3, 13, 'C3.1', 'Desarrollo docente', 1, NOW(), NOW()),
(9, 3, 14, 'C3.2', 'Gestion academica', 1, NOW(), NOW()),
(10, 3, 15, 'C3.3', 'Investigacion', 1, NOW(), NOW()),
(11, 4, 16, 'C4.1', 'Desempeno estudiantil', 1, NOW(), NOW()),
(12, 4, 17, 'C4.2', 'Satisfaccion', 1, NOW(), NOW()),
(13, 5, 18, 'C5.1', 'Mejoramiento continuo', 1, NOW(), NOW());

-- Criterios (13)
INSERT INTO CRITERIO (criterio_id, componente_id, comentario_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(1, 1, 19, '1.1', 'Informacion y promocion de la carrera de Ingenieria en Sistemas', 1, NOW(), NOW()),
(2, 2, 20, '1.2', 'Procesos de admision e ingreso de estudiantes', 1, NOW(), NOW()),
(3, 3, 21, '1.3', 'Correspondencia con el contexto tecnologico y laboral', 1, NOW(), NOW()),
(4, 4, 22, '2.1', 'Plan de estudios y pertinencia curricular', 1, NOW(), NOW()),
(5, 5, 23, '2.2', 'Personal academico especializado en tecnologias', 1, NOW(), NOW()),
(6, 6, 24, '2.3', 'Infraestructura tecnologica y laboratorios', 1, NOW(), NOW()),
(7, 7, 25, '2.4', 'Centro de informacion y recursos digitales', 1, NOW(), NOW()),
(8, 8, 26, '3.1', 'Desarrollo docente y metodologias de ensenanza', 1, NOW(), NOW()),
(9, 9, 27, '3.2', 'Gestion academica y evaluacion del aprendizaje', 1, NOW(), NOW()),
(10, 10, 28, '3.3', 'Investigacion innovacion y vinculacion productiva', 1, NOW(), NOW()),
(11, 11, 29, '4.1', 'Desempeno estudiantil graduacion y empleabilidad', 1, NOW(), NOW()),
(12, 12, 30, '4.2', 'Satisfaccion de graduados y empleadores', 1, NOW(), NOW()),
(13, 13, 31, 'S1', 'Gestion del mejoramiento continuo y sostenibilidad', 1, NOW(), NOW());

-- PASO 6: EVIDENCIAS (27 en total)

-- Evidencias del Criterio 2.1 - Plan de estudios (10) - FOCO PRINCIPAL
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(1, 4, 1, 'E2.1.1', 'Plan de estudios vigente aprobado', 1, NOW(), NOW()),
(2, 4, 1, 'E2.1.2', 'Malla curricular detallada', 1, NOW(), NOW()),
(3, 4, 1, 'E2.1.3', 'Programas de curso actualizados', 1, NOW(), NOW()),
(4, 4, 1, 'E2.1.4', 'Perfil profesional de salida', 1, NOW(), NOW()),
(5, 4, 1, 'E2.1.5', 'Informe actualizacion curricular 2023', 1, NOW(), NOW()),
(6, 4, 1, 'E2.1.6', 'Lineamientos flexibilidad curricular', 1, NOW(), NOW()),
(7, 4, 1, 'E2.1.7', 'Listado trabajos de graduacion', 1, NOW(), NOW()),
(8, 4, 1, 'E2.1.8', 'Evaluacion perfil segun empleadores', 1, NOW(), NOW()),
(9, 4, 1, 'E2.1.9', 'Actualizacion tecnologias emergentes', 1, NOW(), NOW()),
(10, 4, 1, 'E2.1.10', 'Matriz de competencias transversales', 1, NOW(), NOW());

-- Evidencias de otros criterios (17)
-- Criterio 1.1 - Información y promoción (2)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(11, 1, 1, 'E1.1.1', 'Pagina oficial de la carrera', 1, NOW(), NOW()),
(12, 1, 1, 'E1.1.2', 'Folletos promocionales', 1, NOW(), NOW());

-- Criterio 1.2 - Admisión (2)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(13, 2, 1, 'E1.2.1', 'Reglamento de admision', 1, NOW(), NOW()),
(14, 2, 1, 'E1.2.2', 'Estadisticas de matricula', 1, NOW(), NOW());

-- Criterio 1.3 - Contexto laboral (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(15, 3, 1, 'E1.3.1', 'Estudio de pertinencia laboral', 1, NOW(), NOW());

-- Criterio 2.2 - Personal académico (3)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(16, 5, 1, 'E2.2.1', 'Listado docentes con grados', 1, NOW(), NOW()),
(17, 5, 1, 'E2.2.2', 'Curriculum vitae academico', 1, NOW(), NOW()),
(18, 5, 1, 'E2.2.3', 'Plan desarrollo profesional', 1, NOW(), NOW());

-- Criterio 2.3 - Infraestructura (2)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(19, 6, 1, 'E2.3.1', 'Inventario de laboratorios', 1, NOW(), NOW()),
(20, 6, 1, 'E2.3.2', 'Licencias de software', 1, NOW(), NOW());

-- Criterio 2.4 - Centro de información (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(21, 7, 1, 'E2.4.1', 'Sistema de bibliotecas', 1, NOW(), NOW());

-- Criterio 3.1 - Desarrollo docente (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(22, 8, 1, 'E3.1.1', 'Plan de capacitacion docente', 1, NOW(), NOW());

-- Criterio 3.2 - Gestión académica (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(23, 9, 1, 'E3.2.1', 'Actas de Consejo Academico', 1, NOW(), NOW());

-- Criterio 3.3 - Investigación (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(24, 10, 1, 'E3.3.1', 'Proyectos de investigacion', 1, NOW(), NOW());

-- Criterio 4.1 - Desempeño estudiantil (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(25, 11, 1, 'E4.1.1', 'Indicadores de rendimiento', 1, NOW(), NOW());

-- Criterio 4.2 - Satisfacción (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(26, 12, 1, 'E4.2.1', 'Encuestas de empleadores', 1, NOW(), NOW());

-- Criterio S1 - Mejoramiento continuo (1)
INSERT INTO EVIDENCIA (evidencia_id, criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(27, 13, 1, 'ES.1.1', 'Plan de mejora continua 2025-2029', 1, NOW(), NOW());

-- PASO 7: VERIFICACIÓN FINAL

SELECT '=====================================' as '';
SELECT '  RESUMEN DE DATOS CREADOS PARA ISI' as '';
SELECT '=====================================' as '';

SELECT 'Universidad' as tabla, COUNT(*) as total FROM UNIVERSIDAD
UNION ALL SELECT 'Sede', COUNT(*) FROM SEDE
UNION ALL SELECT 'Facultad', COUNT(*) FROM FACULTAD
UNION ALL SELECT 'Carrera', COUNT(*) FROM CARRERA
UNION ALL SELECT 'Estados', COUNT(*) FROM ESTADO_EVIDENCIA
UNION ALL SELECT 'Dimensiones', COUNT(*) FROM DIMENSION
UNION ALL SELECT 'Componentes', COUNT(*) FROM COMPONENTE
UNION ALL SELECT 'Criterios', COUNT(*) FROM CRITERIO
UNION ALL SELECT 'Evidencias', COUNT(*) FROM EVIDENCIA
UNION ALL SELECT 'Comentarios', COUNT(*) FROM COMENTARIO
UNION ALL SELECT 'Carrera_Sede', COUNT(*) FROM CARRERA_SEDE
UNION ALL SELECT 'Ciclo', COUNT(*) FROM CICLO_ACREDITACION
UNION ALL SELECT 'Proceso', COUNT(*) FROM PROCESO;

SELECT '' as '';
SELECT '=====================================' as '';
SELECT '  EVIDENCIAS DEL CRITERIO 2.1' as '';
SELECT '=====================================' as '';

SELECT e.evidencia_id, e.nomenclatura, e.descripcion
FROM EVIDENCIA e
INNER JOIN CRITERIO c ON e.criterio_id = c.criterio_id
WHERE c.nomenclatura = '2.1'
ORDER BY e.nomenclatura;

SELECT '' as '';
SELECT '=====================================' as '';
SELECT '  DATOS CREADOS EXITOSAMENTE!' as '';
SELECT '=====================================' as '';
