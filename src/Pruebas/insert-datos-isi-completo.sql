-- ============================================
-- Script SQL Completo - Datos SINAES para Ingeniería en Sistemas
-- Universidad Nacional de Costa Rica
-- ============================================

-- ============================================
-- 1. ESTRUCTURA ORGANIZACIONAL
-- ============================================

-- Universidad
INSERT INTO UNIVERSIDAD (nombre, activo, created_at, updated_at) 
VALUES ('Universidad Nacional de Costa Rica', 1, NOW(), NOW());

-- Sede (Campus)
INSERT INTO SEDE (universidad_id, nombre, activo, created_at, updated_at) 
VALUES (1, 'Campus Omar Dengo', 1, NOW(), NOW());

-- Facultad
INSERT INTO FACULTAD (sede_id, nombre, activo, created_at, updated_at) 
VALUES (1, 'Facultad de Ciencias Exactas y Naturales', 1, NOW(), NOW());

-- Carrera
INSERT INTO CARRERA (facultad_id, nombre, activo, created_at, updated_at) 
VALUES (1, 'Ingenieria en Sistemas de Informacion', 1, NOW(), NOW());

-- ============================================
-- 2. ESTADOS DE EVIDENCIA
-- ============================================

INSERT INTO ESTADO_EVIDENCIA (nombre, created_at, updated_at) VALUES
('Pendiente', NOW(), NOW()),
('En proceso', NOW(), NOW()),
('Completa', NOW(), NOW()),
('Observada', NOW(), NOW());

-- ============================================
-- 3. PROCESO DE ACREDITACIÓN
-- ============================================

-- Relación Carrera-Sede
INSERT INTO CARRERA_SEDE (carrera_id, sede_id, created_at, updated_at) 
VALUES (1, 1, NOW(), NOW());

-- Ciclo de Acreditación
INSERT INTO CICLO_ACREDITACION (carrera_sede_id, nombre, created_at, updated_at) 
VALUES (1, 'Ciclo 2024-2028', NOW(), NOW());

-- Proceso
INSERT INTO PROCESO (ciclo_acreditacion_id, tipo_proceso, created_at, updated_at) 
VALUES (1, 'Autoevaluacion', NOW(), NOW());

-- ============================================
-- 4. COMENTARIOS (Requeridos para Dimensiones, Componentes y Criterios)
-- ============================================

