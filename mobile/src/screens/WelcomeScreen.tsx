import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onLogin, onRegister }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Sección Superior */}
        <View style={styles.topSection}>
          {/* Tarjeta Blanca con Logo Recortado de Ayllu */}
          <View style={styles.logoCard}>
            <Image 
              source={require('../../assets/logo-symbol.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
          </View>
          
          <Text style={styles.title}>Ayllu</Text>
          
          <Text style={styles.subtitle}>
            Servicios, favores y ayuda entre vecinos de verdad.
          </Text>

          {/* 3 Beneficios Clave con diseño translúcido (Figma 1 · Bienvenida) */}
          <View style={styles.benefitsContainer}>
            {/* Beneficio 1: DNI */}
            <View style={styles.benefitRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#ffffff" />
              </View>
              <Text style={styles.benefitText}>
                Cada vecino se verifica con su DNI
              </Text>
            </View>

            {/* Beneficio 2: Cuadrante */}
            <View style={styles.benefitRow}>
              <View style={styles.iconCircle}>
                <Feather name="map-pin" size={18} color="#ffffff" />
              </View>
              <Text style={styles.benefitText}>
                Solo ves y te ven vecinos de tu zona
              </Text>
            </View>

            {/* Beneficio 3: Código OTP */}
            <View style={styles.benefitRow}>
              <View style={styles.iconCircle}>
                <Feather name="lock" size={18} color="#ffffff" />
              </View>
              <Text style={styles.benefitText}>
                Sin contraseñas: entras con un código
              </Text>
            </View>
          </View>
        </View>

        {/* Sección Inferior: Botones y Disclaimer */}
        <View style={styles.bottomSection}>
          {/* Botón Principal: Crear cuenta */}
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onRegister} 
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          </TouchableOpacity>

          {/* Botón Secundario: Ya tengo cuenta */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={onLogin} 
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Al continuar aceptas los Términos y la Política de privacidad. Solo para mayores de 18 años.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1f6f4a',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
    backgroundColor: '#1f6f4a',
  },
  topSection: {
    paddingTop: 8,
  },
  logoCard: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 26,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    lineHeight: 18,
  },
  bottomSection: {
    gap: 12,
    paddingTop: 24,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#1f6f4a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 8,
  },
});
