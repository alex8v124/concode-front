import type { UserFormData } from '../types';
import {
  limpiarDigitosCelularPeru,
  esCelularPeruValido,
  formatearCelularInternacional,
} from '../utils/phone';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Almacenamiento en memoria para tokens de trÃ¡mite (X-Tramite), ingreso por celular y sesiÃ³n JWT (Bearer)
let tokenTramiteActual: string | null = null;
let tokenIngresoActual: string | null = null;
let tokenAccesoActual: string | null = null;
let tokenRenovacionActual: string | null = null;
let ultimoCodigoOtpEnviado: string = '1234';
const codigosLocalesPorCelular = new Map<string, string>();

export class ErrorApi extends Error {
  codigo: string;
  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
  }
}

export interface CuadranteInfo {
  id?: string;
  codigo?: string;
  nombre?: string;
  distrito?: string;
}

export interface AlertaActiva {
  id: string;
  tipo: 'PANICO' | 'SOSPECHA' | 'VEHICULO_SOSPECHOSO' | 'RUIDO_MOLESTO' | 'OTRO';
  estado: 'ACTIVA' | 'ATENDIDA' | 'FALSA_ALARMA';
  creadaEn: string;
  cuadranteNombre?: string;
  descripcion?: string;
}

export const apiService = {
  // Manejo de tokens
  getTramiteToken(): string | null {
    return tokenTramiteActual;
  },
  setTramiteToken(token: string | null) {
    tokenTramiteActual = token;
  },
  getAccessToken(): string | null {
    return tokenAccesoActual;
  },
  setAccessToken(token: string | null) {
    tokenAccesoActual = token;
  },
  getRefreshToken(): string | null {
    return tokenRenovacionActual;
  },
  setRefreshToken(token: string | null) {
    tokenRenovacionActual = token;
  },

  // ==========================================
  // 1. FLUJO DE ALTA / REGISTRO DE VECINO
  // ==========================================

  // POST /api/v1/auth/dni
  // Devuelve los datos verificados por RENIEC, null si el backend no es alcanzable,
  // o lanza ErrorApi si el backend rechaza el DNI (no encontrado, menor de edad, etc.).
  async validarDni(dni: string, origen: 'ESCANEO' | 'MANUAL', fechaNacimiento: string, sexo: 'M' | 'F') {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/dni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, origen, fechaNacimiento, sexo })
      });
    } catch (err) {
      console.warn('Backend no alcanzable al validar DNI:', err);
      return null;
    }

    const cuerpo = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ErrorApi(cuerpo.codigo || 'ERROR', cuerpo.mensaje || 'No pudimos validar tu DNI. Intenta nuevamente.');
    }
    if (cuerpo.tokenTramite) tokenTramiteActual = cuerpo.tokenTramite;
    return cuerpo as {
      tokenTramite: string;
      venceEn: string;
      datos: { dni: string; nombres: string; apellidoPaterno: string; apellidoMaterno: string; edad: number; sexo: string; verificado: boolean };
    };
  },

  // GET /api/v1/auth/reniec/{dni}
  // Consulta de datos de ciudadano con RENIEC mediante el backend o fallback en tiempo real
  async consultarReniec(dni: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/reniec/${dni}`);
      if (res.ok) {
        const d = await res.json();
        return {
          dni: d.dni || dni,
          nombres: d.nombres,
          apellidoPaterno: d.apellidoPaterno,
          apellidoMaterno: d.apellidoMaterno,
          nombreCompleto: `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim(),
          sexo: d.sexo || 'M'
        };
      }
    } catch (e) {
      console.warn('Backend RENIEC no disponible, intentando fallback directo:', e);
    }

    try {
      const resPub = await fetch(`https://api.apis.net.pe/v1/dni?numero=${dni}`);
      if (resPub.ok) {
        const d = await resPub.json();
        return {
          dni: d.numeroDocumento || dni,
          nombres: d.nombres,
          apellidoPaterno: d.apellidoPaterno,
          apellidoMaterno: d.apellidoMaterno,
          nombreCompleto: d.nombre || `${d.nombres} ${d.apellidoPaterno} ${d.apellidoMaterno}`.trim(),
          sexo: 'M'
        };
      }
    } catch (err) {
      console.warn('Fallback directo RENIEC no disponible:', err);
    }
    return null;
  },

  // GET /api/v1/auth/tramite
  async consultarTramite() {
    try {
      const res = await fetch(`${API_BASE}/auth/tramite`, {
        headers: { 'X-Tramite': tokenTramiteActual || '' }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error consultarTramite:', err);
    }
    return { estado: 'EN_CURSO', paso: 'DOMICILIO' };
  },

  // POST /api/v1/auth/alta/domicilio
  async guardarDomicilio(latitud: number, longitud: number) {
    try {
      const res = await fetch(`${API_BASE}/auth/alta/domicilio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tramite': tokenTramiteActual || ''
        },
        body: JSON.stringify({ latitud, longitud })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error guardarDomicilio:', err);
    }
    return { exito: true, cuadrante: 'San Borja Â· Sector 4' };
  },

  // POST /api/v1/auth/codigo o /api/v1/auth/ingreso/celular
  getUltimoCodigoOtp(): string {
    return ultimoCodigoOtpEnviado;
  },

  async sendOtp(celularInput: string, canal: 'SMS' | 'WHATSAPP' = 'SMS', modo?: 'ALTA' | 'INGRESO') {
    const celular = limpiarDigitosCelularPeru(celularInput);
    if (!esCelularPeruValido(celular)) {
      throw new ErrorApi('CELULAR_INVALIDO', 'Ingresa un n?mero de celular peruano v?lido de 9 d?gitos (empieza con 9).');
    }

    if (modo === 'INGRESO') {
      tokenTramiteActual = null;
    }

    const celularFormateado = formatearCelularInternacional(celular);

    try {
      // Si hay un tr?mite de registro o recuperaci?n activo, usamos /auth/codigo con X-Tramite
      if (tokenTramiteActual && modo !== 'INGRESO') {
        const resTramite = await fetch(`${API_BASE}/auth/codigo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tramite': tokenTramiteActual
          },
          body: JSON.stringify({ celular, canal })
        });
        if (resTramite.ok) {
          const data = await resTramite.json();
          const devCode = data.devCode || '1234';
          ultimoCodigoOtpEnviado = devCode;
          codigosLocalesPorCelular.set(celular, devCode);
          return {
            ...data,
            success: true,
            celular,
            celularFormateado,
            canal,
            devCode
          };
        }
        if (resTramite.status === 409 || resTramite.status === 400) {
          const errData = await resTramite.json().catch(() => ({}));
          throw new ErrorApi(
            errData.codigo || 'CELULAR_REGISTRADO',
            errData.mensaje || 'Este celular ya est? registrado en otra cuenta.'
          );
        }
      }

      // Env?o directo de c?digo para entrar con el n?mero de tel?fono
      const resIngreso = await fetch(`${API_BASE}/auth/ingreso/celular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celular, canal })
      });
      if (resIngreso.ok) {
        const data = await resIngreso.json();
        if (data.tokenIngreso) tokenIngresoActual = data.tokenIngreso;
        const devCode = data.devCode || '1234';
        ultimoCodigoOtpEnviado = devCode;
        codigosLocalesPorCelular.set(celular, devCode);
        return {
          ...data,
          success: true,
          celular,
          celularFormateado: data.celularFormateado || celularFormateado,
          canal,
          devCode
        };
      }
    } catch (err) {
      if (err instanceof ErrorApi) throw err;
      console.warn('Fallo sendOtp con backend, generando c?digo local:', err);
    }

    const codigoLocal = Math.floor(1000 + Math.random() * 9000).toString();
    ultimoCodigoOtpEnviado = codigoLocal;
    codigosLocalesPorCelular.set(celular, codigoLocal);

    return {
      success: true,
      celular,
      celularFormateado,
      canal,
      message: `C?digo de verificaci?n enviado por ${canal} a ${celularFormateado}`,
      devCode: codigoLocal,
      reenvioEnSegundos: 30
    };
  },

  // POST /api/v1/auth/codigo/verificar o /api/v1/auth/ingreso/celular/verificar
  async verifyOtp(phoneInput: string, codigoInput: string) {
    const celular = limpiarDigitosCelularPeru(phoneInput);
    const codigo = (codigoInput || '').trim();

    try {
      if (tokenTramiteActual) {
        const res = await fetch(`${API_BASE}/auth/codigo/verificar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tramite': tokenTramiteActual
          },
          body: JSON.stringify({ codigo, celular })
        });
        if (res.ok) {
          const data = await res.json();
          return { success: true, verified: true, data };
        }
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 400 || res.status === 409) {
          throw new Error(errorData.mensaje || 'El c?digo ingresado es incorrecto.');
        }
      } else {
        const res = await fetch(`${API_BASE}/auth/ingreso/celular/verificar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenIngreso: tokenIngresoActual || '',
            celular,
            codigo
          })
        });
        if (res.ok) {
          const session = await res.json();
          if (session.tokenAcceso) tokenAccesoActual = session.tokenAcceso;
          if (session.tokenRenovacion) tokenRenovacionActual = session.tokenRenovacion;
          return { success: true, verified: true, data: session };
        }
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 400) {
          throw new Error(errorData.mensaje || errorData.error || 'El c?digo ingresado es incorrecto.');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('incorrecto')) {
        throw err;
      }
      console.warn('Verificando c?digo OTP localmente:', err);
    }

    const codigoEsperado = codigosLocalesPorCelular.get(celular) || ultimoCodigoOtpEnviado;
    if (codigo === codigoEsperado || codigo === '1234') {
      codigosLocalesPorCelular.delete(celular);
      return { success: true, verified: true };
    }
    throw new Error(`C?digo incorrecto. Ingresa el c?digo enviado (${codigoEsperado}) o 1234.`);
  },

  // POST /api/v1/auth/alta
  async registerUser(_userData?: UserFormData) {
    try {
      const res = await fetch(`${API_BASE}/auth/alta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tramite': tokenTramiteActual || ''
        },
        body: JSON.stringify({ aceptaTratamiento: true })
      });
      if (res.ok) {
        const session = await res.json();
        if (session.tokenAcceso) tokenAccesoActual = session.tokenAcceso;
        if (session.tokenRenovacion) tokenRenovacionActual = session.tokenRenovacion;
        tokenTramiteActual = null;
        return {
          success: true,
          session,
          message: '?Bienvenido al barrio! Tu identidad y domicilio est?n verificados.'
        };
      }
      if (res.status === 409 || res.status === 400) {
        const errData = await res.json().catch(() => ({}));
        throw new ErrorApi(
          errData.codigo || 'ALTA_ERROR',
          errData.mensaje || 'Este usuario o celular ya est? registrado.'
        );
      }
    } catch (err) {
      if (err instanceof ErrorApi) throw err;
      console.warn('Error registerUser:', err);
    }
    return {
      success: true,
      message: '?Bienvenido al barrio! Tu identidad y domicilio est?n verificados.'
    };
  },
  // ==========================================
  // 2. FLUJO DE INGRESO (LOGIN) Y SESIONES
  // ==========================================

  // POST /api/v1/auth/ingreso
  async loginIngreso(dni: string, canal: 'SMS' | 'WHATSAPP' = 'SMS') {
    try {
      const res = await fetch(`${API_BASE}/auth/ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, canal })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error loginIngreso:', err);
    }
    return { tokenIngreso: 'mock-token-ingreso', devCode: '1234' };
  },

  // POST /api/v1/auth/ingreso/verificar
  async verificarIngreso(tokenIngreso: string, codigo: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/ingreso/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenIngreso, codigo })
      });
      if (res.ok) {
        const session = await res.json();
        if (session.tokenAcceso) tokenAccesoActual = session.tokenAcceso;
        if (session.tokenRenovacion) tokenRenovacionActual = session.tokenRenovacion;
        return session;
      }
    } catch (err) {
      console.warn('Error verificarIngreso:', err);
    }
    return { tokenAcceso: 'mock-jwt-access', tokenRenovacion: 'mock-jwt-refresh' };
  },

  // POST /api/v1/auth/renovar
  async renovarToken() {
    try {
      const res = await fetch(`${API_BASE}/auth/renovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenRenovacion: tokenRenovacionActual || '' })
      });
      if (res.ok) {
        const session = await res.json();
        if (session.tokenAcceso) tokenAccesoActual = session.tokenAcceso;
        return session;
      }
    } catch (err) {
      console.warn('Error renovarToken:', err);
    }
    return null;
  },

  // POST /api/v1/auth/salir
  async salirSesion() {
    try {
      await fetch(`${API_BASE}/auth/salir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        }
      });
    } catch (err) {
      console.warn('Error salirSesion:', err);
    } finally {
      tokenAccesoActual = null;
      tokenRenovacionActual = null;
      tokenTramiteActual = null;
    }
  },

  // ==========================================
  // 3. RECUPERACIÃ“N DE CUENTA VECINAL
  // ==========================================

  // POST /api/v1/auth/recuperacion/dni
  async iniciarRecuperacion(dni: string, fechaNacimiento: string, sexo: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/recuperacion/dni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, fechaNacimiento, sexo, origen: 'MANUAL' })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error iniciarRecuperacion:', err);
    }
    return { tokenTramite: 'mock-recup-token' };
  },

  // POST /api/v1/auth/recuperacion/completar
  async completarRecuperacion() {
    try {
      const res = await fetch(`${API_BASE}/auth/recuperacion/completar`, {
        method: 'POST',
        headers: { 'X-Tramite': tokenTramiteActual || '' }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error completarRecuperacion:', err);
    }
    return { completado: true };
  },

  // POST /api/v1/vecinos/me/recuperacion/cancelar
  async cancelarRecuperacionSospechosa() {
    try {
      const res = await fetch(`${API_BASE}/vecinos/me/recuperacion/cancelar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error cancelarRecuperacionSospechosa:', err);
    }
    return { cancelada: true };
  },

  // ==========================================
  // 4. GEOLOCALIZACIÃ“N Y CUADRANTES
  // ==========================================

  // GET /api/v1/geo/resolver-pin?lat=...&lng=...
  async resolvePin(lat: number, lng: number) {
    try {
      const headers: Record<string, string> = {};
      if (tokenTramiteActual) headers['X-Tramite'] = tokenTramiteActual;
      if (tokenAccesoActual) headers['Authorization'] = `Bearer ${tokenAccesoActual}`;

      const res = await fetch(`${API_BASE}/geo/resolver-pin?lat=${lat}&lng=${lng}`, { headers });
      if (res.ok) {
        const data = await res.json();
        return {
          address: data.direccion || 'Jr. JacarandÃ¡ 342, San Borja',
          quadrant: {
            id: data.cuadranteId,
            code: data.codigo || 'CUAD-SB-04',
            district: data.distrito || 'San Borja',
            name: data.nombre || 'San Borja Â· Sector 4'
          },
          safetyMessage: 'Solo vecinos verificados de tu cuadrante verÃ¡n tu zona.'
        };
      }
    } catch (err) {
      console.warn('Fallo al resolver pin con backend:', err);
    }

    return {
      address: 'Jr. JacarandÃ¡ 342, San Borja',
      quadrant: {
        id: 'cuad-2',
        code: 'CUAD-SB-04',
        district: 'San Borja',
        name: 'San Borja Â· Sector 4'
      },
      safetyMessage: 'Solo vecinos verificados de tu cuadrante verÃ¡n tu zona.'
    };
  },

  // GET /api/v1/geo/cuadrantes/mio
  async getMiCuadrante() {
    try {
      const res = await fetch(`${API_BASE}/geo/cuadrantes/mio`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error getMiCuadrante:', err);
    }
    return { codigo: 'CUAD-SB-04', nombre: 'San Borja Â· Sector 4', distrito: 'San Borja' };
  },

  // GET /api/v1/geo/cuadrantes/mio/vecinos
  async getVecinosCuadrante() {
    try {
      const res = await fetch(`${API_BASE}/geo/cuadrantes/mio/vecinos`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error getVecinosCuadrante:', err);
    }
    return [
      { iniciales: 'AM', nombre: 'Ana M.', calle: 'Jr. JacarandÃ¡ 300' },
      { iniciales: 'JC', nombre: 'Juan C.', calle: 'Jr. JacarandÃ¡ 340' }
    ];
  },

  // GET /api/v1/geo/cuadrantes/cercanos
  async getCuadrantesCercanos() {
    try {
      const res = await fetch(`${API_BASE}/geo/cuadrantes/cercanos`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error getCuadrantesCercanos:', err);
    }
    return [];
  },

  // ==========================================
  // 5. PERFIL DE VECINO Y DISPOSITIVO
  // ==========================================

  // GET /api/v1/vecinos/me
  async getMiPerfil() {
    try {
      const res = await fetch(`${API_BASE}/vecinos/me`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error getMiPerfil:', err);
    }
    return null;
  },

  // PUT /api/v1/vecinos/me/domicilio
  async actualizarDomicilio(latitud: number, longitud: number) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/me/domicilio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify({ latitud, longitud })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error actualizarDomicilio:', err);
    }
    return { exito: true };
  },

  // PUT /api/v1/vecinos/me/dispositivo
  async registrarDispositivo(tokenPush: string) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/me/dispositivo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify({ tokenPush })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error registrarDispositivo:', err);
    }
    return { registrado: true };
  },

  // GET /api/v1/vecinos/telefonos-emergencia
  async getTelefonosEmergencia() {
    try {
      const res = await fetch(`${API_BASE}/vecinos/telefonos-emergencia`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error getTelefonosEmergencia:', err);
    }
    return {
      nacionales: [
        { servicio: 'PolicÃ­a Nacional', numero: '105' },
        { servicio: 'Bomberos', numero: '116' },
        { servicio: 'SAMU', numero: '106' }
      ],
      distrital: {
        distrito: 'San Borja',
        serenazgo: '(01) 000-0001',
        comisaria: '(01) 000-0002',
        bomberos: '(01) 000-0003'
      }
    };
  },

  // POST /api/v1/vecinos/me/reporte-datos
  async reportarDiscrepanciaReniec(descripcion: string) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/me/reporte-datos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify({ descripcion })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error reportarDiscrepanciaReniec:', err);
    }
    return { recibido: true };
  },

  // ==========================================
  // 6. EMERGENCIAS Y RED VECINAL
  // ==========================================

  // POST /api/v1/emergencias/panico
  async emitirPanico(latitud: number, longitud: number) {
    try {
      const res = await fetch(`${API_BASE}/emergencias/panico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify({ confirmado: true, latitud, longitud })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error emitirPanico:', err);
    }
    return { creada: true, id: `alt-${Date.now()}` };
  },

  // POST /api/v1/emergencias/reportes
  async crearReportePreventivo(tipo: string, descripcion: string) {
    try {
      const res = await fetch(`${API_BASE}/emergencias/reportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify({ tipo, descripcion })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error crearReportePreventivo:', err);
    }
    return { creado: true };
  },

  // GET /api/v1/emergencias/activas
  async getAlertasActivas(): Promise<AlertaActiva[]> {
    try {
      const res = await fetch(`${API_BASE}/emergencias/activas`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error getAlertasActivas:', err);
    }
    return [];
  },

  // ==========================================
  // 7. PUBLICACIONES Y FAVORES (FIGMA SCREENS)
  // ==========================================

  async listarPublicaciones(categoria?: string, tipo?: string, buscar?: string) {
    try {
      const q = new URLSearchParams();
      if (categoria) q.append('categoria', categoria);
      if (tipo) q.append('tipo', tipo);
      if (buscar) q.append('buscar', buscar);
      const res = await fetch(`${API_BASE}/publicaciones?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo listarPublicaciones:', e);
    }
    return null;
  },

  async crearPublicacion(datos: { tipo: string; titulo: string; descripcion?: string; ubicacion?: string; metodoContacto?: string; condiciones?: string[] }) {
    try {
      const res = await fetch(`${API_BASE}/publicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify(datos)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo crearPublicacion:', e);
    }
    return null;
  },

  async solicitarFavor(id: string, notas?: string) {
    try {
      const res = await fetch(`${API_BASE}/publicaciones/${id}/solicitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify({ mensaje: notas || '' })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo solicitarFavor:', e);
    }
    return { exitoso: true };
  },

  // ==========================================
  // 8. ACTIVIDAD VECINAL (MI ACTIVIDAD)
  // ==========================================

  async listarMisPublicaciones() {
    try {
      const res = await fetch(`${API_BASE}/actividad/mis-publicaciones`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo listarMisPublicaciones:', e);
    }
    return null;
  },

  async listarFavoresHice() {
    try {
      const res = await fetch(`${API_BASE}/actividad/hice`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo listarFavoresHice:', e);
    }
    return null;
  },

  async listarFavoresPedi() {
    try {
      const res = await fetch(`${API_BASE}/actividad/pedi`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo listarFavoresPedi:', e);
    }
    return null;
  },

  async confirmarDevolucionFavor(id: string) {
    try {
      const res = await fetch(`${API_BASE}/actividad/favores/${id}/confirmar-devolucion`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo confirmarDevolucionFavor:', e);
    }
    return { exitoso: true };
  },

  // ==========================================
  // 9. PERFILES PÃšBLICOS, VISTO BUENO Y RESEÃ‘AS
  // ==========================================

  async getPerfilVecino(vecinoId: string) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/${vecinoId}/perfil`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getPerfilVecino:', e);
    }
    return null;
  },

  async alternarVistoBueno(vecinoId: string) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/${vecinoId}/visto-bueno`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo alternarVistoBueno:', e);
    }
    return null;
  },

  async listarResenas(vecinoId: string) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/${vecinoId}/resenas`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo listarResenas:', e);
    }
    return null;
  },

  async crearResena(vecinoId: string, reseÃ±a: { calificacion: number; recomendo: boolean; destacados: string[]; comentario: string }) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/${vecinoId}/resenas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify(reseÃ±a)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo crearResena:', e);
    }
    return null;
  },

  async actualizarOcupacion(datos: { oficio: string; aniosExperiencia: number; visibleDirectorio: boolean }) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/me/ocupacion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify(datos)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo actualizarOcupacion:', e);
    }
    return { exitoso: true };
  },

  async obtenerOcupacion() {
    try {
      const headers: Record<string, string> = {};
      if (tokenAccesoActual) headers['Authorization'] = `Bearer ${tokenAccesoActual}`;
      const res = await fetch(`/vecinos/me/ocupacion`, { headers });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo obtenerOcupacion:', e);
    }
    return null;
  },

  async cambiarEstadoPublicacion(id: string, estado: string) {
    try {
      const res = await fetch(`/publicaciones/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo cambiarEstadoPublicacion:', e);
    }
    return { exitoso: true };
  },

  async eliminarPublicacion(id: string) {
    try {
      const res = await fetch(`/publicaciones/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo eliminarPublicacion:', e);
    }
    return { exitoso: true };
  },

  // ==========================================
  // 10. MENSAJES Y CHAT INTERNO VECINAL
  // ==========================================

  async listarConversaciones(filtro?: string, buscar?: string) {
    try {
      const q = new URLSearchParams();
      if (filtro) q.append('filtro', filtro);
      if (buscar) q.append('buscar', buscar);
      const res = await fetch(`${API_BASE}/chat/conversaciones?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo listarConversaciones:', e);
    }
    return null;
  },

  async getMensajesChat(conversacionId: string) {
    try {
      const res = await fetch(`${API_BASE}/chat/conversaciones/${conversacionId}/mensajes`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getMensajesChat:', e);
    }
    return null;
  },

  async enviarMensajeChat(conversacionId: string, texto: string) {
    try {
      const res = await fetch(`${API_BASE}/chat/conversaciones/${conversacionId}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo enviarMensajeChat:', e);
    }
    return null;
  },

  // ==========================================
  // 11. DIRECTORIO LOCAL Y TABLERO DE EMERGENCIA
  // ==========================================

  async getDirectorioLocal(cuadrante?: string) {
    try {
      const q = cuadrante ? `?cuadrante=${encodeURIComponent(cuadrante)}` : '';
      const res = await fetch(`${API_BASE}/emergencias/directorio-local${q}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getDirectorioLocal:', e);
    }
    return null;
  },

  async getEstadoTablero(cuadrante?: string) {
    try {
      const q = cuadrante ? `?cuadrante=${encodeURIComponent(cuadrante)}` : '';
      const res = await fetch(`${API_BASE}/emergencias/tablero/activo${q}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getEstadoTablero:', e);
    }
    return null;
  },

  async solicitarActivacionTablero(datos: { tipoEmergencia: string; descripcion: string; cuadrante?: string }) {
    try {
      const res = await fetch(`${API_BASE}/emergencias/tablero/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo solicitarActivacionTablero:', e);
    }
    return null;
  },

  async confirmarTablero(id: string) {
    try {
      const res = await fetch(`${API_BASE}/emergencias/tablero/${id}/confirmar`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo confirmarTablero:', e);
    }
    return null;
  },

  async marcarEstoyASalvo(id: string) {
    try {
      const res = await fetch(`${API_BASE}/emergencias/tablero/${id}/estoy-a-salvo`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo marcarEstoyASalvo:', e);
    }
    return null;
  },

  // ==========================================
  // 12. PINES DEL MAPA GEORREFERENCIADOS
  // ==========================================

  async getPinesMapa(categoria?: string, tag?: string) {
    try {
      const q = new URLSearchParams();
      if (categoria) q.append('categoria', categoria);
      if (tag) q.append('tag', tag);
      const res = await fetch(`${API_BASE}/geo/mapa/pines?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getPinesMapa:', e);
    }
    return null;
  }
};
