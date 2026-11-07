import React, { useState } from 'react';

interface LoginScreenProps {
  onBack: () => void;
  onOpenScanner: () => void;
  onContinue: (phone: string) => void;
  dniScanned?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onOpenScanner,
  onContinue,
  dniScanned
}) => {
  const [phoneNumber, setPhoneNumber] = useState('987654321');

  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const isValidPhone = cleanDigits.length >= 9;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    setPhoneNumber('9' + raw);
  };

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-surface-bg select-none">
      {/* Zona Superior */}
      <div className="flex flex-col">
        {/* Enlace Atrás (Figma: ‹ Atrás) */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-3 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Título de la pantalla */}
        <h2 className="text-[22px] font-bold text-ink-primary mb-4 tracking-tight">
          Inicia sesión
        </h2>

        {/* Tarjeta del Visor para Escanear DNI */}
        <div 
          onClick={onOpenScanner}
          role="button"
          tabIndex={0}
          className="relative w-full h-[155px] rounded-2xl bg-surface-scanner text-white p-4 cursor-pointer transition flex flex-col items-center justify-center overflow-hidden hover:brightness-110 active:scale-[0.99]"
          title="Toca para escanear DNI"
        >
          {/* 4 Esquinas amarillas de precisión (Figma wireframe) */}
          <div className="pointer-events-none absolute inset-3.5">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-[2.5px] border-l-[2.5px] border-accent-yellow"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-[2.5px] border-r-[2.5px] border-accent-yellow"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[2.5px] border-l-[2.5px] border-accent-yellow"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[2.5px] border-r-[2.5px] border-accent-yellow"></div>
            
            {/* Animación sutil de escáner */}
            <div className="absolute left-0 right-0 h-px bg-accent-yellow/60 animate-scan-laser"></div>
          </div>

          <div className="text-center z-10 px-3">
            <p className="text-[13px] font-semibold text-white tracking-tight mb-1">
              {dniScanned ? `DNI: ${dniScanned} (Leído)` : 'Escanea tu DNI para iniciar sesión'}
            </p>
            <p className="text-[11px] text-gray-400 font-normal">
              Coloca el DNI dentro del marco
            </p>
          </div>
        </div>

        {/* Formulario: Número de Celular */}
        <div className="mt-5 flex flex-col">
          <label className="text-[12px] font-medium text-ink-primary mb-1.5">
            Número de celular
          </label>

          <div className="flex items-center rounded-xl bg-white border border-surface-border px-3.5 py-3 shadow-2xs focus-within:border-brand-800 transition">
            <span className="text-[14px] font-medium text-ink-primary mr-1">9</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber.startsWith('9') ? phoneNumber.slice(1) : phoneNumber}
              onChange={handlePhoneChange}
              placeholder="· · · · · · · ·"
              className="w-full text-[14px] font-medium text-ink-primary tracking-wider bg-transparent focus:outline-none placeholder:text-gray-300"
            />
          </div>

          <p className="text-[11px] text-ink-secondary mt-2 leading-relaxed">
            Te enviaremos un código de 4 dígitos por mensaje de texto.
          </p>
        </div>
      </div>

      {/* Botón Inferior: Continuar */}
      <div className="w-full pb-1">
        <button
          onClick={() => isValidPhone && onContinue(phoneNumber)}
          disabled={!isValidPhone}
          className={`w-full py-3.5 px-5 rounded-xl font-semibold text-[15px] transition flex items-center justify-center ${
            isValidPhone
              ? 'bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white shadow-xs cursor-pointer'
              : 'bg-surface-mutedBtn text-surface-mutedText cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
