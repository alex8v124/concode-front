import React from 'react';

interface WelcomeScreenProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginClick,
  onRegisterClick
}) => {
  return (
    <div className="flex flex-col justify-between h-full px-6 py-7 bg-surface-bg select-none">
      {/* Zona Superior */}
      <div className="flex flex-col items-start pt-3">
        {/* Logo VECI Oficial (App Icon recortado) */}
        <div className="relative mb-6">
          <img 
            src="/app-icon.png" 
            alt="VECI - Red Vecinal" 
            className="w-16 h-16 rounded-2xl shadow-md object-contain"
          />
        </div>

        {/* Título Principal */}
        <h1 className="text-[30px] font-bold leading-[1.16] text-ink-primary tracking-tight mb-3">
          Tu barrio,<br />conectado
        </h1>

        {/* Subtítulo simple y amigable para la comuna */}
        <p className="text-[14px] leading-relaxed text-ink-secondary font-normal mb-5">
          Una red de vecinos reales, a pocas cuadras de tu casa.
        </p>

        {/* Insignia / Pill de Confianza Ciudadana */}
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-[12px] font-medium">
          Comunidad cerrada, verificada con DNI
        </div>
      </div>

      {/* Zona Inferior: Botones Claros y Accesibles */}
      <div className="flex flex-col gap-3 w-full pb-1">
        <button
          onClick={onLoginClick}
          className="w-full py-3.5 px-5 rounded-xl bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white font-semibold text-[15px] shadow-xs transition flex items-center justify-center cursor-pointer"
        >
          Iniciar sesión
        </button>

        <button
          onClick={onRegisterClick}
          className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-brand-50 active:scale-[0.99] text-brand-800 font-semibold text-[15px] border border-brand-800 transition flex items-center justify-center cursor-pointer"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
};
