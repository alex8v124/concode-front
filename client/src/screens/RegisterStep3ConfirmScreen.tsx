import React, { useState } from 'react';
import type { UserFormData } from '../types';
import {
  formatearCelularAlEscribir,
  esCelularPeruValido,
  limpiarDigitosCelularPeru,
} from '../utils/phone';

interface RegisterStep3ConfirmScreenProps {
  onBack: () => void;
  formData: UserFormData;
  onUpdateFormData?: (data: Partial<UserFormData>) => void;
  onEditLocation: () => void;
  onRegisterSubmit: () => Promise<void> | void;
}

export const RegisterStep3ConfirmScreen: React.FC<RegisterStep3ConfirmScreenProps> = ({
  onBack,
  formData,
  onUpdateFormData,
  onEditLocation,
  onRegisterSubmit
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formattedPhone = formatearCelularAlEscribir(formData.phone || '987654321');
  const phoneValid = esCelularPeruValido(formData.phone || '987654321');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const clean = limpiarDigitosCelularPeru(e.target.value);
    onUpdateFormData?.({ phone: clean });
  };

  const handleSubmit = async () => {
    if (!phoneValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onRegisterSubmit();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Este celular ya está registrado en otra cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-surface-bg select-none overflow-y-auto">
      {/* Contenido Principal */}
      <div className="flex flex-col">
        {/* Enlace Atrás (Figma: ‹ Atrás) */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-2 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Indicador de Paso */}
        <p className="text-[12px] font-medium text-ink-muted mb-2.5">
          Paso 3 de 3 · Confirma
        </p>

        {/* Visor: Estado Exitoso DNI leído (Figma wireframe) */}
        <div className="relative w-full h-[80px] rounded-xl bg-surface-scanner text-white p-3 shadow-2xs mb-3.5 flex flex-col items-center justify-center">
          {/* 4 Esquinas amarillas */}
          <div className="pointer-events-none absolute inset-2.5">
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-[2px] border-l-[2px] border-accent-yellow"></div>
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-[2px] border-r-[2px] border-accent-yellow"></div>
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-[2px] border-l-[2px] border-accent-yellow"></div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-[2px] border-r-[2px] border-accent-yellow"></div>
          </div>

          <div className="text-center z-10">
            <p className="text-[12px] font-semibold text-white tracking-tight flex items-center justify-center gap-1">
              <span>DNI leído correctamente</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-normal">
              Coloca el DNI dentro del marco
            </p>
          </div>
        </div>

        {/* Formulario con Datos Autollenados */}
        <div className="flex flex-col gap-2">
          {/* Nombre */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-ink-primary">Nombre</label>
              <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-2 py-0.2 rounded-full">
                Autollenado
              </span>
            </div>
            <div className="w-full rounded-xl bg-white border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink-primary shadow-2xs">
              {formData.firstName || 'Ana María'}
            </div>
          </div>

          {/* Apellido */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-ink-primary">Apellido</label>
              <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-2 py-0.2 rounded-full">
                Autollenado
              </span>
            </div>
            <div className="w-full rounded-xl bg-white border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink-primary shadow-2xs">
              {formData.lastName || 'Quispe Ramos'}
            </div>
          </div>

          {/* Edad y Sexo */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-ink-primary">Edad</label>
                <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-1.5 py-0.2 rounded-full">
                  Autollenado
                </span>
              </div>
              <div className="w-full rounded-xl bg-white border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink-primary shadow-2xs">
                {formData.age || '34'}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-ink-primary">Sexo</label>
                <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-1.5 py-0.2 rounded-full">
                  Autollenado
                </span>
              </div>
              <div className="w-full rounded-xl bg-white border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink-primary shadow-2xs">
                {formData.gender || 'Femenino'}
              </div>
            </div>
          </div>

          {/* Nro. de DNI */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-ink-primary">Nro. de DNI</label>
              <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-2 py-0.2 rounded-full">
                Autollenado
              </span>
            </div>
            <div className="w-full rounded-xl bg-white border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink-primary shadow-2xs">
              {formData.dni || '00000000'}
            </div>
          </div>

          {/* Número de celular para recibir código OTP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-ink-primary">Número de celular (recibirás código SMS)</label>
              <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-2 py-0.2 rounded-full">
                +51 Perú
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-12 rounded-xl bg-white border border-surface-border flex items-center justify-center text-[12px] font-bold text-ink-primary shadow-2xs">
                +51
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={formattedPhone}
                onChange={handlePhoneChange}
                placeholder="987 654 321"
                className="flex-1 rounded-xl bg-white border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink-primary shadow-2xs outline-none focus:border-brand-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones Inferiores: Domicilio Guardado + Registrar en Amarillo (Figma wireframe) */}
      <div className="flex flex-col gap-2 pt-3 pb-1">
        {errorMessage && (
          <div className="w-full rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] font-semibold text-red-700">
            {errorMessage}
          </div>
        )}
        {/* Botón Domicilio Guardado */}
        <button
          onClick={onEditLocation}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-brand-50 active:scale-[0.99] text-brand-800 font-semibold text-[13px] border border-brand-800 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <svg className="w-4 h-4 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Domicilio guardado</span>
        </button>

        {/* Botón Registrar (En amarillo vibrante como en el wireframe 5) */}
        <button
          onClick={handleSubmit}
          disabled={!phoneValid || isSubmitting}
          className={`w-full py-3.5 px-4 rounded-xl bg-accent-yellow hover:bg-accent-yellowHover active:scale-[0.99] text-ink-primary font-bold text-[15px] shadow-xs transition text-center cursor-pointer ${
            !phoneValid || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Validando y enviando código...' : 'Registrar y enviar código'}
        </button>
      </div>
    </div>
  );
};
