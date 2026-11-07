export type ScreenId = 
  | 'welcome'          // 1. Bienvenida
  | 'login'            // 2. Iniciar sesión
  | 'register_step1'   // 3. Registro (Paso 1: Tus datos)
  | 'domicilio_step2'  // 4. Domicilio (Paso 2: Tu domicilio / Ubica tu casa)
  | 'confirm_step3'    // 5. Confirmación (Paso 3: Confirma)
  | 'otp_verify'       // 6. Verificación (Código OTP)
  | 'ocr_error'        // 7. Error OCR (No pudimos leer tu DNI)
  | 'welcome_success'  // 8. Cuenta creada (¡Bienvenida al barrio!)
  | 'barrio_home';     // Dashboard Vecinal Activo

export interface UserFormData {
  dni: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phone: string;
  addressText: string;
  lat: number;
  lng: number;
  quadrantName: string;
  dniVerified: boolean;
  addressVerified: boolean;
}

export interface QuadrantInfo {
  id: string;
  code: string;
  district: string;
  name: string;
}

export interface EmergencyAlert {
  id: string;
  userName: string;
  type: 'PANIC' | 'SOSPECHA' | 'ROBO' | 'MEDICA';
  title: string;
  description: string;
  time: string;
  status: 'ACTIVA' | 'RESUELTA';
}
