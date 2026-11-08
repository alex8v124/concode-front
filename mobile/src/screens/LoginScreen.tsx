import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  formatearCelularAlEscribir,
  esCelularPeruValido,
  limpiarDigitosCelularPeru,
} from '../utils/phone';

interface Props {
  onBack: () => void;
  onContinue: (identificador: string, canal?: 'SMS' | 'WHATSAPP') => Promise<void> | void;
  onRegister: () => void;
}

export const LoginScreen: React.FC<Props> = ({ 
  onBack, 
  onContinue, 
  onRegister,
}) => {
  const [tab, setTab] = useState<'celular' | 'correo'>('celular');
  const [phone, setPhone] = useState('987 654 321');
  const [canal, setCanal] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const digitosCelular = limpiarDigitosCelularPeru(phone);
  const celularValido = esCelularPeruValido(phone);
  const isValid = tab === 'celular' ? celularValido : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handlePhoneChange = (text: string) => {
    setErrorMsg('');
    setPhone(formatearCelularAlEscribir(text));
  };

  const handleEnviarCodigo = async () => {
    if (!isValid || isSending) return;
    setErrorMsg('');
    setIsSending(true);
    try {
      const valor = tab === 'celular' ? digitosCelular : email.trim();
      await onContinue(valor, canal);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'No pudimos enviar el código.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Cabecera con Botón Volver */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backCircleBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <Text style={styles.mainTitle}>Hola de nuevo, vecino</Text>
        <Text style={styles.subtitle}>
          Paso 1 de 2 · Ingresa tu celular o correo para recibir tu código de verificación. Luego confirmarás tu identidad escaneando tu DNI.
        </Text>

        {/* Selector Pestañas: Celular / Correo */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity 
            style={[styles.segmentBtn, tab === 'celular' && styles.segmentBtnActive]}
            onPress={() => {
              setTab('celular');
              setErrorMsg('');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, tab === 'celular' && styles.segmentTextActive]}>
              Celular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, tab === 'correo' && styles.segmentBtnActive]}
            onPress={() => {
              setTab('correo');
              setErrorMsg('');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, tab === 'correo' && styles.segmentTextActive]}>
              Correo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input: Celular con +51 o Correo */}
        {tab === 'celular' ? (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Número de celular</Text>
            <View style={styles.phoneRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+51</Text>
              </View>
              <TextInput
                style={[
                  styles.phoneInput,
                  digitosCelular.length > 0 && !celularValido && styles.phoneInputWarning,
                ]}
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={11}
                placeholder="987 654 321"
                placeholderTextColor="#9ca3af"
              />
            </View>
            {digitosCelular.length > 0 && !digitosCelular.startsWith('9') && (
              <Text style={styles.validationHint}>
                El número de celular en Perú debe empezar con 9 y tener 9 dígitos.
              </Text>
            )}

            {/* Selector de Canal: SMS o WhatsApp */}
            <View style={styles.channelRow}>
              <Text style={styles.channelLabel}>Recibir por:</Text>
              <TouchableOpacity
                style={[styles.channelChip, canal === 'SMS' && styles.channelChipActive]}
                onPress={() => setCanal('SMS')}
                activeOpacity={0.8}
              >
                <Feather name="smartphone" size={14} color={canal === 'SMS' ? '#ffffff' : '#4b5563'} />
                <Text style={[styles.channelChipText, canal === 'SMS' && styles.channelChipTextActive]}>
                  SMS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.channelChip, canal === 'WHATSAPP' && styles.channelChipActive]}
                onPress={() => setCanal('WHATSAPP')}
                activeOpacity={0.8}
              >
                <Feather name="message-square" size={14} color={canal === 'WHATSAPP' ? '#ffffff' : '#4b5563'} />
                <Text style={[styles.channelChipText, canal === 'WHATSAPP' && styles.channelChipTextActive]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.emailInput}
              value={email}
              onChangeText={(t) => {
                setErrorMsg('');
                setEmail(t);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="vecino@correo.com"
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        {Boolean(errorMsg) && (
          <Text style={styles.errorText}>{errorMsg}</Text>
        )}

        {/* Botón Enviarme el código */}
        <TouchableOpacity 
          style={[styles.actionBtnDark, (!isValid || isSending) && styles.btnDisabled]}
          onPress={handleEnviarCodigo}
          disabled={!isValid || isSending}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnDarkText}>
            {isSending ? 'Enviando código...' : 'Enviarme el código'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />

        {/* Banner informativo de Verificación de 2 Factores (Código + DNI) */}
        <View style={styles.twoFactorBanner}>
          <View style={styles.twoFactorIconBadge}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color="#144e40" />
          </View>
          <View style={styles.recoveryTextContainer}>
            <Text style={styles.recoveryTitle}>Acceso seguro en 2 pasos (2FA)</Text>
            <Text style={styles.recoverySubtitle}>
              1. Verificamos tu código · 2. Escaneas tu DNI con la cámara para ingresar
            </Text>
          </View>
        </View>

        {/* Enlace al Registro */}
        <View style={styles.footerLinkRow}>
          <Text style={styles.footerText}>¿Eres nuevo? </Text>
          <TouchableOpacity onPress={onRegister} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Crea tu cuenta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  segmentTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prefixBox: {
    width: 64,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  phoneInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  phoneInputWarning: {
    borderColor: '#f59e0b',
  },
  validationHint: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 6,
    fontWeight: '500',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  channelLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  channelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  channelChipActive: {
    backgroundColor: '#144e40',
    borderColor: '#144e40',
  },
  channelChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  channelChipTextActive: {
    color: '#ffffff',
  },
  emailInput: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  actionBtnDark: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  actionBtnDarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  twoFactorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6f2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cde4d8',
  },
  twoFactorIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#d6eee2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recoveryTextContainer: {
    flex: 1,
  },
  recoveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  recoverySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#144e40',
  },
});