INSERT INTO COMENTARIO (usuario_id, texto, fecha_creacion, created_at, updated_at) VALUES
-- Comentarios para dimensiones (5)
(1, 'Dimension 1: Relacion con el Contexto', CURDATE(), NOW(), NOW()),
(1, 'Dimension 2: Recursos', CURDATE(), NOW(), NOW()),
(1, 'Dimension 3: Proceso Educativo', CURDATE(), NOW(), NOW()),
(1, 'Dimension 4: Resultados', CURDATE(), NOW(), NOW()),
(1, 'Dimension 5: Sostenibilidad', CURDATE(), NOW(), NOW()),
-- Comentarios para componentes (13)
(1, 'Componente 1.1: Informacion y promocion', CURDATE(), NOW(), NOW()),
(1, 'Componente 1.2: Admision', CURDATE(), NOW(), NOW()),
(1, 'Componente 1.3: Contexto laboral', CURDATE(), NOW(), NOW()),
(1, 'Componente 2.1: Curriculo', CURDATE(), NOW(), NOW()),
(1, 'Componente 2.2: Personal academico', CURDATE(), NOW(), NOW()),
(1, 'Componente 2.3: Infraestructura', CURDATE(), NOW(), NOW()),
(1, 'Componente 2.4: Centro de informacion', CURDATE(), NOW(), NOW()),
(1, 'Componente 3.1: Desarrollo docente', CURDATE(), NOW(), NOW()),
(1, 'Componente 3.2: Gestion academica', CURDATE(), NOW(), NOW()),
(1, 'Componente 3.3: Investigacion', CURDATE(), NOW(), NOW()),
(1, 'Componente 4.1: Desempeno estudiantil', CURDATE(), NOW(), NOW()),
(1, 'Componente 4.2: Satisfaccion', CURDATE(), NOW(), NOW()),
(1, 'Componente 5.1: Mejoramiento continuo', CURDATE(), NOW(), NOW()),
-- Comentarios para criterios (13)
(1, 'Criterio 1.1: Informacion y promocion de ISI', CURDATE(), NOW(), NOW()),
(1, 'Criterio 1.2: Procesos de admision', CURDATE(), NOW(), NOW()),
(1, 'Criterio 1.3: Contexto tecnologico y laboral', CURDATE(), NOW(), NOW()),
(1, 'Criterio 2.1: Plan de estudios de ISI', CURDATE(), NOW(), NOW()),
(1, 'Criterio 2.2: Personal academico en tecnologias', CURDATE(), NOW(), NOW()),
(1, 'Criterio 2.3: Infraestructura tecnologica', CURDATE(), NOW(), NOW()),
(1, 'Criterio 2.4: Centro de informacion digital', CURDATE(), NOW(), NOW()),
(1, 'Criterio 3.1: Desarrollo docente', CURDATE(), NOW(), NOW()),
(1, 'Criterio 3.2: Gestion academica', CURDATE(), NOW(), NOW()),
(1, 'Criterio 3.3: Investigacion e innovacion', CURDATE(), NOW(), NOW()),
(1, 'Criterio 4.1: Desempeno y empleabilidad', CURDATE(), NOW(), NOW()),
(1, 'Criterio 4.2: Satisfaccion de graduados', CURDATE(), NOW(), NOW()),
(1, 'Criterio S1: Mejoramiento continuo', CURDATE(), NOW(), NOW());

-- ============================================
-- 5. DIMENSIONES (5)
-- ============================================

INSERT INTO DIMENSION (comentario_id, nomenclatura, nombre, activo, created_at, updated_at) VALUES
(1, 'D1', 'Relacion con el Contexto', 1, NOW(), NOW()),
(2, 'D2', 'Recursos', 1, NOW(), NOW()),
(3, 'D3', 'Proceso Educativo', 1, NOW(), NOW()),
(4, 'D4', 'Resultados', 1, NOW(), NOW()),
(5, 'D5', 'Sostenibilidad', 1, NOW(), NOW());

-- ============================================
-- 6. COMPONENTES (13)
-- ============================================

INSERT INTO COMPONENTE (dimension_id, comentario_id, nomenclatura, nombre, activo, created_at, updated_at) VALUES
-- Dimension 1: Relacion con el Contexto (3 componentes)
(1, 6, 'C1.1', 'Informacion y promocion', 1, NOW(), NOW()),
(1, 7, 'C1.2', 'Admision', 1, NOW(), NOW()),
(1, 8, 'C1.3', 'Contexto laboral', 1, NOW(), NOW()),
-- Dimension 2: Recursos (4 componentes)
(2, 9, 'C2.1', 'Curriculo', 1, NOW(), NOW()),
(2, 10, 'C2.2', 'Personal academico', 1, NOW(), NOW()),
(2, 11, 'C2.3', 'Infraestructura', 1, NOW(), NOW()),
(2, 12, 'C2.4', 'Centro de informacion', 1, NOW(), NOW()),
-- Dimension 3: Proceso Educativo (3 componentes)
(3, 13, 'C3.1', 'Desarrollo docente', 1, NOW(), NOW()),
(3, 14, 'C3.2', 'Gestion academica', 1, NOW(), NOW()),
(3, 15, 'C3.3', 'Investigacion', 1, NOW(), NOW()),
-- Dimension 4: Resultados (2 componentes)
(4, 16, 'C4.1', 'Desempeno estudiantil', 1, NOW(), NOW()),
(4, 17, 'C4.2', 'Satisfaccion', 1, NOW(), NOW()),
-- Dimension 5: Sostenibilidad (1 componente)
(5, 18, 'C5.1', 'Mejoramiento continuo', 1, NOW(), NOW());

