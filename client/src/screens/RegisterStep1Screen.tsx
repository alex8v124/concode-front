import React from 'react';
import type { UserFormData } from '../types';

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
  // Los campos de datos sólo aparecen después del escaneo y deben ser no editables
  const isScanned = Boolean(formData.dniVerified && formData.firstName);

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-surface-bg select-none overflow-y-auto">
      {/* Contenido Superior */}
      <div className="flex flex-col">
        {/* Enlace Atrás */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-2 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Indicador de Paso */}
        <p className="text-[12px] font-medium text-ink-muted mb-2.5">
          Paso 1 de 3 · Tus datos
        </p>

        {/* Visor de Escaneo DNI */}
        <div
          onClick={onOpenScanner}
          role="button"
          tabIndex={0}
          className={`relative w-full rounded-2xl bg-surface-scanner text-white cursor-pointer transition flex flex-col items-center justify-center overflow-hidden hover:brightness-110 active:scale-[0.99] ${
            isScanned ? 'h-[88px] p-3 mb-4' : 'h-[170px] p-5 mb-5'
          }`}
          title="Toca para escanear DNI"
        >
          {/* Esquinas amarillas */}
          <div className="pointer-events-none absolute inset-3">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-[2.5px] border-l-[2.5px] border-accent-yellow"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-[2.5px] border-r-[2.5px] border-accent-yellow"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[2.5px] border-l-[2.5px] border-accent-yellow"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[2.5px] border-r-[2.5px] border-accent-yellow"></div>
            
            {!isScanned && (
              <div className="absolute left-0 right-0 h-0.5 bg-accent-yellow shadow-[0_0_8px_#f2ab27] animate-scan-laser"></div>
            )}
          </div>

          <div className="text-center z-10 px-4">
            <p className="text-[13px] font-semibold text-white tracking-tight mb-1">
              {isScanned ? '✓ DNI leído correctamente' : 'Escanea tu DNI para registrarte'}
            </p>
            <p className="text-[11px] text-gray-400 font-normal">
              {isScanned ? 'Toca si deseas escanear nuevamente' : 'Coloca el DNI dentro del marco'}
            </p>
          </div>
        </div>

        {/* ESTADO 1: ANTES DEL ESCANEO (Los campos NO son visibles) */}
        {!isScanned && (
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-surface-border text-center shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-[13px] font-bold text-ink-primary mb-1">
              Verificación de identidad oficial
            </h4>
            <p className="text-[11px] text-ink-secondary leading-relaxed">
              Tus datos personales (nombre, apellidos, edad y DNI) aparecerán aquí automáticamente tras escanear tu documento para proteger la seguridad de tu comunidad.
            </p>
            <button
              type="button"
              onClick={onOpenScanner}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-[12px] font-semibold transition active:scale-95 cursor-pointer"
            >
              Iniciar escaneo de DNI
            </button>
          </div>
        )}

        {/* ESTADO 2: DESPUÉS DEL ESCANEO (Aparecen los campos y son estrictamente NO EDITABLES) */}
        {isScanned && (
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-300">
            {/* Aviso de campos validados y bloqueados */}
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-semibold text-brand-800 flex items-center gap-1">
                <span>✓ Datos oficiales leídos de RENIEC</span>
              </span>
              <span className="text-[10px] text-ink-muted bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                No editables
              </span>
            </div>

            {/* Nombre (No editable) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-ink-primary">Nombre</label>
                <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-2 py-0.2 rounded-full">
                  Autollenado
                </span>
              </div>
              <input
                type="text"
                value={formData.firstName}
                readOnly
                disabled
                tabIndex={-1}
                aria-readonly="true"
                className="w-full rounded-xl bg-gray-50/90 border border-surface-border px-3.5 py-2.5 text-[13px] font-semibold text-ink-primary cursor-default select-none shadow-2xs focus:outline-none"
              />
            </div>

            {/* Apellido (No editable) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-ink-primary">Apellido</label>
                <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-2 py-0.2 rounded-full">
                  Autollenado
                </span>
              </div>
              <input
                type="text"
                value={formData.lastName}
                readOnly
                disabled
                tabIndex={-1}
                aria-readonly="true"
                className="w-full rounded-xl bg-gray-50/90 border border-surface-border px-3.5 py-2.5 text-[13px] font-semibold text-ink-primary cursor-default select-none shadow-2xs focus:outline-none"
              />
            </div>

            {/* Edad y Sexo en 2 columnas (No editables) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-ink-primary">Edad</label>
                  <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-1.5 py-0.2 rounded-full">
                    Autollenado
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.age}
                  readOnly
                  disabled
                  tabIndex={-1}
                  aria-readonly="true"
                  className="w-full rounded-xl bg-gray-50/90 border border-surface-border px-3.5 py-2.5 text-[13px] font-semibold text-ink-primary cursor-default select-none shadow-2xs focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-ink-primary">Sexo</label>
                  <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-1.5 py-0.2 rounded-full">
                    Autollenado
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.gender}
                  readOnly
                  disabled
                  tabIndex={-1}
                  aria-readonly="true"
                  className="w-full rounded-xl bg-gray-50/90 border border-surface-border px-3.5 py-2.5 text-[13px] font-semibold text-ink-primary cursor-default select-none shadow-2xs focus:outline-none"
                />
              </div>
            </div>

            {/* Nro. de DNI (No editable) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-ink-primary">Nro. de DNI</label>
                <span className="text-[10px] font-medium text-brand-800 bg-brand-100 px-2 py-0.2 rounded-full">
                  Autollenado
                </span>
              </div>
              <input
                type="text"
                value={formData.dni}
                readOnly
                disabled
                tabIndex={-1}
                aria-readonly="true"
                className="w-full rounded-xl bg-gray-50/90 border border-surface-border px-3.5 py-2.5 text-[13px] font-semibold text-ink-primary cursor-default select-none shadow-2xs focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botones Inferiores del Paso 1 */}
      <div className="flex flex-col gap-2 pt-4 pb-1">
        {/* Botón Activar Mapa */}
        <button
          onClick={onActivateMap}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-brand-50 active:scale-[0.99] text-brand-800 font-semibold text-[13px] border border-brand-800 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Activar mapa</span>
        </button>

        {/* Botón Registrar (Deshabilitado en Paso 1) */}
        <button
          disabled
          className="w-full py-3.5 px-4 rounded-xl bg-surface-mutedBtn text-surface-mutedText font-semibold text-[14px] cursor-not-allowed text-center"
        >
          Registrar
        </button>
        <p className="text-[11px] text-center text-surface-mutedText font-normal">
          Se habilita al guardar tu domicilio en el mapa
        </p>
      </div>
    </div>
  );
};
