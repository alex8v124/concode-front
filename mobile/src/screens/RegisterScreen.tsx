import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  userData: {
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    dni: string;
    dniVerified?: boolean;
  };
  onBack: () => void;
  onActivateMap: () => void;
  onScanSuccess: (data: { firstName: string; lastName: string; age: string; gender: string; dni: string }) => void;
  onScanError: () => void;
}

export const RegisterScreen: React.FC<Props> = ({ userData, onBack, onActivateMap, onScanSuccess, onScanError }) => {
  const isScanned = Boolean(userData.dniVerified && userData.firstName);

  const handleScanPress = () => {
    if (!isScanned) {
      onScanSuccess({
        firstName: 'Ana María',
        lastName: 'Quispe Ramos',
        age: '34',
        gender: 'Femenino',
        dni: '00000000',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.step}>Paso 1 de 3 · Tus datos</Text>

        <TouchableOpacity 
          style={[styles.scannerBanner, !isScanned && styles.scannerBannerLarge]} 
          onPress={handleScanPress}
          activeOpacity={0.85}
        >
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          
          <Text style={styles.scanTitle}>
            {isScanned ? '✓ DNI leído correctamente' : 'Escanea tu DNI para registrarte'}
          </Text>
          <Text style={styles.scanSubtitle}>
            {isScanned ? 'Toca para escanear nuevamente' : 'Coloca el DNI dentro del marco'}
          </Text>
        </TouchableOpacity>

        {/* ANTES DEL ESCANEO: Campos ocultos */}
        {!isScanned && (
          <View style={styles.preScanInfoCard}>
            <Text style={styles.preScanTitle}>Verificación de identidad oficial</Text>
            <Text style={styles.preScanText}>
              Tus datos personales (nombre, apellidos, edad y DNI) aparecerán aquí de forma automática tras escanear tu documento para proteger la seguridad de tu comunidad.
            </Text>
            <TouchableOpacity 
              style={styles.scanActionBtn}
              onPress={handleScanPress}
              activeOpacity={0.8}
            >
              <Text style={styles.scanActionBtnText}>📷 Iniciar escaneo de DNI</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DESPUÉS DEL ESCANEO: Campos visibles y NO editables */}
        {isScanned && (
          <View style={styles.form}>
            <View style={styles.fieldHeaderStatus}>
              <Text style={styles.statusVerifiedText}>✓ Datos oficiales leídos de RENIEC</Text>
              <Text style={styles.statusLockedBadge}>No editables</Text>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.badge}>Autollenado</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputNonEditable]}
                value={userData.firstName}
                editable={false}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Apellido</Text>
                <Text style={styles.badge}>Autollenado</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputNonEditable]}
                value={userData.lastName}
                editable={false}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Edad</Text>
                  <Text style={styles.badge}>Autollenado</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.inputNonEditable]}
                  value={userData.age}
                  editable={false}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Sexo</Text>
                  <Text style={styles.badge}>Autollenado</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.inputNonEditable]}
                  value={userData.gender}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Nro. de DNI</Text>
                <Text style={styles.badge}>Autollenado</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputNonEditable]}
                value={userData.dni}
                editable={false}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.mapButton} onPress={onActivateMap} activeOpacity={0.85}>
          <Text style={styles.mapButtonText}>📍 Activar mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButtonDisabled} disabled>
          <Text style={styles.registerButtonText}>Registrar</Text>
        </TouchableOpacity>
        <Text style={styles.disabledHelper}>Se habilita al guardar tu domicilio en el mapa</Text>
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
  scannerBanner: {
    height: 86,
    backgroundColor: '#181c1a',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
    marginBottom: 16,
  },
  scannerBannerLarge: {
    height: 160,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  scanSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
  },
  preScanInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d5dbd3',
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  preScanTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141c18',
    marginBottom: 6,
    textAlign: 'center',
  },
  preScanText: {
    fontSize: 11,
    color: '#4e5650',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  scanActionBtn: {
    backgroundColor: '#144e40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    gap: 10,
  },
  fieldHeaderStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusVerifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#144e40',
  },
  statusLockedBadge: {
    fontSize: 10,
    color: '#717b73',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  field: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
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
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#141c18',
  },
  inputNonEditable: {
    backgroundColor: '#f3f4f6',
    fontWeight: '600',
  },
  bottomSection: {
    gap: 8,
    paddingTop: 16,
  },
  mapButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#144e40',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#144e40',
    fontSize: 13,
    fontWeight: '600',
  },
  registerButtonDisabled: {
    backgroundColor: '#ded8cc',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#787165',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledHelper: {
    fontSize: 11,
    color: '#717b73',
    textAlign: 'center',
  },
});