-- ============================================
-- 7. CRITERIOS (13)
-- ============================================

INSERT INTO CRITERIO (componente_id, comentario_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
-- Dimension 1: Relacion con el Contexto
(1, 19, '1.1', 'Informacion y promocion de la carrera de Ingenieria en Sistemas', 1, NOW(), NOW()),
(2, 20, '1.2', 'Procesos de admision e ingreso de estudiantes', 1, NOW(), NOW()),
(3, 21, '1.3', 'Correspondencia con el contexto tecnologico y laboral', 1, NOW(), NOW()),
-- Dimension 2: Recursos
(4, 22, '2.1', 'Plan de estudios y pertinencia curricular', 1, NOW(), NOW()),
(5, 23, '2.2', 'Personal academico especializado en tecnologias', 1, NOW(), NOW()),
(6, 24, '2.3', 'Infraestructura tecnologica y laboratorios', 1, NOW(), NOW()),
(7, 25, '2.4', 'Centro de informacion y recursos digitales', 1, NOW(), NOW()),
-- Dimension 3: Proceso Educativo
(8, 26, '3.1', 'Desarrollo docente y metodologias de ensenanza', 1, NOW(), NOW()),
(9, 27, '3.2', 'Gestion academica y evaluacion del aprendizaje', 1, NOW(), NOW()),
(10, 28, '3.3', 'Investigacion innovacion y vinculacion productiva', 1, NOW(), NOW()),
-- Dimension 4: Resultados
(11, 29, '4.1', 'Desempeno estudiantil graduacion y empleabilidad', 1, NOW(), NOW()),
(12, 30, '4.2', 'Satisfaccion de graduados y empleadores', 1, NOW(), NOW()),
-- Dimension 5: Sostenibilidad
(13, 31, 'S1', 'Gestion del mejoramiento continuo y sostenibilidad', 1, NOW(), NOW());

-- ============================================
-- 8. EVIDENCIAS - CRITERIO 2.1 (10 evidencias - FOCO PRINCIPAL)
-- ============================================

INSERT INTO EVIDENCIA (criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
(4, 1, 'E2.1.1', 'Plan de estudios vigente aprobado', 1, NOW(), NOW()),
(4, 1, 'E2.1.2', 'Malla curricular detallada', 1, NOW(), NOW()),
(4, 1, 'E2.1.3', 'Programas de curso actualizados', 1, NOW(), NOW()),
(4, 1, 'E2.1.4', 'Perfil profesional de salida', 1, NOW(), NOW()),
(4, 1, 'E2.1.5', 'Informe actualizacion curricular 2023', 1, NOW(), NOW()),
(4, 1, 'E2.1.6', 'Lineamientos flexibilidad curricular', 1, NOW(), NOW()),
(4, 1, 'E2.1.7', 'Listado trabajos de graduacion', 1, NOW(), NOW()),
(4, 1, 'E2.1.8', 'Evaluacion perfil segun empleadores', 1, NOW(), NOW()),
(4, 1, 'E2.1.9', 'Actualizacion tecnologias emergentes', 1, NOW(), NOW()),
(4, 1, 'E2.1.10', 'Matriz de competencias transversales', 1, NOW(), NOW());

-- ============================================
-- 9. EVIDENCIAS - OTROS CRITERIOS (17 evidencias)
-- ============================================

INSERT INTO EVIDENCIA (criterio_id, estado_evidencia_id, nomenclatura, descripcion, activo, created_at, updated_at) VALUES
-- Criterio 1.1: Informacion y promocion (2)
(1, 1, 'E1.1.1', 'Pagina oficial de la carrera', 1, NOW(), NOW()),
(1, 1, 'E1.1.2', 'Folletos promocionales', 1, NOW(), NOW()),
-- Criterio 1.2: Admision (2)
(2, 1, 'E1.2.1', 'Reglamento de admision', 1, NOW(), NOW()),
(2, 1, 'E1.2.2', 'Estadisticas de matricula', 1, NOW(), NOW()),
-- Criterio 1.3: Contexto laboral (1)
(3, 1, 'E1.3.1', 'Estudio de pertinencia laboral', 1, NOW(), NOW()),
-- Criterio 2.2: Personal academico (3)
(5, 1, 'E2.2.1', 'Listado docentes con grados', 1, NOW(), NOW()),
(5, 1, 'E2.2.2', 'Curriculum vitae academico', 1, NOW(), NOW()),
(5, 1, 'E2.2.3', 'Plan desarrollo profesional', 1, NOW(), NOW()),
-- Criterio 2.3: Infraestructura (2)
(6, 1, 'E2.3.1', 'Inventario de laboratorios', 1, NOW(), NOW()),
(6, 1, 'E2.3.2', 'Licencias de software', 1, NOW(), NOW()),
-- Criterio 2.4: Centro de informacion (1)
(7, 1, 'E2.4.1', 'Sistema de bibliotecas', 1, NOW(), NOW()),
-- Criterio 3.1: Desarrollo docente (1)
(8, 1, 'E3.1.1', 'Plan de capacitacion docente', 1, NOW(), NOW()),
-- Criterio 3.2: Gestion academica (1)
(9, 1, 'E3.2.1', 'Actas de Consejo Academico', 1, NOW(), NOW()),
-- Criterio 3.3: Investigacion (1)
(10, 1, 'E3.3.1', 'Proyectos de investigacion', 1, NOW(), NOW()),
-- Criterio 4.1: Desempeno estudiantil (1)
(11, 1, 'E4.1.1', 'Indicadores de rendimiento', 1, NOW(), NOW()),
-- Criterio 4.2: Satisfaccion (1)
(12, 1, 'E4.2.1', 'Encuestas de empleadores', 1, NOW(), NOW()),
-- Criterio S1: Mejoramiento continuo (1)
(13, 1, 'ES.1.1', 'Plan de mejora continua 2025-2029', 1, NOW(), NOW());

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT '=== RESUMEN DE DATOS INSERTADOS ===' as titulo;

SELECT 'Universidades' as tabla, COUNT(*) as total FROM UNIVERSIDAD
UNION ALL
SELECT 'Sedes', COUNT(*) FROM SEDE
UNION ALL
SELECT 'Facultades', COUNT(*) FROM FACULTAD
UNION ALL
SELECT 'Carreras', COUNT(*) FROM CARRERA
UNION ALL
SELECT 'Estados de Evidencia', COUNT(*) FROM ESTADO_EVIDENCIA
UNION ALL
SELECT 'Dimensiones', COUNT(*) FROM DIMENSION
UNION ALL
SELECT 'Componentes', COUNT(*) FROM COMPONENTE
UNION ALL
SELECT 'Criterios', COUNT(*) FROM CRITERIO
UNION ALL
SELECT 'Evidencias', COUNT(*) FROM EVIDENCIA
UNION ALL
SELECT 'Comentarios', COUNT(*) FROM COMENTARIO
UNION ALL
SELECT 'Procesos', COUNT(*) FROM PROCESO;

SELECT '' as separador;
SELECT '=== EVIDENCIAS DEL CRITERIO 2.1 (PARA PRUEBAS) ===' as titulo;

SELECT 
    e.evidencia_id,
    e.nomenclatura,
    e.descripcion,
    ee.nombre as estado
FROM EVIDENCIA e
INNER JOIN CRITERIO c ON e.criterio_id = c.criterio_id
INNER JOIN ESTADO_EVIDENCIA ee ON e.estado_evidencia_id = ee.estado_evidencia_id
WHERE c.nomenclatura = '2.1'
ORDER BY e.nomenclatura;
