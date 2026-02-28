-- ============================================================
-- ranking_infieles — Esquema actualizado
-- Cambios v2:
--   · Se eliminaron las columnas `edad` y `semestre` de `personas`
--   · Se agregó `status` a `razones` (pendiente | aprobado | rechazado)
--   · Vista principal solo muestra razones aprobadas
--   · Nueva vista `v_panel_moderacion` para el panel de admin
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- Base de datos: `ranking_infieles`
-- ============================================================

-- ------------------------------------------------------------
-- Tabla: `carreras`
-- ------------------------------------------------------------

CREATE TABLE `carreras` (
  `id`     int          NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `carreras` (`id`, `nombre`) VALUES
(1,  'Ingeniería de Sistemas'),
(2,  'Profesional en Administración de Empresas'),
(3,  'Ingeniería en Topografía'),
(4,  'Profesional en Mercadeo'),
(5,  'Profesional en Cultura Física y Deporte'),
(6,  'Profesional en Contaduría Pública'),
(7,  'Ingeniería Eléctrica'),
(8,  'Ingeniería Electromecánica'),
(9,  'Ingeniería Ambiental'),
(10, 'Ingeniería Industrial'),
(11, 'Ingeniería de Telecomunicaciones'),
(12, 'Ingeniería Electrónica'),
(13, 'Profesional en Diseño de Moda'),
(14, 'Profesional en Administración Financiera'),
(15, 'Ingeniería de Sistemas de Transporte');

ALTER TABLE `carreras` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

-- ------------------------------------------------------------
-- Tabla: `personas`
-- NOTA: Se eliminaron `edad` y `semestre`
-- ------------------------------------------------------------

CREATE TABLE `personas` (
  `id`     int           NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100)  NOT NULL,
  `carrera` varchar(100) NOT NULL,
  `genero` enum('Hombre','Mujer','LGBTIQ+','Helicóptero Apache','desconocido') DEFAULT 'desconocido',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `personas` (`id`, `nombre`, `carrera`, `genero`) VALUES
(1,   'jennifer joya',            'Ingeniería Industrial',                     'Mujer'),
(5,   'maria',                    'Ingeniería de Telecomunicaciones',           'Mujer'),
(6,   'andrés montalvo',          'Ingeniería de Sistemas',                     'Hombre'),
(7,   'camilo',                   'Ingeniería de Sistemas',                     'Hombre'),
(8,   'juan pablo',               'Ingeniería de Sistemas',                     'Hombre'),
(9,   'ashly',                    'Profesional en Contaduría Pública',          'Mujer'),
(10,  'el chamo',                 'Profesional en Cultura Física y Deporte',    'Hombre'),
(12,  'javier',                   'Ingeniería de Sistemas',                     'Hombre'),
(14,  'luis',                     'Profesional en Cultura Física y Deporte',    'Hombre'),
(15,  'javier',                   'Ingeniería de Sistemas',                     'Hombre'),
(16,  'alejandro',                'Profesional en Cultura Física y Deporte',    'Hombre'),
(19,  'kaito',                    'Ingeniería de Sistemas',                     'Hombre'),
(20,  'victor',                   'Profesional en Diseño de Moda',              'Hombre'),
(23,  'cristian',                 'Ingeniería de Sistemas',                     'Hombre'),
(24,  'javier',                   'Ingeniería de Sistemas',                     'Hombre'),
(25,  'jefry epstein',            'Profesional en Cultura Física y Deporte',    'Hombre'),
(26,  'joshman',                  'Ingeniería Electrónica',                     'Hombre'),
(29,  'kuke',                     'Profesional en Cultura Física y Deporte',    'Hombre'),
(33,  'ángel',                    'Ingeniería Electromecánica',                 'Hombre'),
(35,  'traca',                    'Ingeniería en Topografía',                   'Hombre'),
(36,  'cristian',                 'Ingeniería de Sistemas',                     'Hombre'),
(37,  'marsoley',                 'Ingeniería de Sistemas',                     'Mujer'),
(38,  'robinson',                 'Profesional en Cultura Física y Deporte',    'Hombre'),
(43,  'david',                    'Profesional en Cultura Física y Deporte',    'Hombre'),
(44,  'valentina leon',           'Profesional en Cultura Física y Deporte',    'Mujer'),
(46,  'santiago arias',           'Profesional en Mercadeo',                    'Hombre'),
(47,  'john',                     'Ingeniería de Sistemas',                     'Hombre'),
(48,  'javier gutiérrez',         'Profesional en Administración de Empresas',  'Hombre'),
(49,  'alejandro v',              'Ingeniería de Sistemas',                     'Hombre'),
(51,  'tomás',                    'Profesional en Mercadeo',                    'Hombre'),
(52,  'diego',                    'Ingeniería de Sistemas',                     'Hombre'),
(53,  'santiago',                 'Ingeniería de Sistemas',                     'Hombre'),
(57,  'martín andres fuentes',    'Ingeniería de Sistemas',                     'Hombre'),
(58,  'risonaso',                 'Profesional en Cultura Física y Deporte',    'Hombre'),
(59,  'daniel corredor',          'Profesional en Cultura Física y Deporte',    'Hombre'),
(60,  'geronimo',                 'Ingeniería Electromecánica',                 'Hombre'),
(67,  'diego anaya',              'Profesional en Mercadeo',                    'Hombre'),
(71,  'juan',                     'Ingeniería Ambiental',                       'Hombre'),
(74,  'juan david gonzález',      'Ingeniería de Sistemas',                     'Hombre'),
(75,  'santiago suecun',          'Ingeniería de Sistemas',                     'Hombre'),
(76,  'david palomino',           'Ingeniería de Sistemas',                     'Hombre'),
(80,  'cristian sanchez',         'Profesional en Cultura Física y Deporte',    'Hombre'),
(83,  'nicolás cano',             'Profesional en Cultura Física y Deporte',    'Hombre'),
(88,  'silvia',                   'Ingeniería Eléctrica',                       'Mujer'),
(116, 'sofía muñoz',              'Ingeniería de Sistemas',                     'Mujer'),
(121, 'cesar',                    'Profesional en Cultura Física y Deporte',    'Hombre'),
(124, 'yeiner ss',                'Ingeniería de Sistemas',                     'Hombre'),
(125, 'ricardo',                  'Ingeniería de Sistemas',                     'Hombre'),
(126, 'carlos',                   'Profesional en Administración de Empresas',  'Hombre'),
(127, 'franck ardila',            'Ingeniería Electromecánica',                 'Hombre'),
(128, 'oscar patiño',             'Ingeniería Ambiental',                       'Hombre'),
(129, 'jholver quintero',         'Ingeniería Ambiental',                       'Hombre'),
(130, 'el rector',                'Ingeniería de Sistemas',                     'Hombre'),
(138, 'iosif stalin',             'Ingeniería en Topografía',                   'Hombre'),
(144, 'kener castellanos romero', 'Profesional en Cultura Física y Deporte',    'Hombre'),
(153, 'daniel valencia',          'Ingeniería de Sistemas',                     'Hombre'),
(154, 'sergio bautista',          'Ingeniería Eléctrica',                       'Hombre'),
(161, 'chompi',                   'Ingeniería Eléctrica',                       'Hombre'),
(162, 'steven hernández',         'Ingeniería Ambiental',                       'Hombre'),
(163, 'cris',                     'Ingeniería de Sistemas',                     'desconocido'),
(164, 'daniel vagancia',          'Ingeniería de Sistemas',                     'Hombre'),
(165, 'jhon stiven diaz luna',    'Profesional en Cultura Física y Deporte',    'Hombre'),
(177, 'juan pablo',               'Ingeniería de Sistemas',                     'Hombre');

ALTER TABLE `personas` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200;

-- ------------------------------------------------------------
-- Tabla: `ranking`
-- ------------------------------------------------------------

CREATE TABLE `ranking` (
  `id`          int  NOT NULL AUTO_INCREMENT,
  `posicion`    int  NOT NULL,
  `persona_id`  int  NOT NULL,
  `total_votos` int  DEFAULT '0',
  `medalla`     enum('gold','silver','bronze','') DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `persona_id` (`persona_id`),
  CONSTRAINT `ranking_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `ranking` (`id`, `posicion`, `persona_id`, `total_votos`, `medalla`) VALUES
(1,  1,  53,  14, 'silver'),
(3,  3,  76,  11, ''),
(5,  5,  52,  12, 'bronze'),
(6,  6,  57,  7,  ''),
(7,  7,  19,  6,  ''),
(8,  8,  46,  4,  ''),
(9,  9,  16,  3,  ''),
(10, 10, 67,  4,  ''),
(11, 11, 38,  2,  ''),
(12, 12, 59,  2,  ''),
(13, 13, 7,   2,  ''),
(14, 14, 10,  2,  ''),
(15, 15, 9,   2,  ''),
(16, 16, 8,   2,  ''),
(17, 17, 138, 2,  ''),
(18, 18, 25,  2,  ''),
(19, 19, 37,  1,  ''),
(20, 20, 43,  3,  ''),
(21, 21, 44,  1,  ''),
(22, 22, 47,  1,  ''),
(23, 23, 48,  1,  ''),
(24, 24, 49,  1,  ''),
(26, 26, 51,  1,  ''),
(27, 27, 58,  1,  ''),
(28, 28, 60,  1,  ''),
(29, 29, 71,  1,  ''),
(30, 30, 74,  1,  ''),
(31, 31, 75,  1,  ''),
(32, 32, 80,  3,  ''),
(33, 33, 83,  1,  ''),
(34, 34, 177, 1,  ''),
(35, 35, 153, 16, 'gold'),
(36, 36, 154, 1,  ''),
(37, 37, 164, 1,  ''),
(38, 38, 165, 1,  ''),
(39, 39, 116, 1,  ''),
(40, 40, 121, 1,  ''),
(41, 41, 124, 1,  ''),
(42, 42, 125, 1,  ''),
(43, 43, 126, 1,  ''),
(44, 44, 127, 1,  ''),
(45, 45, 128, 1,  ''),
(46, 46, 129, 1,  ''),
(47, 47, 130, 1,  ''),
(48, 48, 88,  1,  ''),
(49, 49, 144, 1,  ''),
(50, 50, 15,  1,  ''),
(51, 51, 161, 1,  ''),
(52, 52, 162, 1,  ''),
(53, 53, 23,  1,  ''),
(54, 54, 24,  1,  ''),
(55, 55, 163, 1,  ''),
(56, 56, 1,   1,  ''),
(57, 57, 6,   1,  ''),
(58, 58, 5,   1,  ''),
(59, 59, 12,  1,  ''),
(60, 60, 14,  1,  ''),
(61, 61, 20,  1,  ''),
(62, 62, 26,  1,  ''),
(63, 63, 29,  1,  ''),
(64, 64, 33,  1,  ''),
(65, 65, 35,  1,  ''),
(66, 66, 36,  1,  '');

ALTER TABLE `ranking` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

-- ------------------------------------------------------------
-- Tabla: `razones`
-- NUEVO: columna `status` para moderación de comentarios
--   · pendiente  → recién registrado, espera revisión
--   · aprobado   → visible públicamente en el ranking
--   · rechazado  → oculto; no aparece en el sitio
-- NUEVO: columna `created_at` para ordenar en el panel admin
-- ------------------------------------------------------------

CREATE TABLE `razones` (
  `id`          int          NOT NULL AUTO_INCREMENT,
  `persona_id`  int          NOT NULL,
  `descripcion` text         NOT NULL,
  `status`      enum('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
  `created_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `persona_id` (`persona_id`),
  KEY `idx_status`  (`status`),          -- índice para filtrar rápido por estado
  KEY `idx_persona_status` (`persona_id`, `status`),
  CONSTRAINT `razones_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos existentes: se marcan como 'aprobado' porque ya estaban públicos
INSERT INTO `razones` (`id`, `persona_id`, `descripcion`, `status`) VALUES
(1,   53,  'Se comio a una puta en gisel teniendo novia',                                                                                                                                              'aprobado'),
(2,   53,  'Se comio una gorda y dice que las odia, el propio come gordas',                                                                                                                            'aprobado'),
(3,   53,  'Se comió un travesti en la 14 en el motel esquinero y cuando le preguntan dice que fue en gisel',                                                                                          'aprobado'),
(4,   53,  'Fue a verse con un gei que conoció en tinder en el sanpio',                                                                                                                                'aprobado'),
(5,   53,  'Le gusta chupar chimbo en los baños del 3piso del A',                                                                                                                                     'aprobado'),
(6,   53,  'Se comió con una gorda de talla triple xxl',                                                                                                                                              'aprobado'),
(7,   53,  'Le gusta que le hechen semen en el culo y se lo come con ganas',                                                                                                                          'aprobado'),
(8,   53,  'Ayer se estaba hablando con un profesor que dicta bases de datos y dijo que le gustaba los viejos de 50 para arriba',                                                                      'aprobado'),
(9,   53,  'Le gusta comer leche',                                                                                                                                                                    'aprobado'),
(10,  53,  'Estaba comiendo pene en el salón 612 b, es el que deja los condones botados',                                                                                                             'aprobado'),
(17,  76,  'Le gusta comer travesti en la 15',                                                                                                                                                        'aprobado'),
(18,  76,  'Le gusta comer de cada lado',                                                                                                                                                             'aprobado'),
(19,  76,  'Le gusta comer niñas de 15 años del pilar',                                                                                                                                               'aprobado'),
(20,  76,  'Le gusta comer trans de la 15 puro loco con peluca',                                                                                                                                      'aprobado'),
(21,  76,  'Se la pasa metiendo marihuana con un gey y luego se van a pichar',                                                                                                                        'aprobado'),
(22,  76,  'Se la pasa mirando puro marica enclosetado de la universidad, tiene cuento con más de uno',                                                                                               'aprobado'),
(23,  76,  'Se la pasa acosando maricas',                                                                                                                                                             'aprobado'),
(24,  76,  'Tiene cuento con un cucho que dicta electromagnetismo y lo recoge para ir a darle culo',                                                                                                   'aprobado'),
(26,  52,  'Se come con todo lo que se le atraviese',                                                                                                                                                 'aprobado'),
(27,  52,  'Finge ser cacorro pa ver a las viejas desnudas y comerselas en los baños y las casas de ellas, graba y lo vende',                                                                         'aprobado'),
(28,  52,  'Se mete con pura menor porque son "maduras"',                                                                                                                                             'aprobado'),
(29,  52,  'Dice serle fiel a la novia y se ve con la ex a escondidas',                                                                                                                               'aprobado'),
(30,  52,  'Mucho blabla y pocas acciones',                                                                                                                                                           'aprobado'),
(31,  52,  'Coquetea con todas las amigas teniendo novia',                                                                                                                                            'aprobado'),
(32,  52,  'Es un cacorro',                                                                                                                                                                           'aprobado'),
(33,  57,  'Es un morrongo',                                                                                                                                                                          'aprobado'),
(34,  57,  'Le gusta todas',                                                                                                                                                                          'aprobado'),
(35,  19,  'Ilusiona a las mujeres y más perro',                                                                                                                                                      'aprobado'),
(36,  19,  'Por gei',                                                                                                                                                                                 'aprobado'),
(37,  19,  'Porque se acuesta con una y despierta con otra cada día',                                                                                                                                  'aprobado'),
(38,  19,  'Por zunga',                                                                                                                                                                               'aprobado'),
(39,  46,  'Se metió con la novia del mejor amigo y le montó cachos con otra nena novia de otro amigo',                                                                                               'aprobado'),
(40,  46,  'Me las hizo y se las hice también',                                                                                                                                                       'aprobado'),
(41,  46,  'Cree que uno no sabe lo que hace pero es bien tonto',                                                                                                                                     'aprobado'),
(42,  16,  'Engañó a Mar con Victor',                                                                                                                                                                 'aprobado'),
(43,  67,  'Está comprometido y sale con como 3 chicas más',                                                                                                                                          'aprobado'),
(44,  67,  'Enano cachón',                                                                                                                                                                            'aprobado'),
(45,  38,  'Ojalá tuviera con quien ser infiel, pero ni una mosca se le acerca',                                                                                                                      'aprobado'),
(46,  38,  'Cacorro ese',                                                                                                                                                                             'aprobado'),
(47,  59,  'Porque me doy la gana',                                                                                                                                                                   'aprobado'),
(48,  59,  'A ese desgraciado no le llega ni una, todas se van',                                                                                                                                      'aprobado'),
(49,  7,   'Lo da y lo reparte',                                                                                                                                                                      'aprobado'),
(50,  7,   'Ella dijo yo solo te amo a ti',                                                                                                                                                           'aprobado'),
(51,  10,  'El perro infiel no quiso a mi amiga',                                                                                                                                                     'aprobado'),
(52,  9,   'No es infiel pero prefirió el man de la moto que a sergio',                                                                                                                               'aprobado'),
(53,  8,   'Me dijo que me amaba y me lo vi con otra',                                                                                                                                                'aprobado'),
(54,  138, 'Se lo chupa a Hitler',                                                                                                                                                                    'aprobado'),
(55,  25,  'Cancelen deportiva',                                                                                                                                                                      'aprobado'),
(56,  37,  'Porque le gusta estar con todos',                                                                                                                                                         'aprobado'),
(57,  43,  'Siempre le coquetea a muchas mujeres cada día',                                                                                                                                           'aprobado'),
(58,  44,  'La más infiel de toda la UTS, le fue infiel a su anterior novio con más de uno',                                                                                                          'aprobado'),
(59,  47,  'Se comió con la novia en el 612A y luego bajó al 408B a comerse con otra vieja ese mismo día. Y luego con otro vago en los baños del C',                                                  'aprobado'),
(60,  48,  'Tiene novia, dice que la ama y le cae a un montón de nenas',                                                                                                                              'aprobado'),
(61,  49,  'Por andar con varias',                                                                                                                                                                    'aprobado'),
(63,  51,  'Se mete con pura niñita de colegio',                                                                                                                                                      'aprobado'),
(64,  58,  'Porque se me dio la gana',                                                                                                                                                                'aprobado'),
(65,  60,  'Se parló a 3 peladas de modas',                                                                                                                                                           'aprobado'),
(66,  71,  'Por cachón soy perro',                                                                                                                                                                    'aprobado'),
(67,  74,  'El cree que le es fiel estando la novia en el colegio',                                                                                                                                   'aprobado'),
(68,  75,  'El cree que Valery le es fiel y le puso los cachos desde el año pasado',                                                                                                                  'aprobado'),
(69,  80,  'Sale con varias chicas al mismo tiempo diciéndole a todas que ellas son las únicas en su vida cuando tiene a 10 o más al mismo tiempo mintiéndoles en la cara',                           'aprobado'),
(70,  83,  'Cree que el pegue le es fiel y ella se habla con todos los exs',                                                                                                                          'aprobado'),
(71,  177, 'Me dijo que me amaba y me lo vi con otra',                                                                                                                                                'aprobado'),
(72,  153, 'Dice tener novia pero mantiene comiendo lo primero que le copia, sea hembra o trans',                                                                                                     'aprobado'),
(73,  154, 'Le gusta comer pene en el salón 512, está metido en un grupo de therians',                                                                                                                'aprobado'),
(74,  164, 'Se comió una trans de mileroticos teniendo novia',                                                                                                                                        'aprobado'),
(75,  165, 'Se mete con todas',                                                                                                                                                                       'aprobado'),
(76,  116, 'Porque le gusta andar de palo en palo',                                                                                                                                                   'aprobado'),
(77,  121, 'Porque me gustan todasss',                                                                                                                                                                'aprobado'),
(78,  124, 'Le es infiel a la novia con 3 y la tiene embarazada',                                                                                                                                     'aprobado'),
(79,  125, 'No lleva ni un mes ese hp y ya se metió con 6',                                                                                                                                           'aprobado'),
(80,  126, '.',                                                                                                                                                                                       'aprobado'),
(81,  127, 'Mentiroso embaucador, le tiraba a tres chicas de modas y una de industrial',                                                                                                              'aprobado'),
(82,  128, 'Por que es un desagradecido, un vividor, un mantenido. La canción de la perla completa. Una red flag total, la desgracia andante, LA VICTIMA',                                            'aprobado'),
(83,  129, 'Le pone cachos a la novia y siempre aplica la misma, siempre es con muchachas de la misma carrera',                                                                                       'aprobado'),
(84,  130, 'Se comió a varias profesoras',                                                                                                                                                            'aprobado'),
(85,  88,  'Se mete con todo mundo',                                                                                                                                                                  'aprobado'),
(86,  144, 'Todo costeño tiene que tener mínimo dos novias',                                                                                                                                          'aprobado'),
(87,  15,  'Se la chupa a distintos profesores y con diversos tipos de materia',                                                                                                                       'aprobado'),
(88,  161, 'Se comió una gordita y dice en todo lado que no gordas',                                                                                                                                  'aprobado'),
(89,  162, 'Anda con dos al mismo tiempo mientras su novia lo espera en el pueblo',                                                                                                                   'aprobado'),
(90,  23,  'Se acostó con la profe de inglés',                                                                                                                                                        'aprobado'),
(91,  24,  'Un mamón',                                                                                                                                                                                'aprobado'),
(92,  163, 'No soy infiel solo quiero el chisme',                                                                                                                                                     'aprobado'),
(93,  1,   'Se mete con el uno y con el otro',                                                                                                                                                        'aprobado'),
(94,  6,   'No se sabe',                                                                                                                                                                              'aprobado'),
(95,  5,   'La señorita disque haciendo tareas se la pasaba en la discoteca',                                                                                                                         'aprobado'),
(96,  12,  'Me reemplazó por un gay llamado juan Pablo que se le declaró a una mujer estando borracho',                                                                                               'aprobado'),
(97,  14,  'Siempre lo cambian por uno con más plata',                                                                                                                                                'aprobado'),
(98,  20,  'Capacho o kuke',                                                                                                                                                                          'aprobado'),
(99,  26,  'Porque le gustan los therians',                                                                                                                                                           'aprobado'),
(100, 29,  'Se come a Victor a escondidas',                                                                                                                                                           'aprobado'),
(101, 33,  'Se la pasa mirando a todas y le pide el número a cualquiera que vea sola',                                                                                                               'aprobado'),
(102, 35,  'Traca',                                                                                                                                                                                   'aprobado'),
(103, 36,  'Anda con 2 al mismo tiempo',                                                                                                                                                              'aprobado'),
(104, 19,  'zunga',                                                                                                                                                                                   'aprobado'),
(105, 80,  'Estuvo con una de mis amigas y a la pobre la dejo embarazada, y para el colmo no se hace responsable el cabrón',                                                                          'aprobado'),
(106, 80,  'Estuviste conmigo estando con otra al mismo tiempo me mentiste me dijiste que era la única en tu vida mentiroso perro infiel',                                                            'aprobado'),
(107, 153, 'acosó a una compañera de electro que lo tuvo que denunciar',                                                                                                                             'aprobado'),
(108, 153, 'le gusta salir a tomar y termina con la primera travesti que ve',                                                                                                                        'aprobado'),
(109, 153, 'tuvo cuentos con una niña de 14',                                                                                                                                                        'aprobado'),
(110, 153, 'es más infiel y se las da de que no',                                                                                                                                                    'aprobado'),
(111, 153, 'una vez borracho terminó con alguien del mismo género',                                                                                                                                  'aprobado'),
(112, 153, 'es el típico 50/50',                                                                                                                                                                     'aprobado'),
(113, 153, 'cacorro',                                                                                                                                                                                 'aprobado'),
(114, 43,  'Está hablando con dos al mismo tiempo mientras tiene una sugar en giron',                                                                                                                 'aprobado'),
(115, 153, 'Come trans',                                                                                                                                                                              'aprobado'),
(116, 153, 'pillado viéndose con otra en papi quiero piña',                                                                                                                                          'aprobado'),
(117, 43,  'Se comió una gorda',                                                                                                                                                                      'aprobado'),
(118, 153, 'le gusta el pene teniendo novia',                                                                                                                                                        'aprobado'),
(119, 153, 'apodado el terror de los trans',                                                                                                                                                         'aprobado'),
(120, 153, 'el propio infiel el número 1',                                                                                                                                                           'aprobado'),
(121, 153, 'cachon a todo honor',                                                                                                                                                                     'aprobado'),
(122, 153, 'estuvo con una en fuentes de amor teniendo novia',                                                                                                                                       'aprobado'),
(123, 153, 'toma pastillas para el herpes',                                                                                                                                                          'aprobado'),
(124, 67,  'Sale con las compañeras y tiene esposa',                                                                                                                                                  'aprobado'),
(125, 67,  'Ella lo sabra',                                                                                                                                                                           'aprobado'),
(126, 52,  'infiel',                                                                                                                                                                                  'aprobado'),
(127, 52,  'perro',                                                                                                                                                                                   'aprobado'),
(128, 52,  '🖕🏻',                                                                                                                                                                                  'aprobado'),
(129, 52,  'cochino',                                                                                                                                                                                 'aprobado');

ALTER TABLE `razones` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

-- ============================================================
-- VISTAS
-- ============================================================

-- ------------------------------------------------------------
-- Vista principal: solo razones APROBADAS
-- Usada por el frontend público
-- ------------------------------------------------------------

DROP VIEW IF EXISTS `v_ranking_completo`;
CREATE ALGORITHM=UNDEFINED
  DEFINER=`root`@`%`
  SQL SECURITY DEFINER
VIEW `v_ranking_completo` AS
SELECT
  r.posicion,
  p.id,
  p.nombre,
  p.carrera,
  p.genero,
  r.total_votos,
  r.medalla,
  -- Razones aprobadas concatenadas (separadas por ". ")
  GROUP_CONCAT(
    rz.descripcion
    ORDER BY rz.id ASC
    SEPARATOR '. '
  ) AS razones_aprobadas,
  COUNT(rz.id) AS total_razones_aprobadas
FROM ranking r
JOIN personas p   ON r.persona_id = p.id
LEFT JOIN razones rz ON rz.persona_id = p.id AND rz.status = 'aprobado'
GROUP BY r.id, r.posicion, p.id, p.nombre, p.carrera, p.genero, r.total_votos, r.medalla
ORDER BY r.posicion ASC;

-- ------------------------------------------------------------
-- Vista de moderación: todas las razones con su estado
-- Usada exclusivamente por el PANEL DE ADMINISTRACIÓN
-- Ordenada: primero las pendientes, luego por fecha descendente
-- ------------------------------------------------------------

DROP VIEW IF EXISTS `v_panel_moderacion`;
CREATE ALGORITHM=UNDEFINED
  DEFINER=`root`@`%`
  SQL SECURITY DEFINER
VIEW `v_panel_moderacion` AS
SELECT
  rz.id            AS razon_id,
  rz.descripcion,
  rz.status,
  rz.created_at,
  p.id             AS persona_id,
  p.nombre         AS persona_nombre,
  p.carrera        AS persona_carrera,
  p.genero         AS persona_genero,
  r.total_votos,
  r.posicion
FROM razones rz
JOIN personas p ON rz.persona_id = p.id
LEFT JOIN ranking r ON r.persona_id = p.id
ORDER BY
  FIELD(rz.status, 'pendiente', 'rechazado', 'aprobado'),
  rz.created_at DESC;

-- ============================================================
-- STORED PROCEDURE: aprobar / rechazar razón
-- Uso: CALL moderar_razon(id_razon, 'aprobado');
--      CALL moderar_razon(id_razon, 'rechazado');
-- ============================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS `moderar_razon`$$
CREATE PROCEDURE `moderar_razon`(
  IN p_razon_id INT,
  IN p_nuevo_status ENUM('pendiente','aprobado','rechazado')
)
BEGIN
  UPDATE razones
  SET status = p_nuevo_status
  WHERE id = p_razon_id;
END$$

DELIMITER ;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
