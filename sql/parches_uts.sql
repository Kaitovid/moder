-- ============================================================
-- parches_uts — Esquema completo v1
-- Módulo: "¿Qué hay pa hacer?" — Tablón de parches y eventos UTS
--
-- Tablas:
--   · parches           → eventos/planes publicados por estudiantes
--   · parches_interesados → relación usuario ↔ parche (N:M)
--   · moderadores       → cuentas con acceso al panel de moderación
--
-- Flujo de moderación:
--   1. Estudiante publica un parche  → status = 'pendiente'
--   2. Moderador lo revisa en el panel
--   3. Lo aprueba  → status = 'aprobado'  (visible en el tablón público)
--      Lo rechaza  → status = 'rechazado' (oculto, notificación opcional)
--
-- Vistas:
--   · v_parches_publicos      → solo aprobados, para el frontend
--   · v_panel_parches         → todos los estados, para moderación
--   · v_parches_interesados   → conteo de interesados por parche
--
-- Procedimientos:
--   · moderar_parche(id, nuevo_status, mod_id, nota)
--   · toggle_interesado(parche_id, fingerprint)
-- ============================================================

SET SQL_MODE   = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone  = "+00:00";
START TRANSACTION;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- 0. MODERADORES
--    Cuentas simples protegidas por token hasheado (SHA2-256).
--    No depende de ninguna tabla externa.
-- ============================================================

