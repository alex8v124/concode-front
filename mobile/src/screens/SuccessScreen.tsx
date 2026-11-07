import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface Props {
  userName: string;
  onEnter: () => void;
}

export const SuccessScreen: React.FC<Props> = ({ onEnter }) => {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        {/* Círculo verde con check blanco (Figma 8) */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>¡Bienvenida al barrio!</Text>
        
        <Text style={styles.subtitle}>
          Tu identidad y tu domicilio están verificados. Ya eres parte de tu comunidad.
        </Text>

        <View style={styles.pill}>
          <Text style={styles.pillText}>Vecina verificada</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.enterButton} onPress={onEnter} activeOpacity={0.85}>
        <Text style={styles.enterButtonText}>Entrar a mi barrio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'space-between',
    backgroundColor: '#f6f8f5',
  },
  centerContent: {
    alignItems: 'center',
    marginVertical: 'auto',
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#144e40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141c18',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#4e5650',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  pill: {
    backgroundColor: '#e3f2ec',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#144e40',
  },
  enterButton: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  enterButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
