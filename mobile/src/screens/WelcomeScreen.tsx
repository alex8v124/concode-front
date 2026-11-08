import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onLogin, onRegister }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        {/* Logo VECI Oficial Recortado (Figma 1 · Bienvenida) */}
        <Image 
          source={require('../../assets/app-icon.png')} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
        
        <Text style={styles.title}>Tu barrio,{"\n"}conectado</Text>
        
        <Text style={styles.subtitle}>
          Una red de vecinos reales, a pocas cuadras de tu casa.
        </Text>

        <View style={styles.pill}>
          <Text style={styles.pillText}>Comunidad cerrada, verificada con DNI</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.primaryButton} onPress={onLogin} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onRegister} activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
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
  topSection: {
    paddingTop: 16,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#141c18',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#4e5650',
    lineHeight: 22,
    marginBottom: 20,
  },
  pill: {
    alignSelf: 'flex-start',
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
  bottomSection: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: '600',
  },
});
