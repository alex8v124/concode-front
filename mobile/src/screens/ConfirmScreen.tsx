import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  userData: {
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    dni: string;
    address: string;
  };
  onBack: () => void;
  onConfirm: () => void;
}

export const ConfirmScreen: React.FC<Props> = ({ userData, onBack, onConfirm }) => {
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
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.savedDomicilioBtn}>
          <Text style={styles.savedDomicilioText}>📍 Domicilio guardado</Text>
        </View>

        {/* Botón Registrar amarillo resaltado (Figma 5) */}
        <TouchableOpacity style={styles.registerYellowBtn} onPress={onConfirm} activeOpacity={0.85}>
          <Text style={styles.registerYellowText}>Registrar</Text>
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
  registerYellowText: {
    color: '#141c18',
    fontSize: 15,
    fontWeight: '700',
  },
});
