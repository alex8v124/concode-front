import React from 'react';
import { CreditCard, MapPin, Lock } from 'lucide-react';

interface WelcomeScreenProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginClick,
  onRegisterClick
}) => {
  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-[#1f6f4a] text-white select-none overflow-y-auto">
      {/* Contenido Superior */}
      <div className="pt-2">
        {/* Tarjeta Blanca con el Logo Recortado de Ayllu */}
        <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md mb-6">
          <img 
            src="/logo-symbol.png" 
            alt="Ayllu Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Título de la Aplicación */}
        <h1 className="text-[32px] font-black leading-tight tracking-tight mb-2 text-white">
          Ayllu
        </h1>

        {/* Subtítulo */}
        <p className="text-[15px] leading-snug text-white/90 font-medium mb-6">
          Servicios, favores y ayuda entre vecinos de verdad.
        </p>

        {/* 3 Beneficios Clave con diseño translúcido (Figma 1 · Bienvenida) */}
        <div className="flex flex-col gap-2.5 mb-6">
          {/* Beneficio 1: DNI */}
          <div className="flex items-center gap-3.5 bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white leading-tight">
              Cada vecino se verifica con su DNI
            </span>
          </div>

          {/* Beneficio 2: Cuadrante Vecinal */}
          <div className="flex items-center gap-3.5 bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white leading-tight">
              Solo ves y te ven vecinos de tu zona
            </span>
          </div>

          {/* Beneficio 3: Código OTP */}
          <div className="flex items-center gap-3.5 bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white leading-tight">
              Sin contraseñas: entras con un código
            </span>
          </div>
        </div>
      </div>

      {/* Zona Inferior: Botones de Acción y Términos */}
      <div className="flex flex-col gap-3 pt-2 pb-1">
        {/* Botón Principal: Crear cuenta */}
        <button
          onClick={onRegisterClick}
          className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-white/90 active:scale-[0.99] text-[#1f6f4a] font-bold text-[15px] shadow-sm transition flex items-center justify-center cursor-pointer"
        >
          Crear cuenta
        </button>

        {/* Botón Secundario: Ya tengo cuenta */}
        <button
          onClick={onLoginClick}
          className="w-full py-3.5 px-5 rounded-2xl bg-transparent hover:bg-white/10 active:scale-[0.99] text-white font-bold text-[15px] border-2 border-white/80 transition flex items-center justify-center cursor-pointer"
        >
          Ya tengo cuenta
        </button>

        {/* Términos y privacidad */}
        <p className="text-[11px] text-white/75 text-center leading-relaxed px-2 mt-1">
          Al continuar aceptas los Términos y la Política de privacidad. Solo para mayores de 18 años.
        </p>
      </div>
    </div>
  );
};
