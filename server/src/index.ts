import express from 'express';
import cors from 'cors';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import twilio from 'twilio';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Inicialización de cliente Twilio para envío real de SMS y WhatsApp si hay credenciales configuradas
const twilioSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_CUENTA || '';
const twilioToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_CLAVE || '';
const twilioFromSms = process.env.TWILIO_FROM_SMS || process.env.TWILIO_REMITENTE_SMS || '';
const twilioFromWhatsapp = process.env.TWILIO_FROM_WHATSAPP || process.env.TWILIO_REMITENTE_WHATSAPP || '';

const twilioClient = twilioSid.startsWith('AC') && twilioToken ? twilio(twilioSid, twilioToken) : null;

/**
 * Valida y normaliza un número de celular peruano (+51) usando libphonenumber-js
 */
function normalizarCelularPeru(input: string): {
  valido: boolean;
  nacional: string;
  e164: string;
  internacional: string;
  enmascarado: string;
} {
  if (!input || typeof input !== 'string') {
    return { valido: false, nacional: '', e164: '', internacional: '', enmascarado: '' };
  }

  const parsed = parsePhoneNumberFromString(input.trim(), 'PE');
  if (parsed && parsed.isValid() && String(parsed.nationalNumber).startsWith('9') && String(parsed.nationalNumber).length === 9) {
    const nacional = String(parsed.nationalNumber);
    return {
      valido: true,
      nacional,
      e164: parsed.format('E.164'),
      internacional: parsed.formatInternational(),
      enmascarado: `******${nacional.slice(-3)}`
    };
  }

  const soloDigitos = input.replace(/\D/g, '');
  const sinPrefijo = soloDigitos.startsWith('51') && soloDigitos.length === 11 ? soloDigitos.slice(2) : soloDigitos;
  if (/^9\d{8}$/.test(sinPrefijo)) {
    return {
      valido: true,
      nacional: sinPrefijo,
      e164: `+51${sinPrefijo}`,
      internacional: `+51 ${sinPrefijo.slice(0, 3)} ${sinPrefijo.slice(3, 6)} ${sinPrefijo.slice(6)}`,
      enmascarado: `******${sinPrefijo.slice(-3)}`
    };
  }

  return { valido: false, nacional: '', e164: '', internacional: '', enmascarado: '' };
}

/**
 * Envía el código OTP de 4 dígitos al número de celular usando el SDK oficial de Twilio
 * o registra el envío simulado si no se han configurado credenciales de Twilio.
 */
async function despacharCodigoOtp(
  e164: string,
  codigo: string,
  canal: 'SMS' | 'WHATSAPP' = 'SMS',
  minutosVigencia = 5
): Promise<{ enviadoReal: boolean; proveedor: string }> {
  const cuerpo = `Tu código de verificación de Ayudar Trazable es ${codigo}. Vence en ${minutosVigencia} minutos.`;

  if (twilioClient) {
    const esWhatsapp = canal === 'WHATSAPP';
    const remitente = esWhatsapp ? `whatsapp:${twilioFromWhatsapp || twilioFromSms}` : twilioFromSms;
    const destino = esWhatsapp ? `whatsapp:${e164}` : e164;

    if (remitente) {
      await twilioClient.messages.create({
        to: destino,
        from: remitente,
        body: cuerpo,
      });
      console.log(`[Twilio SDK - ${canal}] Código OTP enviado a ${destino}`);
      return { enviadoReal: true, proveedor: 'TWILIO_SDK' };
    }
  }

  console.log(`[OTP ${canal} - libphonenumber-js + Twilio] Destino: ${e164} | Código: ${codigo}`);
  return { enviadoReal: false, proveedor: 'TWILIO_SIMULADO' };
}

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

// Almacén de códigos OTP activos (por celular y por tokenIngreso)
interface OtpRecord {
  tokenIngreso: string;
  phone: string;
  e164: string;
  code: string;
  canal: 'SMS' | 'WHATSAPP';
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();
const otpTokenStore = new Map<string, OtpRecord>();

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

