import React, { useState } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { DniScannerModal } from './components/DniScannerModal';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { LoginDniStepScreen } from './screens/LoginDniStepScreen';
import { RegisterStep1Screen } from './screens/RegisterStep1Screen';
import { DomicilioMapScreen } from './screens/DomicilioMapScreen';
import { RegisterStep3ConfirmScreen } from './screens/RegisterStep3ConfirmScreen';
import { OtpVerificationScreen } from './screens/OtpVerificationScreen';
import { OcrErrorScreen } from './screens/OcrErrorScreen';
import { WelcomeSuccessScreen } from './screens/WelcomeSuccessScreen';
import { BarrioHomeScreen } from './screens/BarrioHomeScreen';
import type { ScreenId, UserFormData } from './types';
import { apiService } from './services/api';

const DEFAULT_FORM_DATA: UserFormData = {
  dni: '',
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  phone: '987654321',
  addressText: 'Jr. Jacarandá 342, San Borja',
  lat: -12.0905,
  lng: -76.9902,
  quadrantName: 'San Borja · Sector 4',
  dniVerified: false,
  addressVerified: false,
};

// Datos ya autollenados para la vista de galería (Figma wireframes)
const GALLERY_POPULATED_DATA: UserFormData = {
  dni: '00000000',
  firstName: 'Ana María',
  lastName: 'Quispe Ramos',
  age: '34',
  gender: 'Femenino',
  phone: '987654321',
  addressText: 'Jr. Jacarandá 342, San Borja',
  lat: -12.0905,
  lng: -76.9902,
  quadrantName: 'San Borja · Sector 4',
  dniVerified: true,
  addressVerified: true,
};

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('welcome');
  const [viewMode, setViewMode] = useState<'phone' | 'gallery'>('phone');
  const [formData, setFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);
  const [otpCanal, setOtpCanal] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [otpDevCode, setOtpDevCode] = useState<string>('1234');
  const [otpOrigin, setOtpOrigin] = useState<'login' | 'register'>('login');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannerContext, setScannerContext] = useState<'login' | 'register'>('register');

  const handleUpdateFormData = (data: Partial<UserFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentScreen('welcome');
  };

  // Manejador del Escaneo de DNI exitoso
  const handleScanSuccess = (scannedData: {
    dni: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      dni: scannedData.dni,
      firstName: scannedData.firstName,
      lastName: scannedData.lastName,
      age: scannedData.age.toString(),
      gender: scannedData.gender,
      dniVerified: true
    }));

    if (scannerContext === 'login') {
      setCurrentScreen('barrio_home');
    } else if (scannerContext === 'register' && formData.addressVerified) {
      setCurrentScreen('confirm_step3');
    }
  };

  // Manejador de Falla en Lectura de DNI (lleva a pantalla 7)
  const handleScanError = () => {
    setCurrentScreen('ocr_error');
  };

  const openScanner = (context: 'login' | 'register') => {
    setScannerContext(context);
    setIsScannerOpen(true);
  };

  // Renderiza una pantalla específica dentro de un marco de celular
  const renderScreenContent = (screenId: ScreenId, data: UserFormData) => {
    switch (screenId) {
      case 'welcome':
        return (
          <WelcomeScreen
            onLoginClick={() => {
              setCurrentScreen('login');
              setViewMode('phone');
            }}
            onRegisterClick={() => {
              setCurrentScreen('register_step1');
              setViewMode('phone');
            }}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={() => setCurrentScreen('welcome')}
            onRegister={() => setCurrentScreen('register_step1')}
            onContinue={async (phone, canal = 'SMS') => {
              handleUpdateFormData({ phone });
              setOtpOrigin('login');
              setOtpCanal(canal);
              if (!phone.includes('@')) {
                const resp = await apiService.sendOtp(phone, canal, 'INGRESO');
                if (resp?.devCode) setOtpDevCode(resp.devCode);
              } else {
                setOtpDevCode('1234');
              }
              setCurrentScreen('otp_verify');
            }}
          />
        );
      case 'login_dni_step':
        return (
          <LoginDniStepScreen
            phone={data.phone}
            onBack={() => setCurrentScreen('otp_verify')}
            onOpenScanner={() => openScanner('login')}
          />
        );
      case 'register_step1':
        return (
          <RegisterStep1Screen
            onBack={() => setCurrentScreen('welcome')}
            formData={data}
            onUpdateFormData={handleUpdateFormData}
            onOpenScanner={() => openScanner('register')}
            onActivateMap={() => setCurrentScreen('domicilio_step2')}
            onManualErrorTrigger={() => setCurrentScreen('ocr_error')}
          />
        );
      case 'domicilio_step2':
        return (
          <DomicilioMapScreen
            onBack={() => setCurrentScreen('register_step1')}
            initialAddress={data.addressText}
            onSaveDomicilio={async (loc) => {
              handleUpdateFormData({
                addressText: loc.address,
                lat: loc.lat,
                lng: loc.lng,
                quadrantName: loc.quadrantName,
                addressVerified: true,
                dni: data.dni || '00000000',
                firstName: data.firstName || 'Ana María',
                lastName: data.lastName || 'Quispe Ramos',
                age: data.age || '34',
                gender: data.gender || 'Femenino',
                dniVerified: true
              });
              await apiService.guardarDomicilio(loc.lat, loc.lng);
              setCurrentScreen('confirm_step3');
            }}
          />
        );
      case 'confirm_step3':
        return (
          <RegisterStep3ConfirmScreen
            onBack={() => setCurrentScreen('domicilio_step2')}
            formData={data}
            onUpdateFormData={handleUpdateFormData}
            onEditLocation={() => setCurrentScreen('domicilio_step2')}
            onRegisterSubmit={async () => {
              setOtpOrigin('register');
              const resp = await apiService.sendOtp(data.phone || '987654321', otpCanal, 'ALTA');
              if (resp?.devCode) setOtpDevCode(resp.devCode);
              setCurrentScreen('otp_verify');
            }}
          />
        );
      case 'otp_verify':
        return (
          <OtpVerificationScreen
            onBack={() => {
              if (otpOrigin === 'register') {
                setCurrentScreen('confirm_step3');
              } else {
                setCurrentScreen('login');
              }
            }}
            phone={data.phone}
            devCode={otpDevCode}
            canal={otpCanal}
            mode={otpOrigin}
            onVerifySuccess={async () => {
              if (otpOrigin === 'register') {
                await apiService.registerUser(data);
                setCurrentScreen('welcome_success');
              } else {
                setCurrentScreen('login_dni_step');
              }
            }}
          />
        );
      case 'ocr_error':
        return (
          <OcrErrorScreen
            onBack={() => setCurrentScreen(scannerContext === 'login' ? 'login_dni_step' : 'register_step1')}
            onRetry={() => {
              setCurrentScreen(scannerContext === 'login' ? 'login_dni_step' : 'register_step1');
              openScanner(scannerContext);
            }}
            onManualEntry={() => {
              setCurrentScreen(scannerContext === 'login' ? 'login_dni_step' : 'register_step1');
            }}
          />
        );
      case 'welcome_success':
        return (
          <WelcomeSuccessScreen
            userName={data.firstName || 'Ana María'}
            quadrantName={data.quadrantName || 'San Borja · Sector 4'}
            onEnterBarrio={() => setCurrentScreen('barrio_home')}
          />
        );
      case 'barrio_home':
        return (
          <BarrioHomeScreen
            userData={data}
            onLogout={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PhoneFrame
        currentScreen={currentScreen}
        onSelectScreen={(screen) => setCurrentScreen(screen)}
        onReset={handleReset}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
      >
        {/* MODO 1: SIMULADOR CELULAR INDIVIDUAL INTERACTIVO */}
        {viewMode === 'phone' && (
          <div className="w-[365px] h-[740px] bg-surface-bg rounded-[40px] shadow-phone border-[8px] border-[#222724] overflow-hidden flex flex-col relative ring-1 ring-white/10">
            
            {/* Barra de Estado Móvil (9:41, Notch, Batería) */}
            <div className="w-full h-8 bg-surface-bg px-6 flex items-center justify-between text-ink-primary text-[11px] font-bold shrink-0 select-none z-30 pt-1">
              <span>9:41</span>
              
              {/* Altavoz / Muesca / Isla */}
              <div className="w-16 h-3.5 bg-[#1b201d] rounded-full" />

              <div className="flex items-center gap-1.5 text-ink-secondary text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Contenido de la Pantalla Activa */}
            <div className="flex-1 overflow-hidden relative">
              {renderScreenContent(currentScreen, formData)}
            </div>

            {/* Barra Inferior (Home Indicator) */}
            <div className="w-full h-4 bg-surface-bg flex items-center justify-center shrink-0 z-30 pb-1">
              <div className="w-28 h-1 bg-gray-300 rounded-full" />
            </div>

          </div>
        )}

        {/* MODO 2: GALERÍA COMPLETA FIGMA (8 PANTALLAS EN PARALELO) */}
        {viewMode === 'gallery' && (
          <div className="w-full max-w-[1500px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-bold text-gray-300">
                Flujo Completo Figma · 8 Pantallas de Onboarding Comunal
              </h2>
              <span className="text-xs text-gray-400">
                Toca cualquier pantalla para probarla o cambiar a modo celular
              </span>
            </div>

            {/* Cuadrícula / Tira de Pantallas idéntica a las capturas de Figma */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
              {[
                { id: 'welcome' as ScreenId, title: '1 · Bienvenida' },
                { id: 'login' as ScreenId, title: '2 · Iniciar sesión' },
                { id: 'register_step1' as ScreenId, title: '3 · Registro' },
                { id: 'domicilio_step2' as ScreenId, title: '4 · Domicilio en...' },
                { id: 'confirm_step3' as ScreenId, title: '5 · Registro (Confirma)' },
                { id: 'otp_verify' as ScreenId, title: '6 · Verificación' },
                { id: 'ocr_error' as ScreenId, title: '7 · No se pudo leer' },
                { id: 'welcome_success' as ScreenId, title: '8 · Cuenta creada' },
              ].map((card) => {
                const isSelected = currentScreen === card.id;
                // Usamos los datos autollenados para las pantallas 5 y posteriores
                const screenData = ['confirm_step3', 'otp_verify', 'welcome_success'].includes(card.id)
                  ? GALLERY_POPULATED_DATA
                  : formData;

                return (
                  <div key={card.id} className="flex flex-col items-center">
                    {/* Título de la pantalla en Figma */}
                    <div className="w-full flex items-center justify-between mb-2 px-1 text-gray-400 text-xs font-semibold">
                      <span>{card.title}</span>
                      <button
                        onClick={() => {
                          setCurrentScreen(card.id);
                          setViewMode('phone');
                        }}
                        className="text-[11px] text-brand-300 hover:text-white transition cursor-pointer"
                        title="Probar en pantalla completa"
                      >
                        Abrir ↗
                      </button>
                    </div>

                    {/* Marco de Pantalla */}
                    <div 
                      className={`w-full max-w-[340px] h-[640px] bg-surface-bg rounded-[32px] overflow-hidden flex flex-col shadow-lg border-4 transition-all duration-200 ${
                        isSelected 
                          ? 'border-brand-800 ring-2 ring-brand-400/50 scale-[1.01]' 
                          : 'border-[#222724] hover:border-gray-600'
                      }`}
                    >
                      {/* Barra de estado mini */}
                      <div className="w-full h-7 bg-surface-bg px-5 flex items-center justify-between text-ink-primary text-[10px] font-bold shrink-0 select-none pt-1">
                        <span>9:41</span>
                        <div className="w-12 h-3 bg-[#1b201d] rounded-full" />
                        <span className="text-ink-secondary text-[9px]">100%</span>
                      </div>

                      {/* Contenido interactivo */}
                      <div className="flex-1 overflow-hidden relative">
                        {renderScreenContent(card.id, screenData)}
                      </div>

                      {/* Home indicator mini */}
                      <div className="w-full h-3 bg-surface-bg flex items-center justify-center shrink-0 pb-1">
                        <div className="w-20 h-0.5 bg-gray-300 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PhoneFrame>

      {/* Modal de Escaneo con Cámara / DNI */}
      <DniScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        modo={scannerContext === 'login' ? 'INGRESO' : 'ALTA'}
        title={scannerContext === 'login' ? 'Escanear DNI para Iniciar Sesión' : 'Escanear DNI para Registrarte'}
      />
    </>
  );
};

export default App;
