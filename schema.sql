-- =========================================================
-- HIERRO PROGRESO FITNESS & SWIM CENTER
-- Script de creación de base de datos para Neon (PostgreSQL)
-- =========================================================

-- Si querés volver a correr el script desde cero, descomentá esto:
-- DROP TABLE IF EXISTS consultas CASCADE;
-- DROP TABLE IF EXISTS clientes CASCADE;

-- =========================================================
-- TABLA: clientes
-- =========================================================
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente   SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    apellido     VARCHAR(100),
    telefono     VARCHAR(30)  NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    fecha_alta   TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- TABLA: consultas
-- Relación: un cliente puede tener muchas consultas (1 -- N)
-- =========================================================
CREATE TABLE IF NOT EXISTS consultas (
    id_consulta  SERIAL PRIMARY KEY,
    asunto       VARCHAR(100) NOT NULL,
    mensaje      TEXT NOT NULL,
    fecha        TIMESTAMP DEFAULT NOW(),
    estado       VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                 CHECK (estado IN ('pendiente', 'respondida', 'cerrada')),
    id_cliente   INT NOT NULL,
    CONSTRAINT fk_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes (id_cliente)
        ON DELETE CASCADE
);

-- Índices para acelerar las búsquedas y listados del panel admin
CREATE INDEX IF NOT EXISTS idx_consultas_cliente ON consultas (id_cliente);
CREATE INDEX IF NOT EXISTS idx_consultas_fecha    ON consultas (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_email      ON clientes (email);

-- =========================================================
-- DATOS DE PRUEBA
-- =========================================================

INSERT INTO clientes (nombre, apellido, telefono, email) VALUES
('Lucía',    'Benítez',  '3704-111222', 'lucia.benitez@example.com'),
('Mariano',  'Ocampo',   '3704-222333', 'mariano.ocampo@example.com'),
('Florencia','Acosta',   '3704-333444', 'florencia.acosta@example.com'),
('Diego',    'Ramírez',  '3704-444555', 'diego.ramirez@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO consultas (asunto, mensaje, id_cliente, estado) VALUES
('Plan Premium', 'Hola, quería saber si el plan Premium incluye clases de natación todos los días o tiene horarios limitados.', 1, 'pendiente'),
('Clase de prueba', 'Buenas, ¿cómo hago para reservar la clase de prueba gratuita? ¿Hay que ir presencialmente?', 2, 'respondida'),
('Congelar membresía', 'Voy a viajar 3 semanas en agosto, ¿puedo pausar mi plan Individual durante ese tiempo?', 3, 'pendiente'),
('Plan Familiar', 'Somos 5 en mi familia, el plan dice hasta 4 integrantes, ¿hay alguna opción para el quinto integrante?', 4, 'cerrada');

-- =========================================================
-- CONSULTAS DE EJEMPLO (las que pide el TP en la documentación)
-- =========================================================
-- SELECT * FROM clientes;
-- SELECT * FROM consultas;
-- SELECT c.id_consulta, c.asunto, c.mensaje, c.fecha, c.estado,
--        cl.nombre, cl.apellido, cl.email, cl.telefono
-- FROM consultas c
-- JOIN clientes cl ON cl.id_cliente = c.id_cliente
-- ORDER BY c.fecha DESC;
