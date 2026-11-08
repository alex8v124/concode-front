import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DniCameraScanner, DniEscaneado } from '../components/DniCameraScanner';

interface Props {
  phone: string;
  onBack: () => void;
  onScanSuccess: (data: DniEscaneado) => void;
  onScanError: () => void;
}

export const LoginDniStepScreen: React.FC<Props> = ({
  phone,
  onBack,
  onScanSuccess,
  onScanError,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabecera Superior */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={22} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.stepTitle}>Paso 2 de 2 · Verificación 2FA</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Barra de Progreso de 2 Segmentos (ambos activos) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={16} color="#144e40" />
            <Text style={styles.verifiedBadgeText}>
              Código verificado ({phone})
            </Text>
          </View>

          <Text style={styles.mainTitle}>Escanea tu DNI para entrar</Text>
          <Text style={styles.subtitle}>
            Como segundo factor de seguridad, apunta la cámara al reverso de tu DNI. La captura se realizará automáticamente.
          </Text>

          {/* Tarjeta de Visor de DNI */}
          <TouchableOpacity
            style={styles.viewfinderCard}
            onPress={() => setIsScannerOpen(true)}
            activeOpacity={0.9}
          >
            <View style={styles.dniFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />

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

          {/* Banner de Garantía de Privacidad */}
          <View style={styles.privacyBanner}>
            <Feather name="shield" size={18} color="#144e40" style={{ marginTop: 1 }} />
            <Text style={styles.privacyText}>
              Verificación de 2 factores activa: comprobamos tu código y tu DNI físico para proteger a tu comunidad.
            </Text>
          </View>

          <View style={{ height: 24 }} />

          <TouchableOpacity
            style={styles.scanActionBtn}
            onPress={() => setIsScannerOpen(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="line-scan" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.scanActionBtnText}>Escanear DNI y entrar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal con Cámara en Vivo y OCR automático */}
        <DniCameraScanner
          visible={isScannerOpen}
          validarConBackend={true}
          title="Verificación 2FA · Escanea tu DNI"
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(data) => {
            setIsScannerOpen(false);
            onScanSuccess(data);
          }}
          onScanError={() => {
            setIsScannerOpen(false);
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
  backBtn: {
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
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#d6eee2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#144e40',
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
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d6eee2',
    borderRadius: 16,
    padding: 16,
    gap: 12,
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
    backgroundColor: '#144e40',
    borderRadius: 16,
    height: 52,
  },
  scanActionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
