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

interface Props {
  onBack: () => void;
  onContinue: (identificador: string) => void;
  onRegister: () => void;
  onRestablecerAcceso: () => void;
  onScanSuccess?: (data: { firstName: string; lastName: string; age: string; gender: string; dni: string }) => void;
  onScanError: () => void;
}

export const LoginScreen: React.FC<Props> = ({ 
  onBack, 
  onContinue, 
  onRegister,
  onRestablecerAcceso 
}) => {
  const [tab, setTab] = useState<'celular' | 'correo'>('celular');
  const [phone, setPhone] = useState('987 654 321');
  const [email, setEmail] = useState('');

  const isValid = tab === 'celular' ? phone.trim().length >= 9 : email.includes('@');

  const handleEnviarCodigo = () => {
    if (!isValid) return;
    const valor = tab === 'celular' ? phone.replace(/\s/g, '') : email.trim();
    onContinue(valor);
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
          Escribe tu celular o correo y te enviamos un código para entrar.
        </Text>

        {/* Selector Pestañas: Celular / Correo */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity 
            style={[styles.segmentBtn, tab === 'celular' && styles.segmentBtnActive]}
            onPress={() => setTab('celular')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, tab === 'celular' && styles.segmentTextActive]}>
              Celular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, tab === 'correo' && styles.segmentBtnActive]}
            onPress={() => setTab('correo')}
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
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="987 654 321"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        ) : (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.emailInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="vecino@correo.com"
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        {/* Botón Enviarme el código */}
        <TouchableOpacity 
          style={[styles.actionBtnDark, !isValid && styles.btnDisabled]}
          onPress={handleEnviarCodigo}
          disabled={!isValid}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnDarkText}>Enviarme el código</Text>
        </TouchableOpacity>

        <View style={{ height: 28 }} />

        {/* Tarjeta: ¿Perdiste tu celular o correo? Recupera tu cuenta escaneando tu DNI */}
        <TouchableOpacity 
          style={styles.recoveryCard}
          onPress={onRestablecerAcceso}
          activeOpacity={0.8}
        >
          <View style={styles.recoveryIconBadge}>
            <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#b93815" />
          </View>
          <View style={styles.recoveryTextContainer}>
            <Text style={styles.recoveryTitle}>¿Perdiste tu celular o correo?</Text>
            <Text style={styles.recoverySubtitle}>Recupera tu cuenta escaneando tu DNI</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </TouchableOpacity>

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
  recoveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  recoveryIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ffedd5',
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