CREATE TABLE IF NOT EXISTS `moderadores` (
  `id`           int           NOT NULL AUTO_INCREMENT,
  `alias`        varchar(60)   NOT NULL COMMENT 'Nombre visible en el panel',
  `token_hash`   varchar(64)   NOT NULL COMMENT 'SHA2(token_secreto, 256) — nunca guardar en plano',
  `rol`          enum('admin','moderador') NOT NULL DEFAULT 'moderador',
  `activo`       tinyint(1)    NOT NULL DEFAULT 1,
  `created_at`   datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login`   datetime               DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_alias` (`alias`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Cuentas de moderación del panel de parches y razones';

-- Moderador inicial (admin)
-- token en texto plano: "uts_admin_2026" → hash generado con SHA2('uts_admin_2026',256)
-- ⚠️  Cambiar el token inmediatamente en producción
INSERT INTO `moderadores` (`alias`, `token_hash`, `rol`) VALUES
('admin_uts', SHA2('uts_admin_2026', 256), 'admin');

ALTER TABLE `moderadores` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

-- ============================================================
-- 1. PARCHES
--    Evento/plan publicado por un estudiante.
--    Campos opcionales: cupo, requisitos, contacto.
--    status sigue el mismo patrón que `razones`.
-- ============================================================

CREATE TABLE IF NOT EXISTS `parches` (
  `id`           int            NOT NULL AUTO_INCREMENT,

  -- Quién lo publica (anónimo con iniciales, no FK a personas)
  `autor`        varchar(80)    NOT NULL                COMMENT 'Iniciales o nombre opcional del organizador',
  `carrera`      varchar(100)            DEFAULT NULL   COMMENT 'Carrera del autor (opcional)',

  -- Contenido del parche
  `titulo`       varchar(200)   NOT NULL,
  `descripcion`  text           NOT NULL,
  `categoria`    enum(
                   'parche',
                   'deporte',
                   'estudio',
                   'fiesta',
                   'comida',
                   'otro'
                 ) NOT NULL DEFAULT 'parche',
  `emoji`        varchar(10)    NOT NULL DEFAULT '🫂'   COMMENT 'Emoji representativo de la categoría',

  -- Logística
  `lugar`        varchar(200)   NOT NULL,
  `fecha`        date           NOT NULL                COMMENT 'Fecha del evento',
  `hora`         time           NOT NULL                COMMENT 'Hora de encuentro',
  `cupo`         smallint UNSIGNED        DEFAULT NULL  COMMENT 'Cupo máximo; NULL = sin límite',
  `requisitos`   text                     DEFAULT NULL  COMMENT 'Qué traer / instrucciones',
  `contacto`     varchar(200)             DEFAULT NULL  COMMENT 'Cómo comunicarse con el organizador',

  -- Moderación
  `status`       enum('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente'
                 COMMENT 'pendiente→en revisión | aprobado→público | rechazado→oculto',
  `mod_id`       int                      DEFAULT NULL  COMMENT 'Moderador que lo procesó (FK → moderadores)',
  `mod_nota`     text                     DEFAULT NULL  COMMENT 'Nota interna del moderador al rechazar',
  `mod_at`       datetime                 DEFAULT NULL  COMMENT 'Cuándo fue moderado',

  -- Auditoría
  `ip_hash`      varchar(64)              DEFAULT NULL  COMMENT 'SHA2 de la IP para anti-spam (nunca IP en plano)',
  `created_at`   datetime       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   datetime       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_status`        (`status`),
  KEY `idx_fecha`         (`fecha`),
  KEY `idx_categoria`     (`categoria`),
  KEY `idx_status_fecha`  (`status`, `fecha` DESC),
  KEY `idx_mod`           (`mod_id`),
  CONSTRAINT `fk_parches_mod`
    FOREIGN KEY (`mod_id`) REFERENCES `moderadores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Parches y eventos publicados por estudiantes UTS';

-- ============================================================
-- 2. PARCHES_INTERESADOS
--    Tabla puente para registrar quién marcó "Me interesa".
--    Se usa un fingerprint del navegador o hash de IP
--    para evitar duplicados sin requerir login.
-- ============================================================

CREATE TABLE IF NOT EXISTS `parches_interesados` (
  `id`           int           NOT NULL AUTO_INCREMENT,
  `parche_id`    int           NOT NULL,
  `fingerprint`  varchar(64)   NOT NULL COMMENT 'SHA2 de IP+UserAgent (anonimizado)',
  `created_at`   datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  -- Un fingerprint solo puede marcar interés UNA VEZ por parche
  UNIQUE KEY `uq_fp_parche` (`parche_id`, `fingerprint`),
  KEY `idx_parche`           (`parche_id`),
  CONSTRAINT `fk_interesados_parche`
    FOREIGN KEY (`parche_id`) REFERENCES `parches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Registro de interesados por parche (anti-duplicado por fingerprint)';

-- ============================================================
-- 3. DATOS DE EJEMPLO (status = aprobado para que sean visibles)
-- ============================================================

INSERT INTO `parches`
  (`autor`, `carrera`, `titulo`, `descripcion`, `categoria`, `emoji`,
   `lugar`, `fecha`, `hora`, `cupo`, `requisitos`, `contacto`, `status`)
VALUES
(
  'K.', 'Ing. de Sistemas',
  'Parche en el parque de Santander 🌳',
  'Salida relajada, llevamos algo de tomar, música desde el cel y la buena conversación. '
  'Van todos los que quieran! La idea es salir del campus y conectar fuera de clase.',
  'parche', '🌳',
  'Parque de Santander, Bucaramanga',
  '2026-03-07', '15:00:00',
  NULL,
  'Llevar hidratación, buena vibra y ganas de conocer gente',
  'WhatsApp al 300 000 0000',
  'aprobado'
),
(
  'N.C.', 'Cultura Física',
  'Partido de fútbol 5 ⚽',
  'Necesitamos completar el equipo, faltan 3. Cancha sintética cerca de la U. Costo: 10k x persona.',
  'deporte', '⚽',
  'Canchas sintéticas Campus UTS',
  '2026-03-05', '17:30:00',
  10,
  'Llevar taches o zapatillas apropiadas. Costo: 10.000 COP',
  'Preguntar en los comentarios o al canal de WhatsApp',
  'aprobado'
),
(
  'M.A.F.', 'Ing. de Sistemas',
  'Grupo de estudio final de Cálculo 📚',
  'Profe Ramírez tiene el parcial el viernes. Vamos a repasar integrales y derivadas. '
  'Bienvenidos principiantes. Llevamos tablero y marcadores.',
  'estudio', '📚',
  'Biblioteca UTS – Sala 3',
  '2026-03-04', '14:00:00',
  20,
  'Traer libro de cálculo, cuaderno y calculadora científica',
  'Avisar con anticipación para reservar la sala',
  'aprobado'
),
(
  'V.L.', 'Mercadeo',
  'Almuerzo en la cafetería 🍽️',
  '¿Alguien para almorzar mañana por el C? Somos 2, buscamos con quien caer. Nada formal.',
  'comida', '🍽️',
  'Cafetería Bloque C',
  '2026-03-03', '12:00:00',
  6,
  'Solo venir con hambre y ganas de socializar 😄',
  'Acercarse directamente a la café o mandar mensaje',
  'aprobado'
),
(
  'J.P.', 'Administración',
  'Pre-rumbita after exámenes 🔥',
  'Terminando el periodo de parciales, vamos a celebrar (o a llorar juntos). '
  'Lugar y hora por coordinar en grupo.',
  'fiesta', '🔥',
  'Por definir — se coordina en el grupo',
  '2026-03-08', '20:00:00',
  NULL,
  'Mayor de edad. Cupo según el lugar que confirmemos',
  'Únete al grupo de WhatsApp para coordinar',
  'aprobado'
),
(
  'D.A.', 'Ing. Industrial',
  'Torneo de ping pong 🏓',
  'Premio simbólico para el campeón. Formato eliminación directa. '
  'Cupo limitado a 16. Inscribe tu nombre en los comentarios.',
  'deporte', '🏓',
  'Zona recreativa Bloque A',
  '2026-03-06', '16:00:00',
  16,
  'Inscripción previa. Hay paletas disponibles en el área de recreación',
  'Anota tu nombre acá o habla con D.A. en el bloque A',
  'aprobado'
),
-- Un parche pendiente de moderación (para probar el panel)
(
  'Anónimo', NULL,
  'Salida al mirador de la ciudad 🌆',
  'Quiero organizar una salida al mirador, ir a ver el atardecer. '
  'Si les gusta la idea vamos coordinando.',
  'parche', '🌆',
  'Mirador de Bucaramanga',
  '2026-03-15', '17:00:00',
  NULL,
  'Llevar chaqueta',
  NULL,
  'pendiente'
);

ALTER TABLE `parches` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

-- ============================================================
-- 4. VISTAS
-- ============================================================

-- ----------------------------------------------------------
-- Vista pública: solo parches APROBADOS y no vencidos
-- Usada por el frontend del tablón
-- ----------------------------------------------------------

DROP VIEW IF EXISTS `v_parches_publicos`;
CREATE ALGORITHM=UNDEFINED
  DEFINER=`root`@`%`
  SQL SECURITY DEFINER
VIEW `v_parches_publicos` AS
SELECT
  p.id,
  p.autor,
  p.carrera,
  p.titulo,
  p.descripcion,
  p.categoria,
  p.emoji,
  p.lugar,
  p.fecha,
  p.hora,
  p.cupo,
  p.requisitos,
  p.contacto,
  p.created_at,
  -- Conteo de interesados en tiempo real
  COUNT(pi.id)                                          AS total_interesados,
  -- Cupos restantes (NULL si sin límite)
  IF(p.cupo IS NOT NULL, p.cupo - COUNT(pi.id), NULL)  AS cupos_restantes,
  -- Tiempo relativo (calculado en app, pero útil para debug)
  DATEDIFF(p.fecha, CURDATE())                          AS dias_hasta_evento
FROM parches p
LEFT JOIN parches_interesados pi ON pi.parche_id = p.id
WHERE p.status = 'aprobado'
GROUP BY p.id
ORDER BY
  -- Primero los próximos (fecha ASC), luego los pasados (más recientes primero)
  CASE WHEN p.fecha >= CURDATE() THEN 0 ELSE 1 END ASC,
  p.fecha ASC;


-- ----------------------------------------------------------
-- Vista de moderación: TODOS los parches con info del mod
-- Usada exclusivamente por el panel de administración
-- ----------------------------------------------------------

DROP VIEW IF EXISTS `v_panel_parches`;
CREATE ALGORITHM=UNDEFINED
  DEFINER=`root`@`%`
  SQL SECURITY DEFINER
VIEW `v_panel_parches` AS
SELECT
  p.id            AS parche_id,
  p.titulo,
  p.descripcion,
  p.categoria,
  p.emoji,
  p.autor,
  p.carrera,
  p.lugar,
  p.fecha,
  p.hora,
  p.cupo,
  p.requisitos,
  p.contacto,
  p.status,
  p.mod_nota,
  p.mod_at,
  p.created_at,
  -- Datos del moderador que lo procesó
  m.alias         AS mod_alias,
  m.rol           AS mod_rol,
  -- Conteo de interesados
  COUNT(pi.id)    AS total_interesados
FROM parches p
LEFT JOIN moderadores m            ON m.id = p.mod_id
LEFT JOIN parches_interesados pi   ON pi.parche_id = p.id
GROUP BY p.id, m.alias, m.rol
ORDER BY
  FIELD(p.status, 'pendiente', 'rechazado', 'aprobado'),
  p.created_at DESC;


-- ============================================================
-- 5. STORED PROCEDURES
-- ============================================================

DELIMITER $$

-- ----------------------------------------------------------
-- moderar_parche: Aprobar o rechazar un parche
-- Uso:
--   CALL moderar_parche(3, 'aprobado',  1, NULL);
--   CALL moderar_parche(7, 'rechazado', 1, 'Contenido inapropiado');
-- ----------------------------------------------------------

DROP PROCEDURE IF EXISTS `moderar_parche`$$
CREATE PROCEDURE `moderar_parche`(
  IN  p_parche_id     INT,
  IN  p_nuevo_status  ENUM('pendiente','aprobado','rechazado'),
  IN  p_mod_id        INT,
  IN  p_nota          TEXT
)
BEGIN
  UPDATE parches
  SET
    status   = p_nuevo_status,
    mod_id   = p_mod_id,
    mod_nota = p_nota,
    mod_at   = NOW()
  WHERE id = p_parche_id;
END$$


-- ----------------------------------------------------------
-- toggle_interesado: Agregar o quitar interés en un parche
-- Retorna: accion ('added' | 'removed'), total_interesados
-- Uso:
--   CALL toggle_interesado(1, 'abc123fingerprint');
-- ----------------------------------------------------------

DROP PROCEDURE IF EXISTS `toggle_interesado`$$
CREATE PROCEDURE `toggle_interesado`(
  IN  p_parche_id    INT,
  IN  p_fingerprint  VARCHAR(64)
)
BEGIN
  DECLARE v_exists INT DEFAULT 0;
  DECLARE v_total  INT DEFAULT 0;
  DECLARE v_accion VARCHAR(10);

  -- ¿Ya existe el registro?
  SELECT COUNT(*) INTO v_exists
  FROM parches_interesados
  WHERE parche_id = p_parche_id AND fingerprint = p_fingerprint;

  IF v_exists > 0 THEN
    -- Quitar interés
    DELETE FROM parches_interesados
    WHERE parche_id = p_parche_id AND fingerprint = p_fingerprint;
    SET v_accion = 'removed';
  ELSE
    -- Agregar interés
    INSERT INTO parches_interesados (parche_id, fingerprint)
    VALUES (p_parche_id, p_fingerprint);
    SET v_accion = 'added';
  END IF;

  -- Devolver resultado
  SELECT COUNT(*) INTO v_total
  FROM parches_interesados
  WHERE parche_id = p_parche_id;

  SELECT v_accion AS accion, v_total AS total_interesados;
END$$


-- ----------------------------------------------------------
-- autenticar_moderador: Verificar credenciales
-- Retorna: id y alias del moderador si es válido, NULL si no
-- Uso:
--   CALL autenticar_moderador('uts_admin_2026');
-- ----------------------------------------------------------

DROP PROCEDURE IF EXISTS `autenticar_moderador`$$
CREATE PROCEDURE `autenticar_moderador`(
  IN  p_token_plano  VARCHAR(200)
)
BEGIN
  DECLARE v_hash VARCHAR(64);
  SET v_hash = SHA2(p_token_plano, 256);

  -- Registrar intento de login si es exitoso
  UPDATE moderadores
  SET last_login = NOW()
  WHERE token_hash = v_hash AND activo = 1;

  -- Devolver datos del moderador (o vacío si no existe)
  SELECT id, alias, rol
  FROM moderadores
  WHERE token_hash = v_hash AND activo = 1
  LIMIT 1;
END$$

DELIMITER ;

-- ============================================================
-- 6. ÍNDICE EXTRA para optimizar búsquedas frecuentes
-- ============================================================

-- Para paginación pública (más usada): aprobado + fecha futura
ALTER TABLE `parches`
  ADD INDEX IF NOT EXISTS `idx_public_feed` (`status`, `fecha`, `id`);

-- ============================================================
-- FIN DEL ESQUEMA
-- ============================================================

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
