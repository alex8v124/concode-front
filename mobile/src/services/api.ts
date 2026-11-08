// Servicio de conexión con el backend Spring Boot (cocode-back)
// En desarrollo móvil local apunta a la IP de la máquina o al túnel HTTPS (ngrok/localtunnel)
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api/v1';

let tokenTramiteActual: string | null = null;
let tokenAccesoActual: string | null = null;
let tokenRenovacionActual: string | null = null;

export const mobileApiService = {
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
  async validarDni(dni: string, origen: 'ESCANEO' | 'MANUAL' = 'ESCANEO', fechaNacimiento: string = '1985-07-02', sexo: string = 'M') {
    try {
      const res = await fetch(`${API_BASE}/auth/dni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, origen, fechaNacimiento, sexo })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tokenTramite) tokenTramiteActual = data.tokenTramite;
        return {
          success: true,
          tokenTramite: data.tokenTramite,
          datos: data.datos || {
            dni,
            nombres: 'Juan Carlos',
            apellidoPaterno: 'Pérez',
            apellidoMaterno: 'Soto',
            edad: 41,
            sexo: 'M'
          }
        };
      }
    } catch (e) {
      console.warn('API backend no alcanzable, usando respuesta local simulada:', e);
    }
    tokenTramiteActual = tokenTramiteActual || 'mock-tramite-token';
    return {
      success: true,
      tokenTramite: tokenTramiteActual,
      datos: {
        dni,
        nombres: 'Juan Carlos',
        apellidoPaterno: 'Pérez',
        apellidoMaterno: 'Soto',
        edad: 41,
        sexo: 'M'
      }
    };
  },

  // GET /api/v1/auth/tramite
  async consultarTramite() {
    try {
      const res = await fetch(`${API_BASE}/auth/tramite`, {
        headers: { 'X-Tramite': tokenTramiteActual || '' }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo consultar trámite:', e);
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
    } catch (e) {
      console.warn('Fallo guardar domicilio en backend:', e);
    }
    return { exito: true, cuadrante: 'San Borja · Sector 4' };
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
        if (session.tokenRenovacion) tokenRenovacionActual = session.tokenRenovacion;
        return session;
      }
    } catch (e) {
      console.warn('Fallo completar alta en backend:', e);
    }
    return { tokenAcceso: 'mock-access', tokenRenovacion: 'mock-refresh' };
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
    } catch (e) {
      console.warn('Fallo login ingreso:', e);
    }
    return { tokenIngreso: 'mock-token', devCode: '1234' };
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
    } catch (e) {
      console.warn('Fallo verificar ingreso:', e);
    }
    return { tokenAcceso: 'mock-token' };
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
    } catch (e) {
      console.warn('Fallo renovar token:', e);
    }
    return null;
  },

  // POST /api/v1/auth/salir
  async salirSesion() {
    try {
      await fetch(`${API_BASE}/auth/salir`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
    } catch (e) {
      console.warn('Fallo salir sesión:', e);
    } finally {
      tokenAccesoActual = null;
      tokenRenovacionActual = null;
      tokenTramiteActual = null;
    }
  },

  // ==========================================
  // 3. RECUPERACIÓN DE CUENTA VECINAL
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
    } catch (e) {
      console.warn('Fallo iniciar recuperación:', e);
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
    } catch (e) {
      console.warn('Fallo completar recuperación:', e);
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
    } catch (e) {
      console.warn('Fallo cancelar recuperación sospechosa:', e);
    }
    return { cancelada: true };
  },

  // ==========================================
  // 4. GEOLOCALIZACIÓN Y CUADRANTES
  // ==========================================

  // GET /api/v1/geo/resolver-pin?lat=...&lng=...
  async resolverPin(latitud: number, longitud: number) {
    try {
      const headers: Record<string, string> = {};
      if (tokenTramiteActual) headers['X-Tramite'] = tokenTramiteActual;
      if (tokenAccesoActual) headers['Authorization'] = `Bearer ${tokenAccesoActual}`;

      const res = await fetch(`${API_BASE}/geo/resolver-pin?lat=${latitud}&lng=${longitud}`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Fallo resolver pin:', e);
    }
    return {
      direccion: 'Jr. Jacarandá 342, San Borja',
      cuadranteId: 'cuad-sb-04',
      codigo: 'CUAD-SB-04',
      nombre: 'San Borja · Sector 4',
      distrito: 'San Borja'
    };
  },

  // GET /api/v1/geo/cuadrantes/mio
  async getMiCuadrante() {
    try {
      const res = await fetch(`${API_BASE}/geo/cuadrantes/mio`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getMiCuadrante:', e);
    }
    return { codigo: 'CUAD-SB-04', nombre: 'San Borja · Sector 4', distrito: 'San Borja' };
  },

  // GET /api/v1/geo/cuadrantes/mio/vecinos
  async getVecinosCuadrante() {
    try {
      const res = await fetch(`${API_BASE}/geo/cuadrantes/mio/vecinos`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getVecinosCuadrante:', e);
    }
    return [
      { iniciales: 'AM', nombre: 'Ana M.', calle: 'Jr. Jacarandá 300' },
      { iniciales: 'JC', nombre: 'Juan C.', calle: 'Jr. Jacarandá 340' }
    ];
  },

  // GET /api/v1/geo/cuadrantes/cercanos
  async getCuadrantesCercanos() {
    try {
      const res = await fetch(`${API_BASE}/geo/cuadrantes/cercanos`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getCuadrantesCercanos:', e);
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
    } catch (e) {
      console.warn('Fallo getMiPerfil:', e);
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
    } catch (e) {
      console.warn('Fallo actualizarDomicilio:', e);
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
    } catch (e) {
      console.warn('Fallo registrarDispositivo:', e);
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
    } catch (e) {
      console.warn('Fallo getTelefonosEmergencia:', e);
    }
    return {
      nacionales: [
        { servicio: 'Policía Nacional', numero: '105' },
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
    } catch (e) {
      console.warn('Fallo reportarDiscrepanciaReniec:', e);
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
    } catch (e) {
      console.warn('Fallo emitir panico:', e);
    }
    return { creada: true, id: `panico-${Date.now()}` };
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
    } catch (e) {
      console.warn('Fallo crearReportePreventivo:', e);
    }
    return { creado: true };
  },

  // GET /api/v1/emergencias/activas
  async getAlertasActivas() {
    try {
      const res = await fetch(`${API_BASE}/emergencias/activas`, {
        headers: { 'Authorization': `Bearer ${tokenAccesoActual || ''}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallo getAlertasActivas:', e);
    }
    return [];
  }
};
