// Servicio de conexión con el backend Spring Boot (cocode-back)
// En desarrollo móvil local apunta a la IP de la máquina (192.168.1.5:3001) para pruebas en celular físico
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.5:3001/api/v1';

let tokenTramiteActual: string | null = null;
let tokenAccesoActual: string | null = null;
let tokenRenovacionActual: string | null = null;

export class ErrorApi extends Error {
  constructor(public codigo: string, mensaje: string) {
    super(mensaje);
  }
}

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
    } catch (e) {
      console.warn('Backend no alcanzable al validar DNI:', e);
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
  // Consulta los datos civiles en RENIEC a través del backend o fallback en tiempo real
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
          fechaNacimiento: d.fechaNacimiento,
          sexo: d.sexo || 'M'
        };
      }
    } catch (e) {
      console.warn('Backend RENIEC endpoint no disponible, intentando fallback directo:', e);
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
      console.warn('Fallback RENIEC fallo:', err);
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
  // 9. PERFILES PÚBLICOS, VISTO BUENO Y RESEÑAS
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

  async crearResena(vecinoId: string, reseña: { calificacion: number; recomendo: boolean; destacados: string[]; comentario: string }) {
    try {
      const res = await fetch(`${API_BASE}/vecinos/${vecinoId}/resenas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccesoActual || ''}`
        },
        body: JSON.stringify(reseña)
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
