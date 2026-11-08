import type { UserFormData } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Almacenamiento en memoria para el token de trámite de alta (X-Tramite) y la sesión JWT
let tokenTramiteActual: string | null = null;
let tokenAccesoActual: string | null = null;

export const apiService = {
  getTramiteToken() {
    return tokenTramiteActual;
  },

  setTramiteToken(token: string | null) {
    tokenTramiteActual = token;
  },

  getAccessToken() {
    return tokenAccesoActual;
  },

  setAccessToken(token: string | null) {
    tokenAccesoActual = token;
  },

  // 1. Paso 1: Validar DNI en RENIEC e iniciar trámite de alta
  // POST /api/v1/auth/dni
  async scanDni(simulateError: boolean = false, dniInput?: string) {
    const dni = dniInput || '00000000';
    try {
      const res = await fetch(`${API_BASE}/auth/dni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni,
          origen: dniInput ? 'MANUAL' : 'ESCANEO'
        })
      });

      if (res.ok) {
        const data = await res.json();
        // data: { tokenTramite, nombres, apellidos, fechaNacimiento, sexo }
        if (data.tokenTramite) {
          tokenTramiteActual = data.tokenTramite;
        }
        return {
          success: true,
          tokenTramite: data.tokenTramite,
          data: {
            dni,
            firstName: data.nombres || 'Ana María',
            lastName: data.apellidos || 'Quispe Ramos',
            age: 34,
            gender: data.sexo === 'FEMENINO' ? 'Femenino' : 'Masculino',
            readStatus: 'DNI leído correctamente'
          }
        };
      }
    } catch (err) {
      console.warn('Backend no disponible, usando fallback simulado:', err);
    }

    if (simulateError) {
      throw new Error('No pudimos leer tu DNI. La imagen está borrosa o tiene reflejos.');
    }

    // Fallback garantizado de desarrollo
    tokenTramiteActual = 'mock-tramite-token-12345';
    return {
      success: true,
      tokenTramite: tokenTramiteActual,
      data: {
        dni,
        firstName: 'Ana María',
        lastName: 'Quispe Ramos',
        age: 34,
        gender: 'Femenino',
        readStatus: 'DNI leído correctamente'
      }
    };
  },

  // 2. Paso 2: Resolver Pin y Guardar Domicilio
  // GET /api/v1/geo/resolver-pin?lat=...&lng=...
  // POST /api/v1/auth/alta/domicilio
  async resolvePin(lat: number, lng: number) {
    try {
      const headers: Record<string, string> = {};
      if (tokenTramiteActual) headers['X-Tramite'] = tokenTramiteActual;
      if (tokenAccesoActual) headers['Authorization'] = `Bearer ${tokenAccesoActual}`;

      const res = await fetch(`${API_BASE}/geo/resolver-pin?lat=${lat}&lng=${lng}`, {
        headers
      });

      if (res.ok) {
        const data = await res.json();
        return {
          address: data.direccion || 'Jr. Jacarandá 342, San Borja',
          quadrant: {
            id: data.cuadranteId,
            code: data.codigo || 'CUAD-SB-04',
            district: data.distrito || 'San Borja',
            name: data.nombre || 'San Borja · Sector 4'
          },
          safetyMessage: 'Solo vecinos verificados de tu cuadrante verán tu zona.'
        };
      }
    } catch (err) {
      console.warn('Fallo al resolver pin con backend:', err);
    }

    return {
      address: 'Jr. Jacarandá 342, San Borja',
      quadrant: {
        id: 'cuad-2',
        code: 'CUAD-SB-04',
        district: 'San Borja',
        name: 'San Borja · Sector 4'
      },
      safetyMessage: 'Solo vecinos verificados de tu cuadrante verán tu zona.'
    };
  },

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
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Fallo al guardar domicilio en backend:', err);
    }
    return { exito: true };
  },

  // 3. Paso 3: Solicitar y Verificar Código OTP
  // POST /api/v1/auth/codigo
  async sendOtp(celular: string, canal: 'SMS' | 'WHATSAPP' = 'SMS') {
    try {
      const res = await fetch(`${API_BASE}/auth/codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tramite': tokenTramiteActual || ''
        },
        body: JSON.stringify({ celular, canal })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Fallo al enviar OTP en backend:', err);
    }

    return {
      success: true,
      message: `Enviamos un código de 4 dígitos por mensaje de texto al número ${celular}.`,
      devCode: '1234'
    };
  },

  // POST /api/v1/auth/codigo/verificar
  async verifyOtp(_phone: string, codigo: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/codigo/verificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tramite': tokenTramiteActual || ''
        },
        body: JSON.stringify({ codigo })
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, verified: true, data };
      }
      const errorData = await res.json();
      throw new Error(errorData.mensaje || 'Código incorrecto');
    } catch (err: unknown) {
      if (codigo === '1234') {
        return { success: true, verified: true };
      }
      const message = err instanceof Error ? err.message : 'Código incorrecto. Ingresa 1234.';
      throw new Error(message);
    }
  },

  // 4. Paso 4: Completar Registro Comunal (Alta)
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
        if (session.tokenAcceso) {
          tokenAccesoActual = session.tokenAcceso;
        }
        return {
          success: true,
          session,
          message: '¡Bienvenida al barrio! Tu identidad y domicilio están verificados.'
        };
      }
    } catch (err) {
      console.warn('Fallo al completar alta en backend:', err);
    }

    return {
      success: true,
      message: '¡Bienvenida al barrio! Tu identidad y domicilio están verificados.'
    };
  },

  // 5. Iniciar sesión por DNI y celular
  // POST /api/v1/auth/ingreso
  async loginIngreso(dni: string, canal: 'SMS' | 'WHATSAPP' = 'SMS') {
    try {
      const res = await fetch(`${API_BASE}/auth/ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, canal })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Fallo login ingreso:', err);
    }
    return { tokenIngreso: 'mock-ingreso-token', devCode: '1234' };
  },

  // 6. Botón de Pánico Vecinal
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
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Fallo emitir panico:', err);
    }
    return { creada: true, id: `alt-${Date.now()}` };
  }
};
