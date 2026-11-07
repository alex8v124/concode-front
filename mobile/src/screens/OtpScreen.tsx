import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface Props {
  phone: string;
  onBack: () => void;
  onVerify: () => void;
}

export const OtpScreen: React.FC<Props> = ({ phone, onBack, onVerify }) => {
  const [digits, setDigits] = useState(['', '', '', '']);

  const handleChange = (index: number, val: string) => {
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);
  };

  const isReady = digits.every(d => d.length === 1);

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ingresa el código</Text>
        <Text style={styles.subtitle}>Enviamos 4 dígitos por mensaje de texto a tu celular.</Text>

        <View style={styles.phoneBox}>
          <Text style={styles.phoneLabel}>Número de celular</Text>
          <Text style={styles.phoneNumber}>{phone || '987 654 321'}</Text>
        </View>

        <View style={styles.otpRow}>
          {[0, 1, 2, 3].map((i) => (
            <TextInput
              key={i}
              style={styles.otpBox}
              maxLength={1}
              keyboardType="number-pad"
              value={digits[i]}
              onChangeText={(val) => handleChange(i, val)}
            />
          ))}
        </View>

        <TouchableOpacity onPress={() => setDigits(['1', '2', '3', '4'])} style={styles.quickFill}>
          <Text style={styles.quickFillText}>Código de prueba: 1234 (Toca para autollenar)</Text>
        </TouchableOpacity>

        <Text style={styles.timer}>Reenviar código en 0:30</Text>
      </View>

      <TouchableOpacity 
        style={[styles.verifyButton, !isReady && styles.buttonDisabled]} 
        onPress={onVerify}
        disabled={!isReady}
        activeOpacity={0.85}
      >
        <Text style={[styles.verifyButtonText, !isReady && styles.buttonDisabledText]}>
          Verificar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141c18',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#4e5650',
    marginBottom: 16,
  },
  phoneBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  phoneLabel: {
    fontSize: 11,
    color: '#717b73',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141c18',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  otpBox: {
    width: 56,
    height: 58,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#141c18',
  },
  quickFill: {
    padding: 6,
    backgroundColor: '#e3f2ec',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#144e40',
  },
  timer: {
    fontSize: 12,
    color: '#717b73',
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ded8cc',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabledText: {
    color: '#787165',
  },
});
