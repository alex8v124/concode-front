import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { DniCameraScanner } from '../components/DniCameraScanner';

interface Props {
  onBack: () => void;
  onSuccessRecovery: (userData: { dni: string; firstName: string; lastName: string }) => void;
}

type OpcionPerdida = 'celular' | 'correo' | 'los_dos';

export const RestablecerAccesoScreen: React.FC<Props> = ({ onBack, onSuccessRecovery }) => {
  const [opcion, setOpcion] = useState<OpcionPerdida>('celular');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleContinuar = () => {
    setIsScannerOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Superior */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backCircleBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.stepTitle}>Paso 1 de 4</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Barra de Progreso de 4 Segmentos */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Restablecer tu acceso</Text>
          <Text style={styles.subtitle}>
            Confirmaremos que eres tú con tu DNI y registrarás un nuevo medio para recibir tu código.
          </Text>

          <Text style={styles.questionLabel}>¿Qué perdiste?</Text>

          {/* Opción 1: Mi número de celular */}
          <TouchableOpacity 
            style={[styles.radioCard, opcion === 'celular' && styles.radioCardSelected]}
            onPress={() => setOpcion('celular')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={opcion === 'celular' ? 'radio-button-on' : 'radio-button-off'} 
              size={22} 
              color={opcion === 'celular' ? '#144e40' : '#9ca3af'} 
            />
            <Text style={[styles.radioCardText, opcion === 'celular' && styles.radioCardTextSelected]}>
              Mi número de celular
            </Text>
          </TouchableOpacity>

          {/* Opción 2: Mi correo */}
          <TouchableOpacity 
            style={[styles.radioCard, opcion === 'correo' && styles.radioCardSelected]}
            onPress={() => setOpcion('correo')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={opcion === 'correo' ? 'radio-button-on' : 'radio-button-off'} 
              size={22} 
              color={opcion === 'correo' ? '#144e40' : '#9ca3af'} 
            />
            <Text style={[styles.radioCardText, opcion === 'correo' && styles.radioCardTextSelected]}>
              Mi correo
            </Text>
          </TouchableOpacity>

          {/* Opción 3: Los dos */}
          <TouchableOpacity 
            style={[styles.radioCard, opcion === 'los_dos' && styles.radioCardSelected]}
            onPress={() => setOpcion('los_dos')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={opcion === 'los_dos' ? 'radio-button-on' : 'radio-button-off'} 
              size={22} 
              color={opcion === 'los_dos' ? '#144e40' : '#9ca3af'} 
            />
            <Text style={[styles.radioCardText, opcion === 'los_dos' && styles.radioCardTextSelected]}>
              Los dos
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />

          {/* Botón Continuar */}
          <TouchableOpacity 
            style={styles.actionBtnDark}
            onPress={handleContinuar}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnDarkText}>Continuar</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Modal de Cámara para Escanear DNI */}
        <DniCameraScanner
          visible={isScannerOpen}
          validarConBackend={true}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(data) => {
            setIsScannerOpen(false);
            Alert.alert(
              '¡Identidad confirmada!',
              `Hola ${data.firstName}, hemos verificado tu DNI ${data.dni}. Tu acceso ha sido restaurado exitosamente.`
            );
            onSuccessRecovery({
              dni: data.dni,
              firstName: data.firstName,
              lastName: data.lastName,
            });
          }}
          onScanError={() => {
            setIsScannerOpen(false);
            Alert.alert(
              'Error de escaneo',
              'No se pudo leer el código del DNI. Intenta nuevamente con buena iluminación.'
            );
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
    marginBottom: 28,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    gap: 14,
  },
  radioCardSelected: {
    borderColor: '#144e40',
    backgroundColor: '#f6fbf9',
  },
  radioCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  radioCardTextSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  actionBtnDark: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
