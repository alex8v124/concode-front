import React from 'react';
import type { ScreenId } from '../types';

interface PhoneFrameProps {
  children: React.ReactNode;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onReset: () => void;
  viewMode: 'phone' | 'gallery';
  onToggleViewMode: (mode: 'phone' | 'gallery') => void;
}

const SCREENS_NAV: { id: ScreenId; num: string; title: string }[] = [
  { id: 'welcome', num: '1', title: 'Bienvenida' },
  { id: 'login', num: '2', title: 'Iniciar sesión' },
  { id: 'register_step1', num: '3', title: 'Registro (Datos)' },
  { id: 'domicilio_step2', num: '4', title: 'Domicilio en mapa' },
  { id: 'confirm_step3', num: '5', title: 'Confirma datos' },
  { id: 'otp_verify', num: '6', title: 'Código OTP' },
  { id: 'ocr_error', num: '7', title: 'No se pudo leer DNI' },
  { id: 'welcome_success', num: '8', title: 'Cuenta creada' },
  { id: 'barrio_home', num: '★', title: 'Barrio Hub' },
];

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  currentScreen,
  onSelectScreen,
  onReset,
  viewMode,
  onToggleViewMode
}) => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-[#111312] text-gray-200">
      
      {/* Barra de Control Superior Elegante y Minimalista */}
      <header className="sticky top-0 z-40 w-full bg-[#181b19]/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo y Nombre del Proyecto */}
          <div className="flex items-center gap-2.5">
            <img 
              src="/app-icon.png" 
              alt="VECI" 
              className="w-8 h-8 rounded-lg shadow-xs object-cover"
            />
            <div>
              <span className="text-[13px] font-bold text-white tracking-tight flex items-center gap-1.5">
                VECI
                <span className="text-[10px] text-brand-300 font-medium px-1.5 py-0.5 rounded-full bg-brand-800/50 border border-brand-700/50">
                  Red Vecinal
                </span>
              </span>
              <span className="text-[10px] text-gray-400 block -mt-0.5">
                Ayudar Trazable · Comuna
              </span>
            </div>
          </div>

          {/* Selector de Pantallas (1 al 8) */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {SCREENS_NAV.map((s) => {
              const isActive = currentScreen === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectScreen(s.id);
                    if (viewMode === 'gallery') onToggleViewMode('phone');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    isActive && viewMode === 'phone'
                      ? 'bg-brand-800 text-white font-semibold shadow-xs'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={s.title}
                >
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isActive && viewMode === 'phone' ? 'bg-accent-yellow text-ink-primary' : 'bg-white/10'
                  }`}>
                    {s.num}
                  </span>
                  <span className="hidden md:inline">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Selector de Vista: Celular vs Galería Figma */}
          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => onToggleViewMode('phone')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'phone'
                    ? 'bg-brand-800 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📱 Celular
              </button>
              <button
                onClick={() => onToggleViewMode('gallery')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'gallery'
                    ? 'bg-brand-800 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🖼️ Galería (8 Pantallas)
              </button>
            </div>

            <button
              onClick={onReset}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-medium transition cursor-pointer"
              title="Reiniciar flujo"
            >
              Reiniciar
            </button>
          </div>

        </div>
      </header>

      {/* Área Principal de Visualización */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        {children}
      </main>

    </div>
  );
};
