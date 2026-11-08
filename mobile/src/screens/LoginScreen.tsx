import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { DniCameraScanner } from '../components/DniCameraScanner';

interface Props {
  onBack: () => void;
  onContinue: (phone: string) => void;
  onScanError: () => void;
  onScanSuccess?: (data: { firstName: string; lastName: string; age: string; gender: string; dni: string }) => void;
}

export const LoginScreen: React.FC<Props> = ({ onBack, onContinue, onScanError, onScanSuccess }) => {
  const [phone, setPhone] = useState('987654321');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedDni, setScannedDni] = useState('');

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Inicia sesión</Text>

        {/* Viewfinder Card */}
        <TouchableOpacity 
          style={styles.viewfinder} 
          activeOpacity={0.85} 
          onPress={() => setIsScannerOpen(true)}
        >
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          
          <Text style={styles.scanTitle}>
            {scannedDni ? `✓ DNI: ${scannedDni} (Leído)` : 'Escanea tu DNI para iniciar sesión'}
          </Text>
          <Text style={styles.scanSubtitle}>
            {scannedDni ? 'Toca para escanear nuevamente' : 'Coloca el DNI dentro del marco'}
          </Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número de celular</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="9 _ _ _ _ _ _ _ _"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.helperText}>
            Te enviaremos un código de 4 dígitos por mensaje de texto.
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.continueButton, phone.length < 9 && styles.buttonDisabled]} 
        onPress={() => phone.length >= 9 && onContinue(phone)}
        disabled={phone.length < 9}
      >
        <Text style={[styles.continueButtonText, phone.length < 9 && styles.buttonDisabledText]}>
          Continuar
        </Text>
      </TouchableOpacity>

      {/* Modal de Cámara para Escanear DNI */}
      <DniCameraScanner
        visible={isScannerOpen}
        validarConBackend={false}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(data) => {
          setScannedDni(data.dni);
          if (onScanSuccess) {
            onScanSuccess(data);
          }
        }}
        onScanError={() => {
          onScanError();
        }}
      />
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
    marginBottom: 16,
  },
  viewfinder: {
    height: 155,
    backgroundColor: '#181c1a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
    marginBottom: 20,
  },
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 16,
    height: 16,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#f2ab27',
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#f2ab27',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#f2ab27',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#f2ab27',
  },
  scanTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  scanSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#141c18',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#141c18',
  },
  helperText: {
    fontSize: 11,
    color: '#4e5650',
    lineHeight: 16,
  },
  continueButton: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ded8cc',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabledText: {
    color: '#787165',
  },
});
