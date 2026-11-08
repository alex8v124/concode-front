import React from 'react';
import { LeafletMapPicker } from '../components/LeafletMapPicker';

interface DomicilioMapScreenProps {
  onBack: () => void;
  onSaveDomicilio: (locationData: { address: string; lat: number; lng: number; quadrantName: string }) => void;
  initialAddress?: string;
}

export const DomicilioMapScreen: React.FC<DomicilioMapScreenProps> = ({
  onBack,
  onSaveDomicilio,
  initialAddress = 'Jr. Jacarandá 342, San Borja'
}) => {
  return (
    <div className="flex flex-col justify-between h-full px-5 py-4 bg-surface-bg select-none">
      {/* Cabecera y Título */}
      <div className="flex flex-col flex-1">
        {/* Enlace Atrás */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-1 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Indicador de Paso */}
        <p className="text-[11px] font-medium text-ink-muted mb-0.5">
          Paso 2 de 3 · Tu domicilio
        </p>

        {/* Título de Pantalla */}
        <h2 className="text-[20px] font-bold text-ink-primary tracking-tight mb-0.5">
          Ubica tu casa
        </h2>
        
        {/* Subtítulo de Privacidad Vecinal */}
        <p className="text-[11px] text-ink-secondary leading-normal mb-2">
          Solo vecinos verificados de tu cuadrante verán tu zona.
        </p>

        {/* Mapa Google Maps Bloqueado con Auto-detección GPS */}
        <LeafletMapPicker
          onLocationSelect={onSaveDomicilio}
          onCancel={onBack}
          initialAddress={initialAddress}
        />
      </div>
    </div>
  );
};
