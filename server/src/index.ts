import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Base de datos en memoria para el prototipo/servicios core
interface User {
  id: string;
  dni: string;
  phone: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  addressText: string;
  lat: number;
  lng: number;
  quadrantId: string;
  quadrantName: string;
  dniVerified: boolean;
  addressVerified: boolean;
  role: string;
  createdAt: string;
}

interface Quadrant {
  id: string;
  code: string;
  district: string;
  name: string;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

interface EmergencyAlert {
  id: string;
  userId: string;
  userName: string;
  quadrantId: string;
  type: 'PANIC' | 'SOSPECHA' | 'ROBO' | 'MEDICA';
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: 'ACTIVA' | 'RESUELTA';
  createdAt: string;
}

// Datos de Cuadrantes Vecinales
const quadrants: Quadrant[] = [
  {
    id: 'cuad-1',
    code: 'CUAD-SB-03',
    district: 'San Borja',
    name: 'San Borja Norte - Sector 3',
    bounds: { minLat: -12.095, maxLat: -12.085, minLng: -77.005, maxLng: -76.995 }
  },
  {
    id: 'cuad-2',
    code: 'CUAD-SB-04',
    district: 'San Borja',
    name: 'San Borja - Sector 4 (Las Gardenias)',
    bounds: { minLat: -12.095, maxLat: -12.085, minLng: -76.995, maxLng: -76.985 }
  },
  {
    id: 'cuad-3',
    code: 'CUAD-SUR-01',
    district: 'Santiago de Surco',
    name: 'Chacarilla del Estanque - Sector 1',
    bounds: { minLat: -12.105, maxLat: -12.095, minLng: -76.995, maxLng: -76.985 }
  }
];

// Usuarios verificados
const users: User[] = [
  {
    id: 'usr-1',
    dni: '00000000',
    phone: '987654321',
    firstName: 'Ana María',
    lastName: 'Quispe Ramos',
    age: 34,
    gender: 'Femenino',
    addressText: 'Jr. Jacarandá 342, San Borja',
    lat: -12.0905,
    lng: -76.9902,
    quadrantId: 'cuad-2',
    quadrantName: 'San Borja - Sector 4 (Las Gardenias)',
    dniVerified: true,
    addressVerified: true,
    role: 'VECINO',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-2',
    dni: '45892147',
    phone: '991234567',
    firstName: 'Carlos Alberto',
    lastName: 'Mendoza Silva',
    age: 42,
    gender: 'Masculino',
    addressText: 'Calle Las Acacias 120, San Borja',
    lat: -12.0912,
    lng: -76.9915,
    quadrantId: 'cuad-2',
    quadrantName: 'San Borja - Sector 4 (Las Gardenias)',
    dniVerified: true,
    addressVerified: true,
    role: 'COORDINADOR',
    createdAt: new Date().toISOString()
  }
];

// Alertas de emergencia activas
const alerts: EmergencyAlert[] = [
  {
    id: 'alt-1',
    userId: 'usr-2',
    userName: 'Carlos Mendoza (Coordinador)',
    quadrantId: 'cuad-2',
    type: 'SOSPECHA',
    title: 'Vehículo sospechoso sin placa',
    description: 'Auto negro polarizado rondando la esquina de Jacarandá con Las Acacias.',
    lat: -12.0910,
    lng: -76.9908,
    status: 'ACTIVA',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  }
];

// Almacén de códigos OTP activos (Twilio simulation)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// -------------------------------------------------------------
// ENDPOINTS DE AUTENTICACIÓN Y VALIDACIÓN (RENIEC / OCR / TWILIO)
// -------------------------------------------------------------

// Simulación de OCR DNI (ML Kit / RENIEC)
app.post('/api/auth/ocr-scan', (req, res) => {
  const { simulateError, dniInput } = req.body;

  if (simulateError) {
    return res.status(422).json({
      success: false,
      message: 'No pudimos leer tu DNI. La imagen está borrosa o tiene reflejos.',
      code: 'OCR_READ_FAILED',
      tips: [
        'Busca buena luz y evita reflejos',
        'Coloca el DNI plano y completo',
        'Limpia el lente de la cámara'
      ]
    });
  }

  // Si envían un DNI específico o el de defecto del wireframe:
  const dni = dniInput || '00000000';

  // Simulación de verificación con RENIEC (Perú)
  const reniecMockData: Record<string, { firstName: string; lastName: string; age: number; gender: string }> = {
    '00000000': { firstName: 'Ana María', lastName: 'Quispe Ramos', age: 34, gender: 'Femenino' },
    '71234567': { firstName: 'Juan Carlos', lastName: 'Pérez Gómez', age: 28, gender: 'Masculino' },
    '45892147': { firstName: 'Carlos Alberto', lastName: 'Mendoza Silva', age: 42, gender: 'Masculino' }
  };

  const identity = reniecMockData[dni] || {
    firstName: 'Rosa María',
    lastName: 'Vargas Flores',
    age: 38,
    gender: 'Femenino'
  };

  return res.json({
    success: true,
    verified: true,
    source: 'RENIEC_CIVIL_REGISTRY',
    data: {
      dni,
      ...identity,
      confidence: 0.98,
      readStatus: 'DNI leído correctamente'
    }
  });
});

// Envío de código OTP SMS (Twilio)
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length < 9) {
    return res.status(400).json({ error: 'Número de celular inválido (debe tener 9 dígitos).' });
  }

  // Generar código de 4 dígitos (como en el wireframe)
  const code = '1234'; // Código predecible para demos, o Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos

  otpStore.set(phone, { code, expiresAt });

  console.log(`[Twilio SMS] Código OTP enviado a ${phone}: ${code}`);

  return res.json({
    success: true,
    message: `Enviamos un código de 4 dígitos por mensaje de texto al número ${phone}.`,
    phone,
    devCode: code, // Facilitar pruebas en frontend
    resendAvailableInSeconds: 30
  });
});

