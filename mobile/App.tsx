import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DomicilioMapScreen } from './src/screens/DomicilioMapScreen';
import { ConfirmScreen } from './src/screens/ConfirmScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { OcrErrorScreen } from './src/screens/OcrErrorScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { BarrioHomeScreen } from './src/screens/BarrioHomeScreen';
import { RestablecerAccesoScreen } from './src/screens/RestablecerAccesoScreen';

export type ScreenName = 
  | 'welcome' 
  | 'login' 
  | 'restablecer_acceso'
  | 'register_step1' 
  | 'domicilio_step2' 
  | 'confirm_step3' 
  | 'otp' 
  | 'ocr_error' 
  | 'success' 
  | 'barrio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('welcome');
  const [userData, setUserData] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '987654321',
    address: 'Jr. Jacarandá 342, San Borja',
    quadrant: 'San Borja · Sector 4',
    dniVerified: false,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8f4" />
      
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          onLogin={() => setCurrentScreen('login')}
          onRegister={() => setCurrentScreen('register_step1')}
        />
      )}

      {currentScreen === 'login' && (
        <LoginScreen 
          onBack={() => setCurrentScreen('welcome')}
          onContinue={(identificador) => {
            setUserData(prev => ({ ...prev, phone: identificador }));
            setCurrentScreen('otp');
          }}
          onRegister={() => setCurrentScreen('register_step1')}
          onRestablecerAcceso={() => setCurrentScreen('restablecer_acceso')}
          onScanSuccess={(data) => {
            setUserData(prev => ({ ...prev, ...data, dniVerified: true }));
          }}
          onScanError={() => setCurrentScreen('ocr_error')}
        />
      )}

      {currentScreen === 'restablecer_acceso' && (
        <RestablecerAccesoScreen
          onBack={() => setCurrentScreen('login')}
          onSuccessRecovery={(data) => {
            setUserData(prev => ({ ...prev, ...data, dniVerified: true }));
            setCurrentScreen('login');
          }}
        />
      )}

      {currentScreen === 'register_step1' && (
        <RegisterScreen 
          userData={userData}
          onBack={() => setCurrentScreen('welcome')}
          onActivateMap={() => setCurrentScreen('domicilio_step2')}
          onScanSuccess={(data) => {
            setUserData(prev => ({
              ...prev,
              ...data,
              dniVerified: true,
            }));
          }}
          onScanError={() => setCurrentScreen('ocr_error')}
        />
      )}

      {currentScreen === 'domicilio_step2' && (
        <DomicilioMapScreen 
          onBack={() => setCurrentScreen('register_step1')}
          onSaveAddress={(address) => {
            setUserData(prev => ({ ...prev, address }));
            setCurrentScreen('confirm_step3');
          }}
        />
      )}

      {currentScreen === 'confirm_step3' && (
        <ConfirmScreen 
          userData={userData}
          onBack={() => setCurrentScreen('domicilio_step2')}
          onConfirm={() => setCurrentScreen('otp')}
        />
      )}

      {currentScreen === 'otp' && (
        <OtpScreen 
          phone={userData.phone}
          onBack={() => setCurrentScreen('confirm_step3')}
          onVerify={() => setCurrentScreen('success')}
        />
      )}

      {currentScreen === 'ocr_error' && (
        <OcrErrorScreen 
          onBack={() => setCurrentScreen('register_step1')}
          onRetry={() => setCurrentScreen('register_step1')}
          onManual={() => setCurrentScreen('register_step1')}
        />
      )}

      {currentScreen === 'success' && (
        <SuccessScreen 
          userName={userData.firstName}
          onEnter={() => setCurrentScreen('barrio')}
        />
      )}

      {currentScreen === 'barrio' && (
        <BarrioHomeScreen 
          userData={userData}
          onLogout={() => setCurrentScreen('welcome')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
});
