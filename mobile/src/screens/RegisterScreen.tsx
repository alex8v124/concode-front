import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  TextInput
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DniCameraScanner } from '../components/DniCameraScanner';

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

export const RegisterScreen: React.FC<Props> = ({ 
  userData, 
  onBack, 
  onActivateMap, 
  onScanSuccess, 
  onScanError 
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isScanned = Boolean(userData.dniVerified && userData.firstName);

  const handleScanPress = () => {
    setIsScannerOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Cabecera Superior */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.stepTitle}>Paso 1 de 4 · DNI</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Barra de Progreso de 4 Segmentos */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Escanea tu DNI</Text>
          <Text style={styles.subtitle}>
            Leemos tus datos automáticamente y verificamos que seas mayor de edad.
          </Text>

          {/* Tarjeta de Visor / Cámara Simulada de DNI */}
          {!isScanned ? (
            <TouchableOpacity 
              style={styles.viewfinderCard}
              onPress={handleScanPress}
              activeOpacity={0.9}
            >
              {/* Marco con esquinas punteadas teal */}
              <View style={styles.dniFrame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />

                {/* Líneas simuladas de código MRZ */}
                <View style={styles.mrzLinesContainer}>
                  <View style={styles.mrzLine1} />
                  <View style={styles.mrzLine2} />
                  <View style={styles.mrzLine3} />
                </View>
              </View>

              <Text style={styles.viewfinderInstruction}>
                Coloca el reverso del DNI dentro del recuadro
              </Text>
            </TouchableOpacity>
          ) : (
            /* Vista tras escanear: Datos Oficiales leídos */
            <View style={styles.scannedSuccessCard}>
              <View style={styles.scannedHeaderRow}>
                <View style={styles.checkCircleBadge}>
                  <Feather name="check" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scannedTitle}>DNI verificado con éxito</Text>
                  <Text style={styles.scannedSubtitle}>Validado en el Registro Civil</Text>
                </View>
                <TouchableOpacity onPress={handleScanPress}>
                  <Text style={styles.reScanLink}>Re-escanear</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dataPreviewBox}>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Ciudadano:</Text>
                  <Text style={styles.dataValue}>{userData.firstName} {userData.lastName}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Nro. DNI:</Text>
                  <Text style={styles.dataValue}>{userData.dni}</Text>
                </View>
                {Boolean(userData.age) && (
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Edad / Sexo:</Text>
                    <Text style={styles.dataValue}>{userData.age} años · {userData.gender === 'F' || userData.gender === 'Femenino' ? 'Femenino' : 'Masculino'}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Banner de Garantía de Privacidad */}
          <View style={styles.privacyBanner}>
            <Feather name="lock" size={18} color="#144e40" style={styles.lockIcon} />
            <Text style={styles.privacyText}>
              No guardamos la foto de tu DNI. Solo usamos tu nombre, edad y sexo para tu perfil.
            </Text>
          </View>

          <View style={{ height: 24 }} />

          {/* Botón de Acción Principal */}
          {!isScanned ? (
            <TouchableOpacity 
              style={styles.scanActionBtn}
              onPress={handleScanPress}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="line-scan" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.scanActionBtnText}>Escanear DNI</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.continueActionBtn}
              onPress={onActivateMap}
              activeOpacity={0.85}
            >
              <Text style={styles.continueActionBtnText}>Continuar al paso 2 (Ubica tu casa)</Text>
              <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}

        </ScrollView>

        {/* Modal con Cámara en Vivo y OCR */}
        <DniCameraScanner
          visible={isScannerOpen}
          validarConBackend={true}
          modo="ALTA"
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(data) => {
            onScanSuccess(data);
          }}
          onScanError={() => {
            onScanError();
          }}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  progressSegmentFilled: {
    backgroundColor: '#144e40',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  viewfinderCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dniFrame: {
    width: '90%',
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#2dd4bf',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 16,
    marginBottom: 20,
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2dd4bf',
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2dd4bf',
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2dd4bf',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2dd4bf',
  },
  mrzLinesContainer: {
    gap: 6,
  },
  mrzLine1: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    width: '100%',
  },
  mrzLine2: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    width: '85%',
  },
  mrzLine3: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    width: '92%',
  },
  viewfinderInstruction: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  scannedSuccessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#144e40',
    marginBottom: 20,
  },
  scannedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  checkCircleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#144e40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  scannedSubtitle: {
    fontSize: 12,
    color: '#144e40',
    fontWeight: '600',
  },
  reScanLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#144e40',
  },
  dataPreviewBox: {
    backgroundColor: '#f6fbf9',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d6eee2',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  lockIcon: {
    marginTop: 1,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: '#144e40',
    lineHeight: 18,
    fontWeight: '500',
  },
  scanActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    height: 52,
  },
  scanActionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144e40',
    borderRadius: 16,
    height: 52,
  },
  continueActionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