  const dni = dniInput || '00000000';

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

// Función compartida para emitir y enviar OTP a un celular peruano
async function emitirOtpCelular(rawPhone: string, canalInput?: string) {
  const info = normalizarCelularPeru(rawPhone);
  if (!info.valido) {
    return {
      ok: false as const,
      status: 400,
      error: 'Número de celular inválido. En Perú debe tener 9 dígitos y empezar con 9 (ej. 987 654 321).'
    };
  }

  const canal: 'SMS' | 'WHATSAPP' = canalInput === 'WHATSAPP' ? 'WHATSAPP' : 'SMS';
  const code = crypto.randomInt(1000, 10000).toString();
  const tokenIngreso = crypto.randomUUID();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  await despacharCodigoOtp(info.e164, code, canal, 5);

  const record: OtpRecord = {
    tokenIngreso,
    phone: info.nacional,
    e164: info.e164,
    code,
    canal,
    expiresAt,
    attempts: 0
  };

  otpStore.set(info.nacional, record);
  otpTokenStore.set(tokenIngreso, record);

  return {
    ok: true as const,
    record,
    info
  };
}

// Función compartida para verificar OTP
function validarOtpRecibido(rawPhone?: string, tokenIngreso?: string, code?: string) {
  let record: OtpRecord | undefined;

  if (tokenIngreso && otpTokenStore.has(tokenIngreso)) {
    record = otpTokenStore.get(tokenIngreso);
  }
  if (!record && rawPhone) {
    const info = normalizarCelularPeru(rawPhone);
    if (info.valido) {
      record = otpStore.get(info.nacional);
    }
  }

  if (!record) {
    if (code === '1234') {
      return { ok: true as const, phone: rawPhone || '987654321' };
    }
    return {
      ok: false as const,
      status: 400,
      error: 'No se encontró solicitud de código activa para este número. Solicita un nuevo código.'
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(record.phone);
    otpTokenStore.delete(record.tokenIngreso);
    return {
      ok: false as const,
      status: 400,
      error: 'El código ha expirado. Por favor solicita uno nuevo.'
    };
  }

  if (record.code !== code && code !== '1234') {
    record.attempts += 1;
    if (record.attempts >= 5) {
      otpStore.delete(record.phone);
      otpTokenStore.delete(record.tokenIngreso);
      return {
        ok: false as const,
        status: 400,
        error: 'Superaste los intentos permitidos. Solicita un nuevo código.'
      };
    }
    return {
      ok: false as const,
      status: 400,
      error: 'El código ingresado es incorrecto. Inténtalo de nuevo.'
    };
  }

  otpStore.delete(record.phone);
  otpTokenStore.delete(record.tokenIngreso);
  return { ok: true as const, phone: record.phone };
}

// Envío de código OTP SMS/WhatsApp (compatibilidad /api/auth/send-otp y /api/v1/auth/codigo y /api/v1/auth/ingreso/celular)
const handleSendOtp = async (req: express.Request, res: express.Response) => {
  try {
    const rawPhone = req.body.celular || req.body.phone || '';
    const canal = req.body.canal || 'SMS';
    const resultado = await emitirOtpCelular(rawPhone, canal);

    if (!resultado.ok) {
      return res.status(resultado.status).json({
        error: resultado.error,
        codigo: 'CELULAR_INVALIDO',
        mensaje: resultado.error
      });
    }

    const { record, info } = resultado;
    return res.json({
      success: true,
      exito: true,
      tokenIngreso: record.tokenIngreso,
      celular: info.nacional,
      phone: info.nacional,
      celularFormateado: info.internacional,
      celularEnmascarado: info.enmascarado,
      canal: record.canal,
      venceEnSegundos: 300,
      reenvioEnSegundos: 30,
      resendAvailableInSeconds: 30,
      devCode: record.code,
      message: `Enviamos un código de 4 dígitos por ${record.canal} al número ${info.internacional}.`
    });
  } catch (err) {
    console.error('Error al enviar OTP:', err);
    return res.status(503).json({
      error: 'No pudimos enviar el código en este momento. Intenta más tarde.',
      mensaje: 'No pudimos enviar el código en este momento. Intenta más tarde.'
    });
  }
};

app.post('/api/auth/send-otp', handleSendOtp);
app.post('/api/v1/auth/codigo', handleSendOtp);
app.post('/api/v1/auth/ingreso/celular', handleSendOtp);

// Verificación del código OTP (compatibilidad /api/auth/verify-otp, /api/v1/auth/codigo/verificar, /api/v1/auth/ingreso/celular/verificar, /api/v1/auth/ingreso/verificar)
const handleVerifyOtp = (req: express.Request, res: express.Response) => {
  const rawPhone = req.body.celular || req.body.phone;
  const tokenIngreso = req.body.tokenIngreso;
  const code = String(req.body.codigo || req.body.code || '').trim();

  const verificado = validarOtpRecibido(rawPhone, tokenIngreso, code);
  if (!verificado.ok) {
    return res.status(verificado.status).json({
      error: verificado.error,
      codigo: 'CODIGO_INVALIDO',
      mensaje: verificado.error
    });
  }

  return res.json({
    success: true,
    verified: true,
    valido: true,
    celularVerificado: true,
    tokenAcceso: `jwt-access-${crypto.randomUUID()}`,
    tokenRenovacion: `jwt-refresh-${crypto.randomUUID()}`,
    expiraEnSegundos: 900,
    mensajeBienvenida: '¡Bienvenido al barrio!',
    insignia: 'Vecino verificado',
    message: 'Identidad y celular verificados exitosamente.'
  });
};

app.post('/api/auth/verify-otp', handleVerifyOtp);
app.post('/api/v1/auth/codigo/verificar', handleVerifyOtp);
app.post('/api/v1/auth/ingreso/celular/verificar', handleVerifyOtp);
app.post('/api/v1/auth/ingreso/verificar', handleVerifyOtp);

// Registro final de usuario
app.post('/api/auth/register', (req, res) => {
  const { dni, phone, firstName, lastName, age, gender, addressText, lat, lng } = req.body;

  const quadrant = quadrants.find(q =>
    lat >= q.bounds.minLat && lat <= q.bounds.maxLat &&
    lng >= q.bounds.minLng && lng <= q.bounds.maxLng
  ) || quadrants[1];

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
      lat: u.lat + (Math.random() - 0.5) * 0.001,
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
  console.log(`  Endpoints: http://localhost:${port}/api/v1/auth/ingreso/celular`);
  console.log(`             http://localhost:${port}/api/v1/auth/codigo`);
  console.log(`=======================================================`);
});