// Verificación del código OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code } = req.body;

  const record = otpStore.get(phone);
  if (!record) {
    // Si no está en memoria, permitimos '1234' para agilidad en testing
    if (code === '1234') {
      return res.json({ success: true, verified: true });
    }
    return res.status(400).json({ error: 'No se encontró solicitud de código para este número.' });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'El código ha expirado. Por favor solicita uno nuevo.' });
  }

  if (record.code !== code && code !== '1234') {
    return res.status(400).json({ error: 'El código ingresado es incorrecto. Inténtalo de nuevo.' });
  }

  otpStore.delete(phone);
  return res.json({
    success: true,
    verified: true,
    message: 'Identidad y celular verificados exitosamente.'
  });
});

// Registro final de usuario
app.post('/api/auth/register', (req, res) => {
  const { dni, phone, firstName, lastName, age, gender, addressText, lat, lng } = req.body;

  // Asignar cuadrante según coordenadas
  const quadrant = quadrants.find(q =>
    lat >= q.bounds.minLat && lat <= q.bounds.maxLat &&
    lng >= q.bounds.minLng && lng <= q.bounds.maxLng
  ) || quadrants[1]; // default San Borja Sector 4

  const newUser: User = {
    id: `usr-${Date.now()}`,
    dni: dni || '00000000',
    phone: phone || '987654321',
    firstName: firstName || 'Ana María',
    lastName: lastName || 'Quispe Ramos',
    age: Number(age) || 34,
    gender: gender || 'Femenino',
    addressText: addressText || 'Jr. Jacarandá 342, San Borja',
    lat: lat || -12.0905,
    lng: lng || -76.9902,
    quadrantId: quadrant.id,
    quadrantName: quadrant.name,
    dniVerified: true,
    addressVerified: true,
    role: 'VECINO',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  return res.status(201).json({
    success: true,
    message: '¡Bienvenida al barrio! Tu identidad y domicilio están verificados.',
    user: newUser
  });
});

// -------------------------------------------------------------
// ENDPOINTS GEOESPACIALES (Google Maps / PostGIS)
// -------------------------------------------------------------

// Resolver cuadrante y dirección según pin en el mapa
app.get('/api/geo/resolve-pin', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || -12.0905;
  const lng = parseFloat(req.query.lng as string) || -76.9902;

  const quadrant = quadrants.find(q =>
    lat >= q.bounds.minLat && lat <= q.bounds.maxLat &&
    lng >= q.bounds.minLng && lng <= q.bounds.maxLng
  ) || quadrants[1];

  return res.json({
    quadrant,
    address: 'Jr. Jacarandá 342, San Borja',
    district: quadrant.district,
    safetyMessage: 'Solo vecinos verificados de tu cuadrante verán tu zona.'
  });
});

