import { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Extrae únicamente los 9 dígitos nacionales de un celular peruano (+51).
 */
export function limpiarDigitosCelularPeru(valor: string): string {
  const soloDigitos = (valor || '').replace(/\D/g, '');
  if (soloDigitos.startsWith('51') && soloDigitos.length > 9) {
    return soloDigitos.slice(2, 11);
  }
  return soloDigitos.slice(0, 9);
}

/**
 * Formatea en tiempo real un número de celular peruano mientras el usuario escribe (ej. "987 654 321")
 * utilizando libphonenumber-js (AsYouType 'PE').
 */
export function formatearCelularAlEscribir(valor: string): string {
  const digitos = limpiarDigitosCelularPeru(valor);
  if (!digitos) return '';
  const formatter = new AsYouType('PE');
  const resultado = formatter.input(digitos);
  return resultado || digitos;
}

/**
 * Valida si el número ingresado corresponde a un celular móvil peruano válido (+51 9XX XXX XXX)
 * usando libphonenumber-js.
 */
export function esCelularPeruValido(valor: string): boolean {
  const digitos = limpiarDigitosCelularPeru(valor);
  if (!/^9\d{8}$/.test(digitos)) return false;

  const parsed = parsePhoneNumberFromString(digitos, 'PE');
  return Boolean(parsed && parsed.isValid());
}

/**
 * Devuelve el número de celular en formato internacional legible (+51 987 654 321) usando libphonenumber-js.
 */
export function formatearCelularInternacional(valor: string): string {
  const digitos = limpiarDigitosCelularPeru(valor);
  if (!digitos) return '+51 987 654 321';
  const parsed = parsePhoneNumberFromString(digitos, 'PE');
  if (parsed && parsed.isValid()) {
    return parsed.formatInternational();
  }
  return `+51 ${formatearCelularAlEscribir(digitos)}`;
}

/**
 * Devuelve el número de celular en formato E.164 (+51987654321).
 */
export function formatearCelularE164(valor: string): string {
  const digitos = limpiarDigitosCelularPeru(valor);
  const parsed = parsePhoneNumberFromString(digitos, 'PE');
  if (parsed && parsed.isValid()) {
    return parsed.format('E.164');
  }
  return `+51${digitos}`;
}
