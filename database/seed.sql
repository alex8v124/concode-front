-- ====================================================================
-- Ayudar Trazable - Datos Iniciales (Seed Data)
-- ====================================================================

-- 1. Insertar Cuadrantes en Lima, Perú (San Borja / Surco)
INSERT INTO quadrants (id, code, district, name, polygon)
VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'CUAD-SB-03',
    'San Borja',
    'Cuadrante San Borja Norte - Sector 3',
    ST_GeomFromText('POLYGON((-77.0050 -12.0850, -76.9950 -12.0850, -76.9950 -12.0950, -77.0050 -12.0950, -77.0050 -12.0850))', 4326)
),
(
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'CUAD-SB-04',
    'San Borja',
    'Cuadrante San Borja - Sector 4 (Las Gardenias)',
    ST_GeomFromText('POLYGON((-76.9950 -12.0850, -76.9850 -12.0850, -76.9850 -12.0950, -76.9950 -12.0950, -76.9950 -12.0850))', 4326)
),
(
    'a1b2c3d4-e5f6-7890-abcd-333333333333',
    'CUAD-SUR-01',
    'Santiago de Surco',
    'Cuadrante Chacarilla - Sector 1',
    ST_GeomFromText('POLYGON((-76.9950 -12.0950, -76.9850 -12.0950, -76.9850 -12.1050, -76.9950 -12.1050, -76.9950 -12.0950))', 4326)
)
ON CONFLICT (code) DO NOTHING;

-- 2. Insertar Vecinos Verificados Iniciales (incluyendo Ana María Quispe Ramos del Wireframe)
INSERT INTO users (
    id, dni, phone, first_name, last_name, age, gender, 
    address_text, location, quadrant_id, dni_verified, address_verified, role
)
VALUES
(
    'b2c3d4e5-f6a7-8901-bcde-111111111111',
    '00000000',
    '+51987654321',
    'Ana María',
    'Quispe Ramos',
    34,
    'Femenino',
    'Jr. Jacarandá 342, San Borja',
    ST_SetSRID(ST_MakePoint(-76.9902, -12.0905), 4326),
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    TRUE,
    TRUE,
    'VECINO'
),
(
    'b2c3d4e5-f6a7-8901-bcde-222222222222',
    '45892147',
    '+51991234567',
    'Carlos Alberto',
    'Mendoza Silva',
    42,
    'Masculino',
    'Calle Las Acacias 120, San Borja',
    ST_SetSRID(ST_MakePoint(-76.9915, -12.0912), 4326),
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    TRUE,
    TRUE,
    'COORDINADOR'
),
(
    'b2c3d4e5-f6a7-8901-bcde-333333333333',
    '72145896',
    '+51984567890',
    'Lucía',
    'Fernández Torres',
    29,
    'Femenino',
    'Av. San Borja Norte 845',
    ST_SetSRID(ST_MakePoint(-76.9890, -12.0898), 4326),
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    TRUE,
    TRUE,
    'VECINO'
)
ON CONFLICT (phone) DO NOTHING;

-- 3. Alertas de Emergencia de Prueba
INSERT INTO emergency_alerts (
    id, user_id, quadrant_id, type, title, description, location, status, created_at
)
VALUES
(
    'c3d4e5f6-a7b8-9012-cdef-111111111111',
    'b2c3d4e5-f6a7-8901-bcde-222222222222',
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'SOSPECHA',
    'Vehículo sospechoso sin placa',
    'Auto negro polarizado rondando la esquina de Jacarandá con Las Acacias.',
    ST_SetSRID(ST_MakePoint(-76.9910, -12.0908), 4326),
    'ACTIVA',
    NOW() - INTERVAL '15 minutes'
)
ON CONFLICT DO NOTHING;
