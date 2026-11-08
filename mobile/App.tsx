import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
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
import { mobileApiService } from './src/services/api';

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
  const [otpOrigin, setOtpOrigin] = useState<'login' | 'register'>('login');
  const [otpCanal, setOtpCanal] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [otpDevCode, setOtpDevCode] = useState<string>('1234');
  const [userData, setUserData] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '987654321',
    address: 'Calle 4, Los Pinos',
    quadrant: 'Urb. Los Pinos, Surco',
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
          onContinue={async (identificador, canal = 'SMS') => {
            setUserData(prev => ({ ...prev, phone: identificador }));
            setOtpOrigin('login');
            setOtpCanal(canal);
            if (!identificador.includes('@')) {
              const resp = await mobileApiService.solicitarCodigo(identificador, canal);
              if (resp?.devCode) setOtpDevCode(resp.devCode);
            } else {
              setOtpDevCode('1234');
            }
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
          onSaveAddress={(address, quadrant) => {
            setUserData(prev => ({
              ...prev,
              address,
              ...(quadrant ? { quadrant } : {}),
            }));
            setCurrentScreen('confirm_step3');
          }}
        />
      )}

      {currentScreen === 'confirm_step3' && (
        <ConfirmScreen 
          userData={userData}
          onUpdatePhone={(phone) => setUserData(prev => ({ ...prev, phone }))}
          onBack={() => setCurrentScreen('domicilio_step2')}
          onConfirm={async () => {
            setOtpOrigin('register');
            const resp = await mobileApiService.solicitarCodigo(userData.phone || '987654321', otpCanal);
            if (resp?.devCode) setOtpDevCode(resp.devCode);
            setCurrentScreen('otp');
          }}
        />
      )}

      {currentScreen === 'otp' && (
        <OtpScreen 
          phone={userData.phone}
          devCode={otpDevCode}
          canal={otpCanal}
          onBack={() => setCurrentScreen(otpOrigin === 'register' ? 'confirm_step3' : 'login')}
          onVerify={() => {
            if (otpOrigin === 'register') {
              mobileApiService.completarAlta();
              setCurrentScreen('success');
            } else {
              setCurrentScreen('barrio');
            }
          }}
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
