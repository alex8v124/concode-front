import React from 'react';

interface OcrErrorScreenProps {
  onBack: () => void;
  onRetry: () => void;
  onManualEntry: () => void;
}

export const OcrErrorScreen: React.FC<OcrErrorScreenProps> = ({
  onBack,
  onRetry,
  onManualEntry
}) => {
  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-surface-bg select-none">
      {/* Contenido Superior */}
      <div className="flex flex-col">
        {/* Enlace Atrás (Figma: ‹ Atrás) */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-2 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Círculo Durazno / Salmón Suave (Figma wireframe 7) */}
        <div className="w-12 h-12 rounded-full bg-accent-peach flex items-center justify-center my-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-accent-peachDot" />
        </div>

        {/* Título de Pantalla */}
        <h2 className="text-[22px] font-bold text-ink-primary tracking-tight mb-1">
          No pudimos leer tu DNI
        </h2>

        {/* Subtítulo */}
        <p className="text-[12px] text-ink-secondary mb-4">
          Prueba de nuevo con estos consejos:
        </p>

        {/* Tarjeta de Consejos Limpios y Legibles */}
        <div className="rounded-xl bg-white border border-surface-border p-4 shadow-2xs flex flex-col">
          <div className="py-2.5">
            <p className="text-[13px] font-medium text-ink-primary">
              Busca buena luz y evita reflejos
            </p>
          </div>
          
          <div className="h-px bg-surface-borderLight w-full" />

          <div className="py-2.5">
            <p className="text-[13px] font-medium text-ink-primary">
              Coloca el DNI plano y completo
            </p>
          </div>

          <div className="h-px bg-surface-borderLight w-full" />

          <div className="py-2.5">
            <p className="text-[13px] font-medium text-ink-primary">
              Limpia el lente de la cámara
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Acción Inferiores */}
      <div className="flex flex-col gap-2.5 pt-4 pb-1">
        {/* Intentar de nuevo (Verde oscuro) */}
        <button
          onClick={onRetry}
          className="w-full py-3.5 px-5 rounded-xl bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white font-semibold text-[15px] shadow-xs transition flex items-center justify-center cursor-pointer"
        >
          Intentar de nuevo
        </button>

        {/* Ingresar mis datos a mano (Blanco con borde verde) */}
        <button
          onClick={onManualEntry}
          className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-brand-50 active:scale-[0.99] text-brand-800 font-semibold text-[15px] border border-brand-800 transition flex items-center justify-center cursor-pointer"
        >
          Ingresar mis datos a mano
        </button>
      </div>
    </div>
  );
};
