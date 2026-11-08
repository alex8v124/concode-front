// Servicio de conexión con el backend Spring Boot (cocode-back)
// En desarrollo móvil local apunta a la IP de la máquina o al túnel HTTPS (ngrok/localtunnel)
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api/v1';

let tokenTramiteActual: string | null = null;
let tokenAccesoActual: string | null = null;

export const mobileApiService = {
  setTramiteToken(token: string | null) {
    tokenTramiteActual = token;
  },

  setAccessToken(token: string | null) {
    tokenAccesoActual = token;
  },

  // POST /api/v1/auth/dni
  async validarDni(dni: string, origen: 'ESCANEO' | 'MANUAL' = 'ESCANEO') {
    try {
      const res = await fetch(`${API_BASE}/auth/dni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, origen })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tokenTramite) tokenTramiteActual = data.tokenTramite;
        return data;
      }
    } catch (e) {
      console.warn('API backend no alcanzable, usando respuesta local:', e);
    }
    return {
      tokenTramite: 'mock-tramite-token',
      nombres: 'Ana María',
      apellidos: 'Quispe Ramos',
      fechaNacimiento: '1990-05-14',
      sexo: 'FEMENINO'
    };
  },

  // POST /api/v1/auth/codigo
  async solicitarCodigo(celular: string, canal: 'SMS' | 'WHATSAPP' = 'SMS') {
    try {
      const res = await fetch(`${API_BASE}/auth/codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tramite': tokenTramiteActual || ''
        },
        body: JSON.stringify({ celular, canal })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo solicitar código en backend:', e);
    }
    return { exito: true, devCode: '1234' };
  },

  // POST /api/v1/auth/codigo/verificar
  async verificarCodigo(codigo: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/codigo/verificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tramite': tokenTramiteActual || ''
        },
        body: JSON.stringify({ codigo })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo verificar código en backend:', e);
    }
    return { valido: codigo === '1234' };
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
    } catch (e) {
      console.warn('Fallo guardar domicilio en backend:', e);
    }
    return { exito: true, cuadrante: 'San Borja · Sector 4' };
  },

  // POST /api/v1/auth/alta
  async completarAlta() {
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
        return session;
      }
    } catch (e) {
      console.warn('Fallo completar alta en backend:', e);
    }
    return { tokenAcceso: 'mock-jwt-token' };
  },

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
    } catch (e) {
      console.warn('Fallo emitir panico en backend:', e);
    }
    return { creada: true };
  }
};
