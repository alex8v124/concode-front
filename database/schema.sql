-- ====================================================================
-- Ayudar Trazable - Base de Datos (Supabase PostgreSQL + PostGIS)
-- ====================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Tabla de Cuadrantes Vecinales (Zonificación Geográfica)
CREATE TABLE IF NOT EXISTS quadrants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'CUAD-SB-04'
    district VARCHAR(100) NOT NULL,   -- Ej: 'San Borja'
    name VARCHAR(150) NOT NULL,       -- Ej: 'Sector 4 - Las Gardenias / Jacarandá'
    polygon GEOMETRY(Polygon, 4326) NOT NULL, -- Polígono delimitador del cuadrante
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice geoespacial para cuadrantes
CREATE INDEX IF NOT EXISTS idx_quadrants_polygon ON quadrants USING GIST (polygon);

-- 3. Tabla de Usuarios y Vecinos Verificados
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dni VARCHAR(8) UNIQUE,             -- DNI peruano de 8 dígitos verificado por RENIEC / OCR
    phone VARCHAR(20) UNIQUE NOT NULL, -- Celular (formato peruano: +51 9XXXXXXXX)
    first_name VARCHAR(100),           -- Nombres (ej: 'Ana María')
    last_name VARCHAR(100),            -- Apellidos (ej: 'Quispe Ramos')
    age INT,                           -- Edad calculada desde RENIEC / DNI
    gender VARCHAR(20),                -- 'Femenino' / 'Masculino'
    address_text TEXT,                 -- Dirección legible (ej: 'Jr. Jacarandá 342, Dpto 201')
    location GEOMETRY(Point, 4326),    -- Coordenada exacta (Lat, Lng) guardada por el usuario
    quadrant_id UUID REFERENCES quadrants(id) ON DELETE SET NULL,
    dni_verified BOOLEAN DEFAULT FALSE,
    address_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    role VARCHAR(30) DEFAULT 'VECINO', -- 'VECINO', 'COORDINADOR', 'ADMIN'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices geoespaciales y de búsqueda
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_dni ON users (dni);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_quadrant ON users (quadrant_id);

-- 4. Tabla de Códigos de Verificación OTP (Twilio)
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    attempts INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications (phone);

-- 5. Tabla de Alertas de Emergencia en Tiempo Real (WSS / FCM)
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quadrant_id UUID REFERENCES quadrants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,         -- 'PANIC', 'SOSPECHA', 'ROBO', 'MEDICA', 'INCENDIO'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVA', -- 'ACTIVA', 'ATENDIDA', 'FALSA_ALARMA', 'RESUELTA'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_location ON emergency_alerts USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_alerts_quadrant ON emergency_alerts (quadrant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON emergency_alerts (status);

-- 6. Trigger y Función: Auto-asignación de Cuadrante según Coordenadas (PostGIS)
CREATE OR REPLACE FUNCTION set_user_quadrant_from_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.location IS NOT NULL THEN
        SELECT id INTO NEW.quadrant_id
        FROM quadrants
        WHERE ST_Contains(polygon, NEW.location)
        LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_user_quadrant ON users;
CREATE TRIGGER trg_set_user_quadrant
BEFORE INSERT OR UPDATE OF location ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_quadrant_from_location();

-- 7. Políticas de Seguridad a Nivel de Fila (Row-Level Security - Supabase RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quadrants ENABLE ROW LEVEL SECURITY;

-- Los usuarios verificados de un cuadrante solo ven a otros vecinos del mismo cuadrante
CREATE POLICY "Vecinos ven usuarios de su mismo cuadrante"
ON users FOR SELECT
USING (
    quadrant_id = (SELECT quadrant_id FROM users WHERE id = auth.uid())
);

-- Cualquier vecino verificado de un cuadrante puede ver y recibir alertas de su cuadrante
CREATE POLICY "Vecinos ven alertas de su propio cuadrante"
ON emergency_alerts FOR SELECT
USING (
    quadrant_id = (SELECT quadrant_id FROM users WHERE id = auth.uid())
);

-- Los usuarios pueden emitir alertas en su propio cuadrante
CREATE POLICY "Vecinos pueden emitir alertas en su cuadrante"
ON emergency_alerts FOR INSERT
WITH CHECK (
    user_id = auth.uid()
);

-- Cuadrantes son de lectura pública para validación durante el onboarding
CREATE POLICY "Lectura pública de cuadrantes"
ON quadrants FOR SELECT
USING (true);

-- 8. Habilitar Supabase Realtime para Alertas de Emergencia
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_alerts;
