import React from 'react';
import type { UserFormData } from '../types';
import { X, Lock, Check, Maximize2, ArrowRight } from 'lucide-react';

interface RegisterStep1ScreenProps {
  onBack: () => void;
  formData: UserFormData;
  onUpdateFormData: (data: Partial<UserFormData>) => void;
  onOpenScanner: () => void;
  onActivateMap: () => void;
  onManualErrorTrigger: () => void;
}

export const RegisterStep1Screen: React.FC<RegisterStep1ScreenProps> = ({
  onBack,
  formData,
  onOpenScanner,
  onActivateMap,
}) => {
  const isScanned = Boolean(formData.dniVerified && formData.firstName);

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-[#f7f8f4] select-none overflow-y-auto">
      <div>
        {/* Cabecera Superior */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack} 
            className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            Paso 1 de 4 · DNI
          </span>
          <div className="w-9" />
        </div>

        {/* Barra de Progreso de 4 Segmentos */}
        <div className="flex gap-2 mb-6">
          <div className="h-1 flex-1 rounded-full bg-[#144e40]" />
          <div className="h-1 flex-1 rounded-full bg-gray-200" />
          <div className="h-1 flex-1 rounded-full bg-gray-200" />
          <div className="h-1 flex-1 rounded-full bg-gray-200" />
        </div>

        {/* Título y Subtítulo */}
        <h2 className="text-2xl font-black text-gray-900 mb-1.5 tracking-tight">
          Escanea tu DNI
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Leemos tus datos automáticamente y verificamos que seas mayor de edad.
        </p>

        {/* Visor Card */}
        {!isScanned ? (
          <div
            onClick={onOpenScanner}
            className="w-full bg-[#111827] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer shadow-lg hover:brightness-110 transition mb-5"
          >
            {/* Marco con esquinas teal */}
            <div className="relative w-4/5 h-32 border border-dashed border-teal-400 rounded-xl p-3 flex flex-col justify-end gap-1.5 mb-4">
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-teal-400"></div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-teal-400"></div>
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-teal-400"></div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-teal-400"></div>

              <div className="h-1.5 bg-gray-700 rounded-full w-full"></div>
              <div className="h-1.5 bg-gray-700 rounded-full w-5/6"></div>
              <div className="h-1.5 bg-gray-700 rounded-full w-11/12"></div>
            </div>

            <p className="text-xs text-gray-400 font-medium text-center">
              Coloca el reverso del DNI dentro del recuadro
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border-2 border-[#144e40] shadow-xs mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#144e40] flex items-center justify-center text-white">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">DNI verificado con éxito</h4>
                  <p className="text-xs text-[#144e40] font-semibold">Validado en Registro Civil</p>
                </div>
              </div>
              <button 
                onClick={onOpenScanner}
                className="text-xs font-bold text-[#144e40] hover:underline cursor-pointer"
              >
                Re-escanear
              </button>
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Ciudadano:</span>
                <span className="font-bold text-gray-900">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nro. DNI:</span>
                <span className="font-bold text-gray-900">{formData.dni}</span>
              </div>
              {Boolean(formData.age) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Edad / Sexo:</span>
                  <span className="font-bold text-gray-900">{formData.age} años · {formData.gender === 'M' ? 'Masculino' : 'Femenino'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Garantía de Privacidad */}
        <div className="flex items-center gap-3 bg-[#d6eee2] p-4 rounded-2xl mb-6">
          <Lock className="w-5 h-5 text-[#144e40] shrink-0" />
          <p className="text-xs text-[#144e40] font-medium leading-relaxed">
            No guardamos la foto de tu DNI. Solo usamos tu nombre, edad y sexo para tu perfil.
          </p>
        </div>
      </div>

      {/* Botón de Acción */}
      <div>
        {!isScanned ? (
          <button
            onClick={onOpenScanner}
            className="w-full py-3.5 bg-black text-white font-bold rounded-xl text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            Escanear DNI
          </button>
        ) : (
          <button
            onClick={onActivateMap}
            className="w-full py-3.5 bg-[#144e40] text-white font-bold rounded-xl text-base flex items-center justify-center gap-2 hover:bg-[#103e33] transition cursor-pointer"
          >
            Continuar al paso 2 (Ubica tu casa)
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
