import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface WelcomeSuccessScreenProps {
  userName?: string;
  quadrantName?: string;
  onEnterBarrio: () => void;
}

export const WelcomeSuccessScreen: React.FC<WelcomeSuccessScreenProps> = ({
  onEnterBarrio
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#144e40', '#f2ab27', '#5ba98f']
      });
    } catch {
      // Ignorar si el navegador no soporta canvas
    }
  }, []);

  return (
    <div className="flex flex-col justify-between h-full px-6 py-8 bg-surface-bg text-center select-none">
      {/* Contenido Central de Éxito (Figma 8 · Cuenta creada) */}
      <div className="flex flex-col items-center justify-center my-auto">
        
        {/* Logo Emblema Ayllu con Check de Éxito */}
        <div className="relative mb-5 flex items-center justify-center">
          <img 
            src="/logo-symbol.png" 
            alt="Ayllu" 
            className="w-20 h-20 object-contain drop-shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-800 border-2 border-white flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Título de Bienvenida */}
        <h1 className="text-[24px] font-bold text-ink-primary tracking-tight mb-2">
          ¡Bienvenida al barrio!
        </h1>

        {/* Mensaje de Confirmación */}
        <p className="text-[13px] text-ink-secondary leading-relaxed max-w-[260px] mb-5 font-normal">
          Tu identidad y tu domicilio están verificados. Ya eres parte de tu comunidad.
        </p>

        {/* Insignia: Vecina verificada */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-100 text-brand-800 text-[12px] font-medium">
          Vecina verificada
        </div>
      </div>

      {/* Botón Inferior: Entrar a mi barrio */}
      <div className="w-full pb-1">
        <button
          onClick={onEnterBarrio}
          className="w-full py-3.5 px-5 rounded-xl bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white font-semibold text-[15px] shadow-xs transition flex items-center justify-center cursor-pointer"
        >
          Entrar a mi barrio
        </button>
      </div>
    </div>
  );
};
