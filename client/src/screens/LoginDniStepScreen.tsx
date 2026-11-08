import React from 'react';
import { CheckCircle2, ChevronLeft, ScanLine, Shield } from 'lucide-react';

interface LoginDniStepScreenProps {
  phone: string;
  onBack: () => void;
  onOpenScanner: () => void;
}

export const LoginDniStepScreen: React.FC<LoginDniStepScreenProps> = ({
  phone,
  onBack,
  onOpenScanner,
}) => {
  return (
    <div className="flex flex-col justify-between h-full px-5 py-5 bg-[#f7f8f4] select-none overflow-y-auto">
      <div>
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-700">Paso 2 de 2 · Verificación 2FA</span>
          <div className="w-9" />
        </div>

        {/* Barra de progreso 2/2 */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 h-1 rounded-full bg-[#144e40]" />
          <div className="flex-1 h-1 rounded-full bg-[#144e40]" />
        </div>

        {/* Badge código verificado */}
        <div className="inline-flex items-center gap-1.5 bg-[#d6eee2] text-[#144e40] px-3 py-1 rounded-full text-xs font-bold mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Código verificado ({phone})</span>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1.5 tracking-tight">
          Escanea tu DNI para entrar
        </h2>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          Como segundo factor de seguridad, apunta la cámara al reverso de tu DNI. La captura se realizará automáticamente.
        </p>

        {/* Visor de DNI */}
        <div
          onClick={onOpenScanner}
          className="bg-[#111827] rounded-3xl py-8 px-6 flex flex-col items-center justify-center mb-4 shadow-md cursor-pointer hover:bg-[#182135] transition"
        >
          <div className="w-full max-w-[230px] h-[125px] border-2 border-dashed border-teal-400 rounded-xl relative flex flex-col justify-end p-3.5 mb-4">
            <div className="space-y-1.5">
              <div className="h-1.5 bg-gray-600 rounded w-full" />
              <div className="h-1.5 bg-gray-600 rounded w-[85%]" />
              <div className="h-1.5 bg-gray-600 rounded w-[92%]" />
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium text-center">
            Coloca el reverso del DNI dentro del recuadro
          </span>
        </div>

        {/* Banner de Privacidad / 2FA */}
        <div className="flex items-center gap-3 bg-[#d6eee2] rounded-2xl p-3.5 mb-4">
          <Shield className="w-4 h-4 text-[#144e40] shrink-0" />
          <p className="text-xs text-[#144e40] font-medium leading-snug">
            Verificación de 2 factores activa: comprobamos tu código y tu DNI físico para proteger a tu comunidad.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenScanner}
        className="w-full py-3.5 bg-[#144e40] hover:bg-[#0f3b30] text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <ScanLine className="w-4 h-4" />
        <span>Escanear DNI y entrar</span>
      </button>
    </div>
  );
};