// Obtener vecinos del mismo cuadrante (con protección de privacidad)
app.get('/api/geo/quadrant-neighbors/:quadrantId', (req, res) => {
  const { quadrantId } = req.params;
  const neighborList = users
    .filter(u => u.quadrantId === quadrantId)
    .map(u => ({
      id: u.id,
      firstName: u.firstName,
      initial: u.lastName.charAt(0) + '.',
      addressRef: u.addressText.split(',')[0],
      isVerified: u.dniVerified && u.addressVerified,
      role: u.role,
      lat: u.lat + (Math.random() - 0.5) * 0.001, // ligero jitter para privacidad
      lng: u.lng + (Math.random() - 0.5) * 0.001
    }));

  return res.json({
    quadrantId,
    totalNeighbors: neighborList.length,
    neighbors: neighborList
  });
});

// -------------------------------------------------------------
// SERVICIO DE EMERGENCIAS Y ALERTAS EN TIEMPO REAL (WSS / FCM)
// -------------------------------------------------------------

app.get('/api/emergencias/active', (_req, res) => {
  return res.json(alerts.filter(a => a.status === 'ACTIVA'));
});

// Servidor HTTP y WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const broadcast = (data: object) => {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
};

app.post('/api/emergencias/panic', (req, res) => {
  const { userId, type, title, description, lat, lng, quadrantId } = req.body;
  const user = users.find(u => u.id === userId) || users[0];

  const newAlert: EmergencyAlert = {
    id: `alt-${Date.now()}`,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    quadrantId: quadrantId || user.quadrantId,
    type: type || 'PANIC',
    title: title || '¡BOTÓN DE PÁNICO VECINAL ACTIVADO!',
    description: description || `Alerta emitida por ${user.firstName} en ${user.addressText}`,
    lat: lat || user.lat,
    lng: lng || user.lng,
    status: 'ACTIVA',
    createdAt: new Date().toISOString()
  };

  alerts.unshift(newAlert);

  // Broadcast WebSocket en tiempo real
  broadcast({
    event: 'EMERGENCY_ALERT_DISPATCHED',
    alert: newAlert
  });

  return res.status(201).json({
    success: true,
    message: 'Alerta de emergencia emitida a todos los vecinos del cuadrante.',
    alert: newAlert
  });
});

wss.on('connection', (ws) => {
  console.log('[WebSocket] Nuevo vecino conectado al canal en tiempo real.');
  ws.send(JSON.stringify({ event: 'CONNECTED', message: 'Conectado a la red de emergencias vecinales.' }));
});

server.listen(port, () => {
  console.log(`=======================================================`);
  console.log(`  Ayudar Trazable API Server ejecutándose en puerto ${port}`);
  console.log(`  Endpoints: http://localhost:${port}/api/auth/ocr-scan`);
  console.log(`             http://localhost:${port}/api/emergencias/active`);
  console.log(`=======================================================`);
});
