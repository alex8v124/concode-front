import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import {
  formatearCelularAlEscribir,
  esCelularPeruValido,
  limpiarDigitosCelularPeru,
} from '../utils/phone';

interface Props {
  userData: {
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    dni: string;
    phone?: string;
    address: string;
  };
  onUpdatePhone?: (phone: string) => void;
  onBack: () => void;
  onConfirm: () => Promise<void> | void;
}

export const ConfirmScreen: React.FC<Props> = ({ userData, onUpdatePhone, onBack, onConfirm }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formattedPhone = formatearCelularAlEscribir(userData.phone || '987654321');
  const phoneValid = esCelularPeruValido(userData.phone || '987654321');

  const handlePhoneChange = (text: string) => {
    setErrorMessage('');
    const clean = limpiarDigitosCelularPeru(text);
    onUpdatePhone?.(clean);
  };

  const handleConfirmPress = async () => {
    if (!phoneValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConfirm();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Este número de celular ya está registrado en otra cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.step}>Paso 3 de 3 · Confirma</Text>

        <View style={styles.scannerSuccessBanner}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          
          <Text style={styles.scanTitle}>DNI leído correctamente</Text>
          <Text style={styles.scanSubtitle}>Coloca el DNI dentro del marco</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.badge}>Autollenado</Text>
            </View>
            <View style={styles.filledBox}>
              <Text style={styles.filledText}>{userData.firstName}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Apellido</Text>
              <Text style={styles.badge}>Autollenado</Text>
            </View>
            <View style={styles.filledBox}>
              <Text style={styles.filledText}>{userData.lastName}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>Edad</Text>
                <Text style={styles.badge}>Autollenado</Text>
              </View>
              <View style={styles.filledBox}>
                <Text style={styles.filledText}>{userData.age}</Text>
              </View>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>Sexo</Text>
                <Text style={styles.badge}>Autollenado</Text>
              </View>
              <View style={styles.filledBox}>
                <Text style={styles.filledText}>{userData.gender}</Text>
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Nro. de DNI</Text>
              <Text style={styles.badge}>Autollenado</Text>
            </View>
            <View style={styles.filledBox}>
              <Text style={styles.filledText}>{userData.dni}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Número de celular (recibirás código SMS)</Text>
              <Text style={styles.badge}>+51 Perú</Text>
            </View>
            <View style={styles.phoneInputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+51</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={formattedPhone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={11}
                placeholder="987 654 321"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        {!!errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        <View style={styles.savedDomicilioBtn}>
          <Text style={styles.savedDomicilioText}>📍 Domicilio guardado</Text>
        </View>

        {/* Botón Registrar amarillo resaltado (Figma 5) */}
        <TouchableOpacity
          style={[styles.registerYellowBtn, (!phoneValid || isSubmitting) && styles.btnDisabled]}
          onPress={handleConfirmPress}
          disabled={!phoneValid || isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.registerYellowText}>
            {isSubmitting ? 'Validando y enviando código...' : 'Registrar y enviar código'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
    minHeight: '100%',
    backgroundColor: '#f6f8f5',
  },
  backButton: {
    paddingVertical: 4,
    marginBottom: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#144e40',
  },
  step: {
    fontSize: 12,
    fontWeight: '500',
    color: '#717b73',
    marginBottom: 10,
  },
  scannerSuccessBanner: {
    height: 86,
    backgroundColor: '#181c1a',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
    marginBottom: 16,
  },
  cornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#f2ab27',
  },
  cornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#f2ab27',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#f2ab27',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#f2ab27',
  },
  scanTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  scanSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
  },
  form: {
    gap: 10,
  },
  field: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#141c18',
  },
  badge: {
    fontSize: 10,
    fontWeight: '500',
    color: '#144e40',
    backgroundColor: '#e3f2ec',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filledBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filledText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141c18',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefixBox: {
    width: 52,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141c18',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#141c18',
  },
  bottomSection: {
    gap: 10,
    paddingTop: 16,
  },
  savedDomicilioBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#144e40',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  savedDomicilioText: {
    color: '#144e40',
    fontSize: 13,
    fontWeight: '600',
  },
  registerYellowBtn: {
    backgroundColor: '#f2ab27',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  registerYellowText: {
    color: '#141c18',
    fontSize: 15,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
});
