import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface Props {
  onBack: () => void;
  onRetry: () => void;
  onManual: () => void;
}

export const OcrErrorScreen: React.FC<Props> = ({ onBack, onRetry, onManual }) => {
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        {/* Círculo durazno / salmón suave (Figma 7) */}
        <View style={styles.warningCircle}>
          <View style={styles.innerDot} />
        </View>

        <Text style={styles.title}>No pudimos leer tu DNI</Text>
        <Text style={styles.subtitle}>Prueba de nuevo con estos consejos:</Text>

        <View style={styles.tipsBox}>
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>Busca buena luz y evita reflejos</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>Coloca el DNI plano y completo</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>Limpia el lente de la cámara</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryButton} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onManual} activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Ingresar mis datos a mano</Text>
        </TouchableOpacity>
      </View>
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
  warningCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fde5df',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  innerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f28f80',
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
  tipsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tipItem: {
    paddingVertical: 10,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#141c18',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  buttonGroup: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#144e40',
    fontSize: 14,
    fontWeight: '600',
  },
});
