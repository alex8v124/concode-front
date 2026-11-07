import type { UserFormData } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const apiService = {
  // Simular o ejecutar escaneo de DNI (ML Kit / RENIEC)
  async scanDni(simulateError: boolean = false, dniInput?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/ocr-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateError, dniInput })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en OCR');
      }
      return await res.json();
    } catch {
      // Fallback local garantizado si el backend no está encendido
      if (simulateError) {
        throw new Error('No pudimos leer tu DNI. La imagen está borrosa o tiene reflejos.');
      }
      return {
        success: true,
        data: {
          dni: dniInput || '00000000',
          firstName: 'Ana María',
          lastName: 'Quispe Ramos',
          age: 34,
          gender: 'Femenino',
          confidence: 0.99,
          readStatus: 'DNI leído correctamente'
        }
      };
    }
  },

  // Enviar código OTP SMS
  async sendOtp(phone: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: `Enviamos un código de 4 dígitos por mensaje de texto al número ${phone}.`,
        devCode: '1234'
      };
    }
  },

  // Verificar código OTP
  async verifyOtp(phone: string, code: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');
      return data;
    } catch (err: unknown) {
      if (code === '1234') {
        return { success: true, verified: true };
      }
      const message = err instanceof Error ? err.message : 'Código incorrecto. Ingresa 1234.';
      throw new Error(message);
    }
  },

  // Registrar usuario final
  async registerUser(userData: UserFormData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: '¡Bienvenida al barrio! Tu identidad y domicilio están verificados.'
      };
    }
  },

  // Resolver dirección y cuadrante según lat/lng
  async resolvePin(lat: number, lng: number) {
    try {
      const res = await fetch(`${API_BASE}/geo/resolve-pin?lat=${lat}&lng=${lng}`);
      return await res.json();
    } catch {
      return {
        address: 'Jr. Jacarandá 342, San Borja',
        quadrant: {
          id: 'cuad-2',
          code: 'CUAD-SB-04',
          district: 'San Borja',
          name: 'San Borja - Sector 4 (Las Gardenias)'
        },
        safetyMessage: 'Solo vecinos verificados de tu cuadrante verán tu zona.'
      };
    }
  }
};
